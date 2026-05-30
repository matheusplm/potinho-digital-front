import FavoriteIcon from '@mui/icons-material/Favorite'
import CheckCircleOutlineIcon from '@mui/icons-material/TaskAlt'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Box, Stack, Typography } from '@mui/material'
import { toast as sonnerToast } from 'sonner'

interface ToastOptions {
  description?: string
  duration?: number
}

interface ToastConfig {
  icon: React.ReactNode
  title: string
  description?: string
  accent: string
  bg: string
  border: string
}

function ToastContent({ icon, title, description, accent, bg, border }: ToastConfig) {
  return (
    <Box sx={{
      background: bg,
      backdropFilter: 'blur(16px)',
      border: `1.5px solid ${border}`,
      borderRadius: '14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      px: 2, py: 1.4,
      minWidth: '260px',
      maxWidth: '320px',
    }}>
      <Stack direction="row" spacing={1.2} alignItems="center">
        <Box sx={{ flexShrink: 0, color: accent, display: 'flex' }}>{icon}</Box>
        <Stack spacing={0.15}>
          <Typography sx={{ fontSize: '0.87rem', fontWeight: 700, color: '#1e3a5f', lineHeight: 1.3 }}>
            {title}
          </Typography>
          {description && (
            <Typography sx={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.35 }}>
              {description}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Box>
  )
}

export const toast = {
  success: (title: string, opts?: ToastOptions) =>
    sonnerToast.custom(() => (
      <ToastContent
        icon={<CheckCircleOutlineIcon sx={{ fontSize: 20 }} />}
        title={title} description={opts?.description}
        accent="#15803d"
        bg="rgba(220,252,231,0.92)"
        border="rgba(21,128,61,0.2)"
      />
    ), { duration: opts?.duration ?? 3000 }),

  error: (title: string, opts?: ToastOptions) =>
    sonnerToast.custom(() => (
      <ToastContent
        icon={<ErrorOutlineIcon sx={{ fontSize: 20 }} />}
        title={title} description={opts?.description}
        accent="#e11d48"
        bg="rgba(255,228,230,0.92)"
        border="rgba(225,29,72,0.2)"
      />
    ), { duration: opts?.duration ?? 4000 }),

  info: (title: string, opts?: ToastOptions) =>
    sonnerToast.custom(() => (
      <ToastContent
        icon={<InfoOutlinedIcon sx={{ fontSize: 20 }} />}
        title={title} description={opts?.description}
        accent="#1d4ed8"
        bg="rgba(219,234,254,0.92)"
        border="rgba(29,78,216,0.2)"
      />
    ), { duration: opts?.duration ?? 3000 }),

  love: (title: string, opts?: ToastOptions) =>
    sonnerToast.custom(() => (
      <ToastContent
        icon={<FavoriteIcon sx={{ fontSize: 18 }} />}
        title={title} description={opts?.description}
        accent="#e11d48"
        bg="rgba(255,228,236,0.95)"
        border="rgba(225,29,72,0.22)"
      />
    ), { duration: opts?.duration ?? 3500 }),
}
