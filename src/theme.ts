import { createTheme } from '@mui/material'
import type { CSSProperties } from 'react'
import { colors, font, radius } from './design-system'

type TextVariant = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'label' | 'hint'

declare module '@mui/material/styles' {
  interface TypographyVariants {
    xxs: CSSProperties
    xs: CSSProperties
    sm: CSSProperties
    md: CSSProperties
    lg: CSSProperties
    xl: CSSProperties
    label: CSSProperties
    hint: CSSProperties
  }
  interface TypographyVariantsOptions {
    xxs?: CSSProperties
    xs?: CSSProperties
    sm?: CSSProperties
    md?: CSSProperties
    lg?: CSSProperties
    xl?: CSSProperties
    label?: CSSProperties
    hint?: CSSProperties
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    xxs: true
    xs: true
    sm: true
    md: true
    lg: true
    xl: true
    label: true
    hint: true
  }
}

const text = (fontSize: string, extra: CSSProperties = {}): CSSProperties => ({
  fontFamily: font.sans, fontSize, fontWeight: 400, lineHeight: 1.6, ...extra,
})

const TEXT_VARIANTS: Record<TextVariant, CSSProperties> = {
  xxs: text('0.62rem'),
  xs: text('0.68rem'),
  sm: text('0.74rem'),
  md: text('0.8rem'),
  lg: text('0.86rem'),
  xl: text('0.95rem'),
  label: text('0.72rem', { fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: colors.text.secondary }),
  hint: text('0.68rem', { lineHeight: 1.45, color: colors.text.muted }),
}

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary:    { main: colors.primary.main },
    secondary:  { main: '#b87333' },
    background: { default: '#f4f1ea', paper: '#fffdfa' },
  },
  shape: {
    borderRadius: parseInt(radius.lg),
  },
  typography: {
    fontFamily: font.sans,
    h4: { fontWeight: 700, fontFamily: font.serif },
    h5: { fontWeight: 700, fontFamily: font.serif },
    h6: { fontWeight: 600, fontFamily: font.serif },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.6 },
    ...TEXT_VARIANTS,
  },
  components: {
    MuiTypography: {
      defaultProps: {
        variantMapping: Object.fromEntries(Object.keys(TEXT_VARIANTS).map((variant) => [variant, 'p'])),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'var(--pd-surface-paper)',
          color: 'var(--pd-text-primary)',
          backgroundImage: 'none',
        },
      },
    },
    MuiDialogContentText: {
      styleOverrides: {
        root: { color: 'var(--pd-text-secondary)' },
      },
    },
  },
})
