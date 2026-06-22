import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { Box, CircularProgress, Typography } from '@mui/material'
import { Turnstile } from '@marsidev/react-turnstile'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { forwardRef } from 'react'
import { colors, radius } from '../../design-system'

type Status = 'pending' | 'verified' | 'error'

interface Props {
  status: Status
  onSuccess: (token: string) => void
  onError: () => void
  onExpire: () => void
}

export const TurnstileWidget = forwardRef<TurnstileInstance, Props>(
  ({ status, onSuccess, onError, onExpire }, ref) => {
    return (
      <>
        <Turnstile
          ref={ref}
          siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY as string}
          onSuccess={onSuccess}
          onError={onError}
          onExpire={onExpire}
          options={{ size: 'invisible' }}
        />

        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.2,
          py: 1.1, px: 1.6, borderRadius: radius.xl,
          border: `1.5px solid ${
            status === 'verified' ? 'rgba(22,163,74,0.28)' :
            status === 'error'    ? 'rgba(225,29,72,0.22)' :
                                    'rgba(0,0,0,0.08)'
          }`,
          background:
            status === 'verified' ? 'rgba(240,253,244,0.85)' :
            status === 'error'    ? 'rgba(255,241,242,0.85)' :
                                    'rgba(0,0,0,0.025)',
          transition: 'background 0.35s ease, border-color 0.35s ease',
        }}>
          {status === 'verified' && (
            <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#16a34a', flexShrink: 0 }} />
          )}
          {status === 'error' && (
            <ErrorOutlineIcon sx={{ fontSize: 18, color: '#e11d48', flexShrink: 0 }} />
          )}
          {status === 'pending' && (
            <CircularProgress size={16} thickness={5} sx={{ color: colors.text.muted, flexShrink: 0 }} />
          )}

          <Typography sx={{
            fontSize: '0.82rem', flex: 1,
            fontWeight: status === 'verified' ? 600 : 400,
            color:
              status === 'verified' ? '#16a34a' :
              status === 'error'    ? '#e11d48' :
                                      colors.text.secondary,
            transition: 'color 0.25s ease',
          }}>
            {status === 'verified' ? 'Verificado' :
             status === 'error'    ? 'Verificação falhou — recarregue a página' :
                                     'Verificando segurança...'}
          </Typography>

          <Typography sx={{ fontSize: '0.6rem', color: colors.text.muted, opacity: 0.45, flexShrink: 0, letterSpacing: 0.2 }}>
            Cloudflare
          </Typography>
        </Box>
      </>
    )
  }
)

TurnstileWidget.displayName = 'TurnstileWidget'
