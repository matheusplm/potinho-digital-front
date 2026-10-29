import { Chip, type SxProps, type Theme } from '@mui/material'
import type { SystemStyleObject } from '@mui/system'
import type { ReactNode } from 'react'
import { useBackground } from '../../context/BackgroundContext'
import { colors, themeInk } from '../../design-system'
import { mergeSx } from './sx'

export interface ChoiceTone {
  bg: string
  border?: string
  text?: string
  label?: SystemStyleObject<Theme>
}

const SIZES = {
  sm: { height: 24, fontSize: '0.74rem', px: 1 },
  md: { height: 26, fontSize: '0.74rem', px: 1.1 },
  lg: { height: 30, fontSize: '0.78rem', px: 1.4 },
}

const PRIMARY: ChoiceTone = { bg: themeInk.ink, border: themeInk.ink, text: '#fffcf5' }

export function ChoiceChip({ label, selected, onClick, size = 'sm', surface = 'card', tone, disabled = false, sx }: {
  label: ReactNode
  selected: boolean
  onClick?: () => void
  size?: keyof typeof SIZES
  surface?: 'card' | 'raised' | 'page'
  tone?: ChoiceTone
  disabled?: boolean
  sx?: SxProps<Theme>
}) {
  const { theme } = useBackground()
  const { height, fontSize, px } = SIZES[size]
  const idle = {
    card: { bg: 'transparent', text: colors.text.secondary, border: colors.border.medium },
    raised: { bg: 'transparent', text: colors.text.secondary, border: colors.border.medium },
    page: { bg: 'transparent', text: theme.textOnBgMuted, border: theme.surfaceBorder },
  }[surface]
  const active = tone ?? PRIMARY
  const background = selected ? active.bg : idle.bg
  return (
    <Chip
      size="small"
      label={label}
      onClick={disabled ? undefined : onClick}
      sx={mergeSx({
        height, fontSize, fontWeight: 600, borderRadius: '3px', background, cursor: disabled ? 'not-allowed' : 'pointer',
        border: `1.5px solid ${selected ? active.border ?? 'transparent' : idle.border}`,
        transition: 'background 0.15s, border-color 0.15s',
        '&:hover': { background: selected ? background : colors.fill.subtle, borderColor: selected ? undefined : colors.text.muted },
        '& .MuiChip-label': { px, ...(selected ? { color: active.text, ...active.label } : { color: idle.text }) },
      }, sx)}
    />
  )
}
