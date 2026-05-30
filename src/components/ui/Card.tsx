import { Box, type BoxProps } from '@mui/material'

interface CardProps extends BoxProps {
  accent?: string
}

export function Card({ accent, sx, children, ...props }: CardProps) {
  return (
    <Box
      {...props}
      sx={{
        background: 'rgba(255,253,251,0.95)',
        border: `1px solid ${accent ? `${accent}22` : 'rgba(0,0,0,0.07)'}`,
        borderRadius: '12px',
        boxShadow: accent
          ? `0 4px 20px ${accent}12`
          : '0 4px 20px rgba(0,0,0,0.06)',
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}
