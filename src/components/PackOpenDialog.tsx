import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { Chip, Dialog, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import type { OpenPackResponse, Rarity } from '../types/note'

const rarityColor: Record<Rarity, 'default' | 'primary' | 'secondary' | 'warning' | 'error'> = {
  comum: 'default',
  incomum: 'primary',
  raro: 'secondary',
  lendario: 'error',
  mitico: 'warning',
}

interface PackOpenDialogProps {
  open: boolean
  result: OpenPackResponse | null
  onClose: () => void
}

export function PackOpenDialog({ open, result, onClose }: PackOpenDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Seu pacotinho foi aberto!</DialogTitle>
      <DialogContent>
        {result ? (
          <Stack spacing={2}>
            {result.rewards.map((reward, index) => (
              <Stack
                key={`${reward.id}-${index}`}
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <AutoAwesomeIcon color={reward.rarity === 'lendario' ? 'error' : 'primary'} />
                  <Typography>{reward.title}</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  {reward.isNew ? <Chip label="Novo!" color="success" size="small" /> : null}
                  <Chip
                    label={reward.rarity.toUpperCase()}
                    size="small"
                    color={rarityColor[reward.rarity]}
                  />
                </Stack>
              </Stack>
            ))}
            <Typography variant="body2" color="text.secondary">
              Voce ainda pode abrir {result.remainingOpensToday} pacotinho(s) hoje.
            </Typography>
          </Stack>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
