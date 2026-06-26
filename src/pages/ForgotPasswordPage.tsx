import FavoriteIcon from '@mui/icons-material/Favorite'
import LockResetIcon from '@mui/icons-material/LockReset'
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead'
import { Box, Stack, Typography } from '@mui/material'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Turnstile } from '@marsidev/react-turnstile'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { api } from '../services/api'
import { useRetryAfter } from '../hooks/useRetryAfter'
import { Button, Input } from '../components/ui'
import { fadeSlide, floatHeart, font } from '../design-system'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

const HEARTS = [
  { size: 18, left: '9%',  delay: '0s',   dur: '14s' },
  { size: 22, left: '35%', delay: '3s',   dur: '12s' },
  { size: 15, left: '65%', delay: '1.5s', dur: '13s' },
  { size: 20, left: '84%', delay: '5.5s', dur: '11s' },
]

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(SITE_KEY ? null : 'bypass')
  const widgetRef = useRef<TurnstileInstance>(null)
  const retry = useRetryAfter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const t = captchaToken
    if (!email.trim() || !t || retry.blocked) return
    setCaptchaToken(null)
    if (SITE_KEY) widgetRef.current?.reset()
    setError('')
    setLoading(true)
    try {
      await api.forgotPassword(email.trim(), t)
      setSent(true)
    } catch (err: unknown) {
      retry.captureFromError(err)
      setError((err as Error).message || 'Erro ao enviar email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative',
      overflowX: 'hidden', overflowY: 'auto',
      background: 'linear-gradient(160deg, #dbeafe 0%, #fce7f3 55%, #ede9fe 100%)',
    }}>
      <Box sx={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,78,216,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(225,29,72,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      {HEARTS.map((h, i) => (
        <FavoriteIcon key={i} sx={{
          position: 'absolute', bottom: -8, left: h.left, fontSize: h.size, zIndex: 0,
          color: i % 2 === 0 ? '#1d4ed8' : '#e11d48', filter: 'blur(0.5px)',
          animation: `${floatHeart(i)} ${h.dur} ${h.delay} ease-in infinite`, pointerEvents: 'none',
        }} />
      ))}

      <Stack sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', px: 3, py: 5, animation: `${fadeSlide} 0.5s ease both` }} spacing={0}>
        {sent ? (
          <Stack alignItems="center" spacing={2.5} sx={{ maxWidth: 320, width: '100%' }}>
            <MarkEmailReadIcon sx={{ fontSize: 64, color: '#1d4ed8', filter: 'drop-shadow(0 4px 16px rgba(29,78,216,0.3))' }} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.8rem', color: '#1e3a5f', textAlign: 'center' }}>
              Email enviado!
            </Typography>
            <Typography sx={{ fontSize: '0.88rem', color: 'rgba(30,58,95,0.65)', textAlign: 'center', lineHeight: 1.6 }}>
              Se existe uma conta com <strong>{email}</strong>, você receberá um link para redefinir sua senha.
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: 'rgba(30,58,95,0.4)', textAlign: 'center' }}>
              Verifique também a pasta de spam.
            </Typography>
            <Typography sx={{ mt: 1, fontSize: '0.85rem', color: 'rgba(30,58,95,0.5)' }}>
              <Link to="/login" style={{ color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' }}>Voltar ao login</Link>
            </Typography>
          </Stack>
        ) : (
          <Stack alignItems="center" spacing={0} sx={{ maxWidth: 320, width: '100%' }}>
            <LockResetIcon sx={{ fontSize: 52, color: '#1d4ed8', filter: 'drop-shadow(0 4px 16px rgba(29,78,216,0.35))', mb: 3 }} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '2rem', lineHeight: 1, color: '#1e3a5f', textAlign: 'center', letterSpacing: '-0.5px' }}>
              Esqueci minha
            </Typography>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '2rem', lineHeight: 1, color: '#1d4ed8', textAlign: 'center', letterSpacing: '-0.5px', mb: 1.5 }}>
              senha
            </Typography>
            <Box sx={{ width: 40, height: 3, borderRadius: 2, background: 'linear-gradient(90deg, #1d4ed8, #e11d48)', mb: 3 }} />
            <Typography sx={{ fontSize: '0.88rem', color: 'rgba(30,58,95,0.6)', textAlign: 'center', mb: 3, lineHeight: 1.6 }}>
              Digite seu email e enviaremos um link para criar uma nova senha.
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <Stack spacing={2}>
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" fullWidth required />
                {SITE_KEY && (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Turnstile
                      ref={widgetRef}
                      siteKey={SITE_KEY}
                      onSuccess={setCaptchaToken}
                      onError={() => setCaptchaToken(null)}
                      onExpire={() => setCaptchaToken(null)}
                      options={{ size: 'normal', language: 'pt-BR', theme: 'auto' }}
                    />
                  </Box>
                )}
                <Button variant="primary" type="submit" fullWidth loading={loading} disabled={!email.trim() || !captchaToken || retry.blocked}>
                  {retry.blocked ? `Aguarde ${retry.label}` : 'Enviar link'}
                </Button>
                {error && (
                  <Box sx={{ px: 1.5, py: 1, borderRadius: '10px', background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.2)' }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#e11d48', fontWeight: 600 }}>{error}</Typography>
                  </Box>
                )}
              </Stack>
            </Box>
            <Typography sx={{ mt: 3.5, fontSize: '0.85rem', color: 'rgba(30,58,95,0.5)' }}>
              Lembrou?{' '}
              <Link to="/login" style={{ color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' }}>Entrar</Link>
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
