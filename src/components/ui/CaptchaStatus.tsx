import RefreshIcon from '@mui/icons-material/Refresh'
import { Box, Typography } from '@mui/material'

interface Props {
  status: 'pending' | 'verified' | 'error'
  onRetry: () => void
}

export function CaptchaStatus({ status, onRetry }: Props) {
  if (status === 'verified') return null

  if (status === 'error') {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{ fontSize: '0.78rem', color: '#e11d48' }}>
          Verificação falhou.{' '}
          <Box
            component="span"
            onClick={onRetry}
            sx={{ fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 0.3 }}
          >
            <RefreshIcon sx={{ fontSize: 13 }} /> Tentar novamente
          </Box>
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography sx={{ fontSize: '0.75rem', color: 'rgba(30,58,95,0.4)', letterSpacing: 0.2 }}>
        verificando segurança...
      </Typography>
    </Box>
  )
}
