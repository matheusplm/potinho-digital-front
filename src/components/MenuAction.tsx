import { Box, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { colors, radius } from '../design-system'
import { withAlpha } from '../utils/colorUtils'

const SIZES = {
  sm: { box: 28, icon: 15, py: 0.7, label: 'md' as const },
  md: { box: 30, icon: 16, py: 0.9, label: 'lg' as const },
}

export function MenuAction({ icon, label, tone, labelColor, onClick, badge, disabled = false, title, size = 'sm' }: {
  icon: ReactNode
  label: string
  tone: string
  labelColor: string
  onClick: () => void
  badge?: { label: string; active: boolean }
  disabled?: boolean
  title?: string
  size?: keyof typeof SIZES
}) {
  const dims = SIZES[size]
  return (
    <Stack
      direction="row"
      spacing={1.2}
      alignItems="center"
      title={title}
      onClick={disabled ? undefined : onClick}
      sx={{
        px: 1.3, py: dims.py, borderRadius: radius.lg,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.55 : 1,
        transition: 'background 0.12s',
        '&:hover': disabled ? undefined : { bgcolor: withAlpha(tone, 8) },
      }}
    >
      <Box sx={{
        width: dims.box, height: dims.box, borderRadius: radius.sm, flexShrink: 0,
        background: withAlpha(tone, 12), display: 'flex', alignItems: 'center', justifyContent: 'center',
        '& svg': { fontSize: dims.icon, color: tone },
      }}>
        {icon}
      </Box>
      <Typography variant={dims.label} noWrap sx={{ flex: 1, minWidth: 0, fontWeight: 600, color: labelColor }}>
        {label}
      </Typography>
      {badge && (
        <Box sx={{ px: 0.8, py: 0.15, borderRadius: radius.full, flexShrink: 0, background: badge.active ? withAlpha(tone, 14) : colors.fill.medium }}>
          <Typography variant="xs" sx={{ fontWeight: 700, color: badge.active ? tone : labelColor, opacity: badge.active ? 1 : 0.7 }}>
            {badge.label}
          </Typography>
        </Box>
      )}
    </Stack>
  )
}
