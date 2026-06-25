import { Box, Stack, Typography } from '@mui/material'
import { Input } from '../../components/ui'
import { colors, radius } from '../../design-system'
import { isHexColor } from '../../utils/slug'

export function actionButtonSx(tone: 'primary' | 'danger' | 'neutral' = 'neutral') {
  const color =
    tone === 'primary' ? colors.primary.main
    : tone === 'danger' ? colors.rose.main
    : colors.text.secondary

  return {
    color,
    p: 0.75,
    borderRadius: radius.md,
    background: `${color}12`,
    border: `1px solid ${color}24`,
    transition: 'transform 0.16s ease, background 0.16s ease, box-shadow 0.16s ease',
    '&:hover': {
      background: `${color}20`,
      transform: 'translateY(-1px) scale(1.05)',
      boxShadow: `0 5px 14px ${color}22`,
    },
  }
}

export function ColorRow({ label, field, value, onChange }: {
  label: string; field: string; value: string; onChange: (f: string, v: string) => void
}) {
  const showPicker = isHexColor(value)
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Typography sx={{ fontSize: '0.8rem', color: colors.text.secondary, width: 120, flexShrink: 0 }}>{label}</Typography>
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
