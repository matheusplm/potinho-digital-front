import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material'
import { Suspense, lazy, useEffect, useState } from 'react'
import { Button, Input, LoadingState, toast } from '../../components/ui'
import { RewardCard } from '../../components/collection/RewardCard'
import { useCreateCollectionNoteMutation, useUpdateCollectionNoteMutation } from '../../hooks/useNotes'
import { colors, font, radius } from '../../design-system'
import { gradientTextSx } from '../../utils/colorUtils'
import type { NoteFormData, NoteRecord, RarityConfig, NoteTypeConfig } from '../../types/note'

const ImagePicker = lazy(() => import('../../components/ImagePicker').then((m) => ({ default: m.ImagePicker })))

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

export function NoteDialog({ open, editing, rarities, types, cid, onClose }: {
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

  const lockedIdentity = !!editing && (editing.timesCollected ?? 0) > 0

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
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, opacity: lockedIdentity ? 0.5 : 1 }}>
                {rarities.map((r) => (
                  <Box key={r.id} onClick={() => { if (lockedIdentity) return; setForm((f) => ({ ...f, rarity: r.id })); touch('rarity') }} sx={{
                    px: 1.4, py: 0.6, borderRadius: radius.full, cursor: lockedIdentity ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
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
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, opacity: lockedIdentity ? 0.5 : 1 }}>
                {types.map((t) => (
                  <Box key={t.id} onClick={() => { if (lockedIdentity) return; setForm((f) => ({ ...f, typeId: t.id })); touch('typeId') }} sx={{
                    px: 1.4, py: 0.6, borderRadius: radius.full, cursor: lockedIdentity ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 0.5,
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
            {lockedIdentity && (
              <Typography sx={{ fontSize: '0.68rem', color: colors.text.muted, mt: 0.5, pl: 0.5 }}>
                🔒 {editing?.timesCollected} leitor{editing?.timesCollected === 1 ? '' : 'es'} já {editing?.timesCollected === 1 ? 'coletou' : 'coletaram'} este bilhete — raridade e tipo não podem mudar.
              </Typography>
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
                  ...f, imageLayout: f.imageLayout === opt.value ? null : opt.value, imageUrl: f.imageLayout === opt.value ? null : f.imageUrl,
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
              <Suspense fallback={<LoadingState compact label="Carregando seletor de imagem" />}>
                <ImagePicker value={form.imageUrl} onChange={(url) => { setForm((f) => ({ ...f, imageUrl: url })); if (!url) setTouched((t) => ({ ...t, imageUrl: true })) }} />
              </Suspense>
              {touched.imageUrl && errors.imageUrl && (
                <Typography sx={{ fontSize: '0.7rem', color: colors.error.main, pl: 0.5 }}>{errors.imageUrl}</Typography>
              )}
            </Stack>
          )}
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: colors.text.secondary, mb: 1 }}>Prévia</Typography>
            <RewardCard
              previewMode
              reward={{
                id: '__preview__', title: form.title || 'Título do bilhete',
                message: form.message || 'Mensagem especial que vai aparecer no cartãozinho...',
                rarity: form.rarity || rarities[0]?.id || '', typeId: form.typeId || types[0]?.id || '',
                imageUrl: form.imageUrl, imageLayout: form.imageLayout, isNew: false,
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
