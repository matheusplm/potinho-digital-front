import { Box, Typography } from '@mui/material'
import { colors, radius, themeInk } from '../../design-system'
import { useBackground } from '../../context/BackgroundContext'
import type { ReactNode } from 'react'

interface SegmentedOption<T extends string> {
  id: T
  label: string
  icon?: ReactNode
  activeColor?: string
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  const { theme } = useBackground()
  return (
    <Box sx={{
      display: 'flex', flexWrap: 'wrap', overflow: 'hidden',
      borderRadius: radius.md, border: `1.5px solid ${theme.surfaceBorder}`, background: theme.surfaceBg,
    }}>
      {options.map((opt) => {
        const active = value === opt.id
        const color = active ? themeInk.onButton : theme.textOnBgMuted
        return (
          <Box
            key={opt.id}
            data-tour={`tab-${opt.id}`}
            onClick={() => onChange(opt.id)}
            sx={{
              flex: '1 1 28%', py: 1, px: 1.2, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.7,
              bgcolor: active ? opt.activeColor ?? themeInk.button : 'transparent',
              boxShadow: `inset 0 0 0 0.75px ${theme.surfaceBorder}`,
              transition: 'background 0.15s',
              '&:hover': active ? {} : { bgcolor: colors.fill.subtle },
              '& svg': { color, fontSize: 16, transition: 'color 0.15s' },
            }}
          >
            {opt.icon}
            <Typography variant="md" sx={{ fontWeight: 600, color, transition: 'color 0.15s', whiteSpace: 'nowrap' }}>
              {opt.label}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}
