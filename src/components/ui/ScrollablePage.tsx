import { Box, type BoxProps } from '@mui/material'
import type { ReactNode } from 'react'

interface ScrollablePageProps extends BoxProps {
  children: ReactNode
  narrow?: boolean
}

export function ScrollablePage({ children, sx, narrow = false, ...props }: ScrollablePageProps) {
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
      {narrow ? <Box sx={{ width: '100%', maxWidth: 760, mx: 'auto', display: 'flex', flexDirection: 'column', flex: 1 }}>{children}</Box> : children}
    </Box>
  )
}
