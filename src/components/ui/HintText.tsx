import { Typography, type SxProps, type Theme } from '@mui/material'
import type { ReactNode } from 'react'
import { mergeSx } from './sx'

export function HintText({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) {
  return <Typography variant="hint" sx={mergeSx({ mt: 0.7 }, sx)}>{children}</Typography>
}
