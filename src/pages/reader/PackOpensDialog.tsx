import { Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui'
import { colors, font, radius } from '../../design-system'
import type { CollectionPack } from '../../types/note'

export function PackOpensDialog({ pack, currentOpens, isPending, onClose, onAdd, onRemove }: {
  pack: CollectionPack | null
  currentOpens: number | undefined
  isPending: boolean
  onClose: () => void
  onAdd: (opens: number) => void
  onRemove: () => void
}) {
  const [input, setInput] = useState(1)

  useEffect(() => {
    if (pack) setInput(1)
  }, [pack])

  return (
    <Dialog
      open={!!pack}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: radius.xl, mx: 2, background: 'rgba(255,253,251,0.98)' } } }}
    >
      <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 800, color: colors.text.primary, pb: 0.5 }}>
        {pack ? `${pack.emoji} ${pack.name}` : ''}
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={1.5}>
          {currentOpens !== undefined && (
            <Typography sx={{ fontSize: '0.82rem', color: colors.text.secondary }}>
              Aberturas atuais: <strong>{currentOpens}</strong>
            </Typography>
          )}
          <TextField
            label="Aberturas para adicionar"
            type="number"
            value={input}
            onChange={(e) => setInput(Math.max(1, Number(e.target.value)))}
            inputProps={{ min: 1 }}
            fullWidth
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: radius.lg } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: 'wrap' }}>
        {currentOpens !== undefined && (
          <Button variant="ghost" loading={isPending} onClick={onRemove} sx={{ flex: '1 1 100%', color: colors.rose.main }}>
            Remover brinde
          </Button>
        )}
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>Cancelar</Button>
        <Button variant="primary" loading={isPending} disabled={input < 1} onClick={() => onAdd(input)} sx={{ flex: 1 }}>
          Adicionar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
