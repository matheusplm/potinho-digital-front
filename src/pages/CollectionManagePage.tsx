import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { Box, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Input, PageTitle, SegmentedControl, toast } from '../components/ui'
import {
  useCollectionNotesQuery, useCreateCollectionNoteMutation, useUpdateCollectionNoteMutation, useDeleteCollectionNoteMutation,
  useCollectionRaritiesQuery, useCollectionTypesQuery,
  useCollectionAccessQuery, useGrantAccessMutation, useRevokeAccessMutation,
} from '../hooks/useNotes'
import { useBackground } from '../context/BackgroundContext'
import { colors, font, radius } from '../design-system'
import type { NoteFormData, NoteRecord, RarityConfig, NoteTypeConfig } from '../types/note'

const fadeIn = keyframes`from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}`

type Tab = 'bilhetes' | 'acesso'

const TABS = [
  { id: 'bilhetes' as Tab, label: 'Bilhetes' },
  { id: 'acesso' as Tab, label: 'Acesso' },
]

const EMPTY_NOTE: NoteFormData = { title: '', message: '', rarity: '', typeId: '' }

function NoteDialog({ open, editing, rarities, types, cid, onClose }: {
  open: boolean; editing: NoteRecord | null; rarities: RarityConfig[]; types: NoteTypeConfig[]; cid: string; onClose: () => void
}) {
  const [form, setForm] = useState<NoteFormData>(editing ? { title: editing.title, message: editing.message, rarity: editing.rarity, typeId: editing.typeId } : EMPTY_NOTE)
  const createMutation = useCreateCollectionNoteMutation(cid)
  const updateMutation = useUpdateCollectionNoteMutation(cid)
  const isLoading = createMutation.isPending || updateMutation.isPending

  const errors = {
    title: form.title.trim().length === 0 ? 'Obrigatório' : form.title.length > 60 ? 'Máx 60' : '',
    message: form.message.trim().length === 0 ? 'Obrigatório' : form.message.length > 500 ? 'Máx 500' : '',
    rarity: !form.rarity ? 'Selecione' : '',
    typeId: !form.typeId ? 'Selecione' : '',
  }
  const hasErrors = Object.values(errors).some(Boolean)

  async function handleSubmit() {
    if (hasErrors) return
    try {
      if (editing) { await updateMutation.mutateAsync({ id: editing.id, data: form }); toast.success('Bilhete atualizado!') }
      else { await createMutation.mutateAsync(form); toast.success('Bilhete criado!') }
      onClose()
    } catch { toast.error('Erro ao salvar bilhete.') }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: radius.xl, mx: 2, background: 'rgba(255,253,251,0.98)', backdropFilter: 'blur(24px)' } }}>
      <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 700, color: colors.text.primary, pb: 1 }}>
        {editing ? 'Editar bilhete' : 'Novo bilhete'}
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: colors.text.secondary }}>Título</Typography>
              <Typography sx={{ fontSize: '0.68rem', color: form.title.length > 60 ? colors.error.main : colors.text.muted }}>{form.title.length}/60</Typography>
            </Stack>
            <Input placeholder="Título especial..." value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </Box>
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: colors.text.secondary }}>Mensagem</Typography>
              <Typography sx={{ fontSize: '0.68rem', color: form.message.length > 500 ? colors.error.main : colors.text.muted }}>{form.message.length}/500</Typography>
            </Stack>
            <TextField multiline rows={4} fullWidth placeholder="Escreva algo especial..." value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: radius.md, fontSize: '0.88rem', background: colors.surface.overlay, '& fieldset': { borderColor: colors.border.medium } } }}
            />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: colors.text.secondary, mb: 0.8 }}>Raridade</Typography>
            {rarities.length === 0 ? <Typography sx={{ fontSize: '0.8rem', color: colors.text.muted }}>Nenhuma raridade configurada.</Typography> : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                {rarities.map((r) => (
                  <Box key={r.id} onClick={() => setForm((f) => ({ ...f, rarity: r.id }))} sx={{
                    px: 1.4, py: 0.6, borderRadius: radius.full, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 0.5,
                    background: form.rarity === r.id ? r.chipBg : 'rgba(0,0,0,0.04)',
                    color: form.rarity === r.id ? r.chipColor : colors.text.secondary,
                    border: `1.5px solid ${form.rarity === r.id ? r.borderColor : 'transparent'}`,
                    fontWeight: 700, fontSize: '0.78rem', transition: 'all 0.15s',
                  }}>{r.emoji} {r.label}</Box>
                ))}
              </Box>
            )}
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: colors.text.secondary, mb: 0.8 }}>Tipo</Typography>
            {types.length === 0 ? <Typography sx={{ fontSize: '0.8rem', color: colors.text.muted }}>Nenhum tipo configurado.</Typography> : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                {types.map((t) => (
                  <Box key={t.id} onClick={() => setForm((f) => ({ ...f, typeId: t.id }))} sx={{
                    px: 1.4, py: 0.6, borderRadius: radius.full, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 0.5,
                    background: form.typeId === t.id ? t.tagBg : 'rgba(0,0,0,0.04)',
                    color: form.typeId === t.id ? t.tagColor : colors.text.secondary,
                    border: `1.5px solid ${form.typeId === t.id ? t.accentColor + '55' : 'transparent'}`,
                    fontWeight: 700, fontSize: '0.78rem', transition: 'all 0.15s',
                  }}>{t.emoji} {t.label}</Box>
                ))}
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>Cancelar</Button>
        <Button variant="primary" loading={isLoading} onClick={handleSubmit} disabled={hasErrors} sx={{ flex: 1 }}>
          {editing ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export function CollectionManagePage() {
  const { cid } = useParams<{ cid: string }>()
  const navigate = useNavigate()
  const { theme } = useBackground()
  const [tab, setTab] = useState<Tab>('bilhetes')
  const [noteDialog, setNoteDialog] = useState(false)
  const [editingNote, setEditingNote] = useState<NoteRecord | null>(null)
  const [emailInput, setEmailInput] = useState('')

  const { data: notes = [], isLoading: notesLoading } = useCollectionNotesQuery(cid ?? '')
  const { data: rarities = [] } = useCollectionRaritiesQuery(cid ?? '')
  const { data: types = [] } = useCollectionTypesQuery(cid ?? '')
  const { data: accesses = [], isLoading: accessLoading } = useCollectionAccessQuery(cid ?? '')
  const deleteMutation = useDeleteCollectionNoteMutation(cid ?? '')
  const grantMutation = useGrantAccessMutation(cid ?? '')
  const revokeMutation = useRevokeAccessMutation(cid ?? '')

  function openCreate() { setEditingNote(null); setNoteDialog(true) }
  function openEdit(note: NoteRecord) { setEditingNote(note); setNoteDialog(true) }

  async function handleDelete(note: NoteRecord) {
    try { await deleteMutation.mutateAsync(note.id); toast.success('Bilhete removido.') }
    catch { toast.error('Erro ao remover.') }
  }

  async function handleGrant() {
    const email = emailInput.trim()
    if (!email || !cid) return
    try { await grantMutation.mutateAsync(email); setEmailInput(''); toast.success(`Acesso concedido para ${email}`) }
    catch { toast.error('Erro ao conceder acesso.') }
  }

  async function handleRevoke(email: string) {
    if (!cid) return
    try { await revokeMutation.mutateAsync(email); toast.info(`Acesso removido de ${email}`) }
    catch { toast.error('Erro ao revogar acesso.') }
  }

  return (
    <Box sx={{ height: '100%', position: 'relative', background: theme.gradient }}>
      <FavoriteIcon sx={{ position: 'absolute', bottom: -60, right: -60, fontSize: 400, color: 'rgba(225,29,72,0.04)', pointerEvents: 'none' }} />

      <Box sx={{
        position: 'absolute', inset: 0, zIndex: 1, display: 'flex', flexDirection: 'column',
        px: 2.5, py: 2.5, overflowY: 'auto', animation: `${fadeIn} 0.35s ease`,
      }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
          <IconButton size="small" onClick={() => navigate(`/colecoes/${cid}`)} sx={{ color: colors.text.secondary }}>
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <PageTitle title="Gerenciar" subtitle="Bilhetes e acessos da coleção" />
          </Box>
        </Stack>

        <Box sx={{ mb: 2 }}>
          <SegmentedControl options={TABS} value={tab} onChange={setTab} />
        </Box>

        {tab === 'bilhetes' && (
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontSize: '0.72rem', color: colors.text.muted, fontWeight: 600 }}>
                {notes.length} bilhete{notes.length !== 1 ? 's' : ''}
              </Typography>
              <Button variant="primary" onClick={openCreate} sx={{ py: 0.7, px: 1.4, fontSize: '0.78rem' }}>
                <AddIcon sx={{ fontSize: 15, mr: 0.4 }} /> Novo
              </Button>
            </Stack>

            {notesLoading && <CircularProgress size={24} sx={{ color: colors.primary.main, mx: 'auto', mt: 2 }} />}

            {!notesLoading && notes.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography sx={{ fontFamily: font.serif, fontSize: '1rem', fontWeight: 700, color: colors.text.primary, mb: 0.5 }}>
                  Nenhum bilhete ainda
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: colors.text.secondary }}>
                  Crie o primeiro bilhete desta coleção
                </Typography>
              </Box>
            )}

            {notes.map((note) => {
              const r = rarities.find((x) => x.id === note.rarity)
              return (
                <Card key={note.id} accent={r?.borderColor} sx={{ p: 0, overflow: 'hidden' }}>
                  <Box sx={{ height: '3px', background: r ? `linear-gradient(90deg,${r.borderColor},${r.borderColor}88)` : colors.border.subtle }} />
                  <Box sx={{ p: 1.8 }}>
                    <Stack direction="row" alignItems="flex-start" spacing={1}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '0.93rem', color: colors.text.primary, mb: 0.3 }}>
                          {note.title}
                        </Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: colors.text.secondary, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                          {note.message}
                        </Typography>
                        {r && (
                          <Box sx={{ mt: 0.8, display: 'inline-flex', alignItems: 'center', gap: 0.4, px: 1, py: 0.3, borderRadius: radius.full, background: r.chipBg, color: r.chipColor, fontSize: '0.65rem', fontWeight: 700 }}>
                            {r.emoji} {r.label}
                          </Box>
                        )}
                      </Box>
                      <Stack direction="row">
                        <IconButton size="small" onClick={() => openEdit(note)} sx={{ color: colors.primary.main, p: 0.7 }}>
                          <EditOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(note)} sx={{ color: colors.rose.main, p: 0.7 }}>
                          <DeleteForeverOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Box>
                </Card>
              )
            })}
          </Stack>
        )}

        {tab === 'acesso' && (
          <Stack spacing={2}>
            <Card sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.8, color: colors.text.muted, textTransform: 'uppercase' }}>
                  Convidar por email
                </Typography>
                <Stack direction="row" spacing={1} alignItems="flex-end">
                  <Input
                    type="email" placeholder="email@exemplo.com"
                    value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { fontSize: '0.84rem' }, '& input': { py: 0.75 } }}
                  />
                  <Button variant="primary" loading={grantMutation.isPending} onClick={handleGrant}
                    disabled={!emailInput.trim()} sx={{ py: 0.85, px: 1.5, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    <PersonAddIcon sx={{ fontSize: 16, mr: 0.4 }} /> Convidar
                  </Button>
                </Stack>
              </Stack>
            </Card>

            {accessLoading && <CircularProgress size={24} sx={{ color: colors.primary.main, mx: 'auto' }} />}

            {!accessLoading && accesses.length === 0 && (
              <Typography sx={{ fontSize: '0.82rem', color: colors.text.muted, textAlign: 'center', py: 2 }}>
                Nenhum acesso concedido ainda
              </Typography>
            )}

            {accesses.map((a) => (
              <Card key={a.email} sx={{ p: 1.8 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 36, height: 36, borderRadius: radius.md, background: `linear-gradient(135deg,${colors.primary.main},${colors.rose.main})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Typography sx={{ fontFamily: font.serif, fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
                      {a.email[0].toUpperCase()}
                    </Typography>
                  </Box>
                  <Typography sx={{ flex: 1, fontSize: '0.84rem', color: colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.email}
                  </Typography>
                  <IconButton size="small" onClick={() => handleRevoke(a.email)} sx={{ color: colors.rose.main, p: 0.7, flexShrink: 0 }}>
                    <PersonRemoveIcon sx={{ fontSize: 17 }} />
                  </IconButton>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      {cid && (
        <NoteDialog open={noteDialog} editing={editingNote} rarities={rarities} types={types} cid={cid} onClose={() => { setNoteDialog(false); setEditingNote(null) }} />
      )}
    </Box>
  )
}
