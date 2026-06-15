import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff'
import CloseIcon from '@mui/icons-material/Close'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import { useState, useEffect } from 'react'
import { usePush } from '../hooks/usePush'
import { Button } from './ui'
import { colors, radius } from '../design-system'
import { useBackground } from '../context/BackgroundContext'

export function PushPrompt() {
  const { state, loading, enable } = usePush()
  const { theme } = useBackground()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDismissed(true), 5000)
    return () => clearTimeout(t)
  }, [])

  if (dismissed || state !== 'default') return null

  return (
    <Box sx={{
      position: 'fixed',
      top: 10,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 40px)',
      maxWidth: 440,
      zIndex: 1200,
      background: `${theme.accent}18`,
      backdropFilter: 'blur(20px)',
      border: `1.5px solid ${theme.accent}30`,
      borderLeft: `3px solid ${theme.accent}`,
      borderRadius: radius.xl,
      px: 2, py: 1.4,
      boxShadow: `0 4px 24px ${theme.accent}20`,
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
