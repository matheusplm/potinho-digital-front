import RefreshIcon from '@mui/icons-material/Refresh'
import { Box, Stack, Typography } from '@mui/material'
import { useEffect, type ReactNode } from 'react'
import { Button, LoadingState, ScrollablePage, toast } from '../../components/ui'
import { useBackground } from '../../context/BackgroundContext'
import { useUser } from '../../context/UserContext'
import { fadeIn, font, spin } from '../../design-system'
import { useAdminOverviewQuery } from '../../hooks/useAdmin'
import { ApiRequestError } from '../../services/api'
import { clearAdminSession } from '../../services/adminSession'
import type { AdminOverview } from '../../types/admin'
import { AdminUnlock } from './AdminUnlock'
import { timeAgo } from './format'

function LinkButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: ReactNode }) {
  const { theme } = useBackground()
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={disabled}
      sx={{
        all: 'unset', display: 'inline-flex', alignItems: 'center', gap: 0.4, cursor: disabled ? 'default' : 'pointer',
        fontSize: '0.78rem', fontWeight: 700, color: theme.accent, opacity: disabled ? 0.6 : 1,
        '&:focus-visible': { outline: `2px solid ${theme.accent}`, borderRadius: '4px' },
      }}
    >
      {children}
    </Box>
  )
}

export function AdminShell({ title, children }: { title: string; children: (data: AdminOverview) => ReactNode }) {
  const { theme } = useBackground()
  const { user, setPersona } = useUser()
  const { data, isLoading, error, isFetching, refetch, session } = useAdminOverviewQuery()
  const forbidden = error instanceof ApiRequestError && error.code === 'FORBIDDEN'

  useEffect(() => {
    if (!forbidden || !user) return
    clearAdminSession(false)
    setPersona(user.role)
    toast.error('Sua conta não tem acesso ao modo admin.')
  }, [forbidden, user, setPersona])

  const endsAt = session ? new Date(session.expiresAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : null

  return (
    <Box sx={{ height: '100%', position: 'relative', overflow: 'hidden', background: theme.gradient }}>
      <ScrollablePage sx={{ animation: `${fadeIn} 0.35s ease` }}>
        <Box sx={{ width: '100%', maxWidth: 1180, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 2.5, md: 3.5 }, pb: { xs: 12, md: 4 } }}>
          <Stack spacing={0.3} sx={{ mb: 2.4, pr: { xs: 6, md: 0 } }}>
            <Typography sx={{ fontSize: '0.78rem', color: theme.textOnBgMuted, fontWeight: 700 }}>
              🛠️ Modo admin
            </Typography>
            <Typography component="h1" sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: { xs: '1.6rem', md: '2rem' }, color: theme.textOnBg, lineHeight: 1.1 }}>
              {title}
            </Typography>
            {session && (
              <Stack direction="row" alignItems="center" sx={{ gap: 0.8, flexWrap: 'wrap', rowGap: 0.2 }}>
                {data && (
                  <Typography sx={{ fontSize: '0.78rem', color: theme.textOnBgMuted, fontStyle: 'italic' }}>
                    atualizado {timeAgo(data.generatedAt)}
                  </Typography>
                )}
                <LinkButton onClick={() => { void refetch() }} disabled={isFetching}>
                  <RefreshIcon sx={{ fontSize: 15, animation: isFetching ? `${spin} 0.9s linear infinite` : 'none' }} />
                  {isFetching ? 'atualizando' : 'atualizar'}
                </LinkButton>
                <Typography sx={{ fontSize: '0.78rem', color: theme.textOnBgMuted }}>
                  · sessão até {endsAt} ·
                </Typography>
                <LinkButton onClick={() => clearAdminSession(true)}>encerrar</LinkButton>
              </Stack>
            )}
          </Stack>

          {!session && <AdminUnlock />}

          {session && isLoading && (
            <LoadingState label="Juntando os números" accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} />
          )}

          {session && error && !data && !forbidden && (
            <Stack alignItems="center" spacing={1.5} sx={{ py: 6, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '2.2rem' }}>😵</Typography>
              <Typography sx={{ fontFamily: font.serif, fontWeight: 700, color: theme.textOnBg }}>Não consegui carregar o painel</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: theme.textOnBgMuted }}>{error.message}</Typography>
              <Button variant="ghost" onClick={() => { void refetch() }} sx={{ px: 3 }}>Tentar de novo</Button>
            </Stack>
          )}

          {session && data && children(data)}
        </Box>
      </ScrollablePage>
    </Box>
  )
}
