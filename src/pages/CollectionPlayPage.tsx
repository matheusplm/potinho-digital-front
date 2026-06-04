import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import SettingsIcon from '@mui/icons-material/Settings'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import { Box, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, LinearProgress, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, LoadingState, ScrollablePage, toast } from '../components/ui'
import { useCollectionPlayQuery, useOpenCollectionDailyMutation, useCollectionRaritiesQuery, useCollectionTypesQuery, useCollectionsQuery, useCollectionNotesQuery, useToggleCollectionFavoriteMutation } from '../hooks/useNotes'
import { useBackground } from '../context/BackgroundContext'
import { useUser } from '../context/UserContext'
import { useSimulation } from '../context/SimulationContext'
import { colors, font, radius } from '../design-system'
import { slugify } from '../utils/slug'
import { simulateDailyOpen } from '../utils/simulationPlay'
import type { CollectionDailyReward, CollectionNoteView, CollectionPlayView, NoteRecord, RarityConfig, NoteTypeConfig } from '../types/note'

export const PACK_OPEN_ANIMATION_MS = 2200

const fadeIn = keyframes`from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); }`
const cardIn = keyframes`from { opacity:0; transform:translateY(20px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); }`
const pulse = keyframes`0%,100%{box-shadow:0 0 0 0 rgba(244,63,94,0.5)} 65%{box-shadow:0 0 0 24px rgba(244,63,94,0)}`
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
export type ReadableNote = CollectionDailyReward | CollectionNoteView | NoteRecord

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

function Countdown({ availableAt }: { availableAt: string }) {
  const target = new Date(availableAt).getTime()
  const now = Date.now()
  const diffMs = Math.max(target - now, 0)
  const h = Math.floor(diffMs / 3600000)
  const m = Math.floor((diffMs % 3600000) / 60000)
  return <>{h > 0 ? `${h}h ${m}m` : `${m}m`}</>
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

export function RewardCard({ reward, rarities, types, onClick }: { reward: CollectionDailyReward; rarities: RarityConfig[]; types: NoteTypeConfig[]; onClick?: () => void }) {
  const r = rarities.find((x) => x.id === reward.rarity)
  const t = types.find((x) => x.id === reward.typeId)

  return (
    <Box onClick={onClick} sx={{
      ...rarityCardSx(r),
      animation: `${cardIn} 0.55s cubic-bezier(0.16,1,0.3,1)`,
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <Stack spacing={1.5} sx={{ position: 'relative', zIndex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          {r && (
            <Chip size="small" label={`${r.emoji} ${r.label}`} sx={{
              fontSize: '0.7rem', fontWeight: 800, height: 22,
              background: r.chipBg, color: r.chipColor,
              border: `1px solid ${r.borderColor}`,
              '& .MuiChip-label': { px: 1 },
            }} />
          )}
          {reward.isNew && (
            <Chip size="small" label="✨ Novo!" sx={{
              fontSize: '0.68rem', fontWeight: 800, height: 22,
              bgcolor: '#dcfce7', color: '#15803d',
              '& .MuiChip-label': { px: 1 },
            }} />
          )}
        </Stack>

        <Box sx={{
          p: 1.15,
          borderRadius: radius.lg,
          background: 'rgba(255,255,255,0.68)',
          border: '1px solid rgba(255,255,255,0.58)',
          backdropFilter: 'blur(8px)',
          minWidth: 0,
        }}>
          <Typography sx={{
            fontFamily: font.serif, fontWeight: 700, fontSize: '1.2rem',
            color: r?.textColor ?? colors.text.primary, lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
          }}>
            {reward.title}
          </Typography>

          <Typography sx={{
            mt: 0.75,
            fontSize: '0.9rem', color: r?.captionColor ?? colors.text.secondary,
            lineHeight: 1.65, fontStyle: 'italic',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
          }}>
            &ldquo;{reward.message}&rdquo;
          </Typography>
        </Box>

        {t && (
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.5,
            px: 1, py: 0.3, borderRadius: radius.full,
            background: t.tagBg, color: t.tagColor,
            fontSize: '0.68rem', fontWeight: 700, alignSelf: 'flex-start',
          }}>
            {t.emoji} {t.label}
          </Box>
        )}
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
                    color: rarity.chipColor,
                    border: `1px solid ${rarity.borderColor}`,
                    '& .MuiChip-label': { px: 0.9 },
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
              <Box sx={{
                p: 1.35,
                borderRadius: radius.lg,
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(255,255,255,0.62)',
                backdropFilter: 'blur(8px)',
              }}>
                <Typography sx={{
                  fontSize: '0.92rem',
                  color: rarity?.captionColor ?? colors.text.secondary,
                  lineHeight: 1.7,
                  fontStyle: 'italic',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                }}>
                  &ldquo;{note.message}&rdquo;
                </Typography>
              </Box>
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
              fontSize: '0.62rem',
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

export function CollectionPlayPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useUser()
  const { theme } = useBackground()

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
  const [rewards, setRewards] = useState<CollectionDailyReward[]>([])
  const [isOpeningPack, setIsOpeningPack] = useState(false)
  const [openingSnapshot, setOpeningSnapshot] = useState<CollectionPlayView | null>(null)
  const [albumFilter, setAlbumFilter] = useState<AlbumFilter>('all')
  const [albumSearch, setAlbumSearch] = useState('')
  const [albumRarity, setAlbumRarity] = useState('all')
  const [albumType, setAlbumType] = useState('all')
  const [selectedNote, setSelectedNote] = useState<ReadableNote | null>(null)
  const displayPlay = isOpeningPack && openingSnapshot ? openingSnapshot : play
  const isLoading = collectionsLoading || (!!cid && (isSimulating ? notesLoading : playLoading))
  const { data: rarities = [] } = useCollectionRaritiesQuery(cid)
  const { data: types = [] } = useCollectionTypesQuery(cid)
  const openMutation = useOpenCollectionDailyMutation(cid)
  const favoriteMutation = useToggleCollectionFavoriteMutation(cid)

  function handleSelectNote(note: ReadableNote) {
    if (isSimulating) {
      simulation.markNoteViewed(note.id)
    }
    setSelectedNote(note)
  }

  useEffect(() => {
    setRewards([])
    setIsOpeningPack(false)
    setOpeningSnapshot(null)
    setAlbumSearch('')
    setAlbumRarity('all')
    setAlbumType('all')
    setSelectedNote(null)
  }, [cid, isSimulating])

  const canOpen = displayPlay?.daily.canOpen ?? false
  const completion = displayPlay && displayPlay.total > 0 ? Math.round((displayPlay.owned / displayPlay.total) * 100) : 0
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

  async function waitForPackAnimation(startedAt: number) {
    const elapsed = Date.now() - startedAt
    await wait(Math.max(0, PACK_OPEN_ANIMATION_MS - elapsed))
  }

  async function handleOpen() {
    if (!cid || !play || isOpeningPack) return
    if (isSimulating && notes.length === 0) {
      toast.info('Adicione bilhetes na coleção para simular a abertura.')
      return
    }

    const startedAt = Date.now()
    setOpeningSnapshot(play)
    setIsOpeningPack(true)

    try {
      if (isSimulating) {
        const ownedIds = play.items.filter((item) => item.owned).map((item) => item.id)
        const pendingRewards = simulateDailyOpen(notes, rarities, ownedIds)
        if (pendingRewards.length === 0) {
          setIsOpeningPack(false)
          setOpeningSnapshot(null)
          toast.info('Você já descobriu todos os bilhetes disponíveis nessa coleção.')
          return
        }
        await waitForPackAnimation(startedAt)
        const revealedRewards = simulation.commitDailyOpen(pendingRewards)
        setRewards(revealedRewards)
        toast.love(
          `${revealedRewards.length} bilhete${revealedRewards.length !== 1 ? 's' : ''}!`,
          { description: `${revealedRewards.length} novo${revealedRewards.length !== 1 ? 's' : ''} na prévia ✨` },
        )
        return
      }

      const result = await openMutation.mutateAsync()
      await waitForPackAnimation(startedAt)
      await queryClient.invalidateQueries({ queryKey: ['col-play', cid] })
      setRewards(result.rewards)
      const newCount = result.rewards.filter((r) => r.isNew).length
      toast.love(
        `${result.rewards.length} bilhete${result.rewards.length !== 1 ? 's' : ''}!`,
        { description: newCount > 0 ? `${newCount} novo${newCount !== 1 ? 's' : ''} na coleção ✨` : 'Pacotinho do dia aberto!' },
      )
    } catch (e) {
      toast.error((e as Error).message ?? 'Erro ao abrir pacotinho.')
    } finally {
      setIsOpeningPack(false)
      setOpeningSnapshot(null)
    }
  }

  const isWriter = user?.role === 'writer' && !isSimulating

  return (
    <Box sx={{ height: '100%', position: 'relative', background: theme.gradient }}>
      <FavoriteIcon sx={{ position: 'absolute', bottom: -60, right: -60, fontSize: 400, color: 'rgba(225,29,72,0.04)', pointerEvents: 'none' }} />

      <ScrollablePage sx={{ px: 2.5, py: 2.5, animation: `${fadeIn} 0.35s ease` }}>
        <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 3 }}>
          {!isSimulating && (
            <IconButton
              size="small"
              aria-label="voltar para coleções"
              onClick={() => navigate('/colecoes')}
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

            <Card sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: 0.8, color: colors.text.muted, textTransform: 'uppercase' }}>
                    Sua coleção
                  </Typography>
                  <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.1rem', color: colors.primary.main }}>
                    {completion}%
                  </Typography>
                </Stack>
                <LinearProgress variant="determinate" value={completion} sx={{
                  height: 6, borderRadius: radius.full, bgcolor: 'rgba(0,0,0,0.06)',
                  '& .MuiLinearProgress-bar': { borderRadius: radius.full, background: `linear-gradient(90deg, ${colors.primary.main}, ${colors.purple.main})` },
                }} />
                <Typography sx={{ fontSize: '0.72rem', color: colors.text.muted }}>
                  {displayPlay.owned} de {displayPlay.total} bilhetes coletados
                </Typography>
              </Stack>
            </Card>

            {isSimulating && (
              <Stack spacing={1.2}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.3,
                  py: 0.82,
                  background: 'rgba(255,255,255,0.5)',
                  backdropFilter: 'blur(14px)',
                  border: '1.5px solid rgba(255,255,255,0.62)',
                  borderRadius: radius.xl,
                }}>
                  <SearchIcon sx={{ fontSize: 17, color: theme.textOnBgMuted, flexShrink: 0 }} />
                  <Box
                    component="input"
                    value={albumSearch}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setAlbumSearch(event.target.value)}
                    placeholder="Buscar cartinha..."
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      color: theme.textOnBg,
                      fontFamily: 'inherit',
                      fontSize: '0.84rem',
                      '&::placeholder': { color: theme.textOnBgMuted },
                    }}
                  />
                  {albumSearch && (
                    <Box
                      onClick={() => setAlbumSearch('')}
                      sx={{ display: 'flex', color: theme.textOnBgMuted, cursor: 'pointer', flexShrink: 0 }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 0.6, overflowX: 'auto', pb: 0.2, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                  {[
                    { id: 'all' as AlbumFilter, label: 'Todas' },
                    ...(hasFavorites ? [{ id: 'favorites' as AlbumFilter, label: 'Favoritas' }] : []),
                  ].map((item) => (
                    <Box
                      key={item.id}
                      onClick={() => setAlbumFilter(item.id)}
                      sx={{
                        px: 1.1,
                        py: 0.52,
                        borderRadius: radius.full,
                        cursor: 'pointer',
                        flexShrink: 0,
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: albumFilter === item.id ? '#fff' : theme.textOnBgMuted,
                        background: albumFilter === item.id ? theme.accent : 'rgba(255,255,255,0.48)',
                        border: `1px solid ${albumFilter === item.id ? theme.accent : 'rgba(255,255,255,0.58)'}`,
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      {item.label}
                    </Box>
                  ))}
                </Box>

                {discoveredRarities.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.6, overflowX: 'auto', pb: 0.2, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                    <Box
                      onClick={() => setAlbumRarity('all')}
                      sx={{
                        px: 1.05,
                        py: 0.48,
                        borderRadius: radius.full,
                        cursor: 'pointer',
                        flexShrink: 0,
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: albumRarity === 'all' ? '#fff' : theme.textOnBgMuted,
                        background: albumRarity === 'all' ? colors.primary.main : 'rgba(255,255,255,0.42)',
                        border: `1px solid ${albumRarity === 'all' ? colors.primary.main : 'rgba(255,255,255,0.54)'}`,
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      Todas raridades
                    </Box>
                    {discoveredRarities.map((rarity) => (
                      <Box
                        key={rarity.id}
                        onClick={() => setAlbumRarity(rarity.id)}
                        sx={{
                          px: 1.05,
                          py: 0.48,
                          borderRadius: radius.full,
                          cursor: 'pointer',
                          flexShrink: 0,
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          color: albumRarity === rarity.id ? rarity.chipColor : theme.textOnBgMuted,
                          background: albumRarity === rarity.id ? rarity.chipBg : 'rgba(255,255,255,0.42)',
                          border: `1px solid ${albumRarity === rarity.id ? rarity.borderColor : 'rgba(255,255,255,0.54)'}`,
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        {rarity.emoji} {rarity.label}
                      </Box>
                    ))}
                  </Box>
                )}

                {discoveredTypes.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.6, overflowX: 'auto', pb: 0.2, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                    <Box
                      onClick={() => setAlbumType('all')}
                      sx={{
                        px: 1.05,
                        py: 0.48,
                        borderRadius: radius.full,
                        cursor: 'pointer',
                        flexShrink: 0,
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: albumType === 'all' ? '#fff' : theme.textOnBgMuted,
                        background: albumType === 'all' ? colors.purple.main : 'rgba(255,255,255,0.42)',
                        border: `1px solid ${albumType === 'all' ? colors.purple.main : 'rgba(255,255,255,0.54)'}`,
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      Todos tipos
                    </Box>
                    {discoveredTypes.map((type) => (
                      <Box
                        key={type.id}
                        onClick={() => setAlbumType(type.id)}
                        sx={{
                          px: 1.05,
                          py: 0.48,
                          borderRadius: radius.full,
                          cursor: 'pointer',
                          flexShrink: 0,
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          color: albumType === type.id ? type.tagColor : theme.textOnBgMuted,
                          background: albumType === type.id ? type.tagBg : 'rgba(255,255,255,0.42)',
                          border: `1px solid ${albumType === type.id ? `${type.accentColor}66` : 'rgba(255,255,255,0.54)'}`,
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        {type.emoji} {type.label}
                      </Box>
                    ))}
                  </Box>
                )}

                {albumItems.length === 0 ? (
                  <Card sx={{ p: 2, textAlign: 'center' }}>
                    <Typography sx={{ fontFamily: font.serif, fontWeight: 800, color: colors.text.primary, mb: 0.3 }}>
                      Nenhuma cartinha encontrada
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: colors.text.secondary }}>
                      Abra pacotinhos na tela inicial ou ajuste os filtros.
                    </Typography>
                  </Card>
                ) : (
                  <Stack spacing={1}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: 1.1, color: theme.textOnBgMuted, textTransform: 'uppercase' }}>
                      Cartinhas da coleção — {albumItems.length}
                    </Typography>
                    {albumItems.map((note) => {
                      const r = rarities.find((x) => x.id === note.rarity)
                      const t = types.find((x) => x.id === note.typeId)
                      const isUnread = isSimulating && simulation.unreadNoteIds.includes(note.id)
                      return (
                        <Card key={note.id} accent={r?.borderColor} onClick={() => handleSelectNote(note)} sx={{
                          ...(rarityCardSx(r, true) as object),
                          cursor: 'pointer',
                        }}>
                          <Box sx={{ position: 'relative', zIndex: 1 }}>
                            {isUnread && (
                              <Box sx={{
                                position: 'absolute',
                                top: -2,
                                left: -2,
                                width: 11,
                                height: 11,
                                borderRadius: radius.full,
                                background: colors.rose.main,
                                boxShadow: `0 0 0 3px rgba(255,255,255,0.82), 0 0 14px ${colors.rose.glow}`,
                                zIndex: 3,
                              }} />
                            )}
                            <Box sx={{
                              position: 'relative',
                              minWidth: 0,
                              p: 1,
                              pr: 4.4,
                              borderRadius: radius.lg,
                              background: 'rgba(255,255,255,0.68)',
                              border: '1px solid rgba(255,255,255,0.58)',
                              backdropFilter: 'blur(8px)',
                            }}>
                                <Stack direction="row" alignItems="center" spacing={0.6} sx={{ mb: 0.65, flexWrap: 'wrap', rowGap: 0.5 }}>
                                  {r && (
                                    <Chip size="small" label={`${r.emoji} ${r.label}`} sx={{
                                      height: 19,
                                      fontSize: '0.62rem',
                                      fontWeight: 800,
                                      background: r.chipBg,
                                      color: r.chipColor,
                                      border: `1px solid ${r.borderColor}`,
                                      '& .MuiChip-label': { px: 0.8 },
                                    }} />
                                  )}
                                  {t && (
                                    <Chip size="small" label={`${t.emoji} ${t.label}`} sx={{
                                      height: 19,
                                      fontSize: '0.62rem',
                                      fontWeight: 800,
                                      background: t.tagBg,
                                      color: t.tagColor,
                                      border: `1px solid ${t.accentColor}44`,
                                      '& .MuiChip-label': { px: 0.8 },
                                    }} />
                                  )}
                                </Stack>
                                <Typography sx={{
                                  fontFamily: font.serif,
                                  fontWeight: 800,
                                  fontSize: '0.98rem',
                                  color: r?.textColor ?? colors.text.primary,
                                  mb: 0.3,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  overflowWrap: 'anywhere',
                                  wordBreak: 'break-word',
                                }}>
                                  {note.title}
                                </Typography>
                                <Typography sx={{
                                  fontSize: '0.8rem',
                                  color: r?.captionColor ?? colors.text.secondary,
                                  lineHeight: 1.55,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  overflowWrap: 'anywhere',
                                  wordBreak: 'break-word',
                                }}>
                                  {note.message}
                                </Typography>
                                <IconButton
                                size="small"
                                aria-label="favoritar bilhete"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    simulation.toggleFavorite(note.id, !note.favorite)
                                  }}
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  p: 0.55,
                                  borderRadius: radius.md,
                                  color: note.favorite ? colors.rose.main : (r?.captionColor ?? colors.text.muted),
                                  background: note.favorite ? 'rgba(254,243,199,0.92)' : 'rgba(255,255,255,0.74)',
                                  border: `1px solid ${note.favorite ? 'rgba(234,179,8,0.38)' : 'rgba(255,255,255,0.68)'}`,
                                  backdropFilter: 'blur(8px)',
                                  boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
                                }}
                              >
                                {note.favorite ? <StarIcon sx={{ fontSize: 17, color: '#eab308' }} /> : <StarBorderIcon sx={{ fontSize: 17 }} />}
                              </IconButton>
                            </Box>
                          </Box>
                        </Card>
                      )
                    })}
                  </Stack>
                )}
              </Stack>
            )}

            {!isSimulating && (
            <Stack spacing={1.5} alignItems="center">
              <Box
                onClick={canOpen && !openMutation.isPending && !isOpeningPack ? handleOpen : undefined}
                onMouseDown={(event) => event.preventDefault()}
                sx={{
                  width: 120, height: 120, borderRadius: '50%', cursor: canOpen ? 'pointer' : 'default',
                  background: canOpen
                    ? 'linear-gradient(135deg, #f43f5e, #e11d48)'
                    : `linear-gradient(135deg, ${colors.primary.main}, ${colors.purple.main})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: canOpen ? '0 8px 32px rgba(244,63,94,0.4)' : `0 8px 32px ${colors.primary.glow}`,
                  transition: 'all 0.3s',
                  animation: canOpen ? `${pulse} 2.2s ease-in-out infinite` : 'none',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  outline: 'none',
                  touchAction: 'manipulation',
                  '&:hover': canOpen ? { transform: 'scale(1.06)' } : {},
                  '&:focus': { outline: 'none' },
                  '&:focus-visible': { outline: 'none' },
                }}
              >
                <FavoriteIcon sx={{ fontSize: 44, color: '#fff', opacity: 0.9, pointerEvents: 'none', userSelect: 'none' }} />
              </Box>

              {canOpen ? (
                <Stack spacing={0.3} alignItems="center">
                  <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1rem', color: theme.textOnBg }}>
                    Seu pacotinho está pronto!
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: theme.textOnBgMuted }}>
                    Toque no coração para abrir ✨
                  </Typography>
                </Stack>
              ) : (
                <Stack spacing={0.3} alignItems="center">
                  <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1rem', color: theme.textOnBg }}>
                    Próximo pacotinho
                  </Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: theme.textOnBgMuted }}>
                    às {formatTime(displayPlay.daily.availableAt)} · <Countdown availableAt={displayPlay.daily.availableAt} />
                  </Typography>
                </Stack>
              )}
            </Stack>
            )}

            {!isSimulating && !isOpeningPack && rewards.length > 0 && (
              <Stack spacing={1.2}>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: 1.2, color: theme.textOnBgMuted, textTransform: 'uppercase' }}>
                  Pacotinho de hoje
                </Typography>
                {rewards.map((item, index) => (
                  <RewardCard key={`${item.id}-${index}`} reward={item} rarities={rarities} types={types} onClick={() => handleSelectNote(item)} />
                ))}
              </Stack>
            )}

            {!isSimulating && displayPlay.items.filter((n) => n.owned).length > 0 && (
              <Stack spacing={1}>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: 1.2, color: theme.textOnBgMuted, textTransform: 'uppercase' }}>
                  Bilhetes coletados
                </Typography>
                {displayPlay.items.filter((n) => n.owned).map((note) => {
                  const r = rarities.find((x) => x.id === note.rarity)
                  const t = types.find((x) => x.id === note.typeId)
                  return (
                    <Card key={note.id} accent={r?.borderColor} onClick={() => handleSelectNote(note)} sx={{ ...(rarityCardSx(r, true) as object), cursor: 'pointer' }}>
                      <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                          <Box sx={{
                            flex: 1,
                            minWidth: 0,
                            p: 1,
                            borderRadius: radius.lg,
                            background: 'rgba(255,255,255,0.68)',
                            border: '1px solid rgba(255,255,255,0.58)',
                            backdropFilter: 'blur(8px)',
                          }}>
                            <Stack direction="row" alignItems="center" spacing={0.6} sx={{ mb: 0.65, flexWrap: 'wrap', rowGap: 0.5 }}>
                              {r && (
                                <Chip size="small" label={`${r.emoji} ${r.label}`} sx={{
                                  height: 19,
                                  fontSize: '0.62rem',
                                  fontWeight: 800,
                                  background: r.chipBg,
                                  color: r.chipColor,
                                  border: `1px solid ${r.borderColor}`,
                                  '& .MuiChip-label': { px: 0.8 },
                                }} />
                              )}
                              {t && (
                                <Chip size="small" label={`${t.emoji} ${t.label}`} sx={{
                                  height: 19,
                                  fontSize: '0.62rem',
                                  fontWeight: 800,
                                  background: t.tagBg,
                                  color: t.tagColor,
                                  border: `1px solid ${t.accentColor}44`,
                                  '& .MuiChip-label': { px: 0.8 },
                                }} />
                              )}
                            </Stack>
                            <Typography sx={{
                              fontFamily: font.serif,
                              fontWeight: 700,
                              fontSize: '0.98rem',
                              color: r?.textColor ?? colors.text.primary,
                              mb: 0.3,
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              overflowWrap: 'anywhere',
                              wordBreak: 'break-word',
                            }}>
                              {note.title}
                            </Typography>
                            <Typography sx={{
                              fontSize: '0.8rem', color: r?.captionColor ?? colors.text.secondary, lineHeight: 1.55,
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                              overflowWrap: 'anywhere',
                              wordBreak: 'break-word',
                            }}>
                              {note.message}
                            </Typography>
                          </Box>
                          <Stack spacing={0.4} alignItems="center" sx={{ flexShrink: 0 }}>
                            <IconButton
                              size="small"
                              aria-label="favoritar bilhete"
                              onClick={(event) => {
                                event.stopPropagation()
                                if (isSimulating) {
                                  simulation.toggleFavorite(note.id, !note.favorite)
                                  return
                                }
                                favoriteMutation.mutate({ id: note.id, favorite: !note.favorite })
                              }}
                              sx={{
                                p: 0.55,
                                borderRadius: radius.md,
                                color: note.favorite ? colors.rose.main : (r?.captionColor ?? colors.text.muted),
                                background: note.favorite ? 'rgba(244,63,94,0.14)' : 'rgba(255,255,255,0.38)',
                                border: `1px solid ${note.favorite ? 'rgba(244,63,94,0.28)' : 'rgba(255,255,255,0.48)'}`,
                                backdropFilter: 'blur(8px)',
                                transition: 'transform 0.16s ease, background 0.16s ease, box-shadow 0.16s ease',
                                '&:hover': {
                                  transform: 'translateY(-1px) scale(1.06)',
                                  background: note.favorite ? 'rgba(244,63,94,0.22)' : 'rgba(255,255,255,0.62)',
                                  boxShadow: `0 5px 14px ${note.favorite ? 'rgba(244,63,94,0.22)' : (r?.glowColor || 'rgba(15,23,42,0.12)')}`,
                                },
                              }}
                            >
                              {note.favorite ? <FavoriteIcon sx={{ fontSize: 17 }} /> : <FavoriteBorderIcon sx={{ fontSize: 17 }} />}
                            </IconButton>
                          </Stack>
                        </Stack>
                      </Box>
                    </Card>
                  )
                })}
              </Stack>
            )}

            {!isSimulating && displayPlay.total > 0 && displayPlay.items.filter((n) => !n.owned).length > 0 && (
              <Stack spacing={1}>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: 1.2, color: theme.textOnBgMuted, textTransform: 'uppercase' }}>
                  Ainda por descobrir — {displayPlay.items.filter((n) => !n.owned).length}
                </Typography>
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
      <PackOpeningDialog open={isOpeningPack} emoji={collection?.emoji ?? '💌'} accent={theme.accent} />
      <NoteDetailDialog note={selectedNote} rarities={rarities} types={types} onClose={() => setSelectedNote(null)} />
    </Box>
  )
}
