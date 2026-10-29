import { Box, type SxProps, type Theme } from '@mui/material'

export function Squiggle({ color, sx }: { color: string; sx?: SxProps<Theme> }) {
  return (
    <Box component="svg" viewBox="0 0 220 14" preserveAspectRatio="none" aria-hidden sx={{ display: 'block', width: '100%', height: 10, ...sx }}>
      <path d="M2 9 C 30 3, 52 13, 80 7 S 132 2, 160 8 S 205 11, 218 5" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    </Box>
  )
}

export function HandArrow({ color, flip = false, sx }: { color: string; flip?: boolean; sx?: SxProps<Theme> }) {
  return (
    <Box component="svg" viewBox="0 0 64 40" aria-hidden sx={{ width: 56, height: 36, transform: flip ? 'scaleX(-1)' : undefined, ...sx }}>
      <path d="M4 8 C 18 30, 36 34, 56 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M46 18 L 57 23.5 L 48 32" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Box>
  )
}
