import FavoriteIcon from '@mui/icons-material/Favorite'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import SettingsIcon from '@mui/icons-material/Settings'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import ViewAgendaOutlinedIcon from '@mui/icons-material/ViewAgendaOutlined'
import GridViewIcon from '@mui/icons-material/GridView'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import TuneIcon from '@mui/icons-material/Tune'
import { Box, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, LoadingState, ScrollablePage } from '../components/ui'
import { useCollectionPlayQuery, useCollectionRaritiesQuery, useCollectionTypesQuery, useCollectionsQuery, useCollectionNotesQuery, useToggleCollectionFavoriteMutation } from '../hooks/useNotes'
import { useBackground } from '../context/BackgroundContext'
import { useUser } from '../context/UserContext'
import { useSimulation } from '../context/SimulationContext'
import { useReader } from '../context/ReaderContext'
import { colors, font, radius } from '../design-system'
import type { BackgroundTheme } from '../design-system'
import { slugify } from '../utils/slug'
import { gradientTextSx } from '../utils/colorUtils'
import { isCollectionOwner } from '../utils/collectionAccess'
import { CollectionPanel } from '../components/album/CollectionPanel'
import { ShareCartinha } from '../components/album/ShareCartinha'
import type { CollectionDailyReward, CollectionNoteView, NoteRecord, RarityConfig, NoteTypeConfig } from '../types/note'

export const PACK_OPEN_ANIMATION_MS = 2200

const fadeIn = keyframes`from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); }`
const cardIn = keyframes`from { opacity:0; transform:translateY(20px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); }`
const rarityShine = keyframes`0%{transform:translateX(-140%) rotate(18deg);opacity:0}20%{opacity:.55}55%,100%{transform:translateX(160%) rotate(18deg);opacity:0}`
const packOpening = keyframes`
  0%{transform:translate3d(-50%,18px,0) rotate(-8deg) scale(0.86);filter:drop-shadow(0 18px 26px rgba(15,23,42,0.1));}
  20%{transform:translate3d(-50%,0,0) rotate(3deg) scale(1.02);}
  34%{transform:translate3d(-50%,-4px,0) rotate(-2deg) scale(1.04);}
  47%{transform:translate3d(-50%,2px,0) rotate(1deg) scale(1);}
  60%{transform:translate3d(-50%,-12px,0) rotate(0deg) scale(1.07);}
  100%{transform:translate3d(-50%,8px,0) rotate(0deg) scale(0.92);opacity:0.34;}
`
const packFlap = keyframes`
  0%,42%{transform:translate3d(0,0,0) rotateX(0deg) scaleY(1);}
  58%{transform:translate3d(0,-13px,0) rotateX(58deg) scaleY(0.78);}
  78%,100%{transform:translate3d(0,-25px,0) rotateX(76deg) scaleY(0.62);}
`
const cardEject = keyframes`
  0%,43%{opacity:0;transform:translate3d(-50%,48px,0) rotate(0deg) scale(0.72);}
  58%{opacity:1;transform:translate3d(-50%,-18px,0) rotate(0deg) scale(0.9);}
  88%,100%{opacity:1;transform:translate3d(calc(-50% + var(--x)),calc(-1 * var(--y)),0) rotate(var(--r)) scale(1);}
`
const burstRing = keyframes`
  0%,46%{opacity:0;transform:translate3d(-50%,-50%,0) scale(0.42);}
  62%{opacity:0.58;transform:translate3d(-50%,-50%,0) scale(0.82);}
  100%{opacity:0;transform:translate3d(-50%,-50%,0) scale(1.72);}
`
const sparkleFloat = keyframes`
  0%,34%{opacity:0;transform:translate3d(var(--sx),18px,0) scale(0.58);}
  56%{opacity:1;}
  100%{opacity:0;transform:translate3d(var(--ex),-58px,0) scale(1.18);}
`
const shineSweep = keyframes`from{transform:translate3d(-130%,0,0) rotate(16deg);}to{transform:translate3d(130%,0,0) rotate(16deg);}`
const stageDot = keyframes`
  0%,100%{opacity:0.38;transform:scale(0.92);}
  45%{opacity:1;transform:scale(1.08);}
`
const revealFlash = keyframes`
  0%,52%{opacity:0;transform:scale(0.78);}
  66%{opacity:0.72;transform:scale(1);}
  100%{opacity:0;transform:scale(1.32);}
`

type AlbumFilter = 'all' | 'favorites'
export type AlbumView = 'list' | 'grid' | 'folders'
export type AlbumSort = 'recent' | 'rarity' | 'az'
type AlbumGroup = 'rarity' | 'type'
export const ALBUM_VIEW_KEY = 'potinho-album-view'
const SORT_LABEL: Record<AlbumSort, string> = { recent: 'Recentes', rarity: 'Raridade', az: 'A-Z' }
const SORT_CYCLE: AlbumSort[] = ['recent', 'rarity', 'az']
export type ReadableNote = CollectionDailyReward | CollectionNoteView | NoteRecord

function sortNotes(items: CollectionNoteView[], sort: AlbumSort, order: Record<string, number>) {
  const arr = [...items]
  if (sort === 'az') arr.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
  else if (sort === 'rarity') arr.sort((a, b) => (order[b.rarity] ?? 0) - (order[a.rarity] ?? 0) || a.title.localeCompare(b.title, 'pt-BR'))
  else arr.sort((a, b) => (b.obtainedAt ?? '').localeCompare(a.obtainedAt ?? ''))
  return arr
}

function rarityCardSx(r?: RarityConfig, compact = false) {
  const glow = r?.glowColor || r?.borderColor || 'rgba(244,63,94,0.2)'
  return {
    p: compact ? 1.8 : 2.5,
    borderRadius: compact ? radius.lg : radius.xl,
    position: 'relative',
    overflow: 'hidden',
    isolation: 'isolate',
    background: r?.cardBg ?? colors.surface.base,
    border: `1.5px solid ${r?.borderColor ?? colors.border.subtle}`,
    boxShadow: r
      ? `${r.shadow || '0 4px 20px rgba(0,0,0,0.08)'}, 0 0 34px ${glow}`
      : '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'transform 0.22s ease, box-shadow 0.22s ease',
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
      background: compact
        ? `radial-gradient(circle at 12% 0%, rgba(255,255,255,0.42), transparent 38%), radial-gradient(circle at 92% 100%, ${glow}, transparent 34%)`
        : `radial-gradient(circle at 12% 0%, rgba(255,255,255,0.58), transparent 36%), radial-gradient(circle at 95% 105%, ${glow}, transparent 42%)`,
      opacity: compact ? 0.62 : 0.78,
      mixBlendMode: 'soft-light',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '-35%',
      left: '-45%',
      zIndex: 0,
      width: '38%',
      height: '170%',
      pointerEvents: 'none',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.42), transparent)',
      animation: `${rarityShine} 4.4s ease-in-out infinite`,
    },
    '&:hover': {
      transform: compact ? 'translateY(-1px)' : 'translateY(-2px) scale(1.01)',
      boxShadow: r
        ? `${r.shadow || '0 6px 24px rgba(0,0,0,0.1)'}, 0 0 44px ${glow}`
        : '0 8px 28px rgba(0,0,0,0.1)',
    },
  }
}

export type { NoteImageLayout as ImageLayout } from '../types/note'
import type { NoteImageLayout } from '../types/note'

const IMG_SX = { width: '100%', height: '100%', objectFit: 'cover' as const, display: 'block' }

function CardChips({ r, isNew }: { r?: RarityConfig; isNew: boolean }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      {r && (
        <Chip size="small" label={`${r.emoji} ${r.label}`} sx={{
          fontSize: '0.7rem', fontWeight: 800, height: 22, background: r.chipBg,
          border: `1px solid ${r.borderColor}`, '& .MuiChip-label': { px: 1, ...gradientTextSx(r.chipColor) },
        }} />
      )}
      {isNew && (
        <Chip size="small" label="✨ Novo!" sx={{
          fontSize: '0.68rem', fontWeight: 800, height: 22, bgcolor: '#dcfce7', color: '#15803d',
          '& .MuiChip-label': { px: 1 },
        }} />
      )}
    </Stack>
  )
}

function CardTextBox({ title, message, children }: { title: string; message: string; children?: React.ReactNode }) {
  return (
    <Box sx={{ p: 1.15, borderRadius: radius.lg, background: 'rgba(255,255,255,0.68)', border: '1px solid rgba(255,255,255,0.58)', backdropFilter: 'blur(8px)', minWidth: 0 }}>
      {children}
      <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.2rem', color: colors.text.primary, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
        {title}
      </Typography>
      <Typography sx={{ mt: 0.75, fontSize: '0.9rem', color: colors.text.secondary, lineHeight: 1.65, fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
        &ldquo;{message}&rdquo;
      </Typography>
    </Box>
  )
}

function CardTag({ t }: { t?: NoteTypeConfig }) {
  if (!t) return null
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.3, borderRadius: radius.full, background: t.tagBg, color: t.tagColor, fontSize: '0.68rem', fontWeight: 700, alignSelf: 'flex-start' }}>
      {t.emoji} {t.label}
    </Box>
  )
}

export function RewardCard({ reward, rarities, types, onClick, imageLayout: imageLayoutProp }: { reward: CollectionDailyReward; rarities: RarityConfig[]; types: NoteTypeConfig[]; onClick?: () => void; imageLayout?: NoteImageLayout }) {
  const r = rarities.find((x) => x.id === reward.rarity)
  const t = types.find((x) => x.id === reward.typeId)
  const img = reward.imageUrl
  const imageLayout: NoteImageLayout = imageLayoutProp ?? reward.imageLayout ?? 'banner'

  // ── layouts imersivos que mudam a estrutura toda ──────────────────────────

  if (img && imageLayout === 'hero-overlay') {
    return (
      <Box onClick={onClick} sx={{ ...rarityCardSx(r), animation: `${cardIn} 0.55s cubic-bezier(0.16,1,0.3,1)`, cursor: onClick ? 'pointer' : 'default', p: 0, overflow: 'hidden', position: 'relative' }}>
        <Box sx={{ position: 'relative', width: '100%', height: 220 }}>
          <Box component="img" src={img} alt={reward.title} sx={{ ...IMG_SX, position: 'absolute', inset: 0 }} />
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }} />
          <Stack spacing={0.8} sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2 }}>
            <CardChips r={r} isNew={reward.isNew} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.25rem', color: '#fff', lineHeight: 1.25, textShadow: '0 1px 6px rgba(0,0,0,0.5)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {reward.title}
            </Typography>
          </Stack>
        </Box>
        <Stack spacing={1} sx={{ p: 2, position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontSize: '0.9rem', color: colors.text.secondary, lineHeight: 1.65, fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            &ldquo;{reward.message}&rdquo;
          </Typography>
          <CardTag t={t} />
        </Stack>
      </Box>
    )
  }

  if (img && imageLayout === 'bg-blur') {
    return (
      <Box onClick={onClick} sx={{ ...rarityCardSx(r), animation: `${cardIn} 0.55s cubic-bezier(0.16,1,0.3,1)`, cursor: onClick ? 'pointer' : 'default', position: 'relative', overflow: 'hidden' }}>
        <Box component="img" src={img} alt={reward.title} sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(18px) brightness(0.55) saturate(1.4)', transform: 'scale(1.1)', zIndex: 0 }} />
        <Box sx={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.22)', zIndex: 0 }} />
        <Stack spacing={1.5} sx={{ position: 'relative', zIndex: 1 }}>
          <CardChips r={r} isNew={reward.isNew} />
          <Box sx={{ p: 1.15, borderRadius: radius.lg, background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.7)' }}>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.2rem', color: colors.text.primary, lineHeight: 1.3 }}>{reward.title}</Typography>
            <Typography sx={{ mt: 0.75, fontSize: '0.9rem', color: colors.text.secondary, lineHeight: 1.65, fontStyle: 'italic' }}>&ldquo;{reward.message}&rdquo;</Typography>
          </Box>
          <CardTag t={t} />
        </Stack>
      </Box>
    )
  }

  if (img && imageLayout === 'split') {
    return (
      <Box onClick={onClick} sx={{ ...rarityCardSx(r), animation: `${cardIn} 0.55s cubic-bezier(0.16,1,0.3,1)`, cursor: onClick ? 'pointer' : 'default', p: 0, overflow: 'hidden' }}>
        <Box sx={{ width: '100%', height: 130, overflow: 'hidden' }}>
          <Box component="img" src={img} alt={reward.title} sx={{ ...IMG_SX }} />
        </Box>
        <Stack spacing={1.5} sx={{ p: 2, position: 'relative', zIndex: 1 }}>
          <CardChips r={r} isNew={reward.isNew} />
          <CardTextBox title={reward.title} message={reward.message} />
          <CardTag t={t} />
        </Stack>
      </Box>
    )
  }

  if (img && imageLayout === 'stripe-left') {
    return (
      <Box onClick={onClick} sx={{ ...rarityCardSx(r), animation: `${cardIn} 0.55s cubic-bezier(0.16,1,0.3,1)`, cursor: onClick ? 'pointer' : 'default', p: 0, overflow: 'hidden' }}>
        <Stack direction="row" sx={{ minHeight: 140 }}>
          <Box sx={{ width: 90, flexShrink: 0, overflow: 'hidden' }}>
            <Box component="img" src={img} alt={reward.title} sx={{ ...IMG_SX, height: '100%' }} />
          </Box>
          <Stack spacing={1.2} sx={{ flex: 1, p: 1.8, minWidth: 0 }}>
            <CardChips r={r} isNew={reward.isNew} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.05rem', color: colors.text.primary, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{reward.title}</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: colors.text.secondary, lineHeight: 1.55, fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>&ldquo;{reward.message}&rdquo;</Typography>
            <CardTag t={t} />
          </Stack>
        </Stack>
      </Box>
    )
  }

  // ── banner / thumb / circle (card padrão) ───────────────────────────────
  const isThumb = imageLayout === 'thumb-left' || imageLayout === 'thumb-right' || imageLayout === 'circle-left' || imageLayout === 'circle-right'

  return (
    <Box onClick={onClick} sx={{ ...rarityCardSx(r), animation: `${cardIn} 0.55s cubic-bezier(0.16,1,0.3,1)`, cursor: onClick ? 'pointer' : 'default', position: 'relative' }}>
      <Stack spacing={1.5} sx={{ position: 'relative', zIndex: 1 }}>
        <CardChips r={r} isNew={reward.isNew} />

        {img && imageLayout === 'banner' && (
          <Box sx={{ borderRadius: radius.lg, overflow: 'hidden', width: '100%', height: 110 }}>
            <Box component="img" src={img} alt={reward.title} sx={IMG_SX} />
          </Box>
        )}

        {isThumb && img ? (
          <Box sx={{ p: 1.15, borderRadius: radius.lg, background: 'rgba(255,255,255,0.68)', border: '1px solid rgba(255,255,255,0.58)', backdropFilter: 'blur(8px)', minWidth: 0 }}>
            <Stack direction={imageLayout.endsWith('right') ? 'row-reverse' : 'row'} spacing={1.2} alignItems="flex-start">
              <Box sx={{ flexShrink: 0, width: imageLayout.startsWith('circle') ? 56 : 64, height: imageLayout.startsWith('circle') ? 56 : 64, borderRadius: imageLayout.startsWith('circle') ? '50%' : radius.md, overflow: 'hidden' }}>
                <Box component="img" src={img} alt={reward.title} sx={IMG_SX} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.05rem', color: colors.text.primary, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                  {reward.title}
                </Typography>
                <Typography sx={{ mt: 0.5, fontSize: '0.83rem', color: colors.text.secondary, lineHeight: 1.55, fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                  &ldquo;{reward.message}&rdquo;
                </Typography>
              </Box>
            </Stack>
          </Box>
        ) : (
          <CardTextBox title={reward.title} message={reward.message} />
        )}

        <CardTag t={t} />
      </Stack>
    </Box>
  )
}

export function NoteDetailDialog({ note, rarities, types, onClose }: {
  note: ReadableNote | null
  rarities: RarityConfig[]
  types: NoteTypeConfig[]
  onClose: () => void
}) {
  const { theme } = useBackground()
  const rarity = note ? rarities.find((item) => item.id === note.rarity) : undefined
  const type = note ? types.find((item) => item.id === note.typeId) : undefined

  return (
    <Dialog open={!!note} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { mx: 2, borderRadius: radius.xl, overflow: 'hidden', background: rarity?.cardBg ?? 'rgba(255,250,247,0.98)' } } }}>
      {note && (
        <>
          <DialogTitle sx={{ pb: 1, fontFamily: font.serif, fontWeight: 850, color: rarity?.textColor ?? colors.text.primary, lineHeight: 1.25, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
            {note.title}
          </DialogTitle>
          <DialogContent sx={{ pt: 0 }}>
            <Stack spacing={1.4}>
              <Stack direction="row" spacing={0.6} sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
                {rarity && (
                  <Chip size="small" label={`${rarity.emoji} ${rarity.label}`} sx={{
                    height: 22,
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    background: rarity.chipBg,
                    border: `1px solid ${rarity.borderColor}`,
                    '& .MuiChip-label': { px: 0.9, ...gradientTextSx(rarity.chipColor) },
                  }} />
                )}
                {type && (
                  <Chip size="small" label={`${type.emoji} ${type.label}`} sx={{
                    height: 22,
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    background: type.tagBg,
                    color: type.tagColor,
                    border: `1px solid ${type.accentColor}44`,
                    '& .MuiChip-label': { px: 0.9 },
                  }} />
                )}
              </Stack>
              {note.imageUrl ? (
                <Box sx={{ borderRadius: radius.lg, overflow: 'hidden', width: '100%', aspectRatio: '16/9', background: 'rgba(0,0,0,0.08)' }}>
                  <Box component="img" src={note.imageUrl} alt={note.title} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </Box>
              ) : null}
              <Box sx={{
                p: 1.35,
                borderRadius: radius.lg,
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(255,255,255,0.62)',
                backdropFilter: 'blur(8px)',
              }}>
                <Typography sx={{
                  fontSize: '0.92rem',
                  color: colors.text.secondary,
                  lineHeight: 1.7,
                  fontStyle: 'italic',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                }}>
                  &ldquo;{note.message}&rdquo;
                </Typography>
              </Box>
              <Stack spacing={0.7}>
                <Typography sx={{ fontSize: '0.70rem', fontWeight: 900, letterSpacing: 0.8, color: rarity?.captionColor ?? colors.text.muted, textTransform: 'uppercase' }}>
                  Compartilhar
                </Typography>
                <ShareCartinha note={note} r={rarity} t={type} theme={theme} />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.4 }}>
            <Button variant="primary" onClick={onClose} sx={{ flex: 1 }}>Fechar</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}

export function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export function PackOpeningDialog({ open, emoji, accent }: { open: boolean; emoji: string; accent: string }) {
  const steps = ['Preparando', 'Abrindo', 'Revelando']

  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            background: 'rgba(15,23,42,0.26)',
            backdropFilter: 'blur(12px)',
          },
        },
        paper: {
          sx: {
            mx: 2,
            borderRadius: '28px',
            overflow: 'hidden',
            background: 'rgba(255,250,247,0.98)',
            boxShadow: '0 28px 90px rgba(15,23,42,0.24)',
          },
        },
      }}
    >
      <Box sx={{
        py: 3.2,
        px: 2.5,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate',
        background: `radial-gradient(circle at 50% 18%, ${accent}2a, transparent 34%), radial-gradient(circle at 12% 8%, rgba(255,255,255,0.9), transparent 34%), linear-gradient(160deg,#fff7ed,#fff1f2,#eef2ff)`,
      }}>
        <Box sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.46) 42%, transparent 68%), radial-gradient(circle at 80% 88%, ${accent}18, transparent 38%)`,
          opacity: 0.7,
          zIndex: 0,
        }} />

        {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => (
          <Box key={item} sx={{
            '--sx': `${item % 2 === 0 ? '-' : ''}${10 + item * 2}px`,
            '--ex': `${item % 2 === 0 ? '' : '-'}${14 + item * 3}px`,
            position: 'absolute',
            left: `${10 + item * 11}%`,
            bottom: 58 + (item % 4) * 16,
            width: item % 3 === 0 ? 8 : 6,
            height: item % 3 === 0 ? 8 : 6,
            borderRadius: radius.full,
            background: 'rgba(255,255,255,0.95)',
            boxShadow: `0 0 18px ${accent}88`,
            animation: `${sparkleFloat} 2.05s ease-in-out infinite`,
            animationDelay: `${0.16 + item * 0.09}s`,
            zIndex: 1,
          }} />
        ))}

        <Box sx={{
          position: 'absolute',
          left: '50%',
          top: 134,
          width: 245,
          height: 245,
          borderRadius: radius.full,
          background: `radial-gradient(circle, ${accent}34 0%, ${accent}18 38%, transparent 68%)`,
          transform: 'translate3d(-50%,-50%,0)',
          animation: `${burstRing} 2.2s ease-out infinite both`,
          willChange: 'transform, opacity',
          zIndex: 1,
        }} />
        <Box sx={{
          position: 'absolute',
          left: '50%',
          top: 140,
          width: 178,
          height: 178,
          borderRadius: radius.full,
          background: 'rgba(255,255,255,0.46)',
          transform: 'translate3d(-50%,-50%,0)',
          animation: `${revealFlash} 2.2s ease-out infinite both`,
          filter: 'blur(2px)',
          zIndex: 1,
        }} />

        <Stack direction="row" spacing={0.65} justifyContent="center" sx={{ position: 'relative', zIndex: 2, mb: 1.8 }}>
          {steps.map((step, index) => (
            <Box key={step} sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.45,
              px: 0.8,
              py: 0.35,
              borderRadius: radius.full,
              background: 'rgba(255,255,255,0.64)',
              border: '1px solid rgba(255,255,255,0.66)',
              color: colors.text.secondary,
              fontSize: '0.70rem',
              fontWeight: 850,
              boxShadow: '0 6px 18px rgba(15,23,42,0.06)',
            }}>
              <Box sx={{
                width: 6,
                height: 6,
                borderRadius: radius.full,
                background: accent,
                animation: `${stageDot} 0.72s ease-in-out infinite`,
                animationDelay: `${index * 0.52}s`,
              }} />
              {step}
            </Box>
          ))}
        </Stack>

        <Box sx={{ position: 'relative', width: 248, height: 214, mx: 'auto', perspective: 840, transform: 'translateZ(0)', zIndex: 2 }}>
          {[
            { x: '-68px', y: '92px', r: '-18deg', delay: '0.2s' },
            { x: '-22px', y: '112px', r: '-5deg', delay: '0.28s' },
            { x: '24px', y: '112px', r: '6deg', delay: '0.36s' },
            { x: '68px', y: '92px', r: '18deg', delay: '0.44s' },
          ].map((card, index) => (
            <Box key={index} sx={{
              '--x': card.x,
              '--y': card.y,
              '--r': card.r,
              position: 'absolute',
              left: '50%',
              bottom: 24,
              width: 55,
              height: 82,
              borderRadius: 2.2,
              background: index % 2 === 0
                ? 'linear-gradient(135deg,#ffffff,#fff7ed)'
                : 'linear-gradient(135deg,#ffffff,#eef2ff)',
              border: `1.5px solid ${accent}42`,
              boxShadow: `0 16px 34px ${accent}24`,
              animation: `${cardEject} 2.12s cubic-bezier(.16,.92,.18,1) both`,
              animationDelay: card.delay,
              opacity: 0,
              overflow: 'hidden',
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 7,
                borderRadius: 1.6,
                border: `1px solid ${accent}24`,
                background: `radial-gradient(circle at 50% 20%, ${accent}24, transparent 48%), linear-gradient(180deg, rgba(255,255,255,0.9), transparent)`,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 17,
                height: 17,
                borderRadius: radius.full,
                background: `${accent}1f`,
                transform: 'translate(-50%,-50%)',
              },
            }} />
          ))}

          <Box sx={{
            position: 'absolute',
            left: '50%',
            bottom: 0,
            width: 166,
            height: 22,
            borderRadius: radius.full,
            background: 'radial-gradient(ellipse, rgba(15,23,42,0.18), transparent 68%)',
            transform: 'translateX(-50%)',
            filter: 'blur(1px)',
            zIndex: 0,
          }} />

          <Box sx={{
            position: 'absolute',
            left: '50%',
            bottom: 12,
            width: 150,
            height: 150,
            animation: `${packOpening} 2.12s cubic-bezier(.18,.9,.18,1) both`,
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            zIndex: 3,
          }}>
            <Box sx={{
              position: 'absolute',
              left: 7,
              right: 7,
              top: 4,
              height: 48,
              borderRadius: `${radius.xl} ${radius.xl} ${radius.md} ${radius.md}`,
              background: `linear-gradient(135deg, ${colors.rose.light}, ${accent})`,
              border: '2px solid rgba(255,255,255,0.86)',
              transformOrigin: '50% 100%',
              animation: `${packFlap} 2.12s cubic-bezier(.2,.85,.2,1) both`,
              boxShadow: `0 10px 22px ${accent}28`,
              zIndex: 3,
              willChange: 'transform',
              backfaceVisibility: 'hidden',
            }} />
            <Box sx={{
              position: 'absolute',
              inset: '26px 0 0',
              borderRadius: radius.xl,
              background: `linear-gradient(135deg, ${colors.rose.light}, ${accent})`,
              border: '2px solid rgba(255,255,255,0.86)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3.25rem',
              zIndex: 2,
              boxShadow: `0 20px 38px ${accent}32`,
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle at 20% 0%, rgba(255,255,255,0.78), transparent 38%), radial-gradient(circle at 90% 100%, ${accent}42, transparent 42%)`,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: -42,
                background: 'linear-gradient(100deg, transparent 28%, rgba(255,255,255,0.88) 48%, transparent 68%)',
                animation: `${shineSweep} 1.18s ease-in-out infinite both`,
                willChange: 'transform',
              },
            }}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>{emoji}</Box>
            </Box>
          </Box>
        </Box>

        <Typography sx={{ mt: 1.5, fontFamily: font.serif, fontSize: '1.12rem', fontWeight: 850, color: colors.text.primary, position: 'relative', zIndex: 2 }}>
          Abrindo pacotinho...
        </Typography>
        <Typography sx={{ mt: 0.35, fontSize: '0.78rem', color: colors.text.muted, position: 'relative', zIndex: 2 }}>
          Segura aí, os bilhetinhos estão saindo do potinho.
        </Typography>
      </Box>
    </Dialog>
  )
}

export function NoteCard({ note, r, t, unread, variant, onSelect, onToggleFavorite }: {
  note: CollectionNoteView
  r?: RarityConfig
  t?: NoteTypeConfig
  unread: boolean
  variant: 'list' | 'grid'
  onSelect: (note: CollectionNoteView) => void
  onToggleFavorite: (note: CollectionNoteView) => void
}) {
  const grid = variant === 'grid'
  return (
    <Card accent={r?.borderColor} onClick={() => onSelect(note)} sx={{ ...(rarityCardSx(r, true) as object), cursor: 'pointer', height: grid ? '100%' : undefined }}>
      <Box sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
        {unread && (
          <Box sx={{
            position: 'absolute', top: -2, left: -2, width: 11, height: 11, zIndex: 3,
            borderRadius: radius.full, background: colors.rose.main,
            boxShadow: `0 0 0 3px rgba(255,255,255,0.82), 0 0 14px ${colors.rose.glow}`,
          }} />
        )}
        <Box sx={{
          position: 'relative', minWidth: 0, height: '100%', p: 1, pr: grid ? 3.4 : 4.4,
          borderRadius: radius.lg, background: 'rgba(255,255,255,0.68)',
          border: '1px solid rgba(255,255,255,0.58)', backdropFilter: 'blur(8px)',
          display: 'flex', flexDirection: 'column',
        }}>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.55, flexWrap: 'wrap', rowGap: 0.4 }}>
            {r && (
              <Chip size="small" label={`${r.emoji} ${r.label}`} sx={{
                height: 19, fontSize: '0.70rem', fontWeight: 800,
                background: r.chipBg, border: `1px solid ${r.borderColor}`,
                '& .MuiChip-label': { px: 0.8, ...gradientTextSx(r.chipColor) },
              }} />
            )}
            {t && !grid && (
              <Chip size="small" label={`${t.emoji} ${t.label}`} sx={{
                height: 19, fontSize: '0.70rem', fontWeight: 800,
                background: t.tagBg, color: t.tagColor, border: `1px solid ${t.accentColor}44`,
                '& .MuiChip-label': { px: 0.8 },
              }} />
            )}
          </Stack>
          <Typography sx={{
            fontFamily: font.serif, fontWeight: 800, fontSize: grid ? '0.9rem' : '0.98rem',
            color: colors.text.primary, mb: 0.3,
            display: '-webkit-box', WebkitLineClamp: grid ? 2 : 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            overflowWrap: 'anywhere', wordBreak: 'break-word',
          }}>
            {note.title}
          </Typography>
          <Typography sx={{
            fontSize: grid ? '0.74rem' : '0.8rem', color: colors.text.secondary, lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: grid ? 3 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            overflowWrap: 'anywhere', wordBreak: 'break-word',
          }}>
            {note.message}
          </Typography>
          <IconButton
            size="small"
            aria-label="favoritar bilhete"
            onClick={(event) => { event.stopPropagation(); onToggleFavorite(note) }}
            sx={{
              position: 'absolute', top: 6, right: 6, p: 0.5, borderRadius: radius.md,
              color: note.favorite ? colors.rose.main : (r?.captionColor ?? colors.text.muted),
              background: note.favorite ? 'rgba(254,243,199,0.92)' : 'rgba(255,255,255,0.74)',
              border: `1px solid ${note.favorite ? 'rgba(234,179,8,0.38)' : 'rgba(255,255,255,0.68)'}`,
              backdropFilter: 'blur(8px)', boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
            }}
          >
            {note.favorite ? <StarIcon sx={{ fontSize: 16, color: '#eab308' }} /> : <StarBorderIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        </Box>
      </Box>
    </Card>
  )
}

function AlbumSection({
  search, setSearch, filter, setFilter, rarity, setRarity, type, setType,
  view, setView, sort, setSort, group, setGroup,
  hasFavorites, discoveredRarities, discoveredTypes, items, rarities, types, theme,
  onSelect, onToggleFavorite, unreadIds, emptyHint,
}: {
  search: string; setSearch: (v: string) => void
  filter: AlbumFilter; setFilter: (v: AlbumFilter) => void
  rarity: string; setRarity: (v: string) => void
  type: string; setType: (v: string) => void
  view: AlbumView; setView: (v: AlbumView) => void
  sort: AlbumSort; setSort: (v: AlbumSort) => void
  group: AlbumGroup; setGroup: (v: AlbumGroup) => void
  hasFavorites: boolean
  discoveredRarities: RarityConfig[]
  discoveredTypes: NoteTypeConfig[]
  items: CollectionNoteView[]
  rarities: RarityConfig[]
  types: NoteTypeConfig[]
  theme: BackgroundTheme
  onSelect: (note: CollectionNoteView) => void
  onToggleFavorite: (note: CollectionNoteView) => void
  unreadIds: string[]
  emptyHint: string
}) {
  const order = useMemo(() => Object.fromEntries(rarities.map((r) => [r.id, r.order])), [rarities])
  const sorted = useMemo(() => sortNotes(items, sort, order), [items, sort, order])
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const activeFilterCount = (rarity !== 'all' ? 1 : 0) + (type !== 'all' ? 1 : 0) + (view === 'folders' && group !== 'rarity' ? 1 : 0)

  const groups = useMemo(() => {
    if (view !== 'folders') return []
    if (group === 'rarity') {
      return [...discoveredRarities]
        .sort((a, b) => b.order - a.order)
        .map((r) => ({ key: r.id, label: `${r.emoji} ${r.label}`, accent: r.borderColor, items: sorted.filter((n) => n.rarity === r.id) }))
        .filter((g) => g.items.length > 0)
    }
    return discoveredTypes
      .map((t) => ({ key: t.id, label: `${t.emoji} ${t.label}`, accent: `${t.accentColor}66`, items: sorted.filter((n) => n.typeId === t.id) }))
      .filter((g) => g.items.length > 0)
  }, [view, group, discoveredRarities, discoveredTypes, sorted])

  function renderCard(note: CollectionNoteView, variant: 'list' | 'grid') {
    return (
      <NoteCard
        key={note.id}
        note={note}
        r={rarities.find((x) => x.id === note.rarity)}
        t={types.find((x) => x.id === note.typeId)}
        unread={unreadIds.includes(note.id)}
        variant={variant}
        onSelect={onSelect}
        onToggleFavorite={onToggleFavorite}
      />
    )
  }
  return (
    <Stack spacing={1.2}>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1, px: 1.3, py: 0.82,
        background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(14px)',
        border: '1.5px solid rgba(255,255,255,0.62)', borderRadius: radius.xl,
      }}>
        <SearchIcon sx={{ fontSize: 17, color: theme.textOnBgMuted, flexShrink: 0 }} />
        <Box
          component="input"
          value={search}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
          placeholder="Buscar cartinha..."
          sx={{
            flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            color: theme.textOnBg, fontFamily: 'inherit', fontSize: '0.84rem',
            '&::placeholder': { color: theme.textOnBgMuted },
          }}
        />
        {search && (
          <Box onClick={() => setSearch('')} sx={{ display: 'flex', color: theme.textOnBgMuted, cursor: 'pointer', flexShrink: 0 }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </Box>
        )}
      </Box>

      <Stack direction="row" alignItems="center" spacing={0.6}>
        <Box sx={{ display: 'flex', gap: 0.6, flex: 1, overflowX: 'auto', pb: 0.2, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          {[
            { id: 'all' as AlbumFilter, label: 'Todas' },
            ...(hasFavorites ? [{ id: 'favorites' as AlbumFilter, label: 'Favoritas' }] : []),
          ].map((item) => (
            <Box
              key={item.id}
              onClick={() => setFilter(item.id)}
              sx={{
                px: 1.1, py: 0.52, borderRadius: radius.full, cursor: 'pointer', flexShrink: 0,
                fontSize: '0.72rem', fontWeight: 800,
                color: filter === item.id ? '#fff' : theme.textOnBgMuted,
                background: filter === item.id ? theme.accent : 'rgba(255,255,255,0.48)',
                border: `1px solid ${filter === item.id ? theme.accent : 'rgba(255,255,255,0.58)'}`,
                backdropFilter: 'blur(10px)',
              }}
            >
              {item.label}
            </Box>
          ))}
        </Box>
        {(discoveredRarities.length > 0 || discoveredTypes.length > 0) && (
          <Box
            onClick={() => setFilterSheetOpen(true)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.4, px: 1, py: 0.52,
              borderRadius: radius.full, cursor: 'pointer', flexShrink: 0,
              fontSize: '0.72rem', fontWeight: 800,
              color: activeFilterCount > 0 ? '#fff' : theme.textOnBgMuted,
              background: activeFilterCount > 0 ? theme.accent : 'rgba(255,255,255,0.48)',
              border: `1px solid ${activeFilterCount > 0 ? theme.accent : 'rgba(255,255,255,0.58)'}`,
              backdropFilter: 'blur(10px)',
            }}
          >
            <TuneIcon sx={{ fontSize: 14 }} />
            {activeFilterCount > 0 ? `Filtros (${activeFilterCount})` : 'Filtros'}
          </Box>
        )}
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.2 }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {([
            { id: 'list' as AlbumView, Icon: ViewAgendaOutlinedIcon },
            { id: 'grid' as AlbumView, Icon: GridViewIcon },
            { id: 'folders' as AlbumView, Icon: FolderOutlinedIcon },
          ]).map(({ id, Icon }) => (
            <Box
              key={id}
              role="button"
              aria-label={`Exibição ${id}`}
              onClick={() => setView(id)}
              sx={{
                width: 32, height: 32, borderRadius: radius.md, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: view === id ? '#fff' : theme.textOnBgMuted,
                background: view === id ? theme.accent : 'rgba(255,255,255,0.48)',
                border: `1px solid ${view === id ? theme.accent : 'rgba(255,255,255,0.58)'}`,
                backdropFilter: 'blur(10px)', transition: 'all 0.15s',
              }}
            >
              <Icon sx={{ fontSize: 16 }} />
            </Box>
          ))}
        </Box>
        <Box
          role="button"
          aria-label="ordenar"
          onClick={() => setSort(SORT_CYCLE[(SORT_CYCLE.indexOf(sort) + 1) % SORT_CYCLE.length])}
          sx={{
            display: 'flex', alignItems: 'center', gap: 0.4, px: 1.1, py: 0.5, borderRadius: radius.full,
            cursor: 'pointer', fontSize: '0.72rem', fontWeight: 800, color: theme.textOnBgMuted,
            background: 'rgba(255,255,255,0.48)', border: '1px solid rgba(255,255,255,0.58)', backdropFilter: 'blur(10px)',
          }}
        >
          <SwapVertIcon sx={{ fontSize: 15 }} />
          {SORT_LABEL[sort]}
        </Box>
      </Stack>

      <Dialog
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: `${radius.xl} ${radius.xl} 0 0`, mx: 0, maxWidth: 480, width: '100%', position: 'fixed', bottom: 0, m: 0 } } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, pt: 2, pb: 1 }}>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.1rem', color: colors.text.primary }}>Filtros</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {activeFilterCount > 0 && (
              <Box
                onClick={() => { setRarity('all'); setType('all') }}
                sx={{ fontSize: '0.72rem', fontWeight: 700, color: colors.rose.main, cursor: 'pointer', px: 0.5 }}
              >
                Limpar
              </Box>
            )}
            <IconButton size="small" onClick={() => setFilterSheetOpen(false)}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
          </Stack>
        </Stack>

        <DialogContent sx={{ pt: 0.5, pb: 3 }}>
          <Stack spacing={2}>
            {discoveredRarities.length > 0 && (
              <Box>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: 0.6, color: colors.text.secondary, textTransform: 'uppercase', mb: 1 }}>
                  Raridade
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
                  <Box
                    onClick={() => setRarity('all')}
                    sx={{
                      px: 1.2, py: 0.55, borderRadius: radius.full, cursor: 'pointer',
                      fontSize: '0.78rem', fontWeight: 800,
                      color: rarity === 'all' ? '#fff' : colors.text.secondary,
                      background: rarity === 'all' ? colors.primary.main : colors.surface.overlay,
                      border: `1.5px solid ${rarity === 'all' ? colors.primary.main : colors.border.subtle}`,
                    }}
                  >
                    Todas
                  </Box>
                  {discoveredRarities.map((r) => (
                    <Box
                      key={r.id}
                      onClick={() => setRarity(rarity === r.id ? 'all' : r.id)}
                      sx={{
                        px: 1.2, py: 0.55, borderRadius: radius.full, cursor: 'pointer',
                        fontSize: '0.78rem', fontWeight: 800,
                        background: rarity === r.id ? r.chipBg : colors.surface.overlay,
                        border: `1.5px solid ${rarity === r.id ? r.borderColor : colors.border.subtle}`,
                      }}
                    >
                      <Box component="span" sx={rarity === r.id ? gradientTextSx(r.chipColor) : { color: colors.text.secondary }}>{r.emoji} {r.label}</Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {discoveredTypes.length > 0 && (
              <Box>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: 0.6, color: colors.text.secondary, textTransform: 'uppercase', mb: 1 }}>
                  Tipo
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
                  <Box
                    onClick={() => setType('all')}
                    sx={{
                      px: 1.2, py: 0.55, borderRadius: radius.full, cursor: 'pointer',
                      fontSize: '0.78rem', fontWeight: 800,
                      color: type === 'all' ? '#fff' : colors.text.secondary,
                      background: type === 'all' ? colors.purple.main : colors.surface.overlay,
                      border: `1.5px solid ${type === 'all' ? colors.purple.main : colors.border.subtle}`,
                    }}
                  >
                    Todos
                  </Box>
                  {discoveredTypes.map((t) => (
                    <Box
                      key={t.id}
                      onClick={() => setType(type === t.id ? 'all' : t.id)}
                      sx={{
                        px: 1.2, py: 0.55, borderRadius: radius.full, cursor: 'pointer',
                        fontSize: '0.78rem', fontWeight: 800,
                        color: type === t.id ? t.tagColor : colors.text.secondary,
                        background: type === t.id ? t.tagBg : colors.surface.overlay,
                        border: `1.5px solid ${type === t.id ? `${t.accentColor}66` : colors.border.subtle}`,
                      }}
                    >
                      {t.emoji} {t.label}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {view === 'folders' && (
              <Box>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: 0.6, color: colors.text.secondary, textTransform: 'uppercase', mb: 1 }}>
                  Agrupamento
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.7 }}>
                  {([
                    { id: 'rarity' as AlbumGroup, label: 'Por raridade' },
                    { id: 'type' as AlbumGroup, label: 'Por tipo' },
                  ]).map((g) => (
                    <Box
                      key={g.id}
                      onClick={() => setGroup(g.id)}
                      sx={{
                        px: 1.2, py: 0.55, borderRadius: radius.full, cursor: 'pointer',
                        fontSize: '0.78rem', fontWeight: 800,
                        color: group === g.id ? '#fff' : colors.text.secondary,
                        background: group === g.id ? colors.purple.main : colors.surface.overlay,
                        border: `1.5px solid ${group === g.id ? colors.purple.main : colors.border.subtle}`,
                      }}
                    >
                      {g.label}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Stack>
        </DialogContent>
      </Dialog>

      {items.length === 0 ? (
        <Card sx={{ p: 2, textAlign: 'center' }}>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 800, color: colors.text.primary, mb: 0.3 }}>
            Nenhuma cartinha encontrada
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: colors.text.secondary }}>
            {emptyHint}
          </Typography>
        </Card>
      ) : view === 'folders' ? (
        <Stack spacing={1}>
          {groups.map((g) => {
            const isCollapsed = collapsed[g.key]
            return (
              <Box key={g.key}>
                <Stack
                  direction="row" alignItems="center" spacing={0.8}
                  onClick={() => setCollapsed((c) => ({ ...c, [g.key]: !c[g.key] }))}
                  sx={{
                    px: 1.2, py: 0.8, mb: 0.8, borderRadius: radius.lg, cursor: 'pointer',
                    background: 'rgba(255,255,255,0.5)', border: `1px solid ${g.accent}`,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <ExpandMoreIcon sx={{ fontSize: 18, color: theme.textOnBgMuted, transition: 'transform 0.18s', transform: isCollapsed ? 'rotate(-90deg)' : 'none' }} />
                  <Typography sx={{ flex: 1, fontSize: '0.8rem', fontWeight: 800, color: theme.textOnBg }}>
                    {g.label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: theme.textOnBgMuted }}>
                    {g.items.length}
                  </Typography>
                </Stack>
                {!isCollapsed && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 0.5 }}>
                    {g.items.map((note) => renderCard(note, 'grid'))}
                  </Box>
                )}
              </Box>
            )
          })}
        </Stack>
      ) : (
        <Stack spacing={1}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: 1.1, color: theme.textOnBgMuted, textTransform: 'uppercase' }}>
            Cartinhas da coleção — {sorted.length}
          </Typography>
          {view === 'grid' ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
              {sorted.map((note) => renderCard(note, 'grid'))}
            </Box>
          ) : (
            <Stack spacing={1}>
              {sorted.map((note) => renderCard(note, 'list'))}
            </Stack>
          )}
        </Stack>
      )}
    </Stack>
  )
}

export function CollectionPlayPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user, persona } = useUser()
  const { theme } = useBackground()
  const reader = useReader()

  const { data: collections = [], isLoading: collectionsLoading } = useCollectionsQuery()
  const collection = collections.find((item) => slugify(item.name) === slug)
  const cid = collection?.id ?? ''
  const collectionName = collection?.name
  const notFound = !collectionsLoading && !collection

  const simulation = useSimulation()
  const isSimulating = simulation.isSimulatingCollection(cid)
  const { data: playFromApi, isLoading: playLoading } = useCollectionPlayQuery(cid, { enabled: !isSimulating })
  const { data: notes = [], isLoading: notesLoading } = useCollectionNotesQuery(cid, { enabled: isSimulating })
  const play = isSimulating ? simulation.getPlayView(notes) : playFromApi
  const [albumFilter, setAlbumFilter] = useState<AlbumFilter>('all')
  const [albumSearch, setAlbumSearch] = useState('')
  const [albumRarity, setAlbumRarity] = useState('all')
  const [albumType, setAlbumType] = useState('all')
  const [albumView, setAlbumView] = useState<AlbumView>(() => (localStorage.getItem(ALBUM_VIEW_KEY) as AlbumView) || 'list')
  const [albumSort, setAlbumSort] = useState<AlbumSort>('recent')
  const [albumGroup, setAlbumGroup] = useState<AlbumGroup>('rarity')
  const [selectedNote, setSelectedNote] = useState<ReadableNote | null>(null)

  function changeAlbumView(v: AlbumView) {
    setAlbumView(v)
    localStorage.setItem(ALBUM_VIEW_KEY, v)
  }
  const displayPlay = play
  const isLoading = collectionsLoading || (!!cid && (isSimulating ? notesLoading : playLoading))
  const { data: rarities = [] } = useCollectionRaritiesQuery(cid)
  const { data: types = [] } = useCollectionTypesQuery(cid)
  const favoriteMutation = useToggleCollectionFavoriteMutation(cid)

  const isCollectionOwnerUser = collection ? isCollectionOwner(collection, user?.id) : false
  const isReaderView = !isSimulating && (persona === 'reader' || !isCollectionOwnerUser)

  function handleSelectNote(note: ReadableNote) {
    if (isSimulating) {
      simulation.markNoteViewed(note.id)
    } else if (isReaderView && cid) {
      reader.markViewed(cid, note.id)
    }
    setSelectedNote(note)
  }

  useEffect(() => {
    if (isReaderView && cid) reader.setActiveCollectionId(cid)
  }, [isReaderView, cid, reader])

  useEffect(() => {
    setAlbumSearch('')
    setAlbumRarity('all')
    setAlbumType('all')
    setSelectedNote(null)
  }, [cid, isSimulating])

  const discoveredItems = useMemo(() => (displayPlay?.items ?? []).filter((item) => item.owned), [displayPlay?.items])
  const discoveredRarityIds = useMemo(() => new Set(discoveredItems.map((item) => item.rarity)), [discoveredItems])
  const discoveredTypeIds = useMemo(() => new Set(discoveredItems.map((item) => item.typeId)), [discoveredItems])
  const hasFavorites = useMemo(() => discoveredItems.some((item) => item.favorite), [discoveredItems])
  const discoveredRarities = useMemo(
    () => rarities.filter((rarity) => discoveredRarityIds.has(rarity.id)),
    [discoveredRarityIds, rarities],
  )
  const discoveredTypes = useMemo(
    () => types.filter((type) => discoveredTypeIds.has(type.id)),
    [discoveredTypeIds, types],
  )
  const albumItems = useMemo(() => {
    const q = albumSearch.trim().toLowerCase()
    return discoveredItems.filter((item) => {
      const matchesStatus =
        albumFilter === 'all' ||
        (albumFilter === 'favorites' && item.favorite)
      const matchesRarity = albumRarity === 'all' || item.rarity === albumRarity
      const matchesType = albumType === 'all' || item.typeId === albumType
      const matchesSearch =
        q === '' ||
        item.title.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q)
      return matchesStatus && matchesRarity && matchesType && matchesSearch
    })
  }, [albumFilter, albumRarity, albumSearch, albumType, discoveredItems])

  useEffect(() => {
    if (albumFilter === 'favorites' && !hasFavorites) {
      setAlbumFilter('all')
    }
  }, [albumFilter, hasFavorites])


  const isWriter = isCollectionOwnerUser && persona === 'writer' && !isSimulating

  return (
    <Box sx={{ height: '100%', position: 'relative', background: theme.gradient }}>
      <FavoriteIcon sx={{ position: 'absolute', bottom: -60, right: -60, fontSize: 400, color: 'rgba(225,29,72,0.04)', pointerEvents: 'none' }} />

      <ScrollablePage sx={{ px: 2.5, py: 2.5, animation: `${fadeIn} 0.35s ease` }}>
        <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 3 }}>
          {!isSimulating && (
            <IconButton
              size="small"
              aria-label={isReaderView ? 'voltar para o início' : 'voltar para coleções'}
              onClick={() => navigate(isReaderView ? '/home' : '/colecoes')}
              sx={{
                width: 38,
                height: 38,
                color: theme.textOnBg,
                background: 'rgba(255,255,255,0.5)',
                border: '1.5px solid rgba(255,255,255,0.66)',
                backdropFilter: 'blur(14px)',
                boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
                transition: 'transform 0.16s ease, background 0.16s ease, box-shadow 0.16s ease',
                '&:hover': {
                  background: 'rgba(255,255,255,0.76)',
                  transform: 'translateX(-2px) scale(1.04)',
                  boxShadow: '0 10px 28px rgba(15,23,42,0.12)',
                },
                '&:active': {
                  transform: 'translateX(-1px) scale(0.98)',
                },
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 20, filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.6))' }} />
            </IconButton>
          )}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.15rem', color: theme.textOnBg }}>
              {isLoading ? 'Carregando...' : collectionName ?? (play ? 'Coleção' : '—')}
            </Typography>
            {isSimulating && (
              <Typography sx={{ mt: 0.15, fontSize: '0.72rem', color: theme.textOnBgMuted, fontWeight: 700 }}>
                visão do leitor · coleção ativa
              </Typography>
            )}
          </Box>
          {isWriter && slug && (
            <IconButton size="small" aria-label="gerenciar coleção" onClick={() => navigate(`/colecoes/${slug}/gerenciar`)} sx={{ color: theme.textOnBgMuted }}>
              <SettingsIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
        </Stack>

        {isLoading && (
          <LoadingState label="Preparando coleção" accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} sx={{ minHeight: 320 }} />
        )}

        {notFound && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.1rem', color: theme.textOnBg, mb: 1 }}>
              Coleção não encontrada
            </Typography>
            <Button variant="primary" onClick={() => navigate('/colecoes')}>Voltar às coleções</Button>
          </Box>
        )}

        {!isLoading && !notFound && displayPlay && (
          <Stack spacing={2.5}>
            {isSimulating && (
              <Card sx={{
                p: 1.6,
                background: 'rgba(255,255,255,0.62)',
                backdropFilter: 'blur(14px)',
                border: `1.5px solid ${theme.accent}26`,
                boxShadow: `0 8px 24px ${theme.accent}12`,
              }}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: radius.lg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `${theme.accent}14`,
                    color: theme.accent,
                    fontSize: '1.25rem',
                    flexShrink: 0,
                  }}>
                    {collection?.emoji ?? '💌'}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, letterSpacing: 0.8, color: theme.accent, textTransform: 'uppercase' }}>
                      Simulando leitor novo
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: colors.text.secondary, lineHeight: 1.35 }}>
                      Abra pacotinhos, veja as cartinhas coletadas e favorite bilhetes como quem recebeu acesso.
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            )}

            <CollectionPanel play={displayPlay} rarities={rarities} />

            {(isSimulating || discoveredItems.length > 0) && (
              <AlbumSection
                search={albumSearch} setSearch={setAlbumSearch}
                filter={albumFilter} setFilter={setAlbumFilter}
                rarity={albumRarity} setRarity={setAlbumRarity}
                type={albumType} setType={setAlbumType}
                view={albumView} setView={changeAlbumView}
                sort={albumSort} setSort={setAlbumSort}
                group={albumGroup} setGroup={setAlbumGroup}
                hasFavorites={hasFavorites}
                discoveredRarities={discoveredRarities}
                discoveredTypes={discoveredTypes}
                items={albumItems}
                rarities={rarities}
                types={types}
                theme={theme}
                onSelect={handleSelectNote}
                onToggleFavorite={(note) => {
                  if (isSimulating) {
                    simulation.toggleFavorite(note.id, !note.favorite)
                    return
                  }
                  favoriteMutation.mutate({ id: note.id, favorite: !note.favorite })
                }}
                unreadIds={isSimulating ? simulation.unreadNoteIds : (cid ? reader.unreadFor(cid) : [])}
                emptyHint={isSimulating ? 'Abra pacotinhos na tela inicial ou ajuste os filtros.' : 'Abra um pacotinho ou ajuste os filtros.'}
              />
            )}

            {!isSimulating && displayPlay.total > 0 && displayPlay.items.filter((n) => !n.owned).length > 0 && (
              <Stack spacing={1}>
                <Box>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: 1.2, color: theme.textOnBgMuted, textTransform: 'uppercase' }}>
                    Ainda por descobrir — {displayPlay.items.filter((n) => !n.owned).length}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: theme.textOnBgMuted, mt: 0.3, fontStyle: 'italic' }}>
                    Continue abrindo pacotinhos para descobrir estas cartinhas 💌
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {displayPlay.items.filter((n) => !n.owned).map((note) => {
                    const r = rarities.find((x) => x.id === note.rarity)
                    return (
                      <Box key={note.id} sx={{
                        px: 1, py: 0.5, borderRadius: radius.full,
                        background: 'rgba(255,255,255,0.08)', fontSize: '0.68rem', fontWeight: 700,
                        color: theme.textOnBgMuted, display: 'flex', alignItems: 'center', gap: 0.4,
                      }}>
                        {r?.emoji ?? '📝'} ???
                      </Box>
                    )
                  })}
                </Box>
              </Stack>
            )}
          </Stack>
        )}
      </ScrollablePage>
      <NoteDetailDialog note={selectedNote} rarities={rarities} types={types} onClose={() => setSelectedNote(null)} />
    </Box>
  )
}
