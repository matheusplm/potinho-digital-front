import { createTheme } from '@mui/material'
import { colors, font, radius } from './design-system'

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
  },
  components: {
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
