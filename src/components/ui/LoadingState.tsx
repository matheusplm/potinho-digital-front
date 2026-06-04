import FavoriteIcon from '@mui/icons-material/Favorite'
import { Box, CircularProgress, Stack, Typography, type BoxProps } from '@mui/material'
import { colors, font, radius } from '../../design-system'

interface LoadingStateProps extends BoxProps {
  label?: string
  compact?: boolean
  accent?: string
  textColor?: string
  mutedColor?: string
}

export function LoadingState({
  label = 'Carregando...',
  compact = false,
  accent = colors.primary.main,
  textColor = colors.text.primary,
  mutedColor = colors.text.secondary,
  sx,
  ...props
}: LoadingStateProps) {
  return (
    <Box
      {...props}
      sx={{
        minHeight: compact ? 96 : 240,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: compact ? 2 : 6,
        ...sx,
      }}
    >
      <Stack spacing={1.2} alignItems="center">
        <Box sx={{
          width: compact ? 48 : 62,
          height: compact ? 48 : 62,
          borderRadius: radius.full,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: 'rgba(255,255,255,0.48)',
          border: '1px solid rgba(255,255,255,0.62)',
          boxShadow: `0 10px 30px ${accent}22`,
          backdropFilter: 'blur(14px)',
        }}>
          <CircularProgress size={compact ? 34 : 44} thickness={4} sx={{ color: accent, position: 'absolute' }} />
          <FavoriteIcon sx={{ fontSize: compact ? 15 : 18, color: accent, opacity: 0.82 }} />
        </Box>
        <Stack spacing={0.2} alignItems="center">
          <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: compact ? '0.9rem' : '1rem', color: textColor }}>
            {label}
          </Typography>
          {!compact && (
            <Typography sx={{ fontSize: '0.76rem', color: mutedColor }}>
              Só um instantinho
            </Typography>
          )}
        </Stack>
      </Stack>
    </Box>
  )
}
