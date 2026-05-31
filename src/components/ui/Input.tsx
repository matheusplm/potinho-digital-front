import { Stack, TextField, Typography, type TextFieldProps } from '@mui/material'
import { colors, radius } from '../../design-system'

interface InputProps extends Omit<TextFieldProps, 'label'> {
  label?: string
}

export function Input({ label, sx, ...props }: InputProps) {
  return (
    <Stack spacing={0.6}>
      {label && (
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: colors.text.secondary, pl: 0.5 }}>
          {label}
        </Typography>
      )}
      <TextField
        {...props}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: radius.lg,
            bgcolor: colors.surface.base,
            backdropFilter: 'blur(10px)',
            transition: 'box-shadow 0.2s',
            '& fieldset': { borderColor: colors.border.subtle, borderWidth: 1.5 },
            '&:hover fieldset': { borderColor: `rgba(29,78,216,0.4)` },
            '&.Mui-focused fieldset': { borderColor: colors.primary.main, borderWidth: 1.5 },
            '&.Mui-focused': { boxShadow: `0 0 0 3px rgba(29,78,216,0.1)` },
          },
          '& input': {
            fontSize: '0.95rem',
            color: colors.text.primary,
            '&::placeholder': { color: colors.text.muted, opacity: 1 },
          },
          ...sx,
        }}
      />
    </Stack>
  )
}
