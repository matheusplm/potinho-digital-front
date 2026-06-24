import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Button, EmojiPickerInput, Input } from '../../components/ui'
import { backgroundThemes, colors, font, radius } from '../../design-system'
import type { Collection, CollectionFormData } from '../../types/note'

const DEFAULT_FORM: CollectionFormData = { name: '', emoji: '💙', description: '', theme: 'romance' }

export function CollectionFormDialog({ open, onClose, initial, onSubmit, isPending }: {
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

          <EmojiPickerInput label="Emoji" value={form.emoji} onChange={(emoji) => setForm((f) => ({ ...f, emoji }))} />

          <Box>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: colors.text.secondary }}>Nome</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: form.name.length > 50 ? colors.error.main : colors.text.muted }}>
                {form.name.length}/50
              </Typography>
            </Stack>
            <Input placeholder="Nosso potinho 💙" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value.slice(0, 50) }))} />
          </Box>

          <Box>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: colors.text.secondary }}>Descrição</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: colors.text.muted }}>{form.description.length}/200</Typography>
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
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: 0.5, color: colors.text.muted, textTransform: 'uppercase', mb: 0.6 }}>
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
