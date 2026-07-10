import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import ReplayIcon from '@mui/icons-material/Replay'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda'
import ViewListIcon from '@mui/icons-material/ViewList'
import DensitySmallIcon from '@mui/icons-material/DensitySmall'
import { Box, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Button, Card, ConfirmDeleteDialog, Input, LoadingState, SegmentedControl, toast } from '../../components/ui'
import { NoteDetailDialog, type ReadableNote } from '../../components/collection/NoteDetailDialog'
import { RewardCard } from '../../components/collection/RewardCard'
import {
  useCollectionNotesQuery, useCollectionRaritiesQuery, useCollectionTypesQuery,
  useDisableCollectionNoteMutation, useRestoreCollectionNoteMutation, usePermanentlyDeleteCollectionNoteMutation,
  useImportCollectionNotesMutation,
} from '../../hooks/useNotes'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { useJsonImport } from '../../hooks/useJsonImport'
import { colors, font, radius } from '../../design-system'
import { useBackground } from '../../context/BackgroundContext'
import { gradientTextSx } from '../../utils/colorUtils'
import type { NoteRecord } from '../../types/note'
import { actionButtonSx } from './shared'
import { NoteDialog } from './NoteDialog'
import { ReleaseDialog } from './ReleaseDialog'

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

interface NotesTabProps { cid: string }

export function NotesTab({ cid }: NotesTabProps) {
  const { theme } = useBackground()
  const { data: notes = [], isLoading: notesLoading } = useCollectionNotesQuery(cid)
  const { data: rarities = [] } = useCollectionRaritiesQuery(cid)
  const { data: types = [] } = useCollectionTypesQuery(cid)
  const disableNote = useDisableCollectionNoteMutation(cid)
  const restoreNote = useRestoreCollectionNoteMutation(cid)
  const permanentlyDeleteNote = usePermanentlyDeleteCollectionNoteMutation(cid)
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
  const [purgeConfirmInput, setPurgeConfirmInput] = useState('')
  const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>([])
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false)
  const [statusView, setStatusView] = useState<'live' | 'drafts'>('live')

  const activeNotes = useMemo(() => notes.filter((n) => !n.disabledAt && n.status !== 'preview'), [notes])
  const draftNotes = useMemo(() => notes.filter((n) => !n.disabledAt && n.status === 'preview'), [notes])
  const trashedNotes = useMemo(() => notes.filter((n) => n.disabledAt), [notes])

  useEffect(() => {
    setSelectedDraftIds((current) => current.filter((id) => draftNotes.some((n) => n.id === id)))
    if (draftNotes.length === 0) setStatusView('live')
  }, [draftNotes])

  const selectedDrafts = useMemo(
    () => draftNotes.filter((n) => selectedDraftIds.includes(n.id)),
    [draftNotes, selectedDraftIds],
  )

  const toggleDraft = (id: string) =>
    setSelectedDraftIds((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id])

  const noteDisable = useConfirmDelete<NoteRecord>(disableNote, { success: 'Bilhete movido para a lixeira.', error: 'Erro ao desativar bilhete.' })
  const notePurge = useConfirmDelete<NoteRecord>(permanentlyDeleteNote, { success: 'Bilhete excluído permanentemente.', error: 'Erro ao excluir bilhete.' })
  const noteImport = useJsonImport(
    importNotes,
    (r) => r.created === 0
      ? `Nenhum bilhete novo, ${r.skipped} já existia${r.skipped !== 1 ? 'm' : ''}.`
      : r.skipped > 0
        ? `${r.created} importado${r.created !== 1 ? 's' : ''}, ${r.skipped} ignorado${r.skipped !== 1 ? 's' : ''} (título duplicado).`
        : `${r.created} bilhete${r.created !== 1 ? 's' : ''} importado${r.created !== 1 ? 's' : ''}.`,
    () => setImportDialogOpen(false),
    DEFAULT_IMPORT_JSON,
  )

  async function handleRestore(note: NoteRecord) {
    try {
      await restoreNote.mutateAsync(note.id)
      toast.success(`"${note.title}" voltou a ficar disponível.`)
    } catch (e) {
      toast.error((e as Error).message || 'Erro ao restaurar bilhete.')
    }
  }

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase()
    const rarityOrder = new Map(rarities.map((r) => [r.id, r.order]))
    const typeOrder = new Map(types.map((t) => [t.id, t.order]))
    const filtered = activeNotes.filter((note) =>
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
  }, [noteSort, activeNotes, rarities, rarityFilter, search, types])

  const visibleNotes = useMemo(
    () => statusView === 'drafts' ? [] : filteredNotes.slice(0, visibleNoteCount),
    [filteredNotes, visibleNoteCount, statusView],
  )

  useEffect(() => {
    setVisibleNoteCount(NOTE_PAGE_SIZE)
  }, [noteSort, noteView, rarityFilter, search])

  return (
    <>
      <Stack spacing={1.5}>
        <Stack spacing={1}>
          <Typography sx={{ fontSize: '0.72rem', color: theme.textOnBgMuted, fontWeight: 600 }}>
            {activeNotes.length} bilhete{activeNotes.length !== 1 ? 's' : ''} no ar
            {draftNotes.length > 0 && ` · ${draftNotes.length} rascunho${draftNotes.length !== 1 ? 's' : ''}`}
            {trashedNotes.length > 0 && ` · ${trashedNotes.length} na lixeira`}
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

        {draftNotes.length > 0 && (
          <Stack direction="row" spacing={0.7}>
            {([
              { id: 'live' as const, label: `🚀 No ar · ${activeNotes.length}` },
              { id: 'drafts' as const, label: `🚧 Rascunhos · ${draftNotes.length}` },
            ]).map((option) => {
              const active = statusView === option.id
              return (
                <Box key={option.id} onClick={() => setStatusView(option.id)} sx={{
                  flex: 1, py: 0.8, borderRadius: radius.lg, cursor: 'pointer', textAlign: 'center',
                  background: active ? theme.accent : theme.surfaceBg,
                  border: `1.5px solid ${active ? theme.accent : theme.surfaceBorder}`,
                  backdropFilter: 'blur(12px)',
                  boxShadow: active ? `0 6px 20px ${theme.accent}44` : 'none',
                  transition: 'all 0.18s ease',
                  '&:hover': active ? {} : { borderColor: `${theme.accent}55` },
                }}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: active ? '#fff' : theme.textOnBgMuted }}>
                    {option.label}
                  </Typography>
                </Box>
              )
            })}
          </Stack>
        )}

        {statusView === 'drafts' && (
          <>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 0.3 }}>
              <Typography sx={{ flex: 1, fontSize: '0.74rem', color: theme.textOnBgMuted, lineHeight: 1.45 }}>
                Invisíveis pros leitores até você lançar. Lance em lotes, quando quiser.
              </Typography>
              <Typography
                onClick={() => setSelectedDraftIds(selectedDraftIds.length === draftNotes.length ? [] : draftNotes.map((n) => n.id))}
                sx={{ fontSize: '0.74rem', fontWeight: 800, color: theme.accent, cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', flexShrink: 0, '&:hover': { opacity: 0.75 } }}
              >
                {selectedDraftIds.length === draftNotes.length ? 'Desmarcar todos' : 'Selecionar todos'}
              </Typography>
            </Stack>

            {draftNotes.map((note) => {
              const selected = selectedDraftIds.includes(note.id)
              const r = rarities.find((x) => x.id === note.rarity)
              const t = types.find((x) => x.id === note.typeId)
              return (
                <Card key={note.id} onClick={() => toggleDraft(note.id)} sx={{
                  p: 0, overflow: 'hidden', cursor: 'pointer',
                  border: `1.5px solid ${selected ? theme.accent : colors.border.subtle}`,
                  boxShadow: selected ? `0 8px 26px ${theme.accent}30` : '0 4px 14px rgba(15,23,42,0.06)',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
                  '&:hover': { transform: 'translateY(-1px)' },
                }}>
                  <Stack direction="row" alignItems="stretch" sx={{ minHeight: 78 }}>
                    {note.imageUrl ? (
                      <Box sx={{ width: 68, flexShrink: 0, overflow: 'hidden' }}>
                        <Box component="img" src={note.imageUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: selected ? 'none' : 'saturate(0.85)' }} />
                      </Box>
                    ) : (
                      <Box sx={{ width: 5, flexShrink: 0, background: r ? `linear-gradient(180deg,${r.borderColor},${r.glowColor || r.borderColor})` : colors.border.subtle, opacity: selected ? 1 : 0.55 }} />
                    )}

                    <Box sx={{ flex: 1, minWidth: 0, px: 1.3, py: 1.05 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '0.9rem', color: colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {note.title}
                          </Typography>
                          <Typography sx={{ mt: 0.2, fontSize: '0.74rem', color: colors.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {note.message}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.6, flexWrap: 'wrap', rowGap: 0.4 }}>
                            {r && (
                              <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 0.7, py: 0.15, borderRadius: radius.full, background: r.chipBg, border: `1px solid ${r.borderColor}`, fontSize: '0.64rem', fontWeight: 800 }}>
                                <Box component="span" sx={gradientTextSx(r.chipColor)}>{r.emoji} {r.label}</Box>
                              </Box>
                            )}
                            {t && (
                              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3, px: 0.7, py: 0.15, borderRadius: radius.full, background: t.tagBg, color: t.tagColor, border: `1px solid ${t.accentColor}33`, fontSize: '0.64rem', fontWeight: 800 }}>
                                {t.emoji} {t.label}
                              </Box>
                            )}
                            <Box sx={{ flex: 1 }} />
                            <IconButton size="small" aria-label="ver rascunho" onClick={(e) => { e.stopPropagation(); setViewingNote(note) }} sx={{ ...actionButtonSx('neutral'), width: 26, height: 26 }}>
                              <VisibilityOutlinedIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                            <IconButton size="small" aria-label="editar rascunho" onClick={(e) => { e.stopPropagation(); setEditingNote(note); setNoteDialog(true) }} sx={{ ...actionButtonSx('primary'), width: 26, height: 26 }}>
                              <EditOutlinedIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                            <IconButton size="small" aria-label="desativar rascunho" onClick={(e) => { e.stopPropagation(); noteDisable.setTarget(note) }} sx={{ ...actionButtonSx('danger'), width: 26, height: 26 }}>
                              <DeleteForeverOutlinedIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                          </Stack>
                        </Box>

                        <Box sx={{
                          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                          border: `2px solid ${selected ? theme.accent : colors.border.medium}`,
                          background: selected ? theme.accent : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease',
                        }}>
                          {selected && <Box component="span" sx={{ color: '#fff', fontSize: '0.7rem', lineHeight: 1, fontWeight: 900 }}>✓</Box>}
                        </Box>
                      </Stack>
                    </Box>
                  </Stack>
                </Card>
              )
            })}

            <Box sx={{
              position: 'sticky', bottom: 8, zIndex: 5,
              px: 1.5, py: 1.1, borderRadius: radius.xl,
              background: theme.surfaceBg, backdropFilter: 'blur(18px)',
              border: `1.5px solid ${selectedDraftIds.length > 0 ? `${theme.accent}55` : theme.surfaceBorder}`,
              boxShadow: selectedDraftIds.length > 0 ? `0 10px 32px ${theme.accent}33` : '0 8px 24px rgba(0,0,0,0.12)',
              display: 'flex', alignItems: 'center', gap: 1.2,
              transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
            }}>
              <Typography sx={{ flex: 1, fontSize: '0.76rem', fontWeight: 700, color: theme.textOnBgMuted, lineHeight: 1.35 }}>
                {selectedDraftIds.length === 0
                  ? 'Toque nos bilhetes pra escolher o lote'
                  : `${selectedDraftIds.length} de ${draftNotes.length} no lote`}
              </Typography>
              <Button
                variant="primary"
                disabled={selectedDraftIds.length === 0}
                onClick={() => setReleaseDialogOpen(true)}
                sx={{ py: 0.8, px: 2, fontSize: '0.82rem', whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                🚀 Lançar{selectedDraftIds.length > 0 ? ` ${selectedDraftIds.length}` : ''}
              </Button>
            </Box>
          </>
        )}

        {statusView === 'live' && activeNotes.length > 0 && (
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

        {!notesLoading && activeNotes.length === 0 && draftNotes.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography sx={{ fontFamily: font.serif, fontSize: '1rem', fontWeight: 700, color: theme.textOnBg, mb: 0.5 }}>
              Nenhum bilhete ainda
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: theme.textOnBgMuted }}>Crie o primeiro card desta coleção</Typography>
          </Box>
        )}

        {statusView === 'live' && !notesLoading && activeNotes.length === 0 && draftNotes.length > 0 && (
          <Box onClick={() => setStatusView('drafts')} sx={{ textAlign: 'center', py: 4, cursor: 'pointer' }}>
            <Typography sx={{ fontSize: '2rem', mb: 0.5 }}>🚧</Typography>
            <Typography sx={{ fontFamily: font.serif, fontSize: '1rem', fontWeight: 700, color: theme.textOnBg, mb: 0.5 }}>
              Nada no ar ainda
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: theme.textOnBgMuted }}>
              Seus bilhetes estão nos rascunhos, toque aqui pra lançar
            </Typography>
          </Box>
        )}

        {statusView === 'live' && !notesLoading && activeNotes.length > 0 && filteredNotes.length === 0 && (
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
                    <IconButton size="small" aria-label="desativar bilhete" onClick={(e) => { e.stopPropagation(); noteDisable.setTarget(note) }} sx={{ ...actionButtonSx('danger'), width: 28, height: 28 }}>
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
                        <IconButton size="small" aria-label="desativar bilhete" onClick={(e) => { e.stopPropagation(); noteDisable.setTarget(note) }} sx={actionButtonSx('danger')}>
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
                  <IconButton size="small" aria-label="desativar bilhete" onClick={(e) => { e.stopPropagation(); noteDisable.setTarget(note) }} sx={{ ...actionButtonSx('danger'), backdropFilter: 'blur(8px)' }}>
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
                    <IconButton size="small" aria-label="desativar bilhete" onClick={(e) => { e.stopPropagation(); noteDisable.setTarget(note) }} sx={actionButtonSx('danger')}>
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

        {statusView === 'live' && !notesLoading && filteredNotes.length > visibleNotes.length && (
          <Button variant="ghost" onClick={() => setVisibleNoteCount((c) => c + NOTE_PAGE_SIZE)} sx={{ alignSelf: 'center', mt: 0.5, px: 1.6, py: 0.8, fontSize: '0.78rem', background: 'rgba(255,255,255,0.5)' }}>
            Mostrar mais {Math.min(NOTE_PAGE_SIZE, filteredNotes.length - visibleNotes.length)} bilhetes
          </Button>
        )}

        {statusView === 'live' && trashedNotes.length > 0 && (
          <Box sx={{ mt: 1.5, p: 1.4, borderRadius: radius.xl, border: `1.5px dashed ${theme.surfaceBorder}`, background: theme.surfaceBg, backdropFilter: 'blur(14px)' }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: 0.6, color: theme.textOnBgMuted, textTransform: 'uppercase', mb: 1 }}>
              🗑️ Lixeira
            </Typography>
            <Stack spacing={0.8}>
              {trashedNotes.map((note) => (
                <Card key={note.id} sx={{ p: 1.2, opacity: 0.8 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '0.86rem', color: colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {note.title}
                      </Typography>
                      {(note.timesCollected ?? 0) > 0 && (
                        <Typography sx={{ fontSize: '0.68rem', color: colors.text.muted }}>
                          {note.timesCollected} leitor{note.timesCollected === 1 ? '' : 'es'} já {note.timesCollected === 1 ? 'tem' : 'têm'} este bilhete
                        </Typography>
                      )}
                    </Box>
                    <Button variant="ghost" loading={restoreNote.isPending} onClick={() => void handleRestore(note)} sx={{ py: 0.5, px: 1, fontSize: '0.72rem', flexShrink: 0 }}>
                      <ReplayIcon sx={{ fontSize: 14, mr: 0.3 }} /> Restaurar
                    </Button>
                    <IconButton size="small" aria-label="excluir permanentemente" onClick={() => { setPurgeConfirmInput(''); notePurge.setTarget(note) }} sx={{ ...actionButtonSx('danger'), flexShrink: 0 }}>
                      <DeleteForeverOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Box>
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
      <ReleaseDialog cid={cid} notes={selectedDrafts} open={releaseDialogOpen} onClose={() => setReleaseDialogOpen(false)} />

      <ConfirmDeleteDialog
        open={noteDisable.isOpen}
        title={`Desativar o bilhete "${noteDisable.target?.title ?? ''}"?`}
        description={
          (noteDisable.target?.timesCollected ?? 0) > 0
            ? `${noteDisable.target?.timesCollected} leitor${noteDisable.target?.timesCollected === 1 ? '' : 'es'} já ${noteDisable.target?.timesCollected === 1 ? 'tem' : 'têm'} este bilhete e não serão afetados. Ele só para de ser sorteado para novos leitores e vai para a lixeira, de onde dá para restaurar depois.`
            : 'Ele para de ser sorteado e vai para a lixeira, de onde dá para restaurar depois.'
        }
        confirmLabel="Desativar"
        isPending={noteDisable.isPending}
        onConfirm={noteDisable.confirm}
        onClose={noteDisable.close}
      />

      <ConfirmDeleteDialog
        open={notePurge.isOpen}
        title="Excluir permanentemente?"
        description={
          <Stack spacing={1.2}>
            {(notePurge.target?.timesCollected ?? 0) > 0 && (
              <Typography sx={{ fontSize: '0.86rem', color: colors.text.primary, fontWeight: 700 }}>
                ⚠️ {notePurge.target?.timesCollected} leitor{notePurge.target?.timesCollected === 1 ? '' : 'es'} já {notePurge.target?.timesCollected === 1 ? 'tem' : 'têm'} este bilhete. Ele vai sumir do álbum dessas pessoas também.
              </Typography>
            )}
            <Typography sx={{ fontSize: '0.85rem', color: colors.text.secondary, lineHeight: 1.6 }}>
              Isso é permanente e não pode ser desfeito. Para confirmar, digite o título exato do bilhete:
            </Typography>
            <Input
              placeholder={notePurge.target?.title ?? ''}
              value={purgeConfirmInput}
              onChange={(e) => setPurgeConfirmInput(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.86rem' }, '& input': { py: 0.9 } }}
            />
          </Stack>
        }
        confirmLabel="Excluir para sempre"
        confirmDisabled={purgeConfirmInput.trim().toLowerCase() !== (notePurge.target?.title ?? '').trim().toLowerCase()}
        isPending={notePurge.isPending}
        onConfirm={notePurge.confirm}
        onClose={() => { notePurge.close(); setPurgeConfirmInput('') }}
      />
    </>
  )
}
