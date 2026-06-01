import AddIcon from '@mui/icons-material/Add'
import FavoriteIcon from '@mui/icons-material/Favorite'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import ViewListIcon from '@mui/icons-material/ViewList'
import GridViewIcon from '@mui/icons-material/GridView'
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import {
  Box, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  Menu, MenuItem, Stack, TextField, Typography,
} from '@mui/material'
import { keyframes } from '@emotion/react'
import { useState, useEffect, useMemo, type ElementType } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input, PageTitle, ScrollablePage, toast } from '../components/ui'
import {
  useCollectionsQuery, useCreateCollectionMutation,
  useUpdateCollectionMutation, useDeleteCollectionMutation,
} from '../hooks/useNotes'
import { useBackground } from '../context/BackgroundContext'
import { useUser } from '../context/UserContext'
import { backgroundThemes, colors, font, radius } from '../design-system'
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
type FilterType = 'all' | 'owner' | 'reader'
type SortType = 'name-asc' | 'name-desc'

const VIEW_KEY = 'potinho-collections-view'

const FILTER_LABELS: { key: FilterType; label: string }[] = [
  { key: 'all',    label: 'Todas' },
  { key: 'owner',  label: 'Minhas' },
  { key: 'reader', label: 'Convidadas' },
]

function CollectionsFilterBar({
  filter, setFilter, sort, setSort, accent, textOnBgMuted,
}: {
  filter: FilterType
  setFilter: (f: FilterType) => void
  sort: SortType
  setSort: (s: SortType) => void
  accent: string
  textOnBgMuted: string
}) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 2.5 }}>
      <Box sx={{
        display: 'flex', gap: 0.7, flex: 1,
        overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
      }}>
        {FILTER_LABELS.map(({ key, label }) => {
          const active = filter === key
          return (
            <Box
              key={key}
              onClick={() => setFilter(key)}
              sx={{
                px: 1.4, py: 0.55, borderRadius: radius.full, flexShrink: 0,
                cursor: 'pointer', transition: 'all 0.16s',
                background: active ? `${accent}1a` : 'rgba(255,255,255,0.38)',
                border: `1.5px solid ${active ? accent : 'rgba(255,255,255,0.55)'}`,
                fontSize: '0.78rem', fontWeight: active ? 800 : 500,
                color: active ? accent : textOnBgMuted,
                backdropFilter: 'blur(8px)',
                boxShadow: active ? `0 2px 8px ${accent}22` : 'none',
              }}
            >
              {label}
            </Box>
          )
        })}
      </Box>

      <Box
        onClick={() => setSort(sort === 'name-asc' ? 'name-desc' : 'name-asc')}
        sx={{
          display: 'flex', alignItems: 'center', gap: 0.4,
          px: 1.1, py: 0.55, borderRadius: radius.full, flexShrink: 0,
          cursor: 'pointer', transition: 'all 0.16s',
          background: sort !== 'name-asc' ? `${accent}1a` : 'rgba(255,255,255,0.38)',
          border: `1.5px solid ${sort !== 'name-asc' ? accent : 'rgba(255,255,255,0.55)'}`,
          color: sort !== 'name-asc' ? accent : textOnBgMuted,
          backdropFilter: 'blur(8px)',
          '&:hover': { background: 'rgba(255,255,255,0.6)' },
        }}
      >
        <SwapVertIcon sx={{ fontSize: 14 }} />
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: 0.2 }}>
          {sort === 'name-asc' ? 'A-Z' : 'Z-A'}
        </Typography>
      </Box>
    </Stack>
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
  }, [open])

  const selectedBg = backgroundThemes.find((bg) => bg.key === form.theme) ?? backgroundThemes[0]
  const isEdit = Boolean(initial)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{
      sx: { borderRadius: radius.xl, mx: 2, background: 'rgba(255,253,251,0.98)', backdropFilter: 'blur(24px)' }
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

function CollectionActionsMenu({ col, variant = 'overlay' }: { col: Collection; variant?: 'overlay' | 'inline' }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const updateMutation = useUpdateCollectionMutation()
  const deleteMutation = useDeleteCollectionMutation()

  function openMenu(e: React.MouseEvent) {
    e.stopPropagation()
    setAnchor(e.currentTarget as HTMLElement)
  }

  const btnSx = variant === 'overlay'
    ? {
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: 'rgba(0,0,0,0.22)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'background 0.15s',
        '&:hover': { background: 'rgba(0,0,0,0.38)' },
      }
    : {
        width: 36, height: 36, borderRadius: radius.md, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'background 0.15s',
        color: colors.text.muted,
        '&:hover': { background: 'rgba(0,0,0,0.06)', color: colors.text.secondary },
      }

  const iconColor = variant === 'overlay' ? 'rgba(255,255,255,0.92)' : 'inherit'

  return (
    <>
      <Box onClick={openMenu} sx={btnSx}>
        <MoreVertIcon sx={{ fontSize: variant === 'overlay' ? 15 : 18, color: iconColor }} />
      </Box>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: {
            borderRadius: radius.lg, minWidth: 160,
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
            border: '1px solid rgba(255,255,255,0.5)',
            background: 'rgba(255,253,251,0.97)', backdropFilter: 'blur(20px)',
            p: 0.5,
          }
        }}
      >
        <MenuItem onClick={() => { setAnchor(null); setEditOpen(true) }} sx={{
          gap: 1.2, fontSize: '0.86rem', fontWeight: 600, color: colors.text.primary,
          borderRadius: radius.md, py: 1,
        }}>
          <EditIcon sx={{ fontSize: 16, color: colors.primary.main }} />
          Editar
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); setDeleteOpen(true) }} sx={{
          gap: 1.2, fontSize: '0.86rem', fontWeight: 600, color: colors.rose.main,
          borderRadius: radius.md, py: 1,
        }}>
          <DeleteForeverOutlinedIcon sx={{ fontSize: 16, color: colors.rose.main }} />
          Excluir
        </MenuItem>
      </Menu>

      <CollectionFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={col}
        isPending={updateMutation.isPending}
        onSubmit={async (data) => {
          await updateMutation.mutateAsync({ id: col.id, data })
          toast.success('Coleção atualizada!')
          setEditOpen(false)
        }}
      />

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} PaperProps={{
        sx: { borderRadius: radius.xl, mx: 2, background: 'rgba(255,253,251,0.98)', backdropFilter: 'blur(24px)' }
      }}>
        <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 700, color: colors.text.primary, pb: 1 }}>
          Excluir coleção
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.88rem', color: colors.text.secondary, lineHeight: 1.55 }}>
            Tem certeza que deseja excluir <strong style={{ color: colors.text.primary }}>{col.name}</strong>? Todos os bilhetes, raridades e tipos serão removidos.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="ghost" onClick={() => setDeleteOpen(false)} sx={{ flex: 1 }}>Cancelar</Button>
          <Button variant="rose" loading={deleteMutation.isPending} onClick={async () => {
            await deleteMutation.mutateAsync(col.id)
            toast.success('Coleção excluída.')
            setDeleteOpen(false)
          }} sx={{ flex: 1 }}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

function CollectionCardView({ col, i, onClick }: { col: Collection; i: number; onClick: () => void }) {
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
      <Box sx={{ height: 72, background: bg.gradient, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Typography sx={{ fontSize: '2rem', lineHeight: 1, zIndex: 1, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.18))' }}>
          {col.emoji}
        </Typography>
        {isOwner && (
          <Box sx={{ position: 'absolute', top: 7, right: 7, zIndex: 2 }}>
            <CollectionActionsMenu col={col} />
          </Box>
        )}
      </Box>
      <Box sx={{ p: 1.6 }}>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: col.description ? 0.4 : 0 }}>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1rem', color: colors.text.primary, lineHeight: 1.25, flex: 1, mr: 1 }}>
            {col.name}
          </Typography>
          <Box sx={{
            px: 0.9, py: 0.25, borderRadius: radius.full, flexShrink: 0, mt: 0.15,
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
        <Box sx={{ height: '3px', borderRadius: 2, background: bg.gradient, mt: 1.2, opacity: 0.55 }} />
      </Box>
    </Card>
  )
}

function CollectionGridItem({ col, i, onClick }: { col: Collection; i: number; onClick: () => void }) {
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
            <CollectionActionsMenu col={col} />
          </Box>
        )}
      </Box>
      <Box sx={{ px: 1.2, py: 1, display: 'flex', flexDirection: 'column', gap: 0.3 }}>
        <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '0.88rem', color: colors.text.primary, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

function CollectionListItem({ col, i, onClick }: { col: Collection; i: number; onClick: () => void }) {
  const bg = backgroundThemes.find((t) => t.key === col.theme) ?? backgroundThemes[0]
  const isOwner = col.access === 'owner'
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.4,
        px: 1.4, py: 1.1,
        borderRadius: radius.lg, cursor: 'pointer',
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
        width: 40, height: 40, borderRadius: radius.md, flexShrink: 0,
        background: bg.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.3rem', boxShadow: `0 2px 8px ${bg.accent}33`,
      }}>
        {col.emoji}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '0.92rem', color: colors.text.primary, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {col.name}
        </Typography>
        {col.description && (
          <Typography sx={{ fontSize: '0.72rem', color: colors.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mt: 0.1 }}>
            {col.description}
          </Typography>
        )}
      </Box>
      {isOwner
        ? <CollectionActionsMenu col={col} variant="inline" />
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
        height: 72, position: 'relative', overflow: 'hidden',
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

const VIEW_ICONS: { mode: ViewMode; Icon: ElementType }[] = [
  { mode: 'cards', Icon: ViewAgendaIcon },
  { mode: 'grid',  Icon: GridViewIcon },
  { mode: 'list',  Icon: ViewListIcon },
]

export function CollectionsListPage() {
  const { theme } = useBackground()
  const { user } = useUser()
  const navigate = useNavigate()
  const { data: collections = [], isLoading } = useCollectionsQuery()
  const [createOpen, setCreateOpen] = useState(false)
  const createMutation = useCreateCollectionMutation()
  const [view, setView] = useState<ViewMode>(() => (localStorage.getItem(VIEW_KEY) as ViewMode) ?? 'cards')
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('name-asc')

  const isWriter = user?.role === 'writer'

  const displayedCollections = useMemo(() => {
    let result = collections
    if (filter === 'owner')  result = result.filter((c) => c.access === 'owner')
    if (filter === 'reader') result = result.filter((c) => c.access === 'reader')
    return [...result].sort((a, b) =>
      sort === 'name-asc'
        ? a.name.localeCompare(b.name, 'pt-BR')
        : b.name.localeCompare(a.name, 'pt-BR')
    )
  }, [collections, filter, sort])

  function changeView(v: ViewMode) {
    setView(v)
    localStorage.setItem(VIEW_KEY, v)
  }

  return (
    <Box sx={{ height: '100%', position: 'relative', background: theme.gradient }}>
      <FavoriteIcon sx={{
        position: 'absolute', bottom: -80, right: -80,
        fontSize: 440, color: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(225,29,72,0.04)',
        pointerEvents: 'none',
      }} />

      <ScrollablePage sx={{ px: 2.5, pt: 2.5, pb: 4, animation: `${fadeIn} 0.35s ease` }}>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
          <PageTitle
            title="Coleções"
            subtitle={isLoading ? 'Carregando...' : collections.length === 0 ? 'Nenhuma ainda' : `${collections.length} coleção${collections.length !== 1 ? 'ões' : ''}`}
          />
          <Box sx={{
            display: 'flex', gap: 0.3, mt: 0.5,
            background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)',
            borderRadius: radius.lg, p: 0.4,
            border: '1px solid rgba(255,255,255,0.4)',
          }}>
            {VIEW_ICONS.map(({ mode, Icon }) => (
              <Box key={mode} onClick={() => changeView(mode)} sx={{
                width: 38, height: 38, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.15s',
                background: view === mode ? 'rgba(255,255,255,0.85)' : 'transparent',
                boxShadow: view === mode ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                color: view === mode ? theme.accent : theme.textOnBgMuted,
                '&:hover': { background: 'rgba(255,255,255,0.6)' },
              }}>
                <Icon sx={{ fontSize: 17 }} />
              </Box>
            ))}
          </Box>
        </Stack>

        {!isLoading && collections.length > 0 && (
          <CollectionsFilterBar
            filter={filter} setFilter={setFilter}
            sort={sort} setSort={setSort}
            accent={theme.accent} textOnBgMuted={theme.textOnBgMuted}
          />
        )}

        {isLoading && (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={28} sx={{ color: theme.accent }} />
          </Box>
        )}

        {!isLoading && collections.length === 0 && filter === 'all' && (
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
                {isWriter ? 'Crie sua primeira coleção de bilhetes' : 'Peça o código de convite para acessar uma coleção'}
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
                  <CollectionCardView key={col.id} col={col} i={i} onClick={() => navigate(`/colecoes/${col.id}`)} />
                ))}
                {isWriter && filter === 'all' && <AddGhostCard view="cards" onClick={() => setCreateOpen(true)} accent={theme.accent} />}
              </Stack>
            )}
            {view === 'grid' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.4 }}>
                {displayedCollections.map((col, i) => (
                  <CollectionGridItem key={col.id} col={col} i={i} onClick={() => navigate(`/colecoes/${col.id}`)} />
                ))}
                {isWriter && filter === 'all' && <AddGhostCard view="grid" onClick={() => setCreateOpen(true)} accent={theme.accent} />}
              </Box>
            )}
            {view === 'list' && (
              <Stack spacing={0.8}>
                {displayedCollections.map((col, i) => (
                  <CollectionListItem key={col.id} col={col} i={i} onClick={() => navigate(`/colecoes/${col.id}`)} />
                ))}
                {isWriter && filter === 'all' && <AddGhostCard view="list" onClick={() => setCreateOpen(true)} accent={theme.accent} />}
              </Stack>
            )}
          </>
        )}
      </ScrollablePage>

      <CollectionFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        isPending={createMutation.isPending}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data)
          toast.success('Coleção criada!')
          setCreateOpen(false)
        }}
      />
    </Box>
  )
}
