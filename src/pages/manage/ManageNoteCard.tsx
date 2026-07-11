import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import { Card } from '../../components/ui'
import { RewardCard } from '../../components/collection/RewardCard'
import { colors, font, ink, radius } from '../../design-system'
import { gradientTextSx, themedCardBg } from '../../utils/colorUtils'
import { actionButtonSx } from './shared'
import type { NoteRecord, NoteTypeConfig, RarityConfig } from '../../types/note'

export type ManageNoteView = 'cards' | 'list' | 'compact'

export interface NoteSelection {
  selected: boolean
  accent: string
  onToggle: () => void
}

interface ManageNoteCardProps {
  note: NoteRecord
  view: ManageNoteView
  r?: RarityConfig
  noteTypes?: NoteTypeConfig[]
  mask: boolean
  onOpen: () => void
  onEdit: () => void
  onDisable: () => void
  selection?: NoteSelection
}

function CheckCircle({ selection, size = 22 }: { selection: NoteSelection; size?: number }) {
  return (
    <Box sx={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      border: `2px solid ${selection.selected ? selection.accent : colors.border.medium}`,
      background: selection.selected ? selection.accent : 'rgba(255,255,255,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease',
    }}>
      {selection.selected && <Box component="span" sx={{ color: '#fff', fontSize: size * 0.32, lineHeight: 1, fontWeight: 900 }}>✓</Box>}
    </Box>
  )
}

function NoteActions({ size = 16, selection, onOpen, onEdit, onDisable, blur }: {
  size?: number
  selection?: NoteSelection
  onOpen: () => void
  onEdit: () => void
  onDisable: () => void
  blur?: boolean
}) {
  const extra = { width: size + 12, height: size + 12, ...(blur ? { backdropFilter: 'blur(8px)' } : {}) }
  const stop = (fn: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn() }
  return (
    <>
      {selection && (
        <IconButton size="small" aria-label="ver bilhete" onClick={stop(onOpen)} sx={{ ...actionButtonSx('neutral'), ...extra }}>
          <VisibilityOutlinedIcon sx={{ fontSize: size }} />
        </IconButton>
      )}
      <IconButton size="small" aria-label="editar bilhete" onClick={stop(onEdit)} sx={{ ...actionButtonSx('primary'), ...extra }}>
        <EditOutlinedIcon sx={{ fontSize: size }} />
      </IconButton>
      <IconButton size="small" aria-label="desativar bilhete" onClick={stop(onDisable)} sx={{ ...actionButtonSx('danger'), ...extra }}>
        <DeleteForeverOutlinedIcon sx={{ fontSize: size }} />
      </IconButton>
    </>
  )
}

export function ManageNoteCard({ note, view, r, noteTypes = [], mask, onOpen, onEdit, onDisable, selection }: ManageNoteCardProps) {
  const handleClick = selection ? selection.onToggle : onOpen
  const selectedBorder = selection?.selected ? selection.accent : undefined
  const selectedShadow = selection?.selected ? `0 8px 26px ${selection.accent}30` : undefined

  if (view === 'compact') {
    return (
      <Card accent={r?.borderColor} onClick={handleClick} sx={{
        p: 0, overflow: 'hidden', cursor: 'pointer',
        border: `1px solid ${selectedBorder ?? r?.borderColor ?? colors.border.subtle}`,
        background: themedCardBg('rgba(255,255,255,0.74)', mask),
        boxShadow: selectedShadow ?? '0 3px 10px rgba(15,23,42,0.05)',
        '&:hover': { boxShadow: selectedShadow ?? '0 5px 14px rgba(15,23,42,0.12)' },
      }}>
        <Stack direction="row" alignItems="center" spacing={0.8} sx={{ minHeight: 38, px: 1, py: 0.35 }}>
          <Box sx={{ width: 6, height: 22, borderRadius: radius.full, background: r?.borderColor ?? colors.border.subtle, flexShrink: 0 }} />
          {note.imageUrl && (
            <Box sx={{ width: 28, height: 28, flexShrink: 0, borderRadius: radius.sm, overflow: 'hidden', border: `1px solid ${r?.borderColor ?? ink.borderSubtle}` }}>
              <Box component="img" src={note.imageUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </Box>
          )}
          <Typography sx={{ flex: 1, minWidth: 0, fontFamily: font.serif, fontWeight: 800, fontSize: '0.82rem', color: r?.textColor ?? ink.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {note.title}
          </Typography>
          <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0, opacity: 0.72 }}>
            <NoteActions size={14} selection={selection} onOpen={onOpen} onEdit={onEdit} onDisable={onDisable} />
          </Stack>
          {selection && <CheckCircle selection={selection} size={20} />}
        </Stack>
      </Card>
    )
  }

  if (view === 'list') {
    return (
      <Card accent={r?.borderColor} onClick={handleClick} sx={{
        p: 0, overflow: 'hidden', cursor: 'pointer',
        border: `1.5px solid ${selectedBorder ?? r?.borderColor ?? colors.border.subtle}`,
        background: themedCardBg('rgba(255,255,255,0.78)', mask),
        boxShadow: selectedShadow ?? '0 6px 18px rgba(15,23,42,0.07)',
        transition: 'transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease',
        '&:hover': { transform: 'translateY(-1px)', boxShadow: selectedShadow ?? `0 8px 24px ${r?.glowColor || 'rgba(15,23,42,0.1)'}` },
      }}>
        <Stack direction="row" alignItems="stretch" sx={{ minHeight: 74 }}>
          {note.imageUrl ? (
            <Box sx={{ width: 72, flexShrink: 0, overflow: 'hidden' }}>
              <Box component="img" src={note.imageUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </Box>
          ) : (
            <Box sx={{ width: 5, flexShrink: 0, background: r ? `linear-gradient(180deg,${r.borderColor},${r.glowColor || r.borderColor})` : colors.border.subtle }} />
          )}
          <Box sx={{ flex: 1, minWidth: 0, px: 1.25, py: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={0.6} alignItems="center" sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '0.92rem', color: ink.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {note.title}
                  </Typography>
                  {r && (
                    <Box sx={{ px: 0.65, py: 0.15, borderRadius: radius.full, background: r.chipBg, border: `1px solid ${r.borderColor}`, fontSize: '0.68rem', fontWeight: 850, flexShrink: 0 }}>
                      <Box component="span" sx={gradientTextSx(r.chipColor)}>{r.emoji}</Box>
                    </Box>
                  )}
                  {noteTypes.map((t) => (
                    <Box key={t.id} sx={{ px: 0.65, py: 0.15, borderRadius: radius.full, background: t.tagBg, color: t.tagColor, border: `1px solid ${t.accentColor}33`, fontSize: '0.68rem', fontWeight: 850, flexShrink: 0 }}>
                      {t.emoji}
                    </Box>
                  ))}
                </Stack>
                <Typography sx={{ mt: 0.25, fontSize: '0.74rem', color: ink.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {note.message}
                </Typography>
                <Typography sx={{ mt: 0.35, fontSize: '0.70rem', color: ink.muted, fontWeight: 700 }}>
                  {[r?.label, ...noteTypes.map((t) => t.label)].filter(Boolean).join(' · ') || 'Sem categoria'}
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.4} alignItems="center" sx={{ flexShrink: 0 }}>
                <NoteActions selection={selection} onOpen={onOpen} onEdit={onEdit} onDisable={onDisable} />
                {selection && <CheckCircle selection={selection} />}
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Card>
    )
  }

  if (note.imageUrl && note.imageLayout) {
    return (
      <Box onClick={handleClick} sx={{
        position: 'relative', cursor: 'pointer', borderRadius: radius.xl,
        boxShadow: selection?.selected ? `0 0 0 2.5px ${selection.accent}, 0 8px 26px ${selection.accent}30` : undefined,
        transition: 'box-shadow 0.15s ease',
      }}>
        <RewardCard
          reward={{ id: note.id, title: note.title, message: note.message, rarity: note.rarity, typeId: note.typeId, imageUrl: note.imageUrl, imageLayout: note.imageLayout, isNew: false }}
          rarities={r ? [r] : []}
          types={noteTypes}
        />
        {selection && (
          <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 5 }}>
            <CheckCircle selection={selection} />
          </Box>
        )}
        <Stack direction="row" spacing={0.4} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 5 }}>
          <NoteActions selection={selection} onOpen={onOpen} onEdit={onEdit} onDisable={onDisable} blur />
        </Stack>
      </Box>
    )
  }

  return (
    <Card accent={r?.borderColor} onClick={handleClick} sx={{
      p: 0, overflow: 'hidden', position: 'relative', cursor: 'pointer',
      background: themedCardBg(r?.cardBg ?? ink.surface, mask),
      border: `1.5px solid ${selectedBorder ?? r?.borderColor ?? colors.border.subtle}`,
      boxShadow: selectedShadow ?? (r?.glowColor ? `${r.shadow}, 0 0 26px ${r.glowColor}` : r?.shadow),
      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      '&::before': r ? {
        content: '""', position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(circle at 10% 0%, rgba(255,255,255,0.46), transparent 34%), radial-gradient(circle at 100% 100%, ${r.glowColor || r.borderColor}, transparent 34%)`,
        opacity: 0.42, mixBlendMode: 'soft-light',
      } : undefined,
    }}>
      <Box sx={{ height: '3px', background: r ? `linear-gradient(90deg,${r.borderColor},${r.glowColor || r.borderColor})` : colors.border.subtle, position: 'relative', zIndex: 1 }} />
      <Box sx={{ p: 1.8, position: 'relative', zIndex: 1 }}>
        <Stack spacing={0.8}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            {selection && <CheckCircle selection={selection} />}
            <Box sx={{ flex: 1 }} />
            <NoteActions selection={selection} onOpen={onOpen} onEdit={onEdit} onDisable={onDisable} />
          </Stack>
          <Box sx={{ flex: 1, minWidth: 0, p: 1, borderRadius: radius.lg, background: 'rgba(255,255,255,0.68)', border: '1px solid rgba(255,255,255,0.58)', backdropFilter: 'blur(8px)' }}>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '0.93rem', color: r?.textColor ?? ink.primary, mb: 0.3, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
              {note.title}
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: r?.captionColor ?? ink.secondary, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
              {note.message}
            </Typography>
            {(r || noteTypes.length > 0) && (
              <Stack direction="row" spacing={0.6} sx={{ mt: 0.9, flexWrap: 'wrap', rowGap: 0.5 }}>
                {r && (
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 1, py: 0.3, borderRadius: radius.full, background: r.chipBg, border: `1px solid ${r.borderColor}`, fontSize: '0.72rem', fontWeight: 700 }}>
                    <Box component="span" sx={gradientTextSx(r.chipColor)}>{r.emoji} {r.label}</Box>
                  </Box>
                )}
                {noteTypes.map((t) => (
                  <Box key={t.id} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, px: 1, py: 0.3, borderRadius: radius.full, background: t.tagBg, color: t.tagColor, border: `1px solid ${t.accentColor}44`, fontSize: '0.72rem', fontWeight: 700 }}>
                    {t.emoji} {t.label}
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </Box>
    </Card>
  )
}
