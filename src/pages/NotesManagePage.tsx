import AddIcon from '@mui/icons-material/Add'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { Box, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useState } from 'react'
import { Button, Card, Input, PageTitle, toast } from '../components/ui'
import { useCreateNoteMutation, useDeleteNoteMutation, useNotesQuery, useRaritiesQuery, useTypesQuery, useUpdateNoteMutation } from '../hooks/useNotes'
import { colors, font, radius } from '../design-system'
import { useBackground } from '../context/BackgroundContext'
import type { NoteFormData, NoteRecord } from '../types/note'
import type { RarityConfig, NoteTypeConfig } from '../types/note'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`

const EMPTY_FORM: NoteFormData = { title: '', message: '', rarity: '', typeId: '' }

function RarityChip({ rarity, rarities }: { rarity: string; rarities: RarityConfig[] }) {
  const r = rarities.find((x) => x.id === rarity)
  if (!r) return <Typography sx={{ fontSize: '0.7rem', color: colors.text.muted }}>{rarity}</Typography>
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.4,
      px: 1, py: 0.3, borderRadius: radius.full,
      background: r.chipBg, color: r.chipColor,
      fontSize: '0.68rem', fontWeight: 700,
    }}>
      {r.emoji} {r.label}
    </Box>
  )
}

function TypeChip({ typeId, types }: { typeId: string; types: NoteTypeConfig[] }) {
  const t = types.find((x) => x.id === typeId)
  if (!t) return null
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.4,
      px: 1, py: 0.3, borderRadius: radius.full,
      background: t.tagBg, color: t.tagColor,
      fontSize: '0.68rem', fontWeight: 700,
    }}>
      {t.emoji} {t.label}
    </Box>
  )
}

interface NoteFormProps {
  open: boolean
  editing: NoteRecord | null
  rarities: RarityConfig[]
  types: NoteTypeConfig[]
  onClose: () => void
}

function NoteFormDialog({ open, editing, rarities, types, onClose }: NoteFormProps) {
  const [form, setForm] = useState<NoteFormData>(
    editing ? { title: editing.title, message: editing.message, rarity: editing.rarity, typeId: editing.typeId }
            : EMPTY_FORM
  )
  const createMutation = useCreateNoteMutation()
  const updateMutation = useUpdateNoteMutation()

  const isLoading = createMutation.isPending || updateMutation.isPending

  const errors = {
    title: form.title.trim().length === 0 ? 'Obrigatório' : form.title.length > 60 ? 'Máximo 60 caracteres' : '',
    message: form.message.trim().length === 0 ? 'Obrigatório' : form.message.length > 500 ? 'Máximo 500 caracteres' : '',
    rarity: !form.rarity ? 'Selecione uma raridade' : '',
    typeId: !form.typeId ? 'Selecione um tipo' : '',
  }
  const hasErrors = Object.values(errors).some(Boolean)

  async function handleSubmit() {
    if (hasErrors) return
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: form })
        toast.success('Bilhete atualizado!')
      } else {
        await createMutation.mutateAsync(form)
        toast.success('Bilhete criado!')
      }
      onClose()
    } catch {
      toast.error('Erro ao salvar bilhete.')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{
      sx: { borderRadius: radius.xl, mx: 2, background: 'rgba(255,253,251,0.98)', backdropFilter: 'blur(24px)' }
    }}>
      <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 700, color: colors.text.primary, pb: 1 }}>
        {editing ? 'Editar bilhete' : 'Novo bilhete'}
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: colors.text.secondary }}>Título</Typography>
              <Typography sx={{ fontSize: '0.68rem', color: form.title.length > 60 ? colors.error.main : colors.text.muted }}>
                {form.title.length}/60
              </Typography>
            </Stack>
            <Input
              placeholder="Um título especial..."
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              error={!!errors.title && form.title.length > 0}
            />
          </Box>

          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: colors.text.secondary }}>Mensagem</Typography>
              <Typography sx={{ fontSize: '0.68rem', color: form.message.length > 500 ? colors.error.main : colors.text.muted }}>
                {form.message.length}/500
              </Typography>
            </Stack>
            <TextField
              multiline
              rows={4}
              fullWidth
              placeholder="Escreva algo especial..."
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              error={!!errors.message && form.message.length > 0}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: radius.md,
                  fontSize: '0.88rem',
                  background: colors.surface.overlay,
                  '& fieldset': { borderColor: colors.border.medium },
                  '&:hover fieldset': { borderColor: colors.primary.light },
                  '&.Mui-focused fieldset': { borderColor: colors.primary.main },
                },
              }}
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: colors.text.secondary, mb: 1 }}>
              Raridade
            </Typography>
            {rarities.length === 0 ? (
              <Typography sx={{ fontSize: '0.8rem', color: colors.text.muted }}>
                Crie raridades primeiro em Configurações.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                {rarities.map((r) => (
                  <Box
                    key={r.id}
                    onClick={() => setForm((f) => ({ ...f, rarity: r.id }))}
                    sx={{
                      px: 1.4, py: 0.6, borderRadius: radius.full, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 0.5,
                      background: form.rarity === r.id ? r.chipBg : 'rgba(0,0,0,0.04)',
                      color: form.rarity === r.id ? r.chipColor : colors.text.secondary,
                      border: `1.5px solid ${form.rarity === r.id ? r.borderColor : 'transparent'}`,
                      fontWeight: 700, fontSize: '0.78rem',
                      transition: 'all 0.18s',
                    }}
                  >
                    {r.emoji} {r.label}
                  </Box>
                ))}
              </Box>
            )}
            {errors.rarity && form.rarity === '' && (
              <Typography sx={{ fontSize: '0.7rem', color: colors.error.main, mt: 0.5 }}>{errors.rarity}</Typography>
            )}
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: colors.text.secondary, mb: 1 }}>
              Tipo
            </Typography>
            {types.length === 0 ? (
              <Typography sx={{ fontSize: '0.8rem', color: colors.text.muted }}>
                Crie tipos primeiro em Configurações.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                {types.map((t) => (
                  <Box
                    key={t.id}
                    onClick={() => setForm((f) => ({ ...f, typeId: t.id }))}
                    sx={{
                      px: 1.4, py: 0.6, borderRadius: radius.full, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 0.5,
                      background: form.typeId === t.id ? t.tagBg : 'rgba(0,0,0,0.04)',
                      color: form.typeId === t.id ? t.tagColor : colors.text.secondary,
                      border: `1.5px solid ${form.typeId === t.id ? t.accentColor + '55' : 'transparent'}`,
                      fontWeight: 700, fontSize: '0.78rem',
                      transition: 'all 0.18s',
                    }}
                  >
                    {t.emoji} {t.label}
                  </Box>
                ))}
              </Box>
            )}
            {errors.typeId && form.typeId === '' && (
              <Typography sx={{ fontSize: '0.7rem', color: colors.error.main, mt: 0.5 }}>{errors.typeId}</Typography>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>
          Cancelar
        </Button>
        <Button variant="primary" loading={isLoading} onClick={handleSubmit} disabled={hasErrors} sx={{ flex: 1 }}>
          {editing ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

interface DeleteDialogProps {
  note: NoteRecord | null
  onClose: () => void
}

function DeleteDialog({ note, onClose }: DeleteDialogProps) {
  const deleteMutation = useDeleteNoteMutation()

  async function handleDelete() {
    if (!note) return
    try {
      await deleteMutation.mutateAsync(note.id)
      toast.success('Bilhete removido.')
      onClose()
    } catch {
      toast.error('Erro ao remover bilhete.')
    }
  }

  return (
    <Dialog open={!!note} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{
      sx: { borderRadius: radius.xl, mx: 2 }
    }}>
      <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 700, color: colors.text.primary }}>
        Remover bilhete?
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: '0.88rem', color: colors.text.secondary }}>
          &ldquo;{note?.title}&rdquo; será removido permanentemente.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>Cancelar</Button>
        <Button variant="rose" loading={deleteMutation.isPending} onClick={handleDelete} sx={{ flex: 1 }}>
          Remover
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export function NotesManagePage() {
  const { theme } = useBackground()
  const { data: notes = [], isLoading } = useNotesQuery()
  const { data: rarities = [] } = useRaritiesQuery()
  const { data: types = [] } = useTypesQuery()

  const [formOpen, setFormOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<NoteRecord | null>(null)
  const [deletingNote, setDeletingNote] = useState<NoteRecord | null>(null)

  function openCreate() {
    setEditingNote(null)
    setFormOpen(true)
  }

  function openEdit(note: NoteRecord) {
    setEditingNote(note)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingNote(null)
  }

  return (
    <Box sx={{
      height: '100%', position: 'relative',
      background: theme.gradient,
    }}>
      <FavoriteIcon sx={{
        position: 'absolute', bottom: -60, right: -60,
        fontSize: 400, color: 'rgba(225,29,72,0.04)', pointerEvents: 'none',
      }} />

      <Box sx={{
        position: 'absolute', inset: 0, zIndex: 1,
        display: 'flex', flexDirection: 'column',
        px: 2.5, py: 2.5, overflowY: 'auto',
        animation: `${fadeIn} 0.35s ease`,
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
          <PageTitle title="Bilhetes" subtitle={`${notes.length} bilhete${notes.length !== 1 ? 's' : ''} no potinho`} />
          <Button variant="primary" onClick={openCreate} sx={{ py: 0.9, px: 1.6, fontSize: '0.8rem', flexShrink: 0 }}>
            <AddIcon sx={{ fontSize: 16, mr: 0.5 }} /> Novo
          </Button>
        </Stack>

        {isLoading && (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress size={28} sx={{ color: colors.primary.main }} />
          </Box>
        )}

        {!isLoading && notes.length === 0 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, textAlign: 'center' }}>
            <FavoriteIcon sx={{ fontSize: 48, color: colors.rose.light, opacity: 0.5 }} />
            <Stack spacing={0.5}>
              <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.1rem', color: colors.text.primary }}>
                Nenhum bilhete ainda
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: colors.text.secondary }}>
                Crie o primeiro bilhete para o potinho
              </Typography>
            </Stack>
            <Button variant="primary" onClick={openCreate}>Criar primeiro bilhete</Button>
          </Box>
        )}

        {!isLoading && notes.length > 0 && (
          <Stack spacing={1.2}>
            {notes.map((note) => {
              const r = rarities.find((x) => x.id === note.rarity)
              return (
                <Card key={note.id} accent={r?.borderColor} sx={{ p: 0, overflow: 'hidden' }}>
                  <Box sx={{
                    height: '3px',
                    background: r ? `linear-gradient(90deg, ${r.borderColor}, ${r.borderColor}88)` : colors.border.subtle,
                  }} />
                  <Box sx={{ p: 1.8 }}>
                    <Stack direction="row" alignItems="flex-start" spacing={1}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{
                          fontFamily: font.serif, fontWeight: 700,
                          fontSize: '0.95rem', color: colors.text.primary,
                          mb: 0.4, lineHeight: 1.25,
                        }}>
                          {note.title}
                        </Typography>
                        <Typography sx={{
                          fontSize: '0.8rem', color: colors.text.secondary,
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          lineHeight: 1.5, mb: 1,
                        }}>
                          {note.message}
                        </Typography>
                        <Stack direction="row" spacing={0.6}>
                          <RarityChip rarity={note.rarity} rarities={rarities} />
                          <TypeChip typeId={note.typeId} types={types} />
                        </Stack>
                      </Box>
                      <Stack direction="row" spacing={0} sx={{ flexShrink: 0 }}>
                        <IconButton size="small" onClick={() => openEdit(note)} sx={{ color: colors.primary.main, p: 0.7 }}>
                          <EditOutlinedIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => setDeletingNote(note)} sx={{ color: colors.rose.main, p: 0.7 }}>
                          <DeleteForeverOutlinedIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Box>
                </Card>
              )
            })}
          </Stack>
        )}
      </Box>

      <NoteFormDialog
        open={formOpen}
        editing={editingNote}
        rarities={rarities}
        types={types}
        onClose={closeForm}
      />
      <DeleteDialog note={deletingNote} onClose={() => setDeletingNote(null)} />
    </Box>
  )
}
