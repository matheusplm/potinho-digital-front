import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Box, Collapse, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { colors, radius } from '../../design-system'

interface AdvancedOptionsProps {
  children: React.ReactNode
  label?: string
  defaultOpen?: boolean
  spacing?: number
}

export function AdvancedOptions({ children, label = '⚙️ Opções avançadas', defaultOpen = false, spacing = 2.2 }: AdvancedOptionsProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" onClick={() => setOpen((v) => !v)} sx={{
        cursor: 'pointer', py: 0.7, px: 1.1, borderRadius: radius.md,
        background: 'rgba(0,0,0,0.03)', border: `1px solid ${colors.border.subtle}`,
        transition: 'background 0.14s', '&:hover': { background: 'rgba(0,0,0,0.05)' },
      }}>
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: colors.text.secondary }}>
          {label}
        </Typography>
        <ExpandMoreIcon sx={{ fontSize: 18, color: colors.text.muted, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </Stack>
      <Collapse in={open}>
        <Stack spacing={spacing} sx={{ pt: 2 }}>
          {children}
        </Stack>
      </Collapse>
    </Box>
  )
}
