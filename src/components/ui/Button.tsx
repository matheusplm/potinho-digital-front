import { Button as MuiButton, CircularProgress, type ButtonProps } from '@mui/material'
import { colors, gradients, radius, shadow } from '../../design-system'

type AppVariant = 'primary' | 'rose' | 'purple' | 'ghost'

interface AppButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: AppVariant
  loading?: boolean
}

const PRESS = {
  transition: 'transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease',
  '&:hover': { transform: 'translate(-1px,-1px)', boxShadow: '3px 3px 0 rgba(42,36,29,0.9)' },
  '&:active': { transform: 'translate(1px,1px)', boxShadow: '0 0 0 rgba(42,36,29,0.9)' },
  '&:disabled': { background: colors.border.medium, boxShadow: 'none', color: colors.text.muted, border: '1.5px solid transparent' },
}

function inked(color: string) {
  return {
    background: color,
    color: '#fffcf5',
    border: '1.5px solid #2a241d',
    boxShadow: shadow.primary,
    ...PRESS,
    '&:hover': { ...PRESS['&:hover'], background: color },
  }
}

const STYLES: Record<AppVariant, object> = {
  primary: inked(gradients.primary),
  rose: inked(gradients.rose),
  purple: inked(gradients.purple),
  ghost: {
    background: 'transparent',
    boxShadow: 'none',
    color: colors.text.primary,
    border: `1.5px solid ${colors.border.medium}`,
    '&:hover': { background: colors.fill.subtle, borderColor: colors.text.secondary },
  },
}

export function Button({ variant = 'primary', loading, children, sx, ...props }: AppButtonProps) {
  return (
    <MuiButton
      {...props}
      disableElevation
      sx={{
        borderRadius: radius.md,
        py: 1.4,
        fontWeight: 600,
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
