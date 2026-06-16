import { Box, Typography } from '@mui/material'
import { colors } from '../../design-system'
import { useBackground } from '../../context/BackgroundContext'
import type { ReactNode } from 'react'

export interface SegmentedOption<T extends string> {
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
      display: 'flex', flexWrap: 'wrap', p: 0.5, rowGap: 0.5,
      borderRadius: '10px', bgcolor: theme.isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.06)',
    }}>
      {options.map((opt) => {
        const active = value === opt.id
        const color = opt.activeColor ?? colors.primary.main
        const activeBg = theme.isDark ? theme.accent : '#fff'
        const activeTextColor = theme.isDark ? '#fff' : color
        return (
          <Box
            key={opt.id}
            onClick={() => onChange(opt.id)}
            sx={{
              flex: '1 1 28%', py: 1, px: 1.2, borderRadius: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.7,
              bgcolor: active ? activeBg : 'transparent',
              boxShadow: active ? (theme.isDark ? `0 1px 8px rgba(0,0,0,0.4)` : '0 1px 6px rgba(0,0,0,0.1)') : 'none',
              transition: 'all 0.2s',
              '& svg': { color: active ? activeTextColor : theme.textOnBgMuted, fontSize: 16, transition: 'color 0.2s' },
            }}
          >
            {opt.icon}
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: active ? activeTextColor : theme.textOnBgMuted, transition: 'color 0.2s', whiteSpace: 'nowrap' }}>
              {opt.label}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}
