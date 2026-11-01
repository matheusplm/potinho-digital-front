import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import CloseIcon from '@mui/icons-material/Close'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import { useState, useEffect } from 'react'
import { usePush } from '../hooks/usePush'
import { Button } from './ui'
import { colors, font, radius, themeInk } from '../design-system'
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
    <Box role="status" sx={{
      position: 'fixed',
      bottom: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 84px)', md: 24 },
      left: { xs: '50%', md: 'auto' },
      right: { xs: 'auto', md: 24 },
      transform: { xs: 'translateX(-50%) rotate(-0.6deg)', md: 'rotate(-0.6deg)' },
      width: { xs: 'calc(100% - 32px)', md: 380 },
      maxWidth: 440,
      zIndex: 1200,
      background: theme.surfaceBg,
      border: `1.5px solid ${theme.surfaceBorder}`,
      borderLeft: `4px solid ${themeInk.ink}`,
      borderRadius: radius.md,
      pl: 2, pr: 1, py: 1.2,
      boxShadow: '3px 4px 0 rgba(0,0,0,0.16), 0 18px 30px -18px rgba(0,0,0,0.45)',
    }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <NotificationsNoneIcon sx={{ fontSize: 22, color: colors.primary.text, flexShrink: 0 }} />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 600, fontSize: '1rem', color: colors.text.primary, lineHeight: 1.2 }}>
            Ativar notificações
          </Typography>
          <Typography variant="sm" sx={{ color: colors.text.secondary, lineHeight: 1.4, mt: 0.2 }}>
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
            aria-label="Fechar aviso"
            onClick={dismiss}
            sx={{ color: colors.text.muted, width: 40, height: 40 }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  )
}

