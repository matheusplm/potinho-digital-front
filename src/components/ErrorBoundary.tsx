import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import { Button } from './ui'
import { colors, font, gradients } from '../design-system'
import { isChunkLoadError, reloadForNewVersion } from '../utils/chunkReload'

interface Props {
  children: ReactNode
}

type Screen = 'updating' | 'offline' | 'error'

interface State {
  hasError: boolean
  screen: Screen
}

function screenFor(error: unknown): Screen {
  if (!isChunkLoadError(error)) return 'error'
  return navigator.onLine ? 'updating' : 'offline'
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, screen: 'error' }

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, screen: screenFor(error) }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (this.state.screen === 'offline') return
    if (this.state.screen === 'updating' && reloadForNewVersion()) return
    if (this.state.screen === 'updating') this.setState({ screen: 'error' })
    console.error('Erro não tratado na aplicação', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <Box sx={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: gradients.page, p: 3,
      }}>
        {this.state.screen === 'updating' ? (
          <Stack spacing={2} alignItems="center" sx={{ maxWidth: 340, textAlign: 'center' }}>
            <CircularProgress size={34} sx={{ color: colors.primary.text }} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.3rem', color: colors.text.primary }}>
              Atualizando o Potinho…
            </Typography>
            <Typography variant="lg" sx={{ color: colors.text.secondary }}>
              Tem uma versão nova no ar, é rapidinho.
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={2} alignItems="center" sx={{ maxWidth: 340, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '2.6rem', lineHeight: 1 }}>{this.state.screen === 'offline' ? '📶' : '😵‍💫'}</Typography>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.4rem', color: colors.text.primary }}>
              {this.state.screen === 'offline' ? 'Sem internet' : 'Algo deu errado'}
            </Typography>
            <Typography variant="lg" sx={{ color: colors.text.secondary }}>
              {this.state.screen === 'offline'
                ? 'Confere a conexão e toca em recarregar quando ela voltar.'
                : 'Tenta recarregar a página. Se continuar, avise a gente.'}
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
