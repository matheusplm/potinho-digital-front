import { Box, CircularProgress, Stack, Typography } from '@mui/material'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

type Status = 'pending' | 'verified' | 'error'

interface Props {
  status: Status
  onRetry: () => void
}

function CloudflareLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 230 230" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M153.6 144.2l5.9-20.3c.7-2.4.4-4.8-.8-6.6-1.2-1.7-3.2-2.7-5.5-2.8l-91.6-.6c-.6 0-1-.3-1.2-.7-.2-.4-.1-.9.2-1.3l19.2-33.1c1.8-3.1 5.1-5 8.7-5h16.6c2.1 0 4 1.5 4.5 3.5l4.5 18.1c.5 1.9 2.4 3.3 4.5 3.3h28.7c2.8 0 5-2.3 5-5.2V17.6c0-2.9-2.2-5.2-5-5.2h-29.1c-2.1 0-4 1.5-4.5 3.5l-4.5 18.1c-.5 1.9-2.4 3.3-4.5 3.3H89.9c-3.7 0-7.1 2-9 5.1L56.2 91c-.9 1.6-1.4 3.3-1.4 5.1 0 .8.1 1.5.2 2.3-12.5 2.4-22 11.4-24.6 23.6a33 33 0 00.8 16.4A30 30 0 0025 155.8c0 16.6 13.5 30 30.2 30H163c12.9 0 23.7-9.7 25-22.2 1.3-12.3-6-23.4-17.3-27.2l2.9-12.2z" fill="#F6821F"/>
      <path d="M175.3 119.7c-.4 1.3-.9 2.6-1.5 3.8 5.1 3.7 8.4 9.5 8 16-1 9-8.5 16.1-17.8 16.1H55.3c-9.9 0-17.8-7.6-17.8-16.9 0-4.3 1.7-8.3 4.4-11.2a22 22 0 01-.7-11.4c1.8-8.6 8.8-15.1 17.7-16.1v-1.8c0-2.7 1-5.3 2.9-7.4l1-.9 90.8 1.2c7.5.4 13.8 5.6 15.7 12.6z" fill="#FBAD41"/>
    </svg>
  )
}

function CheckMark() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M1.5 6.5L5 10L11.5 3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function TurnstileWidget({ status, onRetry }: Props) {
  if (!SITE_KEY) return null

  return (
    <Box sx={{
      border: '1px solid',
      borderColor: status === 'error' ? 'rgba(217,119,6,0.4)' : 'rgba(0,0,0,0.13)',
      borderRadius: '4px',
      background: '#f9f9f9',
      height: 64,
      display: 'flex',
      alignItems: 'stretch',
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      userSelect: 'none',
    }}>
      {/* Status area */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1, px: 2 }}>
        <Box sx={{ width: 26, height: 26, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {status === 'pending' && (
            <Box sx={{
              width: 24, height: 24, borderRadius: '3px',
              border: '1.5px solid #c0c0c0', background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CircularProgress size={13} sx={{ color: '#c0c0c0' }} />
            </Box>
          )}
          {status === 'verified' && (
            <Box sx={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'linear-gradient(135deg, #00b341 0%, #00952f 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 4px rgba(0,180,65,0.35)',
            }}>
              <CheckMark />
            </Box>
          )}
          {status === 'error' && (
            <Box
              component="button"
              type="button"
              onClick={onRetry}
              sx={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 4px rgba(217,119,6,0.35)',
                '&:hover': { filter: 'brightness(1.1)' },
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2v4M6 9v.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </Box>
          )}
        </Box>

        <Box>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1a1a1a', lineHeight: 1.2 }}>
            {status === 'error' ? (
              <Box
                component="span"
                onClick={onRetry}
                sx={{ cursor: 'pointer', color: '#d97706', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
              >
                Tentar novamente
              </Box>
            ) : 'Não sou robô'}
          </Typography>
          {status === 'pending' && (
            <Typography sx={{ fontSize: '0.65rem', color: '#999', lineHeight: 1.3, mt: 0.2 }}>
              verificando...
            </Typography>
          )}
          {status === 'error' && (
            <Typography sx={{ fontSize: '0.65rem', color: '#d97706', lineHeight: 1.3, mt: 0.2 }}>
              falha na verificação
            </Typography>
          )}
        </Box>
      </Stack>

      {/* Divider */}
      <Box sx={{ width: '1px', background: 'rgba(0,0,0,0.1)', flexShrink: 0, my: 1 }} />

      {/* Cloudflare branding */}
      <Stack alignItems="center" justifyContent="center" sx={{ px: 1.5, minWidth: 82, gap: 0 }}>
        <CloudflareLogo />
        <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#555', letterSpacing: 0.3, lineHeight: 1.4, mt: 0.3 }}>
          Cloudflare
        </Typography>
        <Stack direction="row" spacing={0.4}>
          <Typography sx={{ fontSize: '0.52rem', color: '#aaa', lineHeight: 1 }}>Privacidade</Typography>
          <Typography sx={{ fontSize: '0.52rem', color: '#ccc', lineHeight: 1 }}>·</Typography>
          <Typography sx={{ fontSize: '0.52rem', color: '#aaa', lineHeight: 1 }}>Termos</Typography>
        </Stack>
      </Stack>
    </Box>
  )
}
