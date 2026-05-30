import { Button as MuiButton, CircularProgress, type ButtonProps } from '@mui/material'

type AppVariant = 'primary' | 'rose' | 'purple' | 'ghost'

interface AppButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: AppVariant
  loading?: boolean
}

const STYLES: Record<AppVariant, object> = {
  primary: {
    background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
    boxShadow: '0 6px 20px rgba(29,78,216,0.32)',
    color: '#fff',
    '&:hover': { boxShadow: '0 8px 24px rgba(29,78,216,0.44)', background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)' },
    '&:disabled': { background: 'rgba(0,0,0,0.1)', boxShadow: 'none', color: 'rgba(0,0,0,0.3)' },
  },
  rose: {
    background: 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)',
    boxShadow: '0 6px 20px rgba(225,29,72,0.32)',
    color: '#fff',
    '&:hover': { boxShadow: '0 8px 24px rgba(225,29,72,0.44)', background: 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)' },
    '&:disabled': { background: 'rgba(0,0,0,0.1)', boxShadow: 'none', color: 'rgba(0,0,0,0.3)' },
  },
  purple: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    boxShadow: '0 6px 20px rgba(79,70,229,0.32)',
    color: '#fff',
    '&:hover': { boxShadow: '0 8px 24px rgba(79,70,229,0.44)', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
    '&:disabled': { background: 'rgba(0,0,0,0.1)', boxShadow: 'none', color: 'rgba(0,0,0,0.3)' },
  },
  ghost: {
    background: 'rgba(255,255,255,0.6)',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    color: '#1d4ed8',
    border: '1.5px solid rgba(29,78,216,0.2)',
    '&:hover': { background: 'rgba(255,255,255,0.85)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  },
}

export function Button({ variant = 'primary', loading, children, sx, ...props }: AppButtonProps) {
  return (
    <MuiButton
      {...props}
      disableElevation
      sx={{
        borderRadius: 2.5,
        py: 1.4,
        fontWeight: 700,
        textTransform: 'none',
        fontSize: '0.97rem',
        letterSpacing: '0.01em',
        ...STYLES[variant],
        ...sx,
      }}
    >
      {loading ? <CircularProgress size={22} sx={{ color: 'inherit' }} /> : children}
    </MuiButton>
  )
}
