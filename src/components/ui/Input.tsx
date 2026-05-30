import { Stack, TextField, Typography, type TextFieldProps } from '@mui/material'

interface InputProps extends Omit<TextFieldProps, 'label'> {
  label?: string
}

export function Input({ label, sx, ...props }: InputProps) {
  return (
    <Stack spacing={0.6}>
      {label && (
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', pl: 0.5 }}>
          {label}
        </Typography>
      )}
      <TextField
        {...props}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2.5,
            bgcolor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            transition: 'box-shadow 0.2s',
            '& fieldset': { borderColor: 'rgba(0,0,0,0.1)', borderWidth: 1.5 },
            '&:hover fieldset': { borderColor: 'rgba(29,78,216,0.4)' },
            '&.Mui-focused fieldset': { borderColor: '#1d4ed8', borderWidth: 1.5 },
            '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(29,78,216,0.1)' },
          },
          '& input': {
            fontSize: '0.95rem',
            color: '#1e3a5f',
            '&::placeholder': { color: '#94a3b8', opacity: 1 },
          },
          ...sx,
        }}
      />
    </Stack>
  )
}
