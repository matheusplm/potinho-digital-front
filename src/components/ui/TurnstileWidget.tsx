import { Box, CircularProgress, Stack, Typography } from '@mui/material'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

type Status = 'pending' | 'verified' | 'error'

interface Props {
  status: Status
  onRetry: () => void
}

function CloudflareLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#F38020">
      <path d="M16.5088 16.8447c.1475-.5068.0908-.9707-.1553-1.3154-.2246-.3164-.6045-.499-1.0615-.5205l-8.6592-.1123a.1559.1559 0 0 1-.1333-.0713c-.0283-.042-.0351-.0986-.021-.1553.0278-.084.1123-.1484.2036-.1562l8.7359-.1123c1.0351-.0489 2.1601-.8868 2.5537-1.9136l.499-1.3013c.0215-.0561.0293-.1128.0147-.168-.5625-2.5463-2.835-4.4453-5.5499-4.4453-2.5039 0-4.6284 1.6177-5.3876 3.8614-.4927-.3658-1.1187-.5625-1.794-.499-1.2026.119-2.1665 1.083-2.2861 2.2856-.0283.31-.0069.6128.0635.894C1.5683 13.171 0 14.7754 0 16.752c0 .1748.0142.3515.0352.5273.0141.083.0844.1475.1689.1475h15.9814c.0909 0 .1758-.0645.2032-.1553l.12-.4268zm2.7568-5.5634c-.0771 0-.1611 0-.2383.0112-.0566 0-.1054.0415-.127.0976l-.3378 1.1744c-.1475.5068-.0918.9707.1543 1.3164.2256.3164.6055.498 1.0625.5195l1.8437.1133c.0557 0 .1055.0263.1329.0703.0283.043.0351.1074.0214.1562-.0283.084-.1132.1485-.204.1553l-1.921.1123c-1.041.0488-2.1582.8867-2.5527 1.914l-.1406.3585c-.0283.0713.0215.1416.0986.1416h6.5977c.0771 0 .1474-.0489.169-.126.1122-.4082.1757-.837.1757-1.2803 0-2.6025-2.125-4.727-4.7344-4.727"/>
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
