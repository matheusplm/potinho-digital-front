import FavoriteIcon from '@mui/icons-material/Favorite'
import CheckCircleOutlineIcon from '@mui/icons-material/TaskAlt'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Box, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { toast as sonnerToast } from 'sonner'
import { colors, font, ink, radius, shadow, shineSweep } from '../../design-system'

const achievementDrain = keyframes`
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
`

const achievementPop = keyframes`
  0% { transform: scale(0.6); opacity: 0; }
  55% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`

const achievementGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); }
  50% { box-shadow: 0 0 0 7px rgba(245,158,11,0); }
`

function AchievementToastContent({ emoji, label, description, duration }: { emoji: string; label: string; description: string; duration: number }) {
  return (
    <Box sx={{
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, rgba(255,251,235,0.98), rgba(255,247,237,0.98))',
      backdropFilter: 'blur(16px)',
      border: '1.5px solid rgba(245,158,11,0.35)',
      borderRadius: radius.lg,
      boxShadow: '0 16px 44px rgba(120,53,15,0.2), 0 0 30px rgba(245,158,11,0.22)',
      px: 2, py: 1.5,
      minWidth: '270px',
      maxWidth: '340px',
    }}>
      <Stack direction="row" spacing={1.3} alignItems="center">
        <Box sx={{
          position: 'relative',
          flexShrink: 0,
          width: 50, height: 50,
          borderRadius: radius.full,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.55rem',
          background: 'linear-gradient(135deg, #fde68a, #f59e0b)',
          border: '1.5px solid rgba(255,255,255,0.6)',
          animation: `${achievementPop} 0.5s cubic-bezier(0.16,1,0.3,1) both, ${achievementGlow} 1.8s ease-in-out 0.5s infinite`,
        }}>
          <Box sx={{
            position: 'absolute', inset: -22,
            background: 'linear-gradient(100deg, transparent 32%, rgba(255,255,255,0.75) 50%, transparent 68%)',
            animation: `${shineSweep} 2.4s ease-in-out 0.3s infinite`,
          }} />
          <Box sx={{ position: 'relative' }}>{emoji}</Box>
        </Box>
        <Stack spacing={0.15} sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.66rem', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#b45309' }}>
            🏆 Conquista desbloqueada
          </Typography>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '0.98rem', color: ink.primary, lineHeight: 1.25 }}>
            {label}
          </Typography>
          {description && (
            <Typography sx={{
              fontSize: '0.74rem', color: ink.secondary, lineHeight: 1.3,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {description}
            </Typography>
          )}
        </Stack>
      </Stack>
      <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: 'rgba(245,158,11,0.16)' }}>
        <Box sx={{
          height: '100%', width: '100%', transformOrigin: 'left',
          background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
          animation: `${achievementDrain} ${duration}ms linear forwards`,
        }} />
      </Box>
    </Box>
  )
}

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

  achievement: (emoji: string, label: string, description: string, opts?: ToastOptions) => {
    const duration = opts?.duration ?? 5200
    return sonnerToast.custom(() => (
      <AchievementToastContent emoji={emoji} label={label} description={description} duration={duration} />
    ), { duration })
  },
}
