import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { colors, font, radius } from '../../design-system'
import { Button } from './Button'

interface ConfirmDeleteDialogProps {
  open: boolean
  title: string
  description?: React.ReactNode
  isPending: boolean
  onConfirm: () => void
  onClose: () => void
  confirmLabel?: string
}

export function ConfirmDeleteDialog({
  open,
  title,
  description = 'Esta ação não pode ser desfeita.',
  isPending,
  onConfirm,
  onClose,
  confirmLabel = 'Excluir',
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: radius.xl, mx: 2, background: 'rgba(255,253,251,0.98)', backdropFilter: 'blur(24px)' } } }}
    >
      <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 700, color: colors.text.primary, pb: 1 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        {typeof description === 'string' ? (
          <Typography sx={{ fontSize: '0.88rem', color: colors.text.secondary, lineHeight: 1.55 }}>
            {description}
          </Typography>
        ) : description}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>Cancelar</Button>
        <Button variant="rose" loading={isPending} onClick={onConfirm} sx={{ flex: 1 }}>{confirmLabel}</Button>
      </DialogActions>
    </Dialog>
  )
}
