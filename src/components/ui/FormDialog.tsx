import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { colors, font, radius } from '../../design-system'
import { Button } from './Button'

interface FormDialogProps {
  open: boolean
  title: string
  onClose: () => void
  onSubmit: () => void
  isPending?: boolean
  submitLabel?: string
  cancelLabel?: string
  maxWidth?: 'xs' | 'sm' | 'md'
  children: React.ReactNode
}

export function FormDialog({
  open,
  title,
  onClose,
  onSubmit,
  isPending = false,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  maxWidth = 'sm',
  children,
}: FormDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: radius.xl, mx: 2, background: 'var(--pd-surface-paper)', backdropFilter: 'blur(24px)' } } }}
    >
      <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 700, color: colors.text.primary, pb: 1 }}>
        {title}
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        {children}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>{cancelLabel}</Button>
        <Button variant="primary" loading={isPending} onClick={onSubmit} sx={{ flex: 1 }}>{submitLabel}</Button>
      </DialogActions>
    </Dialog>
  )
}
