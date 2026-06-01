import { Box, type BoxProps } from '@mui/material'
import type { ReactNode } from 'react'

interface ScrollablePageProps extends BoxProps {
  children: ReactNode
}

export function ScrollablePage({ children, sx, ...props }: ScrollablePageProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  )
}
