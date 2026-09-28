import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import { Button } from './ui'
import { font, ink } from '../design-system'
import { isChunkLoadError, reloadForNewVersion } from '../utils/chunkReload'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  updating: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, updating: false }

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, updating: isChunkLoadError(error) }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (isChunkLoadError(error) && reloadForNewVersion()) return
    if (this.state.updating) this.setState({ updating: false })
    console.error('Erro não tratado na aplicação', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <Box sx={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(160deg, #dbeafe 0%, #fce7f3 55%, #ede9fe 100%)', p: 3,
      }}>
        {this.state.updating ? (
          <Stack spacing={2} alignItems="center" sx={{ maxWidth: 340, textAlign: 'center' }}>
            <CircularProgress size={34} sx={{ color: ink.primary }} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.3rem', color: ink.primary }}>
              Atualizando o Potinho…
            </Typography>
            <Typography variant="lg" sx={{ color: 'rgba(30,58,95,0.65)' }}>
              Tem uma versão nova no ar, é rapidinho.
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={2} alignItems="center" sx={{ maxWidth: 340, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '2.6rem', lineHeight: 1 }}>😵‍💫</Typography>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.4rem', color: ink.primary }}>
              Algo deu errado
            </Typography>
            <Typography variant="lg" sx={{ color: 'rgba(30,58,95,0.65)' }}>
              Tenta recarregar a página. Se continuar, avise a gente.
            </Typography>
            <Button variant="primary" onClick={() => window.location.reload()} sx={{ px: 4 }}>
              Recarregar
            </Button>
          </Stack>
        )}
      </Box>
    )
  }
}
