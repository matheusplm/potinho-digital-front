import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import CloseIcon from '@mui/icons-material/Close'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import { useState, useEffect } from 'react'
import { usePush } from '../hooks/usePush'
import { Button } from './ui'
import { colors, radius } from '../design-system'
import { useBackground } from '../context/BackgroundContext'

const SEEN_KEY = 'push-prompt-seen'

export function PushPrompt() {
  const { state, loading, enable } = usePush()
  const { theme } = useBackground()
  const [dismissed, setDismissed] = useState(() => !!sessionStorage.getItem(SEEN_KEY))

  const dismiss = () => {
    sessionStorage.setItem(SEEN_KEY, '1')
    setDismissed(true)
  }

  useEffect(() => {
    const t = setTimeout(dismiss, 5000)
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
            onClick={dismiss}
            sx={{ color: colors.text.muted, p: 0.4 }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  )
}

