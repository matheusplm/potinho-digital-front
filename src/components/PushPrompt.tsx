import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff'
import CloseIcon from '@mui/icons-material/Close'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { usePush } from '../hooks/usePush'
import { Button } from './ui'
import { colors, radius } from '../design-system'
import { useBackground } from '../context/BackgroundContext'

export function PushPrompt() {
  const { state, loading, enable } = usePush()
  const { theme } = useBackground()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || state !== 'default') return null

  return (
    <Box sx={{
      mx: 2.5, mb: 2,
      background: 'rgba(255,255,255,0.62)',
      backdropFilter: 'blur(16px)',
      border: `1.5px solid ${theme.accent}22`,
      borderLeft: `3px solid ${theme.accent}`,
      borderRadius: radius.xl,
      px: 2, py: 1.4,
    }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <NotificationsNoneIcon sx={{ fontSize: 22, color: theme.accent, flexShrink: 0 }} />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: theme.textOnBg, lineHeight: 1.2 }}>
            Ativar notificações
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: theme.textOnBgMuted, lineHeight: 1.4, mt: 0.2 }}>
            Avise quando o pacotinho do dia estiver disponível.
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.8} alignItems="center" sx={{ flexShrink: 0 }}>
          <Button
            variant="primary"
            loading={loading}
            onClick={enable}
            sx={{ py: 0.6, px: 1.4, fontSize: '0.75rem', minWidth: 0, height: 32 }}
          >
            Ativar
          </Button>
          <IconButton
            size="small"
            onClick={() => setDismissed(true)}
            sx={{ color: colors.text.muted, p: 0.4 }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  )
}

export function PushDeniedChip() {
  const { state } = usePush()
  if (state !== 'denied') return null
  return (
    <Stack direction="row" alignItems="center" spacing={0.6} sx={{ px: 2.5, mb: 1.5, opacity: 0.5 }}>
      <NotificationsOffIcon sx={{ fontSize: 14, color: colors.text.muted }} />
      <Typography sx={{ fontSize: '0.7rem', color: colors.text.muted }}>
        Notificações bloqueadas nas configurações do navegador.
      </Typography>
    </Stack>
  )
}
