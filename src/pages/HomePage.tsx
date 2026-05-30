import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import FavoriteIcon from '@mui/icons-material/Favorite'
import SettingsIcon from '@mui/icons-material/Settings'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { Box, Button as MuiButton, Chip, Stack, Tooltip, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { usePackNotifications } from '../hooks/usePackNotifications'
import { useDailyNoteStatusQuery, useOpenDailyNoteMutation } from '../hooks/useNotes'
import { useUser } from '../context/UserContext'
import { useCardConfig } from '../context/CardConfigContext'
import { toast } from '../components/ui'
import type { DailyNoteOpenResponse } from '../types/note'

function formatDateTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

function formatClockTime(nowMs: number): string {
  return new Date(nowMs).toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })
}

const FLOATING_HEARTS = [
  { size: 14, left: '7%',  delay: '0s',   dur: '9s',  opacity: 0.18 },
  { size: 10, left: '19%', delay: '2.8s', dur: '12s', opacity: 0.13 },
  { size: 18, left: '74%', delay: '1.2s', dur: '10s', opacity: 0.15 },
  { size: 11, left: '87%', delay: '4.5s', dur: '13s', opacity: 0.12 },
  { size: 13, left: '43%', delay: '3.2s', dur: '11s', opacity: 0.14 },
  { size:  9, left: '61%', delay: '6.1s', dur: '14s', opacity: 0.10 },
]

const CLOCK_HEARTS = [
  { top: '63%', left: '50%', size: 28, rotate:   0, opacity: 0.88 },
  { top: '30%', left: '28%', size: 13, rotate: -12, opacity: 0.82 },
  { top: '33%', left: '79%', size: 12, rotate:  16, opacity: 0.78 },
  { top: '73%', left: '24%', size: 12, rotate:  -8, opacity: 0.72 },
  { top: '74%', left: '78%', size: 13, rotate:  10, opacity: 0.75 },
  { top: '49%', left: '29%', size: 11, rotate: -15, opacity: 0.70 },
  { top: '48%', left: '72%', size: 11, rotate:  15, opacity: 0.70 },
]

export function HomePage() {
  const { user } = useUser()
  const { rarities } = useCardConfig()
  const dailyStatusQuery = useDailyNoteStatusQuery()
  const openDailyNoteMutation = useOpenDailyNoteMutation()
  const [lastDailyResult, setLastDailyResult] = useState<DailyNoteOpenResponse | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [nowMs, setNowMs] = useState(() => Date.now())

  usePackNotifications(notificationsEnabled)

  const canOpenDaily = dailyStatusQuery.data?.canOpen ?? false
  const nowDate = useMemo(() => new Date(nowMs), [nowMs])
  const secondAngle = nowDate.getSeconds() * 6
  const minuteAngle = nowDate.getMinutes() * 6 + nowDate.getSeconds() * 0.1
  const hourAngle = (nowDate.getHours() % 12) * 30 + nowDate.getMinutes() * 0.5

  const availabilityProgress = useMemo(() => {
    if (!dailyStatusQuery.data || dailyStatusQuery.data.canOpen) return 1
    const targetMs = new Date(dailyStatusQuery.data.availableAt).getTime()
    const remainingMs = Math.max(targetMs - nowMs, 0)
    return Math.min(Math.max(24 * 60 * 60 * 1000 - remainingMs, 0) / (24 * 60 * 60 * 1000), 1)
  }, [dailyStatusQuery.data, nowMs])

  const clockFaceGradient = useMemo(() => {
    if (canOpenDaily) return 'radial-gradient(circle at 35% 30%, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%)'
    const p = availabilityProgress
    return `radial-gradient(circle at 30% 30%, hsl(212 ${8 + p * 66}% ${83 - p * 28}%) 0%, hsl(216 ${7 + p * 68}% ${70 - p * 30}%) 45%, hsl(220 ${6 + p * 74}% ${56 - p * 28}%) 100%)`
  }, [availabilityProgress, canOpenDaily])

  const clockBorderColor = useMemo(() => {
    if (canOpenDaily) return '#fda4af'
    const p = availabilityProgress
    return `hsl(210 ${10 + p * 70}% ${80 - p * 24}%)`
  }, [availabilityProgress, canOpenDaily])

  const clockTextColor = useMemo(() => {
    if (canOpenDaily) return '#9f1239'
    const p = availabilityProgress
    return `hsl(210 ${16 + p * 70}% ${86 - p * 20}%)`
  }, [availabilityProgress, canOpenDaily])

  const clockRingGradient = useMemo(() => {
    if (canOpenDaily) return 'conic-gradient(#f43f5e 0deg 360deg)'
    const degree = Math.round(availabilityProgress * 360)
    return `conic-gradient(#2563eb 0deg ${degree}deg, #e2e8f0 ${degree}deg 360deg)`
  }, [availabilityProgress, canOpenDaily])

  const nextDailyLabel = useMemo(() => {
    if (!dailyStatusQuery.data) return 'Carregando...'
    if (dailyStatusQuery.data.canOpen) return 'Bilhete pronto!'
    return `Próximo em ${formatDateTime(dailyStatusQuery.data.availableAt)}`
  }, [dailyStatusQuery.data])

  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'granted') setNotificationsEnabled(true)
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  function handleOpenDailyNote() {
    openDailyNoteMutation.mutate(undefined, {
      onSuccess: (response) => {
        setLastDailyResult(response)
        toast.love(`"${response.reward.title}"`, { description: 'Bilhete do dia aberto!' })
      },
      onError: () => toast.error('Não foi possível abrir o bilhete.'),
    })
  }

  async function handleEnableNotifications() {
    if (!('Notification' in window)) {
      toast.error('Este navegador não suporta notificações.')
      return
    }
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      toast.error('Permissão de notificação negada.')
      return
    }
    setNotificationsEnabled(true)
    toast.success('Notificações ativadas!')
  }

  return (
    <Box sx={{
      height: '100%', position: 'relative', overflow: 'hidden',
      background: canOpenDaily
        ? 'linear-gradient(160deg, #fff1f2 0%, #ffe4e6 40%, #fdf2ff 100%)'
        : 'linear-gradient(145deg, #f4f8ff 0%, #eef4ff 45%, #f7efff 100%)',
      transition: 'background 1.8s ease',
    }}>
      <SettingsIcon sx={{
        position: 'absolute', top: -560, right: -530,
        fontSize: 980, color: canOpenDaily ? '#f43f5e' : '#b87333',
        opacity: 0.09, pointerEvents: 'none', transition: 'color 1.8s ease',
        animation: 'spin-gear 28s linear infinite',
        '@keyframes spin-gear': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
      }} />

      {FLOATING_HEARTS.map((h, i) => (
        <FavoriteIcon key={i} sx={{
          position: 'absolute', bottom: '-4px', left: h.left,
          fontSize: h.size, color: canOpenDaily ? '#f43f5e' : '#2563eb',
          opacity: h.opacity, pointerEvents: 'none', transition: 'color 1.8s ease',
          animation: `float-up-${i} ${h.dur} ${h.delay} ease-in infinite`,
          [`@keyframes float-up-${i}`]: {
            '0%':   { transform: 'translateY(0) rotate(-8deg)', opacity: 0 },
            '8%':   { opacity: h.opacity },
            '92%':  { opacity: h.opacity * 0.6 },
            '100%': { transform: 'translateY(-105vh) rotate(12deg)', opacity: 0 },
          },
        }} />
      ))}

      <Stack sx={{
        alignItems: 'center', height: '100%', justifyContent: 'center',
        px: 2.5, py: 2, gap: 2.5, position: 'relative', zIndex: 1, overflowY: 'auto',
      }}>
        <Stack spacing={0.3} alignItems="center">
          <Typography variant="h4" sx={{ color: '#1f2a44', textAlign: 'center', fontSize: '2rem', lineHeight: 1.1, letterSpacing: '-0.3px' }}>
            Potinho Digital
          </Typography>
          <Typography variant="body2" sx={{ color: '#4a5568', textAlign: 'center', fontSize: '0.93rem', lineHeight: 1.55 }}>
            {user?.name ? `Olá, ${user.name.split(' ')[0]} 💙` : 'Um potinho de bilhetinhos feito com amor.'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#a0aec0', fontSize: '0.74rem', fontStyle: 'italic' }}>
            feito por Matheus
          </Typography>
        </Stack>

        <Box sx={{ position: 'relative', width: 280, height: 280, maxWidth: '86%', flexShrink: 0 }}>
          <MuiButton
            onClick={handleOpenDailyNote}
            disabled={!canOpenDaily || openDailyNoteMutation.isPending}
            sx={{
              width: 210, height: 210, borderRadius: '50%', p: 0, minWidth: 0,
              position: 'absolute', top: 35, left: 35, zIndex: 2,
              bgcolor: 'transparent', color: 'inherit', boxShadow: 'none',
              '&::before': {
                content: '""', position: 'absolute', inset: -13, borderRadius: '50%',
                background: clockRingGradient, zIndex: -1, opacity: 0.93, transition: 'background 1.8s ease',
              },
              '&:hover:not(:disabled) .clock-face': { filter: 'brightness(1.05)' },
              '&:disabled': { opacity: 1 },
              animation: canOpenDaily ? 'pulse-clock 2.2s ease-in-out infinite' : 'none',
              '@keyframes pulse-clock': {
                '0%':   { boxShadow: '0 0 0 0 rgba(244,63,94,0.55)' },
                '65%':  { boxShadow: '0 0 0 30px rgba(244,63,94,0)' },
                '100%': { boxShadow: '0 0 0 0 rgba(244,63,94,0)' },
              },
            }}
          >
            <Box className="clock-face" sx={{
              position: 'relative', width: '100%', height: '100%', borderRadius: '50%',
              background: clockFaceGradient, border: `3.5px solid ${clockBorderColor}`,
              overflow: 'hidden', transition: 'background 1.8s ease, border-color 1.8s ease',
              boxShadow: canOpenDaily
                ? '0 0 48px rgba(244,63,94,0.28), inset 0 1px 0 rgba(255,255,255,0.65)'
                : '0 8px 36px rgba(30,64,175,0.16), inset 0 1px 0 rgba(255,255,255,0.55)',
            }}>
              <Box sx={{ position: 'absolute', inset: 13, borderRadius: '50%', border: `1.5px dashed ${canOpenDaily ? 'rgba(244,63,94,0.3)' : 'rgba(255,255,255,0.42)'}`, transition: 'border-color 1.8s ease', pointerEvents: 'none' }} />

              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30) * (Math.PI / 180)
                const r = 42
                return (
                  <Box key={i} sx={{
                    position: 'absolute', borderRadius: '50%',
                    width: i % 3 === 0 ? 4 : 2.5, height: i % 3 === 0 ? 4 : 2.5,
                    bgcolor: clockTextColor,
                    top: `${50 - Math.cos(angle) * r}%`, left: `${50 + Math.sin(angle) * r}%`,
                    transform: 'translate(-50%, -50%)',
                    opacity: i % 3 === 0 ? 0.75 : 0.45,
                    transition: 'background-color 1.8s ease', pointerEvents: 'none',
                  }} />
                )
              })}

              {CLOCK_HEARTS.map((h, i) => (
                <FavoriteIcon key={i} sx={{
                  position: 'absolute', top: h.top, left: h.left,
                  transform: `translate(-50%, -50%) rotate(${h.rotate}deg)`,
                  color: canOpenDaily ? '#f43f5e' : '#ef4444',
                  fontSize: h.size, opacity: h.opacity, zIndex: 1,
                  pointerEvents: 'none', transition: 'color 1.8s ease',
                }} />
              ))}

              {[
                { w: 4.5, h: 52, color: canOpenDaily ? '#9f1239' : '#1e293b', angle: hourAngle },
                { w: 3,   h: 70, color: canOpenDaily ? '#be123c' : '#334155', angle: minuteAngle },
                { w: 1.5, h: 82, color: canOpenDaily ? '#e11d48' : '#f59e0b', angle: secondAngle },
              ].map((hand, i) => (
                <Box key={i} sx={{
                  position: 'absolute', top: '52%', left: '50%',
                  width: hand.w, height: hand.h,
                  borderRadius: i === 2 ? 8 : '4px 4px 2px 2px',
                  bgcolor: hand.color, zIndex: 3,
                  transformOrigin: '50% 100%',
                  transform: `translate(-50%, -100%) rotate(${hand.angle}deg)`,
                  transition: 'background-color 1.8s ease', pointerEvents: 'none',
                  boxShadow: i < 2 ? '0 1px 4px rgba(0,0,0,0.22)' : 'none',
                }} />
              ))}

              <Box sx={{
                position: 'absolute', top: '52%', left: '50%',
                width: 10, height: 10, borderRadius: '50%',
                bgcolor: canOpenDaily ? '#f43f5e' : '#fbbf24',
                transform: 'translate(-50%, -50%)',
                border: `2px solid ${canOpenDaily ? '#fff1f2' : '#fef3c7'}`,
                zIndex: 4, transition: 'all 1.8s ease',
                boxShadow: canOpenDaily ? '0 0 8px rgba(244,63,94,0.7)' : '0 0 6px rgba(251,191,36,0.6)',
                pointerEvents: 'none',
              }} />

              <Typography sx={{
                position: 'absolute', bottom: 18, left: 0, right: 0, textAlign: 'center',
                color: clockTextColor, fontSize: '0.82rem', fontWeight: 700,
                letterSpacing: 1.2, fontVariantNumeric: 'tabular-nums',
                transition: 'color 1.8s ease', pointerEvents: 'none',
              }}>
                {formatClockTime(nowMs)}
              </Typography>
            </Box>
          </MuiButton>
        </Box>

        <Stack spacing={0.8} alignItems="center" sx={{ width: '100%', maxWidth: 300 }}>
          <Chip
            icon={canOpenDaily ? <AutoAwesomeIcon sx={{ fontSize: '0.95rem !important', color: '#fff !important' }} /> : undefined}
            label={nextDailyLabel}
            sx={{
              fontWeight: 700, fontSize: '0.92rem', height: 34, transition: 'all 0.4s ease',
              ...(canOpenDaily ? {
                background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                color: '#fff', boxShadow: '0 3px 14px rgba(244,63,94,0.45)',
                animation: 'chip-glow 2.2s ease-in-out infinite',
                '@keyframes chip-glow': {
                  '0%,100%': { boxShadow: '0 3px 14px rgba(244,63,94,0.4)' },
                  '50%':     { boxShadow: '0 3px 24px rgba(244,63,94,0.72)' },
                },
              } : { bgcolor: 'rgba(0,0,0,0.06)', color: '#4a5568' }),
              '& .MuiChip-label': { px: 1.2 },
            }}
          />

          {canOpenDaily && !lastDailyResult && (
            <Typography variant="caption" sx={{
              color: '#be123c', fontSize: '0.82rem', fontWeight: 600, textAlign: 'center',
              animation: 'fade-slide 0.45s cubic-bezier(0.16,1,0.3,1)',
              '@keyframes fade-slide': {
                from: { opacity: 0, transform: 'translateY(5px)' },
                to:   { opacity: 1, transform: 'translateY(0)' },
              },
            }}>
              Toque no relógio para abrir seu bilhete ✨
            </Typography>
          )}

          {lastDailyResult && (
            <Box sx={{
              width: '100%', p: 1.8, borderRadius: 3,
              background: 'rgba(255,253,251,0.94)', backdropFilter: 'blur(8px)',
              border: '1.5px solid rgba(244,63,94,0.22)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
              animation: 'card-in 0.5s cubic-bezier(0.16,1,0.3,1)',
              '@keyframes card-in': {
                from: { opacity: 0, transform: 'translateY(18px) scale(0.97)' },
                to:   { opacity: 1, transform: 'translateY(0) scale(1)' },
              },
            }}>
              <Stack spacing={0.8}>
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <FavoriteIcon sx={{ color: '#f43f5e', fontSize: 15 }} />
                  <Typography sx={{ fontWeight: 700, color: '#1f2a44', fontSize: '0.9rem' }}>
                    Bilhete do dia aberto!
                  </Typography>
                </Stack>
                <Typography sx={{ color: '#374151', fontSize: '0.97rem', fontFamily: '"Playfair Display",Georgia,serif', fontStyle: 'italic', lineHeight: 1.4 }}>
                  "{lastDailyResult.reward.title}"
                </Typography>
                <Stack direction="row" spacing={0.8} alignItems="center">
                  {(() => {
                    const cfg = rarities[lastDailyResult.reward.rarity]
                    return (
                      <Chip
                        label={cfg ? `${cfg.emoji} ${cfg.label}` : lastDailyResult.reward.rarity}
                        size="small"
                        sx={{ fontSize: '0.68rem', fontWeight: 700, height: 20, background: cfg?.chipBg, color: cfg?.chipColor }}
                      />
                    )
                  })()}
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.76rem' }}>
                    Próximo: {formatDateTime(lastDailyResult.status.availableAt)}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          )}

          <Tooltip title={notificationsEnabled ? 'Notificações já estão ativas' : 'Avisa quando o pacotinho diário liberar'} placement="top">
            <span>
              <MuiButton
                variant={notificationsEnabled ? 'contained' : 'outlined'}
                size="small"
                startIcon={<NotificationsActiveIcon sx={{ fontSize: '1rem !important' }} />}
                onClick={handleEnableNotifications}
                disabled={notificationsEnabled}
                sx={{
                  fontSize: '0.78rem', fontWeight: 600, px: 2.2, py: 0.55,
                  borderRadius: 6, opacity: notificationsEnabled ? 0.65 : 1, textTransform: 'none',
                }}
              >
                {notificationsEnabled ? 'Notificações ativas' : 'Ativar notificações'}
              </MuiButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  )
}
