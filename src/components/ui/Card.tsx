import { Box, type BoxProps } from '@mui/material'
import { colors, radius, shadow } from '../../design-system'

interface CardProps extends BoxProps {
  accent?: string
}

export function Card({ accent, sx, children, ...props }: CardProps) {
  return (
    <Box
      {...props}
      sx={{
        background: colors.surface.base,
        border: `1px solid ${accent ? `${accent}22` : colors.border.subtle}`,
        borderRadius: radius.lg,
        boxShadow: accent ? `0 4px 20px ${accent}12` : shadow.md,
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}
