import { Box, Stack, Typography } from '@mui/material'
import { useRef } from 'react'
import { Input, OptionTile } from '../../components/ui'
import { colors, radius } from '../../design-system'
import { isHexColor } from '../../utils/slug'

export function actionButtonSx(tone: 'primary' | 'danger' | 'neutral' = 'neutral') {
  const color =
    tone === 'primary' ? colors.primary.main
    : tone === 'danger' ? colors.rose.main
    : colors.text.secondary

  const tint = (percent: number) => `color-mix(in srgb, ${color} ${percent}%, transparent)`

  return {
    color,
    p: 0.75,
    borderRadius: radius.md,
    background: tint(7),
    border: `1px solid ${tint(tone === 'neutral' ? 28 : 14)}`,
    transition: 'transform 0.16s ease, background 0.16s ease, box-shadow 0.16s ease',
    '&:hover': {
      background: tint(12.5),
      transform: 'translateY(-1px) scale(1.05)',
      boxShadow: `0 5px 14px ${tint(13)}`,
    },
  }
}

export function ColorPickTile({ title, hint, fill, value, onPick }: {
  title: string; hint: string; fill: string; value: string; onPick: (color: string) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <OptionTile
      active={false}
      onClick={() => input.current?.click()}
      label={`Escolher cor: ${title}`}
      title={title}
      hint={hint}
      layout="row"
      icon={(
        <Box sx={{ position: 'relative', display: 'flex' }}>
          <Box sx={{ width: 26, height: 26, flexShrink: 0, borderRadius: '50%', background: fill, boxShadow: `0 0 0 2px ${colors.surface.base}, 0 2px 8px rgba(15,23,42,0.18)` }} />
          <input
            ref={input}
            type="color"
            value={value}
            tabIndex={-1}
            aria-hidden
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onPick(e.target.value)}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, pointerEvents: 'none', border: 0, padding: 0 }}
          />
        </Box>
      )}
    />
  )
}

export function ColorRow({ label, field, value, onChange }: {
  label: string; field: string; value: string; onChange: (f: string, v: string) => void
}) {
  const showPicker = isHexColor(value)
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Typography variant="md" sx={{ color: colors.text.secondary, width: 120, flexShrink: 0 }}>{label}</Typography>
      {showPicker && (
        <Box sx={{ position: 'relative', width: 32, height: 32, borderRadius: 1.5, overflow: 'hidden', border: `1.5px solid ${colors.border.medium}`, flexShrink: 0 }}>
          <input type="color" value={value} onChange={(e) => onChange(field, e.target.value)}
            style={{ position: 'absolute', inset: 0, width: '200%', height: '200%', border: 'none', cursor: 'pointer', padding: 0, margin: '-25%' }} />
        </Box>
      )}
      <Input value={value} onChange={(e) => onChange(field, e.target.value)} fullWidth
        placeholder={showPicker ? undefined : 'CSS: #hex, rgba(), gradiente...'}
        sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.78rem' }, '& input': { py: 0.7 } }} />
    </Stack>
  )
}
