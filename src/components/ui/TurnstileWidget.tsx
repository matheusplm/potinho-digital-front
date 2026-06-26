import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import { radius } from '../../design-system'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

type Status = 'pending' | 'verified' | 'error'

interface Props {
  status: Status
  onRetry: () => void
}

const CloudflareIcon = () => (
  <svg width="32" height="32" viewBox="0 0 109 83" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M79.4 48.7c.7-2.4.4-4.6-.7-6.2-1.1-1.5-2.8-2.4-4.9-2.6l-42.5-.6c-.3 0-.5-.1-.6-.3-.1-.2-.1-.5.1-.7l8.9-15.4c.8-1.4 2.3-2.2 3.9-2.2h7.7c1 0 1.9.7 2.1 1.6l2.1 8.4c.2.9 1.1 1.6 2.1 1.6h13.3c1.3 0 2.3-1.1 2.3-2.4V8c0-1.3-1-2.4-2.3-2.4H56.7c-1 0-1.9.7-2.1 1.6l-2.1 8.4c-.2.9-1.1 1.6-2.1 1.6h-7c-1.7 0-3.3.9-4.2 2.4L26 37.4c-.4.7-.6 1.5-.6 2.3 0 .4 0 .7.1 1.1-5.8 1.1-10.2 5.3-11.4 11a15.4 15.4 0 0 0 .4 7.6 14 14 0 0 0-2.5 8.1C12 73.7 17 79.2 23.5 79.2h51c6 0 11-4.5 11.6-10.3.6-5.7-2.8-10.9-8-12.6l1.3-7.6z" fill="#F48120"/>
    <path d="M87.3 55.8c-.2.6-.4 1.2-.7 1.8 2.4 1.7 3.9 4.4 3.7 7.4-.3 4.2-3.9 7.5-8.2 7.5H31.5c-4.6 0-8.2-3.5-8.2-7.8 0-2 .8-3.8 2-5.2a10.3 10.3 0 0 1-.3-5.3c.8-4 4.1-7 8.2-7.5l-.1-.8c0-1.3.5-2.5 1.3-3.5l.5-.5 42.1.6c3.5.2 6.4 2.6 7.3 5.9l3 7.4z" fill="#FBAD41"/>
  </svg>
)

export function TurnstileWidget({ status, onRetry }: Props) {
  if (!SITE_KEY) return null

  return (
    <Box sx={{
      border: `1px solid ${status === 'error' ? 'rgba(225,29,72,0.25)' : 'rgba(0,0,0,0.1)'}`,
      borderRadius: radius.xl,
      background: '#fafafa',
      px: 1.5,
      py: 1,
      userSelect: 'none',
    }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {status === 'pending' && (
            <Box sx={{ width: 28, height: 28, border: '1.5px solid rgba(0,0,0,0.15)', borderRadius: radius.md, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress size={14} sx={{ color: 'rgba(0,0,0,0.25)' }} />
            </Box>
          )}
          {status === 'verified' && (
            <Box sx={{ width: 28, height: 28, borderRadius: radius.md, background: '#00b341', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l3.5 3.5L12 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Box>
          )}
          {status === 'error' && (
            <Box
              component="button"
              type="button"
              onClick={onRetry}
              sx={{
                width: 28, height: 28, borderRadius: radius.md,
                background: 'rgba(225,29,72,0.1)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                '&:hover': { background: 'rgba(225,29,72,0.18)' },
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v4M7 9v4M1 7h4M9 7h4" stroke="#e11d48" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </Box>
          )}
        </Box>

        <Box sx={{ flex: 1 }} />

        <Stack alignItems="flex-end" spacing={0} sx={{ flexShrink: 0 }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <CloudflareIcon />
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#1d1d1d', lineHeight: 1 }}>
              Cloudflare
            </Typography>
          </Stack>
          {status === 'error' ? (
            <Typography
              sx={{ fontSize: '0.62rem', color: '#e11d48', fontWeight: 600, lineHeight: 1.4, cursor: 'pointer' }}
              onClick={onRetry}
            >
              Tentar novamente
            </Typography>
          ) : (
            <Typography sx={{ fontSize: '0.62rem', color: 'rgba(0,0,0,0.35)', lineHeight: 1.4 }}>
              Privacidade · Termos
            </Typography>
          )}
        </Stack>
      </Stack>
    </Box>
  )
}
