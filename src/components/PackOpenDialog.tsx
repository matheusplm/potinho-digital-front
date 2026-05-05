import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { Box, Button, Chip, Dialog, DialogContent, Stack, Typography } from '@mui/material'
import type { OpenPackResponse, Rarity } from '../types/note'

interface RewardStyle {
  bg: string
  iconBg: string
  iconColor: string
  chipBg: string
  chipColor: string
  border: string
}

const rewardStyle: Record<Rarity, RewardStyle> = {
  comum: {
    bg: 'rgba(241, 245, 249, 0.75)',
    iconBg: 'rgba(100, 116, 139, 0.1)',
    iconColor: '#64748b',
    chipBg: '#f1f5f9',
    chipColor: '#475569',
    border: 'rgba(148, 163, 184, 0.2)',
  },
  incomum: {
    bg: 'rgba(219, 234, 254, 0.55)',
    iconBg: 'rgba(37, 99, 235, 0.1)',
    iconColor: '#2563eb',
    chipBg: '#dbeafe',
    chipColor: '#1e40af',
    border: 'rgba(59, 130, 246, 0.2)',
  },
  raro: {
    bg: 'rgba(30, 58, 138, 0.08)',
    iconBg: 'rgba(29, 78, 216, 0.1)',
    iconColor: '#1d4ed8',
    chipBg: '#1e3a8a',
    chipColor: '#bfdbfe',
    border: 'rgba(30, 58, 138, 0.15)',
  },
  lendario: {
    bg: 'rgba(254, 243, 199, 0.75)',
    iconBg: 'rgba(217, 119, 6, 0.1)',
    iconColor: '#d97706',
    chipBg: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    chipColor: '#451a03',
    border: 'rgba(245, 158, 11, 0.28)',
  },
  mitico: {
    bg: 'rgba(237, 233, 254, 0.55)',
    iconBg: 'rgba(139, 92, 246, 0.1)',
    iconColor: '#8b5cf6',
    chipBg: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    chipColor: '#fff',
    border: 'rgba(139, 92, 246, 0.2)',
  },
}

const rarityLabel: Record<Rarity, string> = {
  comum: 'Comum',
  incomum: 'Incomum',
  raro: 'Raro',
  lendario: 'Lendário',
  mitico: 'Mítico',
}

interface PackOpenDialogProps {
  open: boolean
  result: OpenPackResponse | null
  onClose: () => void
}

export function PackOpenDialog({ open, result, onClose }: PackOpenDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: 'linear-gradient(160deg, #fff8f9 0%, #f5f0ff 100%)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
          mx: 2,
        },
      }}
    >
      <DialogContent sx={{ pt: 3, pb: 2.5, px: 2.5 }}>
        {result ? (
          <Stack spacing={2.2}>
            {/* Header */}
            <Stack spacing={0.5} alignItems="center">
              <Typography sx={{ fontSize: '2rem', lineHeight: 1 }}>✨</Typography>
              <Typography
                variant="h5"
                sx={{ textAlign: 'center', color: '#1f2a44', lineHeight: 1.2 }}
              >
                Pacotinho aberto!
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Você conseguiu 3 bilhetinhos
              </Typography>
            </Stack>

            {/* Rewards */}
            <Stack spacing={1.1}>
              {result.rewards.map((reward, index) => {
                const style = rewardStyle[reward.rarity]
                return (
                  <Box
                    key={`${reward.id}-${index}`}
                    sx={{
                      p: 1.4,
                      borderRadius: 2.5,
                      background: style.bg,
                      border: `1.5px solid ${style.border}`,
                      animation: `reward-in 0.4s ${index * 0.12}s cubic-bezier(0.16,1,0.3,1) both`,
                      '@keyframes reward-in': {
                        from: { opacity: 0, transform: 'translateX(-14px)' },
                        to:   { opacity: 1, transform: 'translateX(0)' },
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          bgcolor: style.iconBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <AutoAwesomeIcon sx={{ fontSize: 17, color: style.iconColor }} />
                      </Box>

                      <Typography
                        sx={{
                          flex: 1,
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          color: '#1f2a44',
                          fontFamily: '"Playfair Display", Georgia, serif',
                          fontStyle: 'italic',
                          lineHeight: 1.3,
                        }}
                      >
                        {reward.title}
                      </Typography>

                      <Stack direction="row" spacing={0.5} flexShrink={0}>
                        {reward.isNew && (
                          <Chip
                            label="Novo!"
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.63rem',
                              fontWeight: 700,
                              bgcolor: '#dcfce7',
                              color: '#15803d',
                              '& .MuiChip-label': { px: 0.7 },
                              animation: 'new-pop 0.5s cubic-bezier(0.16,1,0.3,1)',
                              '@keyframes new-pop': {
                                from: { transform: 'scale(0.5)', opacity: 0 },
                                to:   { transform: 'scale(1)', opacity: 1 },
                              },
                            }}
                          />
                        )}
                        <Chip
                          label={rarityLabel[reward.rarity]}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.63rem',
                            fontWeight: 700,
                            background: style.chipBg,
                            color: style.chipColor,
                            '& .MuiChip-label': { px: 0.7 },
                          }}
                        />
                      </Stack>
                    </Stack>
                  </Box>
                )
              })}
            </Stack>

            {/* Footer */}
            <Stack spacing={1} alignItems="center">
              <Typography variant="caption" sx={{ color: '#94a3b8', textAlign: 'center' }}>
                Você ainda pode abrir{' '}
                <Box component="span" sx={{ color: '#1d4ed8', fontWeight: 700 }}>
                  {result.remainingOpensToday}
                </Box>{' '}
                pacotinho{result.remainingOpensToday !== 1 ? 's' : ''} hoje.
              </Typography>
              <Button
                onClick={onClose}
                variant="contained"
                fullWidth
                sx={{
                  borderRadius: 3,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '1rem',
                  py: 1.2,
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                  boxShadow: '0 4px 16px rgba(29, 78, 216, 0.3)',
                }}
              >
                Ótimo!
              </Button>
            </Stack>
          </Stack>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
