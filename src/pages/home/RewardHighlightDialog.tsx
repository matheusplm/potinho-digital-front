import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui'
import { RewardCard } from '../../components/collection/RewardCard'
import { colors, font, radius } from '../../design-system'
import type { CollectionDailyReward, NoteTypeConfig, RarityConfig } from '../../types/note'

export function RewardHighlightDialog({ open, rewards, rarities, types, collectionSlug, accent, onClose, onRewardClick }: {
  open: boolean
  rewards: CollectionDailyReward[]
  rarities: RarityConfig[]
  types: NoteTypeConfig[]
  collectionSlug: string
  accent: string
  onClose: () => void
  onRewardClick: (reward: CollectionDailyReward) => void
}) {
  const navigate = useNavigate()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            mx: 2,
            borderRadius: radius.xl,
            overflow: 'hidden',
            background: 'rgba(255,250,247,0.98)',
            boxShadow: '0 24px 70px rgba(15,23,42,0.18)',
          },
        },
        backdrop: {
          sx: { background: 'rgba(15,23,42,0.18)', backdropFilter: 'blur(8px)' },
        },
      }}
    >
      <Box sx={{
        p: 2,
        background: `radial-gradient(circle at 18% 0%, rgba(255,255,255,0.76), transparent 38%), linear-gradient(135deg, ${colors.rose.main}14, ${accent}18)`,
        position: 'relative',
      }}>
        <DialogTitle sx={{ p: 0, fontFamily: font.serif, fontWeight: 850, fontSize: '1.18rem', color: colors.text.primary }}>
          Você recebeu 💌
        </DialogTitle>
        <Typography sx={{ mt: 0.35, fontSize: '0.78rem', color: colors.text.secondary }}>
          Leia seus novos bilhetinhos antes de guardar na coleção.
        </Typography>
      </Box>
      <DialogContent sx={{ pt: 2, px: 2, pb: 1.5 }}>
        <Stack spacing={1.2}>
          {rewards.map((reward, index) => (
            <RewardCard
              key={`${reward.id}-${index}`}
              reward={reward}
              rarities={rarities}
              types={types}
              onClick={() => onRewardClick(reward)}
            />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>Fechar</Button>
        <Button
          variant="primary"
          onClick={() => { onClose(); navigate(`/colecoes/${collectionSlug}`) }}
          sx={{ flex: 1, whiteSpace: 'nowrap' }}
        >
          Ver coleção
        </Button>
      </DialogActions>
    </Dialog>
  )
}
