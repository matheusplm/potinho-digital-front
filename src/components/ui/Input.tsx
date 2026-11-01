import { Stack, TextField, Typography, type TextFieldProps } from '@mui/material'
import { colors, radius, themeInk } from '../../design-system'

interface InputProps extends Omit<TextFieldProps, 'label'> {
  label?: string
  lined?: boolean
}

const LINED = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 0, bgcolor: 'transparent', boxShadow: 'none',
    '& fieldset': { border: 'none', borderBottom: `2px solid ${colors.border.medium}`, borderRadius: 0 },
    '&:hover fieldset': { borderBottomColor: colors.text.secondary },
    '&.Mui-focused fieldset': { borderBottom: `2.5px solid ${themeInk.button}` },
    '&.Mui-focused': { boxShadow: 'none', bgcolor: 'color-mix(in srgb, var(--pd-text-primary) 4%, transparent)' },
  },
  '& input': { pl: '4px', pr: 0.5, pt: '9px', pb: '8px' },
}

export function Input({ label, lined = false, sx, ...props }: InputProps) {
  return (
    <Stack spacing={0.9}>
      {label && (
        <Typography variant="md" sx={{ fontWeight: 600, color: colors.text.primary, pl: 0.25 }}>
          {label}
        </Typography>
      )}
      <TextField
        {...props}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: radius.md,
            bgcolor: colors.surface.base,
            boxShadow: 'inset 1px 1px 0 rgba(42,36,29,0.06)',
            transition: 'box-shadow 0.2s',
            '& fieldset': { borderColor: colors.border.medium, borderWidth: 1.5 },
            '&:hover fieldset': { borderColor: colors.text.secondary },
            '&.Mui-focused fieldset': { borderColor: themeInk.button, borderWidth: 2 },
            '&.Mui-focused': { boxShadow: `0 0 0 3px color-mix(in srgb, ${themeInk.button} 22%, transparent)` },
          },
          '& input': {
            fontSize: '1rem',
            py: '12.5px',
            color: colors.text.primary,
            '&::placeholder': { color: colors.text.muted, opacity: 1 },
          },
          ...(lined ? LINED : {}),
          ...sx,
        }}
      />
    </Stack>
  )
}
