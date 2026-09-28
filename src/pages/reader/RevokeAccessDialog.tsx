import { Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui'
import { colors, font, radius } from '../../design-system'

export function RevokeAccessDialog({ open, email, isPending, onClose, onRevoke }: {
  open: boolean
  email: string
  isPending: boolean
  onClose: () => void
  onRevoke: () => void
}) {
  const [input, setInput] = useState('')

  useEffect(() => {
    if (!open) setInput('')
  }, [open])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: radius.xl, mx: 2, background: 'var(--pd-surface-paper)' } } }}
    >
      <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 800, color: colors.rose.text, pb: 0.5 }}>
        Remover acesso
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={1.5}>
          <Typography variant="md" sx={{ color: colors.text.secondary, lineHeight: 1.6 }}>
            O leitor perde acesso imediatamente. Os bilhetes já coletados, favoritos e conquistas continuam guardados e voltam a aparecer normalmente se ele for convidado de novo.
          </Typography>
          <Typography variant="lg" sx={{ color: colors.text.secondary }}>
            Para confirmar, digite o email do leitor:
          </Typography>
          <Typography variant="sm" sx={{ fontWeight: 700, color: colors.text.primary, px: 1.2, py: 0.6, borderRadius: radius.md, background: colors.fill.subtle, fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {email}
          </Typography>
          <TextField
            placeholder={email}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            fullWidth
            size="small"
            autoComplete="off"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: radius.lg } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>Cancelar</Button>
        <Button
          variant="ghost"
          loading={isPending}
          disabled={input.trim().toLowerCase() !== email.toLowerCase()}
          onClick={onRevoke}
          sx={{ flex: 1, color: colors.rose.text, background: `${colors.rose.main}15`, border: `1px solid ${colors.rose.main}30`, '&:hover': { background: `${colors.rose.main}25` } }}
        >
          Remover
        </Button>
      </DialogActions>
    </Dialog>
  )
}
