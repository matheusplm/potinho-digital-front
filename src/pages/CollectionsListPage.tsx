import AddIcon from '@mui/icons-material/Add'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { Box, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input, PageTitle, ScrollablePage, toast } from '../components/ui'
import { useCollectionsQuery, useCreateCollectionMutation } from '../hooks/useNotes'
import { useBackground } from '../context/BackgroundContext'
import { useUser } from '../context/UserContext'
import { backgroundThemes, colors, font, radius } from '../design-system'
import type { CollectionFormData } from '../types/note'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`

const EMOJIS = ['💙', '💗', '✨', '🌸', '🌙', '🌊', '🌿', '🔥', '⭐', '🎁']

const DEFAULT_FORM: CollectionFormData = { name: '', emoji: '💙', description: '', theme: 'romance' }

function CreateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState<CollectionFormData>(DEFAULT_FORM)
  const createMutation = useCreateCollectionMutation()

  const titleError = form.name.trim().length === 0 ? '' : form.name.length > 50 ? 'Máximo 50 caracteres' : ''

  async function handleSubmit() {
    if (!form.name.trim()) return
    try {
      await createMutation.mutateAsync(form)
      toast.success('Coleção criada!')
      setForm(DEFAULT_FORM)
      onClose()
    } catch {
      toast.error('Erro ao criar coleção.')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{
      sx: { borderRadius: radius.xl, mx: 2, background: 'rgba(255,253,251,0.98)', backdropFilter: 'blur(24px)' }
    }}>
      <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 700, color: colors.text.primary, pb: 1 }}>
        Nova coleção
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: colors.text.secondary, mb: 0.8 }}>Emoji</Typography>
            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
              {EMOJIS.map((e) => (
                <Box key={e} onClick={() => setForm((f) => ({ ...f, emoji: e }))} sx={{
                  width: 38, height: 38, borderRadius: radius.md, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
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
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: colors.text.secondary }}>Nome</Typography>
              <Typography sx={{ fontSize: '0.68rem', color: form.name.length > 50 ? colors.error.main : colors.text.muted }}>
                {form.name.length}/50
              </Typography>
            </Stack>
            <Input placeholder="Nosso potinho 💙" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={!!titleError} />
          </Box>

          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: colors.text.secondary }}>Descrição</Typography>
              <Typography sx={{ fontSize: '0.68rem', color: colors.text.muted }}>{form.description.length}/200</Typography>
            </Stack>
            <TextField multiline rows={2} fullWidth placeholder="Um potinho cheio de amor..." value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value.slice(0, 200) }))}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: radius.md, fontSize: '0.88rem', background: colors.surface.overlay, '& fieldset': { borderColor: colors.border.medium } } }}
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: colors.text.secondary, mb: 1 }}>Tema de fundo</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {backgroundThemes.map((bg) => (
                <Box key={bg.key} onClick={() => setForm((f) => ({ ...f, theme: bg.key }))} sx={{
                  width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
                  background: bg.gradient, flexShrink: 0,
                  border: `2.5px solid ${form.theme === bg.key ? bg.accent : 'transparent'}`,
                  boxShadow: form.theme === bg.key ? `0 2px 10px ${bg.accent}66` : 'none',
                  transition: 'all 0.15s', '&:hover': { transform: 'scale(1.1)' },
                }} title={bg.label} />
              ))}
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>Cancelar</Button>
        <Button variant="primary" loading={createMutation.isPending} onClick={handleSubmit} disabled={!form.name.trim()} sx={{ flex: 1 }}>
          Criar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export function CollectionsListPage() {
  const { theme } = useBackground()
  const { user } = useUser()
  const navigate = useNavigate()
  const { data: collections = [], isLoading } = useCollectionsQuery()
  const [createOpen, setCreateOpen] = useState(false)

  const isWriter = user?.role === 'writer'

  return (
    <Box sx={{ height: '100%', position: 'relative', background: theme.gradient }}>
      <FavoriteIcon sx={{ position: 'absolute', bottom: -60, right: -60, fontSize: 400, color: 'rgba(225,29,72,0.04)', pointerEvents: 'none' }} />

      <ScrollablePage sx={{ px: 2.5, py: 2.5, animation: `${fadeIn} 0.35s ease` }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
          <PageTitle title="Coleções" subtitle={isLoading ? 'Carregando...' : `${collections.length} coleção${collections.length !== 1 ? 'ões' : ''}`} />
          {isWriter && (
            <Button variant="primary" onClick={() => setCreateOpen(true)} sx={{ py: 0.9, px: 1.6, fontSize: '0.8rem', flexShrink: 0 }}>
              <AddIcon sx={{ fontSize: 16, mr: 0.5 }} /> Nova
            </Button>
          )}
        </Stack>

        {isLoading && (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress size={28} sx={{ color: colors.primary.main }} />
          </Box>
        )}

        {!isLoading && collections.length === 0 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, textAlign: 'center' }}>
            <AutoAwesomeIcon sx={{ fontSize: 48, color: colors.primary.light, opacity: 0.4 }} />
            <Stack spacing={0.5}>
              <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.1rem', color: theme.textOnBg }}>
                {isWriter ? 'Nenhuma coleção ainda' : 'Você não tem coleções'}
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: theme.textOnBgMuted }}>
                {isWriter ? 'Crie sua primeira coleção de bilhetes' : 'Peça o código de convite para acessar uma coleção'}
              </Typography>
            </Stack>
            {isWriter && <Button variant="primary" onClick={() => setCreateOpen(true)}>Criar primeira coleção</Button>}
          </Box>
        )}

        {!isLoading && collections.length > 0 && (
          <Stack spacing={1.2}>
            {collections.map((col) => {
              const bg = backgroundThemes.find((t) => t.key === col.theme) ?? backgroundThemes[0]
              return (
                <Card key={col.id} accent={bg.accent} sx={{ p: 0, overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => navigate(`/colecoes/${col.id}`)}>
                  <Box sx={{ height: '4px', background: bg.gradient }} />
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.8 }}>
                    <Box sx={{
                      width: 46, height: 46, borderRadius: radius.md, flexShrink: 0,
                      background: bg.gradient,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                    }}>
                      {col.emoji}
                    </Box>
                    <Stack sx={{ flex: 1, minWidth: 0 }} spacing={0.2}>
                      <Stack direction="row" alignItems="center" spacing={0.8}>
                        <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1rem', color: colors.text.primary, lineHeight: 1.2 }}>
                          {col.name}
                        </Typography>
                        <Box sx={{
                          px: 0.8, py: 0.2, borderRadius: radius.full,
                          background: col.access === 'owner' ? `${colors.primary.main}18` : `${colors.rose.main}18`,
                          fontSize: '0.6rem', fontWeight: 800, letterSpacing: 0.4,
                          color: col.access === 'owner' ? colors.primary.main : colors.rose.main,
                          textTransform: 'uppercase', flexShrink: 0,
                        }}>
                          {col.access === 'owner' ? 'minha' : 'convidada'}
                        </Box>
                      </Stack>
                      {col.description && (
                        <Typography sx={{ fontSize: '0.76rem', color: colors.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {col.description}
                        </Typography>
                      )}
                    </Stack>
                    <ChevronRightIcon sx={{ fontSize: 18, color: colors.text.muted, flexShrink: 0 }} />
                  </Stack>
                </Card>
              )
            })}
          </Stack>
        )}
      </ScrollablePage>

      <CreateDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </Box>
  )
}
