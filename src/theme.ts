import { createTheme } from '@mui/material'

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1d4ed8',
    },
    secondary: {
      main: '#b87333',
    },
    background: {
      default: '#f4f1ea',
      paper: '#fffdfa',
    },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: '"Nunito", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontFamily: '"Playfair Display", "Georgia", serif',
    },
    h5: {
      fontWeight: 700,
      fontFamily: '"Playfair Display", "Georgia", serif',
    },
    h6: {
      fontWeight: 600,
      fontFamily: '"Playfair Display", "Georgia", serif',
    },
    body1: {
      lineHeight: 1.6,
    },
    body2: {
      lineHeight: 1.6,
    },
  },
})
