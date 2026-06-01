import { Stack, Typography } from '@mui/material'
import { useBackground } from '../../context/BackgroundContext'
import { font } from '../../design-system'

interface PageTitleProps {
  title: string
  subtitle?: string
}

export function PageTitle({ title, subtitle }: PageTitleProps) {
  const { theme } = useBackground()
  return (
    <Stack spacing={0.25}>
      <Typography variant="h5" sx={{ color: theme.textOnBg, lineHeight: 1.1, letterSpacing: '-0.3px', fontFamily: font.serif }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ color: theme.textOnBgMuted }}>
          {subtitle}
        </Typography>
      )}
    </Stack>
  )
}
