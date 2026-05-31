import { Stack, Typography } from '@mui/material'
import { colors } from '../../design-system'

interface PageTitleProps {
  title: string
  subtitle?: string
}

export function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="h5" sx={{ color: colors.text.primary, lineHeight: 1.1, letterSpacing: '-0.3px' }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ color: colors.text.secondary }}>
          {subtitle}
        </Typography>
      )}
    </Stack>
  )
}
