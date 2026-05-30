import FavoriteIcon from '@mui/icons-material/Favorite'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Box, Stack, Typography } from '@mui/material'
import { toast as sonnerToast } from 'sonner'

interface ToastOptions {
  description?: string
  duration?: number
}

function ToastContent({ icon, title, description, accent }: {
  icon: React.ReactNode
  title: string
  description?: string
  accent: string
}) {
  return (
    <Stack direction="row" spacing={1.2} alignItems="flex-start" sx={{ width: '100%' }}>
      <Box sx={{ mt: 0.1, flexShrink: 0, color: accent }}>{icon}</Box>
      <Stack spacing={0.2}>
        <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e3a5f', lineHeight: 1.3 }}>
          {title}
        </Typography>
        {description && (
          <Typography sx={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
            {description}
          </Typography>
        )}
      </Stack>
    </Stack>
  )
}

const BASE_STYLE = {
  background: 'rgba(255,253,251,0.97)',
  backdropFilter: 'blur(16px)',
  border: '1.5px solid rgba(255,255,255,0.8)',
  borderRadius: '14px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  padding: '12px 14px',
  minWidth: '280px',
  maxWidth: '340px',
}

export const toast = {
  success: (title: string, opts?: ToastOptions) =>
    sonnerToast.custom(() => (
      <Box sx={{ ...BASE_STYLE, borderLeft: '3px solid #15803d' }}>
        <ToastContent
          icon={<CheckCircleOutlineIcon sx={{ fontSize: 20 }} />}
          title={title}
          description={opts?.description}
          accent="#15803d"
        />
      </Box>
    ), { duration: opts?.duration ?? 3000 }),

  error: (title: string, opts?: ToastOptions) =>
    sonnerToast.custom(() => (
      <Box sx={{ ...BASE_STYLE, borderLeft: '3px solid #e11d48' }}>
        <ToastContent
          icon={<ErrorOutlineIcon sx={{ fontSize: 20 }} />}
          title={title}
          description={opts?.description}
          accent="#e11d48"
        />
      </Box>
    ), { duration: opts?.duration ?? 4000 }),

  info: (title: string, opts?: ToastOptions) =>
    sonnerToast.custom(() => (
      <Box sx={{ ...BASE_STYLE, borderLeft: '3px solid #1d4ed8' }}>
        <ToastContent
          icon={<InfoOutlinedIcon sx={{ fontSize: 20 }} />}
          title={title}
          description={opts?.description}
          accent="#1d4ed8"
        />
      </Box>
    ), { duration: opts?.duration ?? 3000 }),

  love: (title: string, opts?: ToastOptions) =>
    sonnerToast.custom(() => (
      <Box sx={{ ...BASE_STYLE, borderLeft: '3px solid #e11d48', background: 'rgba(255,240,245,0.97)' }}>
        <ToastContent
          icon={<FavoriteIcon sx={{ fontSize: 18 }} />}
          title={title}
          description={opts?.description}
          accent="#e11d48"
        />
      </Box>
    ), { duration: opts?.duration ?? 3500 }),
}
