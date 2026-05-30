import { Stack, Typography } from '@mui/material'

interface PageTitleProps {
  title: string
  subtitle?: string
}

export function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="h5" sx={{ color: '#1f2a44', lineHeight: 1.1, letterSpacing: '-0.3px' }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          {subtitle}
        </Typography>
      )}
    </Stack>
  )
}
