import { Stack, Typography, type SxProps, type Theme } from '@mui/material'
import type { ReactNode } from 'react'
import { mergeSx } from './sx'

interface SectionLabelProps {
  children: ReactNode
  hint?: ReactNode
  color?: string
  sx?: SxProps<Theme>
}

export function SectionLabel({ children, hint, color, sx }: SectionLabelProps) {
  if (!hint) return <Typography variant="label" sx={mergeSx({ color }, sx)}>{children}</Typography>
  return (
    <Stack direction="row" alignItems="baseline" sx={mergeSx({ flexWrap: 'wrap', columnGap: 1 }, sx)}>
      <Typography variant="label" sx={{ color, whiteSpace: 'nowrap' }}>{children}</Typography>
      <Typography variant="hint">{hint}</Typography>
    </Stack>
  )
}
