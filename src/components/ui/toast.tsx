import FavoriteIcon from '@mui/icons-material/Favorite'
import CheckCircleOutlineIcon from '@mui/icons-material/TaskAlt'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Box, Stack, Typography } from '@mui/material'
import { toast as sonnerToast } from 'sonner'
import { colors, ink, radius, shadow } from '../../design-system'

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
      borderRadius: radius.lg,
      boxShadow: shadow.lg,
      px: 2, py: 1.4,
      minWidth: '260px',
      maxWidth: '320px',
    }}>
      <Stack direction="row" spacing={1.2} alignItems="center">
        <Box sx={{ flexShrink: 0, color: accent, display: 'flex' }}>{icon}</Box>
        <Stack spacing={0.15}>
          <Typography sx={{ fontSize: '0.87rem', fontWeight: 700, color: ink.primary, lineHeight: 1.3 }}>
            {title}
          </Typography>
          {description && (
            <Typography sx={{ fontSize: '0.76rem', color: ink.secondary, lineHeight: 1.35 }}>
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
      <ToastContent icon={<CheckCircleOutlineIcon sx={{ fontSize: 20 }} />} title={title}
        description={opts?.description} accent={colors.success.main}
        bg={colors.success.bg} border={colors.success.border} />
    ), { duration: opts?.duration ?? 3000 }),

  error: (title: string, opts?: ToastOptions) =>
    sonnerToast.custom(() => (
      <ToastContent icon={<ErrorOutlineIcon sx={{ fontSize: 20 }} />} title={title}
        description={opts?.description} accent={colors.error.main}
        bg={colors.error.bg} border={colors.error.border} />
    ), { duration: opts?.duration ?? 4000 }),

  info: (title: string, opts?: ToastOptions) =>
    sonnerToast.custom(() => (
      <ToastContent icon={<InfoOutlinedIcon sx={{ fontSize: 20 }} />} title={title}
        description={opts?.description} accent={colors.info.main}
        bg={colors.info.bg} border={colors.info.border} />
    ), { duration: opts?.duration ?? 3000 }),

  love: (title: string, opts?: ToastOptions) =>
    sonnerToast.custom(() => (
      <ToastContent icon={<FavoriteIcon sx={{ fontSize: 16 }} />} title={title}
        description={opts?.description} accent={colors.love.main}
        bg={colors.love.bg} border={colors.love.border} />
    ), { duration: opts?.duration ?? 3500 }),
}
