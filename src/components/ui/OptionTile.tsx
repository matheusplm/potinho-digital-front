import { Box, Typography, type SxProps, type Theme } from '@mui/material'
import type { ReactNode } from 'react'
import { colors, radius } from '../../design-system'
import { mergeSx } from './sx'

type Layout = 'stack' | 'row'
type LayoutProp = Layout | { xs: Layout; sm: Layout }

interface OptionTileProps {
  active: boolean
  onClick: () => void
  label?: string
  icon?: ReactNode
  title?: ReactNode
  hint?: ReactNode
  trailing?: ReactNode
  layout?: LayoutProp
  variant?: 'soft' | 'solid'
  size?: 'sm' | 'md'
  sx?: SxProps<Theme>
}

const softTint = `color-mix(in srgb, ${colors.primary.text} 12%, transparent)`

const LAYOUT = {
  stack: { flexDirection: 'column', textAlign: 'center', gap: 0.4, grow: 'none' },
  row: { flexDirection: 'row', textAlign: 'left', gap: 0.9, grow: 1 },
} as const

const VARIANT = {
  soft: { bg: softTint, border: colors.primary.text, title: colors.primary.text, hint: colors.text.muted, hover: colors.primary.text },
  solid: { bg: colors.primary.main, border: colors.primary.main, title: '#fff', hint: 'rgba(255,255,255,0.8)', hover: colors.primary.light },
}

function byLayout<K extends keyof typeof LAYOUT.stack>(layout: LayoutProp, key: K) {
  return typeof layout === 'string' ? LAYOUT[layout][key] : { xs: LAYOUT[layout.xs][key], sm: LAYOUT[layout.sm][key] }
}

export function OptionTile({ active, onClick, label, icon, title, hint, trailing, layout = 'stack', variant = 'soft', size = 'sm', sx }: OptionTileProps) {
  const look = VARIANT[variant]
  return (
    <Box
      role="button"
      tabIndex={0}
      aria-pressed={active}
      aria-label={label ?? (typeof title === 'string' ? title : undefined)}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      sx={mergeSx({
        display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1,
        flexDirection: byLayout(layout, 'flexDirection'), textAlign: byLayout(layout, 'textAlign'), gap: byLayout(layout, 'gap'),
        borderRadius: radius.lg, cursor: 'pointer', userSelect: 'none', outline: 'none',
        background: active ? look.bg : colors.fill.subtle,
        border: `1.5px solid ${active ? look.border : colors.border.subtle}`,
        transition: 'transform 0.15s ease, border-color 0.15s ease, background 0.15s ease',
        '&:hover': { transform: 'translateY(-1px)', borderColor: look.hover },
        '&:focus-visible': { boxShadow: `0 0 0 3px ${softTint}`, borderColor: look.hover },
      }, sx)}
    >
      {icon && <Box sx={{ display: 'flex', flexShrink: 0, fontSize: '1.15rem', lineHeight: 1.1 }}>{icon}</Box>}
      {(title || hint) && (
        <Box sx={{ flex: byLayout(layout, 'grow'), minWidth: 0 }}>
          {title && (
            <Typography variant={size === 'md' ? 'md' : 'xs'} sx={{ fontWeight: 800, lineHeight: 1.25, overflowWrap: 'anywhere', color: active ? look.title : colors.text.secondary }}>
              {title}
            </Typography>
          )}
          {hint && <Typography variant="xxs" sx={{ lineHeight: 1.25, mt: size === 'md' ? 0.2 : 0, color: active ? look.hint : colors.text.muted }}>{hint}</Typography>}
        </Box>
      )}
      {trailing}
    </Box>
  )
}
