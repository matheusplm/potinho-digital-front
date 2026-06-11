import AddIcon from '@mui/icons-material/Add'
import FavoriteIcon from '@mui/icons-material/Favorite'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import ViewListIcon from '@mui/icons-material/ViewList'
import GridViewIcon from '@mui/icons-material/GridView'
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda'
import EditIcon from '@mui/icons-material/Edit'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Stack, TextField, Typography,
} from '@mui/material'
import { keyframes } from '@emotion/react'
import { useState, useEffect, useMemo, type ElementType } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input, LoadingState, PageTitle, ScrollablePage, toast } from '../components/ui'
import {
  useCollectionsQuery, useCreateCollectionMutation,
  useUpdateCollectionMutation, useDeleteCollectionMutation,
} from '../hooks/useNotes'
import { useBackground } from '../context/BackgroundContext'
import { useSimulation } from '../context/SimulationContext'
import { useUser } from '../context/UserContext'
import { backgroundThemes, colors, font, radius } from '../design-system'
import { slugify } from '../utils/slug'
import type { Collection, CollectionFormData } from '../types/note'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`
const cardIn = (i: number) => keyframes`
  from { opacity: 0; transform: translateY(${14 + i * 4}px); }
  to   { opacity: 1; transform: translateY(0); }
`
const ghostPulse = keyframes`
  0%, 100% { transform: scale(1);   box-shadow: 0 0 0 0 rgba(0,0,0,0.12); }
  50%       { transform: scale(1.1); box-shadow: 0 0 0 8px rgba(0,0,0,0); }
`

type ViewMode = 'cards' | 'grid' | 'list'
type SortType = 'name-asc' | 'name-desc'

const VIEW_KEY = 'potinho-collections-view'

const VIEW_ICONS: { mode: ViewMode; Icon: ElementType }[] = [
  { mode: 'cards', Icon: ViewAgendaIcon },
  { mode: 'grid',  Icon: GridViewIcon },
  { mode: 'list',  Icon: ViewListIcon },
]

function CollectionsFilterBar({
  sort, setSort, search, setSearch,
  view, changeView, accent, textOnBg, textOnBgMuted,
}: {
  sort: SortType;        setSort: (s: SortType) => void
  search: string;        setSearch: (s: string) => void
  view: ViewMode;        changeView: (v: ViewMode) => void
  accent: string;        textOnBg: string;  textOnBgMuted: string
}) {
  const chipBase = {
    px: 1.1, py: 0.5, borderRadius: radius.full, flexShrink: 0,
    cursor: 'pointer', transition: 'all 0.16s',
    backdropFilter: 'blur(8px)',
  }

  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        px: 1.4, py: 0.85,
        background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(12px)',
        border: '1.5px solid rgba(255,255,255,0.6)',
        borderRadius: radius.xl, mb: 1.2,
        transition: 'border-color 0.15s, background 0.15s',
        '&:focus-within': {
          border: `1.5px solid ${accent}66`,
          background: 'rgba(255,255,255,0.72)',
        },
      }}>
        <SearchIcon sx={{ fontSize: 17, color: textOnBgMuted, flexShrink: 0 }} />
        <Box
          component="input"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder="Buscar coleção..."
          sx={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontSize: '0.88rem', color: textOnBg, fontFamily: 'inherit',
            '&::placeholder': { color: textOnBgMuted },
          }}
        />
        {search && (
          <Box onClick={() => setSearch('')} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: textOnBgMuted, '&:hover': { color: textOnBg } }}>
            <CloseIcon sx={{ fontSize: 15 }} />
          </Box>
        )}
      </Box>

      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Box onClick={() => setSort(sort === 'name-asc' ? 'name-desc' : 'name-asc')} sx={{
          ...chipBase, display: 'flex', alignItems: 'center', gap: 0.3,
          px: 1.1, py: 0.5,
          background: sort !== 'name-asc' ? `${accent}1a` : 'rgba(255,255,255,0.38)',
          border: `1.5px solid ${sort !== 'name-asc' ? accent : 'rgba(255,255,255,0.55)'}`,
          color: sort !== 'name-asc' ? accent : textOnBgMuted,
        }}>
          <SwapVertIcon sx={{ fontSize: 13 }} />
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700 }}>
            {sort === 'name-asc' ? 'A-Z' : 'Z-A'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.8 }}>
          {VIEW_ICONS.map(({ mode, Icon }) => (
            <Box key={mode} onClick={() => changeView(mode)} sx={{
              width: 34, height: 34, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.15s', backdropFilter: 'blur(8px)',
              background: view === mode ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.38)',
              border: `1.5px solid ${view === mode ? accent : 'rgba(255,255,255,0.55)'}`,
              boxShadow: view === mode ? `0 2px 8px ${accent}22` : 'none',
              color: view === mode ? accent : textOnBgMuted,
              '&:hover': { background: 'rgba(255,255,255,0.65)' },
            }}>
              <Icon sx={{ fontSize: 15 }} />
            </Box>
          ))}
        </Box>
      </Stack>
    </Box>
  )
}

const EMOJIS = ['💙', '💗', '✨', '🌸', '🌙', '🌊', '🌿', '🔥', '⭐', '🎁', '🦋', '🍀']
const DEFAULT_FORM: CollectionFormData = { name: '', emoji: '💙', description: '', theme: 'romance' }

function CollectionFormDialog({
  open, onClose, initial, onSubmit, isPending,
}: {
  open: boolean
  onClose: () => void
  initial?: Collection
  onSubmit: (data: CollectionFormData) => Promise<void>
  isPending: boolean
}) {
  const [form, setForm] = useState<CollectionFormData>(DEFAULT_FORM)

  useEffect(() => {
    if (open) {
      setForm(initial
        ? { name: initial.name, emoji: initial.emoji, description: initial.description ?? '', theme: initial.theme }
        : DEFAULT_FORM
      )
    }
  }, [open, initial])

  const selectedBg = backgroundThemes.find((bg) => bg.key === form.theme) ?? backgroundThemes[0]
  const isEdit = Boolean(initial)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{
      paper: { sx: { borderRadius: radius.xl, mx: 2, background: 'rgba(255,253,251,0.98)', backdropFilter: 'blur(24px)' } }
    }}>
      <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 700, color: colors.text.primary, pb: 1 }}>
        {isEdit ? 'Editar coleção' : 'Nova coleção'}
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <Box sx={{
            height: 60, borderRadius: radius.lg,
            background: selectedBg.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', transition: 'background 0.3s ease',
            boxShadow: `0 4px 16px ${selectedBg.accent}33`,
          }}>
            {form.emoji || '💙'}
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: colors.text.secondary, mb: 0.8 }}>Emoji</Typography>
            <Box sx={{ display: 'flex', gap: 0.7, flexWrap: 'wrap' }}>
              {EMOJIS.map((e) => (
                <Box key={e} onClick={() => setForm((f) => ({ ...f, emoji: e }))} sx={{
                  width: 36, height: 36, borderRadius: radius.md, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                  border: `2px solid ${form.emoji === e ? colors.primary.main : 'transparent'}`,
                  background: form.emoji === e ? `${colors.primary.main}12` : 'rgba(0,0,0,0.04)',
                  transition: 'all 0.15s',
                }}>
                  {e}
                </Box>
              ))}
            </Box>
          </Box>

          <Box>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: colors.text.secondary }}>Nome</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: form.name.length > 50 ? colors.error.main : colors.text.muted }}>
                {form.name.length}/50
              </Typography>
            </Stack>
            <Input placeholder="Nosso potinho 💙" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value.slice(0, 50) }))} />
          </Box>

          <Box>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: colors.text.secondary }}>Descrição</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: colors.text.muted }}>{form.description.length}/200</Typography>
            </Stack>
            <TextField multiline rows={2} fullWidth placeholder="Um potinho cheio de amor..." value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value.slice(0, 200) }))}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: radius.md, fontSize: '0.86rem', background: colors.surface.overlay, '& fieldset': { borderColor: colors.border.medium } } }}
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: colors.text.secondary, mb: 1 }}>Cor da coleção</Typography>
            <Stack spacing={0.8}>
              {([false, true] as const).map((dark) => (
                <Box key={String(dark)}>
                  <Typography sx={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: 0.5, color: colors.text.muted, textTransform: 'uppercase', mb: 0.6 }}>
                    {dark ? 'Escuros' : 'Claros'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                    {backgroundThemes.filter((bg) => bg.isDark === dark).map((bg) => (
                      <Box key={bg.key} onClick={() => setForm((f) => ({ ...f, theme: bg.key }))} title={bg.label} sx={{
                        width: 30, height: 30, borderRadius: '50%', cursor: 'pointer',
                        background: bg.gradient, flexShrink: 0,
                        border: `2.5px solid ${form.theme === bg.key ? bg.accent : 'transparent'}`,
                        boxShadow: form.theme === bg.key ? `0 2px 10px ${bg.accent}66` : 'none',
                        transition: 'all 0.15s', '&:hover': { transform: 'scale(1.12)' },
                      }} />
                    ))}
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>Cancelar</Button>
        <Button variant="primary" loading={isPending} onClick={() => onSubmit(form)} disabled={!form.name.trim()} sx={{ flex: 1 }}>
          {isEdit ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const overlayBtn = {
  width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
  background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'transform 0.15s, box-shadow 0.15s',
  '&:hover': { transform: 'scale(1.1)', boxShadow: '0 4px 16px rgba(0,0,0,0.26)' },
}

function CardActions({ col, variant, onEdit, onDelete }: {
  col: Collection
  variant: 'overlay' | 'inline'
  onEdit: (col: Collection) => void
  onDelete: (col: Collection) => void
}) {
  const handle = (fn: (col: Collection) => void) => (e: React.MouseEvent) => {
    e.stopPropagation()
    fn(col)
  }

  if (variant === 'inline') {
    return (
      <Stack direction="row" spacing={0.2} sx={{ flexShrink: 0 }}>
        <IconButton size="small" aria-label="editar coleção" onClick={handle(onEdit)} sx={{ color: colors.primary.main, p: 0.7 }}>
          <EditIcon sx={{ fontSize: 17 }} />
        </IconButton>
        <IconButton size="small" aria-label="excluir coleção" onClick={handle(onDelete)} sx={{ color: colors.rose.main, p: 0.7 }}>
          <DeleteForeverOutlinedIcon sx={{ fontSize: 17 }} />
        </IconButton>
      </Stack>
    )
  }

  return (
    <Stack direction="row" spacing={0.7}>
      <Box onClick={handle(onEdit)} aria-label="editar coleção" sx={overlayBtn}>
        <EditIcon sx={{ fontSize: 15, color: colors.primary.main }} />
      </Box>
      <Box onClick={handle(onDelete)} aria-label="excluir coleção" sx={overlayBtn}>
        <DeleteForeverOutlinedIcon sx={{ fontSize: 15, color: colors.rose.main }} />
      </Box>
    </Stack>
  )
}

interface CardProps {
  col: Collection
  i: number
  onClick: () => void
  onEdit: (col: Collection) => void
  onDelete: (col: Collection) => void
}

function CollectionCardView({ col, i, onClick, onEdit, onDelete }: CardProps) {
  const bg = backgroundThemes.find((t) => t.key === col.theme) ?? backgroundThemes[0]
  const isOwner = col.access === 'owner'
  return (
    <Card
      onClick={onClick}
      sx={{
        p: 0, overflow: 'hidden', cursor: 'pointer',
        animation: `${cardIn(i)} ${0.28 + i * 0.05}s cubic-bezier(0.16,1,0.3,1) both`,
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 28px ${bg.accent}28` },
        '&:active': { transform: 'scale(0.985)' },
      }}
    >
      <Box sx={{ height: 84, background: bg.gradient, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.18) 0%, transparent 68%)', pointerEvents: 'none' }} />
        <Typography sx={{ fontSize: '2.2rem', lineHeight: 1, zIndex: 1, filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.2))' }}>
          {col.emoji}
        </Typography>
        {isOwner && (
          <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
            <CardActions col={col} variant="overlay" onEdit={onEdit} onDelete={onDelete} />
          </Box>
        )}
      </Box>
      <Box sx={{ px: 1.6, pt: 1.4, pb: 1.5 }}>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: col.description ? 0.5 : 0 }}>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1rem', color: colors.text.primary, lineHeight: 1.25, flex: 1, minWidth: 0, mr: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {col.name}
          </Typography>
          <Box sx={{
            px: 0.9, py: 0.3, borderRadius: radius.full, flexShrink: 0, mt: 0.1,
            background: isOwner ? `${colors.primary.main}15` : `${colors.rose.main}15`,
            border: `1px solid ${isOwner ? colors.primary.main : colors.rose.main}30`,
            fontSize: '0.58rem', fontWeight: 800, letterSpacing: 0.5,
            color: isOwner ? colors.primary.main : colors.rose.main,
            textTransform: 'uppercase',
          }}>
            {isOwner ? 'minha' : 'convidada'}
          </Box>
        </Stack>
        {col.description && (
          <Typography sx={{ fontSize: '0.78rem', color: colors.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {col.description}
          </Typography>
        )}
        <Box sx={{ height: '2.5px', borderRadius: 2, background: bg.gradient, mt: 1.3, opacity: 0.5 }} />
      </Box>
    </Card>
  )
}

function CollectionGridItem({ col, i, onClick, onEdit, onDelete }: CardProps) {
  const bg = backgroundThemes.find((t) => t.key === col.theme) ?? backgroundThemes[0]
  const isOwner = col.access === 'owner'
  return (
    <Box
      onClick={onClick}
      sx={{
        borderRadius: radius.xl, overflow: 'hidden', cursor: 'pointer',
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        animation: `${cardIn(i)} ${0.28 + i * 0.04}s cubic-bezier(0.16,1,0.3,1) both`,
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 10px 28px ${bg.accent}30` },
        '&:active': { transform: 'scale(0.96)' },
      }}
    >
      <Box sx={{ aspectRatio: '4/3', background: bg.gradient, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 40% 35%, rgba(255,255,255,0.22) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <Typography sx={{ fontSize: '2.2rem', lineHeight: 1, filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.22))' }}>
          {col.emoji}
        </Typography>
        {isOwner && (
          <Box sx={{ position: 'absolute', top: 6, right: 6, zIndex: 2 }}>
            <CardActions col={col} variant="overlay" onEdit={onEdit} onDelete={onDelete} />
          </Box>
        )}
      </Box>
      <Box sx={{ px: 1.3, py: 1.1, display: 'flex', flexDirection: 'column', gap: 0.35 }}>
        <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '0.88rem', color: colors.text.primary, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
          {col.name}
        </Typography>
        <Box sx={{
          alignSelf: 'flex-start', px: 0.7, py: 0.15, borderRadius: radius.full,
          background: isOwner ? `${colors.primary.main}15` : `${colors.rose.main}15`,
          fontSize: '0.56rem', fontWeight: 800, letterSpacing: 0.4,
          color: isOwner ? colors.primary.main : colors.rose.main,
          textTransform: 'uppercase',
        }}>
          {isOwner ? 'minha' : 'convidada'}
        </Box>
      </Box>
    </Box>
  )
}

function CollectionListItem({ col, i, onClick, onEdit, onDelete }: CardProps) {
  const bg = backgroundThemes.find((t) => t.key === col.theme) ?? backgroundThemes[0]
  const isOwner = col.access === 'owner'
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.4,
        px: 1.5, py: 1.3,
        borderRadius: radius.xl, cursor: 'pointer',
        background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.5)',
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
        animation: `${cardIn(i)} ${0.25 + i * 0.04}s cubic-bezier(0.16,1,0.3,1) both`,
        transition: 'background 0.15s, box-shadow 0.15s',
        '&:hover': { background: 'rgba(255,255,255,0.92)', boxShadow: `0 3px 14px ${bg.accent}22` },
        '&:active': { transform: 'scale(0.99)' },
      }}
    >
      <Box sx={{
        width: 44, height: 44, borderRadius: radius.lg, flexShrink: 0,
        background: bg.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.4rem', boxShadow: `0 3px 10px ${bg.accent}40`,
      }}>
        {col.emoji}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '0.92rem', color: colors.text.primary, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
          {col.name}
        </Typography>
        {col.description && (
          <Typography sx={{ fontSize: '0.72rem', color: colors.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mt: 0.1 }}>
            {col.description}
          </Typography>
        )}
      </Box>
      {isOwner
        ? <CardActions col={col} variant="inline" onEdit={onEdit} onDelete={onDelete} />
        : (
          <Box sx={{
            px: 0.8, py: 0.2, borderRadius: radius.full, flexShrink: 0,
            background: `${colors.rose.main}15`,
            fontSize: '0.57rem', fontWeight: 800, letterSpacing: 0.4,
            color: colors.rose.main, textTransform: 'uppercase',
          }}>
            convidada
          </Box>
        )
      }
    </Box>
  )
}

function AddGhostCard({ view, onClick, accent }: { view: ViewMode; onClick: () => void; accent: string }) {
  const PlusCircle = ({ size = 44 }: { size?: number }) => (
    <Box sx={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 4px 16px ${accent}55`,
      animation: `${ghostPulse} 2.4s ease-in-out infinite`,
    }}>
      <AddIcon sx={{ fontSize: size * 0.5, color: '#fff' }} />
    </Box>
  )

  const base = {
    cursor: 'pointer',
    border: `1.5px dashed ${accent}55`,
    transition: 'all 0.2s ease',
    '&:hover': { border: `1.5px dashed ${accent}cc`, transform: 'translateY(-2px)', boxShadow: `0 6px 24px ${accent}22` },
    '&:active': { transform: 'scale(0.985)' },
  }

  if (view === 'list') {
    return (
      <Box onClick={onClick} sx={{
        ...base, display: 'flex', alignItems: 'center', gap: 1.4,
        px: 1.4, py: 1.1, borderRadius: radius.lg,
        background: `linear-gradient(135deg, ${accent}08, ${accent}04)`,
        backdropFilter: 'blur(8px)',
      }}>
        <PlusCircle size={40} />
        <Box>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '0.92rem', color: accent, lineHeight: 1.2 }}>
            Nova coleção
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: accent, opacity: 0.55, mt: 0.15 }}>
            Toque para criar
          </Typography>
        </Box>
      </Box>
    )
  }

  if (view === 'grid') {
    return (
      <Box onClick={onClick} sx={{ ...base, borderRadius: radius.xl, overflow: 'hidden', background: `${accent}06` }}>
        <Box sx={{ aspectRatio: '4/3', background: `linear-gradient(135deg, ${accent}18, ${accent}30)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PlusCircle size={42} />
        </Box>
        <Box sx={{ px: 1.2, py: 1 }}>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '0.86rem', color: accent, lineHeight: 1.2 }}>
            Nova coleção
          </Typography>
          <Typography sx={{ fontSize: '0.6rem', color: accent, opacity: 0.5, mt: 0.2 }}>
            Toque para criar
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box onClick={onClick} sx={{ ...base, borderRadius: radius.xl, overflow: 'hidden', background: `${accent}06` }}>
      <Box sx={{
        height: 84, position: 'relative', overflow: 'hidden',
        background: `linear-gradient(135deg, ${accent}18, ${accent}32)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <PlusCircle size={46} />
      </Box>
      <Box sx={{ p: 1.6 }}>
        <Box>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1rem', color: accent, lineHeight: 1.25 }}>
            Nova coleção
          </Typography>
          <Typography sx={{ fontSize: '0.74rem', color: accent, opacity: 0.55, mt: 0.2 }}>
            Toque para criar
          </Typography>
        </Box>
        <Box sx={{ height: '3px', borderRadius: 2, background: `linear-gradient(90deg, ${accent}66, ${accent}22)`, mt: 1.2 }} />
      </Box>
    </Box>
  )
}

export function CollectionsListPage() {
  const { theme } = useBackground()
  const { user } = useUser()
  const { isActive, session, startSimulation } = useSimulation()
  const navigate = useNavigate()
  const { data: collections = [], isLoading } = useCollectionsQuery()
  const createMutation = useCreateCollectionMutation()
  const updateMutation = useUpdateCollectionMutation()
  const deleteMutation = useDeleteCollectionMutation()

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Collection | null>(null)
  const [deleting, setDeleting] = useState<Collection | null>(null)
  const [view, setView] = useState<ViewMode>(() => (localStorage.getItem(VIEW_KEY) as ViewMode) ?? 'cards')
  const [sort, setSort] = useState<SortType>('name-asc')
  const [search, setSearch] = useState('')

  const isWriter = user?.role === 'writer'

  useEffect(() => {
    if (!isActive || !session) return
    navigate(`/colecoes/${session.collectionSlug}`, { replace: true })
  }, [isActive, navigate, session])

  const displayedCollections = useMemo(() => {
    let result = collections
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((c) =>
        c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
      )
    }
    return [...result].sort((a, b) =>
      sort === 'name-asc'
        ? a.name.localeCompare(b.name, 'pt-BR')
        : b.name.localeCompare(a.name, 'pt-BR')
    )
  }, [collections, sort, search])

  function changeView(v: ViewMode) {
    setView(v)
    localStorage.setItem(VIEW_KEY, v)
  }

  function openCollection(col: Collection) {
    const slug = slugify(col.name)
    if (isActive) {
      startSimulation({
        collectionId: col.id,
        collectionSlug: slug,
        collectionName: col.name,
        collectionEmoji: col.emoji,
        preset: session?.preset ?? 'new_reader',
      })
      navigate(`/colecoes/${slug}`)
      return
    }
    navigate(col.access === 'owner' ? `/colecoes/${slug}/gerenciar` : `/colecoes/${slug}`)
  }

  if (isActive && session) {
    return (
      <Box sx={{ height: '100%', position: 'relative', background: theme.gradient }}>
        <ScrollablePage sx={{ px: 2.5, py: 2.5, animation: `${fadeIn} 0.35s ease` }}>
          <LoadingState label="Voltando para a coleção" accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} sx={{ minHeight: 360 }} />
        </ScrollablePage>
      </Box>
    )
  }

  async function handleCreate(data: CollectionFormData) {
    await createMutation.mutateAsync(data)
    toast.success('Coleção criada!')
    setCreateOpen(false)
  }

  async function handleUpdate(data: CollectionFormData) {
    if (!editing) return
    await updateMutation.mutateAsync({ id: editing.id, data })
    toast.success('Coleção atualizada!')
    setEditing(null)
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      toast.success('Coleção excluída.')
      setDeleting(null)
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao excluir coleção.')
    }
  }

  return (
    <Box sx={{ height: '100%', position: 'relative', background: theme.gradient }}>
      <FavoriteIcon sx={{
        position: 'absolute', bottom: -80, right: -80,
        fontSize: 440, color: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(225,29,72,0.04)',
        pointerEvents: 'none',
      }} />

      <ScrollablePage sx={{ px: 2.5, pt: 2.5, pb: 4, animation: `${fadeIn} 0.35s ease` }}>
        <Box sx={{ mb: 2.5 }}>
          <PageTitle
            title="Coleções"
            subtitle={isLoading ? 'Carregando...' : collections.length === 0 ? 'Nenhuma ainda' : `${collections.length} coleção${collections.length !== 1 ? 'ões' : ''}`}
          />
        </Box>

        {!isLoading && collections.length > 0 && (
          <CollectionsFilterBar
            sort={sort} setSort={setSort}
            search={search} setSearch={setSearch}
            view={view} changeView={changeView}
            accent={theme.accent} textOnBg={theme.textOnBg} textOnBgMuted={theme.textOnBgMuted}
          />
        )}

        {isLoading && (
          <LoadingState label="Carregando coleções" accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} sx={{ minHeight: 320 }} />
        )}

        {!isLoading && collections.length === 0 && !search && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, textAlign: 'center', py: 8 }}>
            <Box sx={{
              width: 72, height: 72, borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.accent}22, ${theme.accent}44)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AutoAwesomeIcon sx={{ fontSize: 32, color: theme.accent, opacity: 0.7 }} />
            </Box>
            <Stack spacing={0.5}>
              <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.15rem', color: theme.textOnBg }}>
                {isWriter ? 'Nenhuma coleção ainda' : 'Nenhuma coleção'}
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: theme.textOnBgMuted, maxWidth: 240 }}>
                {isWriter ? 'Crie sua primeira coleção de bilhetes' : 'Peça para liberarem seu email em uma coleção'}
              </Typography>
            </Stack>
            {isWriter && <AddGhostCard view="cards" onClick={() => setCreateOpen(true)} accent={theme.accent} />}
          </Box>
        )}

        {!isLoading && collections.length > 0 && displayedCollections.length === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 1 }}>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1rem', color: theme.textOnBg }}>
              Nenhuma coleção aqui
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: theme.textOnBgMuted }}>
              Tente outro filtro
            </Typography>
          </Box>
        )}

        {!isLoading && displayedCollections.length > 0 && (
          <>
            {view === 'cards' && (
              <Stack spacing={1.4}>
                {displayedCollections.map((col, i) => (
                  <CollectionCardView key={col.id} col={col} i={i} onClick={() => openCollection(col)} onEdit={setEditing} onDelete={setDeleting} />
                ))}
                {isWriter && <AddGhostCard view="cards" onClick={() => setCreateOpen(true)} accent={theme.accent} />}
              </Stack>
            )}
            {view === 'grid' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.4 }}>
                {displayedCollections.map((col, i) => (
                  <CollectionGridItem key={col.id} col={col} i={i} onClick={() => openCollection(col)} onEdit={setEditing} onDelete={setDeleting} />
                ))}
                {isWriter && <AddGhostCard view="grid" onClick={() => setCreateOpen(true)} accent={theme.accent} />}
              </Box>
            )}
            {view === 'list' && (
              <Stack spacing={0.8}>
                {displayedCollections.map((col, i) => (
                  <CollectionListItem key={col.id} col={col} i={i} onClick={() => openCollection(col)} onEdit={setEditing} onDelete={setDeleting} />
                ))}
                {isWriter && <AddGhostCard view="list" onClick={() => setCreateOpen(true)} accent={theme.accent} />}
              </Stack>
            )}
          </>
        )}
      </ScrollablePage>

      <CollectionFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        isPending={createMutation.isPending}
        onSubmit={handleCreate}
      />

      <CollectionFormDialog
        open={!!editing}
        initial={editing ?? undefined}
        onClose={() => setEditing(null)}
        isPending={updateMutation.isPending}
        onSubmit={handleUpdate}
      />

      <Dialog open={!!deleting} onClose={() => setDeleting(null)} slotProps={{
        paper: { sx: { borderRadius: radius.xl, mx: 2, background: 'rgba(255,253,251,0.98)', backdropFilter: 'blur(24px)' } }
      }}>
        <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 700, color: colors.text.primary, pb: 1 }}>
          Excluir coleção
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.88rem', color: colors.text.secondary, lineHeight: 1.55 }}>
            Tem certeza que deseja excluir <strong style={{ color: colors.text.primary }}>{deleting?.name}</strong>? Todos os bilhetes, raridades e tipos serão removidos.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="ghost" onClick={() => setDeleting(null)} sx={{ flex: 1 }}>Cancelar</Button>
          <Button variant="rose" loading={deleteMutation.isPending} onClick={handleDelete} sx={{ flex: 1 }}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
