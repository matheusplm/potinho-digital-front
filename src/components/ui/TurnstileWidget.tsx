import RefreshIcon from '@mui/icons-material/Refresh'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { Box, Stack, Typography } from '@mui/material'
import { Turnstile } from '@marsidev/react-turnstile'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { radius } from '../../design-system'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
const LOAD_TIMEOUT_MS = 9000

type Status = 'pending' | 'verified' | 'error'

interface Props {
  status: Status
  onSuccess: (token: string) => void
  onError: () => void
  onExpire: () => void
}

export const TurnstileWidget = forwardRef<TurnstileInstance, Props>(
  ({ status, onSuccess, onError, onExpire }, ref) => {
    const innerRef = useRef<TurnstileInstance>(null)
    const [timedOut, setTimedOut] = useState(false)

    useImperativeHandle(ref, () => innerRef.current as TurnstileInstance)

    useEffect(() => {
      if (!SITE_KEY) onSuccess('bypass')
    }, [])

    useEffect(() => {
      if (!SITE_KEY || status !== 'pending') return
      const t = setTimeout(() => setTimedOut(true), LOAD_TIMEOUT_MS)
      return () => clearTimeout(t)
    }, [status])

    useEffect(() => {
      if (status !== 'pending') setTimedOut(false)
    }, [status])

    if (!SITE_KEY) return null

    const failed = timedOut || status === 'error'

    const handleRetry = () => {
      setTimedOut(false)
      onError()
      if (innerRef.current) {
        innerRef.current.reset()
      } else {
        window.location.reload()
      }
    }

    return (
      <Box>
        <Box sx={{
          borderRadius: radius.xl,
          overflow: 'hidden',
          border: `1.5px solid ${
            status === 'verified' ? 'rgba(22,163,74,0.3)' :
            failed               ? 'rgba(225,29,72,0.2)'  :
                                   'rgba(0,0,0,0.08)'
          }`,
          transition: 'border-color 0.35s ease',
          '& iframe': { display: 'block' },
          display: failed ? 'none' : undefined,
        }}>
          <Turnstile
            ref={innerRef}
            siteKey={SITE_KEY}
            onSuccess={onSuccess}
            onError={onError}
            onExpire={onExpire}
            options={{ size: 'flexible', theme: 'light', language: 'pt-BR' }}
            style={{ width: '100%' }}
          />
        </Box>

        {failed && (
          <Box
            sx={{
              borderRadius: radius.xl,
              border: '1.5px solid rgba(225,29,72,0.18)',
              background: 'rgba(225,29,72,0.04)',
              px: 2,
              py: 1.5,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <WarningAmberIcon sx={{ fontSize: 18, color: '#d97706', flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.78rem', color: 'rgba(30,58,95,0.65)', lineHeight: 1.4 }}>
                  {timedOut ? 'Captcha não carregou.' : 'Erro no captcha.'}{' '}
                  <Box
                    component="span"
                    onClick={() => window.location.reload()}
                    sx={{ color: '#1d4ed8', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Recarregar página
                  </Box>
                </Typography>
              </Stack>
              <Box
                component="button"
                type="button"
                onClick={handleRetry}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.4,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 700,
                  flexShrink: 0, p: 0.5, borderRadius: radius.md,
                  '&:hover': { background: 'rgba(29,78,216,0.08)' },
                }}
              >
                <RefreshIcon sx={{ fontSize: 14 }} />
                Tentar novamente
              </Box>
            </Stack>
          </Box>
        )}
      </Box>
    )
  }
)

TurnstileWidget.displayName = 'TurnstileWidget'
