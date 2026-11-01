import { Stack, Typography, type SxProps } from '@mui/material'
import { colors, font } from '../../design-system'
import { Card } from './Card'
import { SillScene } from '../scene/WindowScene'

interface EmptyStateProps {
  emoji?: string
  title: string
  description?: string
  action?: React.ReactNode
  accent?: string
  sx?: SxProps
}

export function EmptyState({ emoji, title, description, action, accent, sx }: EmptyStateProps) {
  return (
    <Card accent={accent} sx={{ p: 2.5, textAlign: 'center', ...sx }}>
      <Stack spacing={0.5} alignItems="center">
        <SillScene emoji={emoji} height={90} />
        <Typography sx={{ fontFamily: font.serif, fontWeight: 600, fontSize: '1.1rem', color: colors.text.primary }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="md" sx={{ color: colors.text.secondary, maxWidth: 280 }}>
            {description}
          </Typography>
        )}
        {action && <Stack sx={{ pt: 1, width: '100%', alignItems: 'center' }}>{action}</Stack>}
      </Stack>
    </Card>
  )
}
