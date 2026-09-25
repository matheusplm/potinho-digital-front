import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import RefreshIcon from '@mui/icons-material/Refresh'
import { Box, Stack, Typography } from '@mui/material'
import { useEffect, useState, type ReactNode } from 'react'
import { Button, ScrollablePage, toast } from '../../components/ui'
import { useBackground } from '../../context/BackgroundContext'
import { useUser } from '../../context/UserContext'
import { fadeIn, font, radius, spin } from '../../design-system'
import { useAdminOverviewQuery } from '../../hooks/useAdmin'
import { ApiRequestError } from '../../services/api'
import { clearAdminSession } from '../../services/adminSession'
import type { AdminOverview } from '../../types/admin'
import { AdminUnlock } from './AdminUnlock'
import { SkeletonBlock } from './charts'
import { timeAgo } from './format'

function useMinutesLeft(expiresAt: number | undefined): number | null {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!expiresAt) return
    const timer = setInterval(() => setNow(Date.now()), 15_000)
    return () => clearInterval(timer)
  }, [expiresAt])
  if (!expiresAt) return null
  return Math.max(0, Math.round((expiresAt - now) / 60_000))
}

function Pill({ children, onClick, disabled, tone, label }: { children: ReactNode; onClick?: () => void; disabled?: boolean; tone?: string; label?: string }) {
  const { theme } = useBackground()
  const color = tone ?? theme.textOnBg
  return (
    <Box
      component={onClick ? 'button' : 'span'}
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      sx={{
        all: 'unset', boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', gap: 0.6, height: 32, px: 1.3,
        borderRadius: radius.full, fontSize: '0.76rem', fontWeight: 700, whiteSpace: 'nowrap', color,
        background: theme.surfaceBg, border: `1px solid ${theme.surfaceBorder}`, backdropFilter: 'blur(12px)',
        cursor: onClick && !disabled ? 'pointer' : 'default', opacity: disabled ? 0.6 : 1,
        transition: 'background 0.15s, border-color 0.15s',
        '&:hover': onClick && !disabled ? { borderColor: `${theme.accent}66` } : undefined,
        '&:focus-visible': { outline: `2px solid ${theme.accent}`, outlineOffset: 2 },
        '& svg': { fontSize: 16 },
      }}
    >
      {children}
    </Box>
  )
}

function LoadingSkeleton() {
  return (
    <Stack spacing={2}>
      <SkeletonBlock height={140} />
      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'repeat(2, minmax(0,1fr))', lg: 'repeat(4, minmax(0,1fr))' } }}>
        {Array.from({ length: 8 }, (_, i) => <SkeletonBlock key={i} height={128} />)}
      </Box>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'minmax(0,1fr)', lg: 'minmax(0,1.7fr) minmax(0,1fr)' } }}>
        <SkeletonBlock height={340} />
        <SkeletonBlock height={340} />
      </Box>
    </Stack>
  )
}

export function AdminShell({ title, subtitle, children }: { title: string; subtitle?: string; children: (data: AdminOverview) => ReactNode }) {
  const { theme } = useBackground()
  const { user, setPersona } = useUser()
  const { data, isLoading, error, isFetching, refetch, session } = useAdminOverviewQuery()
  const forbidden = error instanceof ApiRequestError && error.code === 'FORBIDDEN'
  const minutesLeft = useMinutesLeft(session?.expiresAt)

  useEffect(() => {
    if (!forbidden || !user) return
    clearAdminSession(false)
    setPersona(user.role)
    toast.error('Sua conta não tem acesso ao modo admin.')
  }, [forbidden, user, setPersona])

  return (
    <Box sx={{ height: '100%', position: 'relative', overflow: 'hidden', background: theme.gradient }}>
      <Box sx={{ position: 'absolute', top: -160, right: -120, width: 420, height: 420, borderRadius: '50%', background: `radial-gradient(circle, ${theme.accent}26, transparent 70%)`, pointerEvents: 'none' }} />
      <ScrollablePage sx={{ animation: `${fadeIn} 0.35s ease` }}>
        <Box sx={{ width: '100%', maxWidth: 1240, mx: 'auto', px: { xs: 1.6, md: 4 }, pt: { xs: 2.2, md: 3.5 }, pb: { xs: 13, md: 5 } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'flex-start', md: 'flex-end' }}
            justifyContent="space-between"
            sx={{ mb: { xs: 2, md: 2.8 }, gap: 1.4, pr: { xs: 6, md: 0 } }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mb: 0.6 }}>
                <Box sx={{ px: 1, py: 0.2, borderRadius: radius.full, background: `${theme.accent}1f`, color: theme.textOnBg, fontSize: '0.68rem', fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  🛠️ Modo admin
                </Box>
                {subtitle && <Typography sx={{ fontSize: '0.76rem', color: theme.textOnBgMuted, fontWeight: 600 }}>{subtitle}</Typography>}
              </Stack>
              <Typography component="h1" sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: { xs: '1.75rem', md: '2.3rem' }, color: theme.textOnBg, lineHeight: 1.05, letterSpacing: '-0.5px' }}>
                {title}
              </Typography>
              {data && (
                <Typography sx={{ mt: 0.6, fontSize: '0.76rem', color: theme.textOnBgMuted, fontStyle: 'italic' }}>
                  dados de {timeAgo(data.generatedAt)}
                </Typography>
              )}
            </Box>

            {session && (
              <Stack direction="row" spacing={0.8} sx={{ flexWrap: 'wrap', rowGap: 0.8 }}>
                <Pill tone={minutesLeft !== null && minutesLeft <= 5 ? '#f59e0b' : undefined} label={`Sessão admin: ${minutesLeft} minutos restantes`}>
                  <LockOutlinedIcon />
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>sessão ·</Box>
                  {minutesLeft ? `${minutesLeft} min` : '< 1 min'}
                </Pill>
                <Pill onClick={() => { void refetch() }} disabled={isFetching} label="Atualizar dados">
                  <RefreshIcon sx={{ animation: isFetching ? `${spin} 0.9s linear infinite` : 'none' }} />
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{isFetching ? 'atualizando' : 'atualizar'}</Box>
                </Pill>
                <Pill onClick={() => clearAdminSession(true)} label="Encerrar sessão admin">
                  <LogoutIcon />
                  encerrar
                </Pill>
              </Stack>
            )}
          </Stack>

          {!session && <AdminUnlock />}

          {session && isLoading && <LoadingSkeleton />}

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
