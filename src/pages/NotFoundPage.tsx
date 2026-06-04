import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { Box, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <Box
      sx={{
        height: '100dvh',
        background: 'linear-gradient(145deg, #f4f8ff 0%, #eef4ff 45%, #f7efff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack spacing={2.5} alignItems="center" sx={{ px: 3, textAlign: 'center' }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'rgba(244, 63, 94, 0.07)',
            border: '2px dashed rgba(244, 63, 94, 0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FavoriteBorderIcon sx={{ fontSize: 34, color: '#f43f5e', opacity: 0.45 }} />
        </Box>

        <Stack spacing={0.5}>
          <Typography variant="h5" sx={{ color: '#1f2a44' }}>
            Ops, essa tela não existe
          </Typography>
          <Typography variant="body2" sx={{ color: '#4a5568', maxWidth: 260 }}>
            Parece que você se perdeu no caminho...
          </Typography>
        </Stack>

        <Button onClick={() => navigate('/')} sx={{ px: 3.5 }}>
          Voltar para o início
        </Button>
      </Stack>
    </Box>
  )
}
