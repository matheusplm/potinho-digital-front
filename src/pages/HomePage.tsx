import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import FavoriteIcon from '@mui/icons-material/Favorite'
import SettingsIcon from '@mui/icons-material/Settings'
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { usePackNotifications } from '../hooks/usePackNotifications'
import {
  useDailyNoteStatusQuery,
  useOpenDailyNoteMutation,
} from '../hooks/useNotes'
import type { DailyNoteOpenResponse } from '../types/note'

function formatDateTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatClockTime(nowMs: number): string {
  return new Date(nowMs).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export function HomePage() {
  const dailyStatusQuery = useDailyNoteStatusQuery()
  const openDailyNoteMutation = useOpenDailyNoteMutation()
  const [lastDailyResult, setLastDailyResult] = useState<DailyNoteOpenResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [nowMs, setNowMs] = useState(() => Date.now())

  usePackNotifications(notificationsEnabled)

  const canOpenDaily = dailyStatusQuery.data?.canOpen ?? false
  const nowDate = useMemo(() => new Date(nowMs), [nowMs])
  const secondAngle = nowDate.getSeconds() * 6
  const minuteAngle = nowDate.getMinutes() * 6 + nowDate.getSeconds() * 0.1
  const hourAngle = (nowDate.getHours() % 12) * 30 + nowDate.getMinutes() * 0.5
  const availabilityProgress = useMemo(() => {
    if (!dailyStatusQuery.data || dailyStatusQuery.data.canOpen) {
      return 1
    }

    const targetMs = new Date(dailyStatusQuery.data.availableAt).getTime()
    const remainingMs = Math.max(targetMs - nowMs, 0)
    const totalCycleMs = 24 * 60 * 60 * 1000
    const elapsedMs = Math.max(totalCycleMs - remainingMs, 0)
    return Math.min(elapsedMs / totalCycleMs, 1)
  }, [dailyStatusQuery.data, nowMs])

  const clockFaceGradient = useMemo(() => {
    const p = availabilityProgress
    return `radial-gradient(circle at 30% 30%, hsl(212 ${8 + p * 66}% ${83 - p * 28}%) 0%, hsl(216 ${
      7 + p * 68
    }% ${70 - p * 30}%) 45%, hsl(220 ${6 + p * 74}% ${56 - p * 28}%) 100%)`
  }, [availabilityProgress])

  const clockBorderColor = useMemo(() => {
    const p = availabilityProgress
    return `hsl(210 ${10 + p * 70}% ${80 - p * 24}%)`
  }, [availabilityProgress])

  const clockTextColor = useMemo(() => {
    const p = availabilityProgress
    return `hsl(210 ${16 + p * 70}% ${86 - p * 20}%)`
  }, [availabilityProgress])

  const clockRingGradient = useMemo(() => {
    const degree = Math.round(availabilityProgress * 360)
    return `conic-gradient(#2563eb 0deg ${degree}deg, #9ca3af ${degree}deg 360deg)`
  }, [availabilityProgress])

  const nextDailyLabel = useMemo(() => {
    if (!dailyStatusQuery.data) {
      return 'Carregando horario do backend...'
    }

    if (dailyStatusQuery.data.canOpen) {
      return 'Liberado agora!'
    }

    return `Novo bilhete em ${formatDateTime(dailyStatusQuery.data.availableAt)}`
  }, [dailyStatusQuery.data])

  useEffect(() => {
    if (!('Notification' in window)) {
      return
    }

    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true)
    }
  }, [])

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNowMs(Date.now())
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [])

  function handleOpenDailyNote() {
    openDailyNoteMutation.mutate(undefined, {
      onSuccess: (response) => {
        setLastDailyResult(response)
      },
      onError: (mutationError) => {
        setError(mutationError.message)
      },
    })
  }

  async function handleEnableNotifications() {
    if (!('Notification' in window)) {
      setError('Este navegador nao suporta notificacoes web.')
      return
    }

    const permission = await Notification.requestPermission()

    if (permission !== 'granted') {
      setError('Permissao de notificacao negada.')
      return
    }

    setNotificationsEnabled(true)
  }

  return (
    <Stack
      spacing={0}
      sx={{
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.2, sm: 2.8 },
          height: '100%',
          borderRadius: 0,
          width: '100%',
          m: 0,
          background: 'linear-gradient(145deg, #f4f8ff 0%, #eef4ff 45%, #f7efff 100%)',
          overflow: 'hidden',
          position: 'relative',
          border: 0,
          boxShadow: 'none',
        }}
      >
        <Stack
          sx={{
            alignItems: 'center',
            height: '100%',
            justifyContent: 'space-between',
            fontFamily: '"Nunito", "Roboto", "Helvetica", "Arial", sans-serif',
          }}
        >
          <Stack spacing={1} sx={{ alignItems: 'center' }}>
            <Chip
              label="Feito por eu, Matheus, ahaaam eu que fiz isso tudo, vai vendo"
              color="secondary"
              sx={{
                color: '#fff',
                fontWeight: 700,
                letterSpacing: 0.2,
                maxWidth: 340,
                height: 'auto',
                py: 0.25,
                '& .MuiChip-label': {
                  px: 1.2,
                  py: 0.35,
                  whiteSpace: 'normal',
                  display: 'block',
                  textAlign: 'center',
                  lineHeight: 1.3,
                  fontSize: '0.9rem',
                },
              }}
            />
            <Typography
              variant="h5"
              sx={{
                color: '#1f2a44',
                textAlign: 'center',
                fontWeight: 700,
                letterSpacing: 0,
                lineHeight: 1.1,
                fontSize: { xs: '2.15rem', sm: '2.3rem' },
                fontFamily: 'inherit',
              }}
            >
              Potinho digital
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#243447',
                textAlign: 'justify',
                maxWidth: 340,
                lineHeight: 1.5,
                fontSize: { xs: '1.08rem', sm: '1.16rem' },
              }}
            >
              Oh, fiz um album de figurinha, so que com bilhetinho.
              <br />
              Espelhado em um presente muito especial
              <br />
              que voce me deu: o potinho de bilhete.
              <br />
              Espero que goste.
            </Typography>
          </Stack>

          <Box sx={{ position: 'relative', width: 340, height: 340, maxWidth: '100%', mt: 0.3 }}>
            <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
              <SettingsIcon
                sx={{
                  position: 'absolute',
                  top: -560,
                  right: -530,
                  color: '#b87333',
                  fontSize: 980,
                  opacity: 0.14,
                  filter: 'drop-shadow(0 6px 6px rgba(65, 32, 14, 0.25))',
                  animation: 'spin-gear 24s linear infinite',
                  '@keyframes spin-gear': {
                    from: { transform: 'rotate(0deg)' },
                    to: { transform: 'rotate(360deg)' },
                  },
                }}
              />
            </Box>

            <Button
              onClick={handleOpenDailyNote}
              disabled={!canOpenDaily || openDailyNoteMutation.isPending}
              sx={{
                width: 232,
                height: 232,
                borderRadius: '50%',
                p: 0,
                minWidth: 0,
                position: 'absolute',
                top: 54,
                left: 54,
                zIndex: 2,
                bgcolor: 'transparent',
                color: 'inherit',
                boxShadow: 'none',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: -10,
                  borderRadius: '50%',
                  background: clockRingGradient,
                  zIndex: -1,
                  opacity: 0.95,
                },
                animation: canOpenDaily ? 'pulse-button 2s infinite' : 'none',
                '&:hover': {
                  bgcolor: 'transparent',
                  boxShadow: 'none',
                },
                '@keyframes pulse-button': {
                  '0%': {
                    boxShadow: '0 0 0 0 rgba(29, 78, 216, 0.7)',
                  },
                  '70%': {
                    boxShadow: '0 0 0 28px rgba(29, 78, 216, 0)',
                  },
                  '100%': {
                    boxShadow: '0 0 0 0 rgba(29, 78, 216, 0)',
                  },
                },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: clockFaceGradient,
                  border: `4px solid ${clockBorderColor}`,
                  overflow: 'hidden',
                  opacity: 1,
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 14,
                    borderRadius: '50%',
                    border: '2px dashed rgba(255, 255, 255, 0.5)',
                  }}
                />

                <FavoriteIcon
                  sx={{
                    position: 'absolute',
                    top: '63%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#ef4444',
                    fontSize: 30,
                    opacity: 0.92,
                    zIndex: 1,
                  }}
                />
                <FavoriteIcon
                  sx={{
                    position: 'absolute',
                    top: '30%',
                    left: '28%',
                    transform: 'translate(-50%, -50%) rotate(-12deg)',
                    color: '#ef4444',
                    fontSize: 14,
                    opacity: 0.9,
                    zIndex: 1,
                  }}
                />
                <FavoriteIcon
                  sx={{
                    position: 'absolute',
                    top: '33%',
                    right: '21%',
                    transform: 'translate(50%, -50%) rotate(16deg)',
                    color: '#dc2626',
                    fontSize: 13,
                    opacity: 0.88,
                    zIndex: 1,
                  }}
                />
                <FavoriteIcon
                  sx={{
                    position: 'absolute',
                    top: '73%',
                    left: '24%',
                    transform: 'translate(-50%, -50%) rotate(-8deg)',
                    color: '#ef4444',
                    fontSize: 13,
                    opacity: 0.84,
                    zIndex: 1,
                  }}
                />
                <FavoriteIcon
                  sx={{
                    position: 'absolute',
                    top: '74%',
                    right: '22%',
                    transform: 'translate(50%, -50%) rotate(10deg)',
                    color: '#b91c1c',
                    fontSize: 15,
                    opacity: 0.87,
                    zIndex: 1,
                  }}
                />
                <FavoriteIcon
                  sx={{
                    position: 'absolute',
                    top: '49%',
                    left: '29%',
                    transform: 'translate(-50%, -50%) rotate(-15deg)',
                    color: '#ef4444',
                    fontSize: 12,
                    opacity: 0.8,
                    zIndex: 1,
                  }}
                />
                <FavoriteIcon
                  sx={{
                    position: 'absolute',
                    top: '48%',
                    right: '28%',
                    transform: 'translate(50%, -50%) rotate(15deg)',
                    color: '#dc2626',
                    fontSize: 12,
                    opacity: 0.8,
                    zIndex: 1,
                  }}
                />
                <FavoriteIcon
                  sx={{
                    position: 'absolute',
                    top: '22%',
                    left: '41%',
                    transform: 'translate(-50%, -50%) rotate(-8deg)',
                    color: '#ef4444',
                    fontSize: 10,
                    opacity: 0.76,
                    zIndex: 1,
                  }}
                />
                <FavoriteIcon
                  sx={{
                    position: 'absolute',
                    top: '22%',
                    right: '40%',
                    transform: 'translate(50%, -50%) rotate(10deg)',
                    color: '#b91c1c',
                    fontSize: 10,
                    opacity: 0.76,
                    zIndex: 1,
                  }}
                />
                <FavoriteIcon
                  sx={{
                    position: 'absolute',
                    top: '81%',
                    left: '40%',
                    transform: 'translate(-50%, -50%) rotate(-7deg)',
                    color: '#ef4444',
                    fontSize: 11,
                    opacity: 0.76,
                    zIndex: 1,
                  }}
                />
                <FavoriteIcon
                  sx={{
                    position: 'absolute',
                    top: '81%',
                    right: '39%',
                    transform: 'translate(50%, -50%) rotate(9deg)',
                    color: '#dc2626',
                    fontSize: 11,
                    opacity: 0.76,
                    zIndex: 1,
                  }}
                />

                <Box
                  sx={{
                    position: 'absolute',
                    top: '52%',
                    left: '50%',
                    width: 5,
                    height: 52,
                    borderRadius: 8,
                    bgcolor: '#111827',
                    zIndex: 3,
                    transformOrigin: '50% 100%',
                    transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '52%',
                    left: '50%',
                    width: 3,
                    height: 70,
                    borderRadius: 8,
                    bgcolor: '#334155',
                    zIndex: 3,
                    transformOrigin: '50% 100%',
                    transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '52%',
                    left: '50%',
                    width: 2,
                    height: 82,
                    borderRadius: 8,
                    bgcolor: '#f59e0b',
                    zIndex: 3,
                    transformOrigin: '50% 100%',
                    transform: `translate(-50%, -100%) rotate(${secondAngle}deg)`,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '52%',
                    left: '50%',
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: '#fbbf24',
                    transform: 'translate(-50%, -50%)',
                    border: '2px solid #fef3c7',
                    zIndex: 4,
                  }}
                />

                <Typography
                  sx={{
                    position: 'absolute',
                    bottom: 20,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    color: clockTextColor,
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    letterSpacing: 0.7,
                  }}
                >
                  {formatClockTime(nowMs)}
                </Typography>
              </Box>
            </Button>
          </Box>

          <Stack spacing={0.7} sx={{ alignItems: 'center', width: '100%', maxWidth: 360 }}>
            <Chip
              label={nextDailyLabel}
              color={canOpenDaily ? 'success' : 'default'}
              sx={{ '& .MuiChip-label': { fontSize: '0.95rem', fontWeight: 700 } }}
            />

            <Button
              variant={notificationsEnabled ? 'contained' : 'outlined'}
              startIcon={<NotificationsActiveIcon />}
              onClick={handleEnableNotifications}
              disabled={notificationsEnabled}
              sx={{ fontSize: '1.02rem', fontWeight: 700, px: 2.2, py: 0.95 }}
            >
              {notificationsEnabled ? 'Notificacoes ativas' : 'Ativar notificacoes'}
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.84rem', textAlign: 'center' }}>
              Quando o pacotinho diario liberar, o app te avisa (com a aba aberta).
            </Typography>

            {lastDailyResult ? (
              <Box
                sx={{
                  mt: 0.6,
                  width: '100%',
                  p: 1.2,
                  border: '1px solid rgba(120, 84, 42, 0.22)',
                  background: 'rgba(255, 253, 250, 0.72)',
                }}
              >
                <Stack spacing={0.45}>
                  <Typography variant="subtitle2">Bilhete do dia aberto!</Typography>
                  <Typography variant="body2">{lastDailyResult.reward.title}</Typography>
                  <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                    <Chip label={lastDailyResult.reward.rarity.toUpperCase()} size="small" />
                    <Typography variant="caption" color="text.secondary">
                      Proximo: {formatDateTime(lastDailyResult.status.availableAt)}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            ) : null}
          </Stack>
        </Stack>
      </Paper>

      <Snackbar open={Boolean(error)} autoHideDuration={3200} onClose={() => setError(null)}>
        <Alert severity="error" variant="filled" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Stack>
  )
}
