import { Box, Typography } from '@mui/material'
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
  return (
    <Box sx={{ display: 'flex', p: 0.5, borderRadius: 1.5, bgcolor: 'rgba(0,0,0,0.06)' }}>
      {options.map((opt) => {
        const active = value === opt.id
        const color = opt.activeColor ?? '#1d4ed8'
        return (
          <Box
            key={opt.id}
            onClick={() => onChange(opt.id)}
            sx={{
              flex: 1, py: 1, px: 1.2, borderRadius: 1, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.7,
              bgcolor: active ? '#fff' : 'transparent',
              boxShadow: active ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
              '& svg': { color: active ? color : '#94a3b8', fontSize: 16, transition: 'color 0.2s' },
            }}
          >
            {opt.icon}
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: active ? color : '#64748b', transition: 'color 0.2s', whiteSpace: 'nowrap' }}>
              {opt.label}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}
