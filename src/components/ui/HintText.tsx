import { Typography, type SxProps } from '@mui/material'
import { colors } from '../../design-system'

interface HintTextProps {
  children: React.ReactNode
  sx?: SxProps
}

export function HintText({ children, sx }: HintTextProps) {
  return (
    <Typography sx={{
      fontSize: '0.68rem',
      color: colors.text.muted,
      mt: 0.7,
      lineHeight: 1.45,
      ...sx,
    }}>
      {children}
    </Typography>
  )
}
