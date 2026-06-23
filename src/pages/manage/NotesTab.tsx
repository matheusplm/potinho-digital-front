import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda'
import ViewListIcon from '@mui/icons-material/ViewList'
import DensitySmallIcon from '@mui/icons-material/DensitySmall'
import { Box, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Button, Card, ConfirmDeleteDialog, Input, LoadingState, SegmentedControl, toast } from '../../components/ui'
import { ImagePicker } from '../../components/ImagePicker'
import { NoteDetailDialog, RewardCard, type ReadableNote } from '../CollectionPlayPage'
import {
  useCollectionNotesQuery, useCollectionRaritiesQuery, useCollectionTypesQuery,
  useCreateCollectionNoteMutation, useDeleteCollectionNoteMutation, useImportCollectionNotesMutation, useUpdateCollectionNoteMutation,
} from '../../hooks/useNotes'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { useJsonImport } from '../../hooks/useJsonImport'
import { colors, font, radius } from '../../design-system'
import { useBackground } from '../../context/BackgroundContext'
import { gradientTextSx } from '../../utils/colorUtils'
import type { NoteFormData, NoteRecord, RarityConfig, NoteTypeConfig } from '../../types/note'
import { actionButtonSx } from './shared'

type NoteSort = 'newest' | 'oldest' | 'az' | 'rarity' | 'type'
type NoteView = 'cards' | 'list' | 'compact'

const NOTE_PAGE_SIZE = 60

const NOTE_SORT_OPTIONS: { id: NoteSort; label: string }[] = [
  { id: 'newest', label: 'Mais recentes' },
  { id: 'oldest', label: 'Mais antigos' },
  { id: 'az', label: 'A-Z' },
  { id: 'rarity', label: 'Raridade' },
  { id: 'type', label: 'Tipo' },
]

const NOTE_VIEW_OPTIONS = [
  { id: 'cards' as NoteView, label: 'Cards', icon: <ViewAgendaIcon /> },
  { id: 'list' as NoteView, label: 'Lista', icon: <ViewListIcon /> },
  { id: 'compact' as NoteView, label: 'Compacta', icon: <DensitySmallIcon /> },
]

const EMPTY_NOTE: NoteFormData = { title: '', message: '', rarity: '', typeId: '', imageUrl: null, imageLayout: null }

const IMAGE_LAYOUTS: { value: import('../../types/note').NoteImageLayout; label: string }[] = [
  { value: 'thumb-left', label: 'Thumb esq' },
  { value: 'thumb-right', label: 'Thumb dir' },
  { value: 'circle-left', label: 'Círculo esq' },
  { value: 'circle-right', label: 'Círculo dir' },
  { value: 'stripe-left', label: 'Stripe' },
  { value: 'hero-overlay', label: 'Hero' },
  { value: 'bg-blur', label: 'Blur' },
]

const DEFAULT_IMPORT_JSON = `[
  {
    "title": "Seu título aqui",
    "message": "Seu bilhetinho aqui",
    "rarity": "comum",
    "typeId": "alegria",
    "imageUrl": "https://exemplo.com/imagem.gif",
    "imageLayout": "thumb-left"
  }
]`

function NoteDialog({ open, editing, rarities, types, cid, onClose }: {
  open: boolean; editing: NoteRecord | null; rarities: RarityConfig[]; types: NoteTypeConfig[]; cid: string; onClose: () => void
}) {
  const [form, setForm] = useState<NoteFormData>(EMPTY_NOTE)
  const [touched, setTouched] = useState({ title: false, message: false, rarity: false, typeId: false, imageUrl: false })
  const createMutation = useCreateCollectionNoteMutation(cid)
  const updateMutation = useUpdateCollectionNoteMutation(cid)
  const isLoading = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (!open) return
    setForm(editing ? { title: editing.title, message: editing.message, rarity: editing.rarity, typeId: editing.typeId, imageUrl: editing.imageUrl ?? null, imageLayout: editing.imageLayout ?? null } : EMPTY_NOTE)
    setTouched({ title: false, message: false, rarity: false, typeId: false, imageUrl: false })
  }, [open, editing])

  const errors = {
    title: form.title.trim().length === 0 ? 'Obrigatório' : form.title.length > 60 ? 'Máx 60 caracteres' : '',
    message: form.message.trim().length === 0 ? 'Obrigatório' : form.message.length > 500 ? 'Máx 500 caracteres' : '',
    rarity: !form.rarity ? 'Selecione uma raridade' : '',
    typeId: !form.typeId ? 'Selecione um tipo' : '',
    imageUrl: form.imageLayout && !form.imageUrl ? 'Selecione um GIF ou cole uma URL de imagem' : '',
  }
  const hasErrors = Object.values(errors).some(Boolean)

  function touch(field: keyof typeof touched) {
    setTouched((t) => ({ ...t, [field]: true }))
  }

  async function handleSubmit() {
    if (hasErrors) {
      setTouched({ title: true, message: true, rarity: true, typeId: true, imageUrl: true })
      return
    }
    try {
      if (editing) { await updateMutation.mutateAsync({ id: editing.id, data: form }); toast.success('Bilhete atualizado!') }
      else { await createMutation.mutateAsync(form); toast.success('Bilhete criado!') }
      onClose()
    } catch (e) { toast.error((e as Error).message || 'Erro ao salvar bilhete.') }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: radius.xl, mx: 2, background: 'rgba(255,253,251,0.98)', backdropFilter: 'blur(24px)' } } }}>
      <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 700, color: colors.text.primary, pb: 1 }}>
        {editing ? 'Editar bilhete' : 'Novo bilhete'}
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: touched.title && errors.title ? colors.error.main : colors.text.secondary }}>Título</Typography>
              <Typography sx={{ fontSize: '0.68rem', color: form.title.length > 60 ? colors.error.main : colors.text.muted }}>{form.title.length}/60</Typography>
            </Stack>
            <Input
              placeholder="Título especial..." value={form.title}
              onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); touch('title') }}
              onBlur={() => touch('title')}
              error={touched.title && !!errors.title}
              helperText={touched.title && errors.title ? errors.title : undefined}
            />
          </Box>
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: touched.message && errors.message ? colors.error.main : colors.text.secondary }}>Mensagem</Typography>
              <Typography sx={{ fontSize: '0.68rem', color: form.message.length > 500 ? colors.error.main : colors.text.muted }}>{form.message.length}/500</Typography>
            </Stack>
            <TextField multiline rows={4} fullWidth placeholder="Escreva algo especial..." value={form.message}
              onChange={(e) => { setForm((f) => ({ ...f, message: e.target.value })); touch('message') }}
              onBlur={() => touch('message')}
              error={touched.message && !!errors.message}
              helperText={touched.message && errors.message ? errors.message : undefined}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: radius.md, fontSize: '0.88rem', background: colors.surface.overlay, '& fieldset': { borderColor: colors.border.medium } } }}
            />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: touched.rarity && errors.rarity ? colors.error.main : colors.text.secondary, mb: 0.8 }}>Raridade</Typography>
            {rarities.length === 0 ? <Typography sx={{ fontSize: '0.8rem', color: colors.text.muted }}>Crie raridades na aba Raridades.</Typography> : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                {rarities.map((r) => (
                  <Box key={r.id} onClick={() => { setForm((f) => ({ ...f, rarity: r.id })); touch('rarity') }} sx={{
                    px: 1.4, py: 0.6, borderRadius: radius.full, cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                    background: form.rarity === r.id ? r.chipBg : 'rgba(0,0,0,0.04)',
                    border: `1.5px solid ${form.rarity === r.id ? r.borderColor : touched.rarity && errors.rarity ? colors.error.main + '66' : 'transparent'}`,
                    fontWeight: 700, fontSize: '0.78rem', transition: 'all 0.15s',
                  }}>
                    <Box component="span" sx={form.rarity === r.id ? gradientTextSx(r.chipColor) : { color: colors.text.secondary }}>{r.emoji} {r.label}</Box>
                  </Box>
                ))}
              </Box>
            )}
            {touched.rarity && errors.rarity && (
              <Typography sx={{ fontSize: '0.68rem', color: colors.error.main, mt: 0.5, pl: 0.5 }}>{errors.rarity}</Typography>
            )}
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: touched.typeId && errors.typeId ? colors.error.main : colors.text.secondary, mb: 0.8 }}>Tipo</Typography>
            {types.length === 0 ? <Typography sx={{ fontSize: '0.8rem', color: colors.text.muted }}>Crie tipos na aba Tipos.</Typography> : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                {types.map((t) => (
                  <Box key={t.id} onClick={() => { setForm((f) => ({ ...f, typeId: t.id })); touch('typeId') }} sx={{
                    px: 1.4, py: 0.6, borderRadius: radius.full, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 0.5,
                    background: form.typeId === t.id ? t.tagBg : 'rgba(0,0,0,0.04)',
                    color: form.typeId === t.id ? t.tagColor : colors.text.secondary,
                    border: `1.5px solid ${form.typeId === t.id ? t.accentColor + '55' : touched.typeId && errors.typeId ? colors.error.main + '66' : 'transparent'}`,
                    fontWeight: 700, fontSize: '0.78rem', transition: 'all 0.15s',
                  }}>{t.emoji} {t.label}</Box>
                ))}
              </Box>
            )}
            {touched.typeId && errors.typeId && (
              <Typography sx={{ fontSize: '0.68rem', color: colors.error.main, mt: 0.5, pl: 0.5 }}>{errors.typeId}</Typography>
            )}
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: colors.text.secondary, mb: 0.8 }}>
              Posição da imagem{' '}
              <Typography component="span" sx={{ fontSize: '0.68rem', fontWeight: 400, color: colors.text.muted }}>(opcional)</Typography>
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
              {IMAGE_LAYOUTS.map((opt) => (
                <Box key={opt.value} onClick={() => setForm((f) => ({
                  ...f,
                  imageLayout: f.imageLayout === opt.value ? null : opt.value,
                  imageUrl: f.imageLayout === opt.value ? null : f.imageUrl,
                }))} sx={{
                  px: 1.4, py: 0.5, borderRadius: radius.full, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
                  background: form.imageLayout === opt.value ? colors.primary.main : 'rgba(0,0,0,0.05)',
                  color: form.imageLayout === opt.value ? '#fff' : colors.text.secondary,
                  border: `1.5px solid ${form.imageLayout === opt.value ? colors.primary.main : 'transparent'}`,
                  transition: 'all 0.15s',
                }}>
                  {opt.label}
                </Box>
              ))}
            </Box>
          </Box>
          {form.imageLayout && (
            <Stack spacing={0.5}>
              <ImagePicker
                value={form.imageUrl}
                onChange={(url) => {
                  setForm((f) => ({ ...f, imageUrl: url }))
                  if (!url) setTouched((t) => ({ ...t, imageUrl: true }))
                }}
              />
              {touched.imageUrl && errors.imageUrl && (
                <Typography sx={{ fontSize: '0.7rem', color: colors.error.main, pl: 0.5 }}>
                  {errors.imageUrl}
                </Typography>
              )}
            </Stack>
          )}
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: colors.text.secondary, mb: 1 }}>Prévia</Typography>
            <RewardCard
              previewMode
              reward={{
                id: '__preview__',
                title: form.title || 'Título do bilhete',
                message: form.message || 'Mensagem especial que vai aparecer no cartãozinho...',
                rarity: form.rarity || rarities[0]?.id || '',
                typeId: form.typeId || types[0]?.id || '',
                imageUrl: form.imageUrl,
                imageLayout: form.imageLayout,
                isNew: false,
              }}
              rarities={rarities}
              types={types}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>Cancelar</Button>
        <Button variant="primary" loading={isLoading} onClick={handleSubmit} sx={{ flex: 1 }}>
          {editing ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

interface NotesTabProps { cid: string }

export function NotesTab({ cid }: NotesTabProps) {
  const { theme } = useBackground()
  const { data: notes = [], isLoading: notesLoading } = useCollectionNotesQuery(cid)
  const { data: rarities = [] } = useCollectionRaritiesQuery(cid)
  const { data: types = [] } = useCollectionTypesQuery(cid)
  const deleteNote = useDeleteCollectionNoteMutation(cid)
  const importNotes = useImportCollectionNotesMutation(cid)

  const [search, setSearch] = useState('')
  const [rarityFilter, setRarityFilter] = useState<string>('all')
  const [noteSort, setNoteSort] = useState<NoteSort>('newest')
  const [noteView, setNoteView] = useState<NoteView>('cards')
  const [visibleNoteCount, setVisibleNoteCount] = useState(NOTE_PAGE_SIZE)
  const [noteDialog, setNoteDialog] = useState(false)
  const [editingNote, setEditingNote] = useState<NoteRecord | null>(null)
  const [viewingNote, setViewingNote] = useState<ReadableNote | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  const noteDelete = useConfirmDelete<NoteRecord>(deleteNote, { success: 'Bilhete removido.', error: 'Erro ao remover bilhete.' })
  const noteImport = useJsonImport(
    importNotes,
    (r) => r.created === 0
      ? `Nenhum bilhete novo — ${r.skipped} já existia${r.skipped !== 1 ? 'm' : ''}.`
      : r.skipped > 0
        ? `${r.created} importado${r.created !== 1 ? 's' : ''}, ${r.skipped} ignorado${r.skipped !== 1 ? 's' : ''} (título duplicado).`
        : `${r.created} bilhete${r.created !== 1 ? 's' : ''} importado${r.created !== 1 ? 's' : ''}.`,
    () => setImportDialogOpen(false),
    DEFAULT_IMPORT_JSON,
  )

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase()
    const rarityOrder = new Map(rarities.map((r) => [r.id, r.order]))
    const typeOrder = new Map(types.map((t) => [t.id, t.order]))
    const filtered = notes.filter((note) =>
      (rarityFilter === 'all' || note.rarity === rarityFilter) &&
      (q === '' || note.title.toLowerCase().includes(q) || note.message.toLowerCase().includes(q)),
    )
    return filtered.sort((a, b) => {
      if (noteSort === 'oldest') return (a.createdAt ?? '').localeCompare(b.createdAt ?? '') || a.title.localeCompare(b.title, 'pt-BR')
      if (noteSort === 'az') return a.title.localeCompare(b.title, 'pt-BR')
      if (noteSort === 'rarity') return (rarityOrder.get(b.rarity) ?? 0) - (rarityOrder.get(a.rarity) ?? 0) || a.title.localeCompare(b.title, 'pt-BR')
      if (noteSort === 'type') return (typeOrder.get(a.typeId) ?? 0) - (typeOrder.get(b.typeId) ?? 0) || a.title.localeCompare(b.title, 'pt-BR')
      return (b.createdAt ?? '').localeCompare(a.createdAt ?? '') || a.title.localeCompare(b.title, 'pt-BR')
    })
  }, [noteSort, notes, rarities, rarityFilter, search, types])

  const visibleNotes = useMemo(() => filteredNotes.slice(0, visibleNoteCount), [filteredNotes, visibleNoteCount])

  useEffect(() => {
    setVisibleNoteCount(NOTE_PAGE_SIZE)
  }, [noteSort, noteView, rarityFilter, search])

  return (
    <>
      <Stack spacing={1.5}>
        <Stack spacing={1}>
          <Typography sx={{ fontSize: '0.72rem', color: theme.textOnBgMuted, fontWeight: 600 }}>
            {notes.length} bilhete{notes.length !== 1 ? 's' : ''}
          </Typography>
          <Stack direction="row" spacing={0.8} alignItems="center" sx={{ flexWrap: 'wrap', rowGap: 0.8 }}>
            <Box sx={{ flex: '1 1 260px', minWidth: 230 }}>
              <SegmentedControl options={NOTE_VIEW_OPTIONS} value={noteView} onChange={setNoteView} />
            </Box>
            <Button variant="ghost" onClick={() => setImportDialogOpen(true)} sx={{ flex: '1 1 132px', py: 0.7, px: 1.2, fontSize: '0.76rem', background: 'rgba(255,255,255,0.44)' }}>
              Importar JSON
            </Button>
            <Button variant="primary" onClick={() => { setEditingNote(null); setNoteDialog(true) }} sx={{ flex: '1 1 94px', py: 0.7, px: 1.4, fontSize: '0.78rem' }}>
              <AddIcon sx={{ fontSize: 15, mr: 0.4 }} /> Novo
            </Button>
          </Stack>
        </Stack>

        {notes.length > 0 && (
          <Stack spacing={1}>
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1, px: 1.4, py: 0.7,
              background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(255,255,255,0.6)', borderRadius: radius.lg,
            }}>
              <SearchIcon sx={{ fontSize: 17, color: theme.textOnBgMuted, flexShrink: 0 }} />
              <Box component="input" value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                placeholder="Buscar bilhete..."
                sx={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.86rem', color: theme.textOnBg, fontFamily: 'inherit', '&::placeholder': { color: theme.textOnBgMuted } }}
              />
              {search && (
                <Box onClick={() => setSearch('')} sx={{ display: 'flex', cursor: 'pointer', color: theme.textOnBgMuted }}>
                  <CloseIcon sx={{ fontSize: 15 }} />
                </Box>
              )}
            </Box>
            {rarities.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
                <Chip label="Todas" size="small" onClick={() => setRarityFilter('all')}
                  sx={{ height: 26, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                    bgcolor: rarityFilter === 'all' ? colors.primary.main : 'rgba(255,255,255,0.5)',
                    color: rarityFilter === 'all' ? '#fff' : theme.textOnBgMuted }} />
                {rarities.map((r) => (
                  <Chip key={r.id} label={`${r.emoji} ${r.label}`} size="small" onClick={() => setRarityFilter(r.id)}
                    sx={{ height: 26, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                      background: rarityFilter === r.id ? r.chipBg : 'rgba(255,255,255,0.5)',
                      border: `1.5px solid ${rarityFilter === r.id ? r.borderColor : 'transparent'}`,
                      '& .MuiChip-label': rarityFilter === r.id ? gradientTextSx(r.chipColor) : { color: theme.textOnBgMuted },
                    }} />
                ))}
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, flexWrap: 'wrap', px: 0.1 }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: 0.6, color: theme.textOnBgMuted, textTransform: 'uppercase' }}>
                Ordenar
              </Typography>
              {NOTE_SORT_OPTIONS.map((option) => (
                <Chip
                  key={option.id}
                  label={option.label}
                  size="small"
                  onClick={() => setNoteSort(option.id)}
                  sx={{
                    height: 26, fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                    bgcolor: noteSort === option.id ? colors.purple.main : 'rgba(255,255,255,0.5)',
                    color: noteSort === option.id ? '#fff' : theme.textOnBgMuted,
                    border: `1.5px solid ${noteSort === option.id ? colors.purple.main : 'rgba(255,255,255,0.35)'}`,
                    '& .MuiChip-label': { px: 0.9 },
                  }}
                />
              ))}
              <Typography sx={{ ml: 'auto', fontSize: '0.7rem', color: theme.textOnBgMuted, fontWeight: 700 }}>
                {Math.min(visibleNoteCount, filteredNotes.length)} de {filteredNotes.length} exibido{filteredNotes.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Stack>
        )}

        {notesLoading && <LoadingState compact label="Carregando bilhetes" accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} />}

        {!notesLoading && notes.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography sx={{ fontFamily: font.serif, fontSize: '1rem', fontWeight: 700, color: theme.textOnBg, mb: 0.5 }}>
              Nenhum bilhete ainda
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: theme.textOnBgMuted }}>Crie o primeiro card desta coleção</Typography>
          </Box>
        )}

        {!notesLoading && notes.length > 0 && filteredNotes.length === 0 && (
          <Typography sx={{ fontSize: '0.82rem', color: theme.textOnBgMuted, textAlign: 'center', py: 3 }}>
            Nenhum bilhete com esses filtros
          </Typography>
        )}

        {visibleNotes.map((note) => {
          const r = rarities.find((x) => x.id === note.rarity)
          const t = types.find((x) => x.id === note.typeId)
          if (noteView === 'compact') {
            return (
              <Card key={note.id} accent={r?.borderColor} onClick={() => setViewingNote(note)} sx={{
                p: 0, overflow: 'hidden', cursor: 'pointer',
                border: `1px solid ${r?.borderColor ?? colors.border.subtle}`,
                background: 'rgba(255,255,255,0.74)',
                boxShadow: '0 3px 10px rgba(15,23,42,0.05)',
                '&:hover': { background: 'rgba(255,255,255,0.9)', boxShadow: '0 5px 14px rgba(15,23,42,0.08)' },
              }}>
                <Stack direction="row" alignItems="center" spacing={0.8} sx={{ minHeight: 38, px: 1, py: 0.35 }}>
                  <Box sx={{ width: 6, height: 22, borderRadius: radius.full, background: r?.borderColor ?? colors.border.subtle, flexShrink: 0 }} />
                  {note.imageUrl && (
                    <Box sx={{ width: 28, height: 28, flexShrink: 0, borderRadius: radius.sm, overflow: 'hidden', border: `1px solid ${r?.borderColor ?? colors.border.subtle}22` }}>
                      <Box component="img" src={note.imageUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </Box>
                  )}
                  <Typography sx={{ flex: 1, minWidth: 0, fontFamily: font.serif, fontWeight: 800, fontSize: '0.82rem', color: r?.textColor ?? colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {note.title}
                  </Typography>
                  <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0, opacity: 0.72 }}>
                    <IconButton size="small" aria-label="editar bilhete" onClick={(e) => { e.stopPropagation(); setEditingNote(note); setNoteDialog(true) }} sx={{ ...actionButtonSx('primary'), width: 28, height: 28 }}>
                      <EditOutlinedIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                    <IconButton size="small" aria-label="excluir bilhete" onClick={(e) => { e.stopPropagation(); noteDelete.setTarget(note) }} sx={{ ...actionButtonSx('danger'), width: 28, height: 28 }}>
                      <DeleteForeverOutlinedIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Stack>
                </Stack>
              </Card>
            )
          }
          if (noteView === 'list') {
            return (
              <Card key={note.id} accent={r?.borderColor} onClick={() => setViewingNote(note)} sx={{
                p: 0, overflow: 'hidden', cursor: 'pointer',
                border: `1.5px solid ${r?.borderColor ?? colors.border.subtle}`,
                background: 'rgba(255,255,255,0.78)',
                boxShadow: '0 6px 18px rgba(15,23,42,0.07)',
                transition: 'transform 0.16s ease, box-shadow 0.16s ease',
                '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 8px 24px ${r?.glowColor || 'rgba(15,23,42,0.1)'}` },
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
                          <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '0.92rem', color: colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {note.title}
                          </Typography>
                          {r && (
                            <Box sx={{ px: 0.65, py: 0.15, borderRadius: radius.full, background: r.chipBg, border: `1px solid ${r.borderColor}`, fontSize: '0.68rem', fontWeight: 850, flexShrink: 0 }}>
                              <Box component="span" sx={gradientTextSx(r.chipColor)}>{r.emoji}</Box>
                            </Box>
                          )}
                          {t && (
                            <Box sx={{ px: 0.65, py: 0.15, borderRadius: radius.full, background: t.tagBg, color: t.tagColor, border: `1px solid ${t.accentColor}33`, fontSize: '0.68rem', fontWeight: 850, flexShrink: 0 }}>
                              {t.emoji}
                            </Box>
                          )}
                        </Stack>
                        <Typography sx={{ mt: 0.25, fontSize: '0.74rem', color: colors.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {note.message}
                        </Typography>
                        <Typography sx={{ mt: 0.35, fontSize: '0.70rem', color: colors.text.muted, fontWeight: 700 }}>
                          {[r?.label, t?.label].filter(Boolean).join(' · ') || 'Sem categoria'}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.4} sx={{ flexShrink: 0 }}>
                        <IconButton size="small" aria-label="editar bilhete" onClick={(e) => { e.stopPropagation(); setEditingNote(note); setNoteDialog(true) }} sx={actionButtonSx('primary')}>
                          <EditOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" aria-label="excluir bilhete" onClick={(e) => { e.stopPropagation(); noteDelete.setTarget(note) }} sx={actionButtonSx('danger')}>
                          <DeleteForeverOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
              </Card>
            )
          }
          if (note.imageUrl && note.imageLayout) {
            return (
              <Box key={note.id} sx={{ position: 'relative', cursor: 'pointer' }} onClick={() => setViewingNote(note)}>
                <RewardCard
                  reward={{ id: note.id, title: note.title, message: note.message, rarity: note.rarity, typeId: note.typeId, imageUrl: note.imageUrl, imageLayout: note.imageLayout, isNew: false }}
                  rarities={r ? [r] : []}
                  types={t ? [t] : []}
                />
                <Stack direction="row" spacing={0.4} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 5 }}>
                  <IconButton size="small" aria-label="editar bilhete" onClick={(e) => { e.stopPropagation(); setEditingNote(note); setNoteDialog(true) }} sx={{ ...actionButtonSx('primary'), backdropFilter: 'blur(8px)' }}>
                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton size="small" aria-label="excluir bilhete" onClick={(e) => { e.stopPropagation(); noteDelete.setTarget(note) }} sx={{ ...actionButtonSx('danger'), backdropFilter: 'blur(8px)' }}>
                    <DeleteForeverOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Stack>
              </Box>
            )
          }
          return (
            <Card key={note.id} accent={r?.borderColor} onClick={() => setViewingNote(note)} sx={{
              p: 0, overflow: 'hidden', position: 'relative', cursor: 'pointer',
              background: r?.cardBg ?? colors.surface.base,
              border: `1.5px solid ${r?.borderColor ?? colors.border.subtle}`,
              boxShadow: r?.glowColor ? `${r.shadow}, 0 0 26px ${r.glowColor}` : r?.shadow,
              '&::before': r ? {
                content: '""', position: 'absolute', inset: 0, pointerEvents: 'none',
                background: `radial-gradient(circle at 10% 0%, rgba(255,255,255,0.46), transparent 34%), radial-gradient(circle at 100% 100%, ${r.glowColor || r.borderColor}, transparent 34%)`,
                opacity: 0.42, mixBlendMode: 'soft-light',
              } : undefined,
            }}>
              <Box sx={{ height: '3px', background: r ? `linear-gradient(90deg,${r.borderColor},${r.glowColor || r.borderColor})` : colors.border.subtle, position: 'relative', zIndex: 1 }} />
              <Box sx={{ p: 1.8, position: 'relative', zIndex: 1 }}>
                <Stack spacing={0.8}>
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <IconButton size="small" aria-label="editar bilhete" onClick={(e) => { e.stopPropagation(); setEditingNote(note); setNoteDialog(true) }} sx={actionButtonSx('primary')}>
                      <EditOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton size="small" aria-label="excluir bilhete" onClick={(e) => { e.stopPropagation(); noteDelete.setTarget(note) }} sx={actionButtonSx('danger')}>
                      <DeleteForeverOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Stack>
                  <Box sx={{ flex: 1, minWidth: 0, p: 1, borderRadius: radius.lg, background: 'rgba(255,255,255,0.68)', border: '1px solid rgba(255,255,255,0.58)', backdropFilter: 'blur(8px)' }}>
                    <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '0.93rem', color: r?.textColor ?? colors.text.primary, mb: 0.3, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                      {note.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: r?.captionColor ?? colors.text.secondary, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                      {note.message}
                    </Typography>
                    {(r || t) && (
                      <Stack direction="row" spacing={0.6} sx={{ mt: 0.9, flexWrap: 'wrap', rowGap: 0.5 }}>
                        {r && (
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 1, py: 0.3, borderRadius: radius.full, background: r.chipBg, border: `1px solid ${r.borderColor}`, fontSize: '0.72rem', fontWeight: 700 }}>
                            <Box component="span" sx={gradientTextSx(r.chipColor)}>{r.emoji} {r.label}</Box>
                          </Box>
                        )}
                        {t && (
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, px: 1, py: 0.3, borderRadius: radius.full, background: t.tagBg, color: t.tagColor, border: `1px solid ${t.accentColor}44`, fontSize: '0.72rem', fontWeight: 700 }}>
                            {t.emoji} {t.label}
                          </Box>
                        )}
                      </Stack>
                    )}
                  </Box>
                </Stack>
              </Box>
            </Card>
          )
        })}

        {!notesLoading && filteredNotes.length > visibleNotes.length && (
          <Button variant="ghost" onClick={() => setVisibleNoteCount((c) => c + NOTE_PAGE_SIZE)} sx={{ alignSelf: 'center', mt: 0.5, px: 1.6, py: 0.8, fontSize: '0.78rem', background: 'rgba(255,255,255,0.5)' }}>
            Mostrar mais {Math.min(NOTE_PAGE_SIZE, filteredNotes.length - visibleNotes.length)} bilhetes
          </Button>
        )}
      </Stack>

      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: radius.xl, mx: 2, background: 'rgba(255,253,251,0.98)' } } }}>
        <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 800, color: colors.text.primary, pb: 0.5 }}>
          Importar bilhetes por JSON
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={1.3}>
            <Typography sx={{ fontSize: '0.82rem', color: colors.text.secondary, lineHeight: 1.5 }}>
              Cole uma lista de bilhetes. Cada item precisa ter <strong>title</strong>, <strong>message</strong>, <strong>rarity</strong> e <strong>typeId</strong>.
            </Typography>
            <TextField multiline minRows={10} value={noteImport.json} onChange={(e) => noteImport.setJson(e.target.value)} fullWidth spellCheck={false}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: radius.lg, background: colors.surface.base, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '0.75rem', alignItems: 'flex-start' } }} />
            <Box sx={{ p: 1.1, borderRadius: radius.lg, background: `${theme.accent}10`, border: `1px solid ${theme.accent}24` }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: theme.accent, mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.7 }}>
                IDs aceitos
              </Typography>
              <Typography sx={{ fontSize: '0.74rem', color: colors.text.secondary, lineHeight: 1.5 }}>
                Raridades: {rarities.map((r) => r.id).join(', ') || 'crie uma raridade primeiro'}
              </Typography>
              <Typography sx={{ fontSize: '0.74rem', color: colors.text.secondary, lineHeight: 1.5 }}>
                Tipos: {types.map((t) => t.id).join(', ') || 'crie um tipo primeiro'}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="ghost" onClick={() => setImportDialogOpen(false)} sx={{ flex: 1 }}>Cancelar</Button>
          <Button variant="primary" loading={importNotes.isPending} disabled={!noteImport.json.trim() || importNotes.isPending} onClick={noteImport.execute} sx={{ flex: 1 }}>Importar</Button>
        </DialogActions>
      </Dialog>

      <NoteDialog open={noteDialog} editing={editingNote} rarities={rarities} types={types} cid={cid} onClose={() => { setNoteDialog(false); setEditingNote(null) }} />
      <NoteDetailDialog note={viewingNote} rarities={rarities} types={types} onClose={() => setViewingNote(null)} />
      <ConfirmDeleteDialog open={noteDelete.isOpen} title={`Excluir o bilhete "${noteDelete.target?.title ?? ''}"?`} isPending={noteDelete.isPending} onConfirm={noteDelete.confirm} onClose={noteDelete.close} />
    </>
  )
}
