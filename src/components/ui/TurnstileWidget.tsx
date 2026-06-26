import { Box } from '@mui/material'
import { Turnstile } from '@marsidev/react-turnstile'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { forwardRef, useEffect } from 'react'
import { radius } from '../../design-system'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

type Status = 'pending' | 'verified' | 'error'

interface Props {
  status: Status
  onSuccess: (token: string) => void
  onError: () => void
  onExpire: () => void
}

export const TurnstileWidget = forwardRef<TurnstileInstance, Props>(
  ({ status, onSuccess, onError, onExpire }, ref) => {
    useEffect(() => {
      if (!SITE_KEY) onSuccess('bypass')
    }, [])

    if (!SITE_KEY) return null

    return (
      <Box sx={{
        borderRadius: radius.xl,
        overflow: 'hidden',
        border: `1.5px solid ${
          status === 'verified' ? 'rgba(22,163,74,0.3)' :
          status === 'error'    ? 'rgba(225,29,72,0.25)' :
                                  'rgba(0,0,0,0.08)'
        }`,
        transition: 'border-color 0.35s ease',
        '& iframe': { display: 'block' },
      }}>
        <Turnstile
          ref={ref}
          siteKey={SITE_KEY}
          onSuccess={onSuccess}
          onError={onError}
          onExpire={onExpire}
          options={{ size: 'flexible', theme: 'light', language: 'pt-BR' }}
          style={{ width: '100%' }}
        />
      </Box>
    )
  }
)

TurnstileWidget.displayName = 'TurnstileWidget'
