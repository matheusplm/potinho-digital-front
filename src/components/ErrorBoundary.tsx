import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { Button } from './ui'
import { font } from '../design-system'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erro não tratado na aplicação', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <Box sx={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(160deg, #dbeafe 0%, #fce7f3 55%, #ede9fe 100%)', p: 3,
      }}>
        <Stack spacing={2} alignItems="center" sx={{ maxWidth: 340, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '2.6rem', lineHeight: 1 }}>😵‍💫</Typography>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.4rem', color: '#1e3a5f' }}>
            Algo deu errado
          </Typography>
          <Typography sx={{ fontSize: '0.88rem', color: 'rgba(30,58,95,0.65)' }}>
            Tenta recarregar a página. Se continuar, avise a gente.
          </Typography>
          <Button variant="primary" onClick={() => window.location.reload()} sx={{ px: 4 }}>
            Recarregar
          </Button>
        </Stack>
      </Box>
    )
  }
}
