import { Typography, type SxProps } from '@mui/material'
import { colors } from '../../design-system'

interface SectionLabelProps {
  children: React.ReactNode
  color?: string
  sx?: SxProps
}

export function SectionLabel({ children, color = colors.text.secondary, sx }: SectionLabelProps) {
  return (
    <Typography sx={{
      fontSize: '0.72rem',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      color,
      ...sx,
    }}>
      {children}
    </Typography>
  )
}
