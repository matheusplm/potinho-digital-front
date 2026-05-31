import { Button as MuiButton, CircularProgress, type ButtonProps } from '@mui/material'
import { colors, gradients, radius, shadow } from '../../design-system'

type AppVariant = 'primary' | 'rose' | 'purple' | 'ghost'

interface AppButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: AppVariant
  loading?: boolean
}

const STYLES: Record<AppVariant, object> = {
  primary: {
    background: gradients.primary,
    boxShadow: shadow.primary,
    color: '#fff',
    '&:hover': { boxShadow: `0 8px 24px ${colors.primary.glow}`, background: gradients.primary },
    '&:disabled': { background: 'rgba(0,0,0,0.1)', boxShadow: 'none', color: 'rgba(0,0,0,0.3)' },
  },
  rose: {
    background: gradients.rose,
    boxShadow: shadow.rose,
    color: '#fff',
    '&:hover': { boxShadow: `0 8px 24px ${colors.rose.glow}`, background: gradients.rose },
    '&:disabled': { background: 'rgba(0,0,0,0.1)', boxShadow: 'none', color: 'rgba(0,0,0,0.3)' },
  },
  purple: {
    background: gradients.purple,
    boxShadow: shadow.purple,
    color: '#fff',
    '&:hover': { boxShadow: `0 8px 24px ${colors.purple.glow}`, background: gradients.purple },
    '&:disabled': { background: 'rgba(0,0,0,0.1)', boxShadow: 'none', color: 'rgba(0,0,0,0.3)' },
  },
  ghost: {
    background: colors.surface.overlay,
    backdropFilter: 'blur(8px)',
    boxShadow: shadow.sm,
    color: colors.primary.main,
    border: `1.5px solid rgba(29,78,216,0.2)`,
    '&:hover': { background: 'rgba(255,255,255,0.95)', boxShadow: shadow.md },
  },
}

export function Button({ variant = 'primary', loading, children, sx, ...props }: AppButtonProps) {
  return (
    <MuiButton
      {...props}
      disableElevation
      sx={{
        borderRadius: radius.lg,
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
