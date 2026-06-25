import FavoriteIcon from '@mui/icons-material/Favorite'
import { Box, Stack, Typography } from '@mui/material'
import { useRef, useState } from 'react'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../services/api'
import { Button, Input, TurnstileWidget, toast } from '../components/ui'
import { ScrollHint } from '../components/ui/ScrollHint'
import { fadeSlide, floatHeart, font } from '../design-system'

const HEARTS = [
  { size: 18, left: '11%', delay: '0s',   dur: '13s' },
  { size: 22, left: '33%', delay: '4s',   dur: '11s' },
  { size: 15, left: '67%', delay: '2s',   dur: '14s' },
  { size: 20, left: '85%', delay: '6.5s', dur: '12s' },
]

export function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [confirmTouched, setConfirmTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaStatus, setCaptchaStatus] = useState<'pending' | 'verified' | 'error'>('pending')
  const turnstileRef = useRef<TurnstileInstance>(null)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const passwordError = passwordTouched && form.password.length < 6
  const confirmError = confirmTouched && form.confirm !== form.password

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 6) { setPasswordTouched(true); return }
    if (form.confirm !== form.password) { setConfirmTouched(true); return }
    if (!captchaToken) return
    setLoading(true)
    try {
      await api.register(form.name, form.email, form.password, captchaToken)
      toast.success('Conta criada!', { description: 'Agora é só entrar.' })
      navigate('/login')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar conta.'
      toast.error(msg)
      turnstileRef.current?.reset()
      setCaptchaToken(null)
      setCaptchaStatus('pending')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflowX: 'hidden',
      overflowY: 'auto',
      background: 'linear-gradient(160deg, #dbeafe 0%, #fce7f3 55%, #ede9fe 100%)',
    }}>
      <Box sx={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,78,216,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {HEARTS.map((h, i) => (
        <FavoriteIcon key={i} sx={{
          position: 'absolute', bottom: -8, left: h.left,
          fontSize: h.size, zIndex: 0,
          color: i % 2 === 0 ? '#1d4ed8' : '#7c3aed',
          filter: 'blur(0.5px)',
          animation: `${floatHeart(i)} ${h.dur} ${h.delay} ease-in infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      <Stack sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', px: 3, py: 5, animation: `${fadeSlide} 0.5s ease both` }} spacing={0}>
        <FavoriteIcon sx={{
          fontSize: 52,
          color: '#1d4ed8',
          filter: 'drop-shadow(0 4px 16px rgba(29,78,216,0.4))',
          mb: 3,
        }} />

        <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '2.8rem', lineHeight: 1, color: '#1e3a5f', textAlign: 'center', letterSpacing: '-0.5px' }}>
          Criar
        </Typography>
        <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '2.8rem', lineHeight: 1, color: '#1d4ed8', textAlign: 'center', letterSpacing: '-0.5px', mb: 1.5 }}>
          Conta
        </Typography>

        <Box sx={{ width: 40, height: 3, borderRadius: 2, background: 'linear-gradient(90deg, #1d4ed8, #e11d48)', mb: 4 }} />

        <Box sx={{ width: '100%', maxWidth: 320 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <Input label="Seu nome" value={form.name} onChange={set('name')} placeholder="Como te chamamos?" fullWidth required />
              <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="seu@email.com" fullWidth required />
              <Input
                label="Senha" type="password" value={form.password}
                onChange={set('password')} onBlur={() => setPasswordTouched(true)}
                placeholder="••••••••" fullWidth required
                error={passwordError}
                helperText={passwordError ? 'Mínimo de 6 caracteres' : undefined}
              />
              <Input
                label="Confirmar senha" type="password" value={form.confirm}
                onChange={set('confirm')} onBlur={() => setConfirmTouched(true)}
                placeholder="••••••••" fullWidth required
                error={confirmError}
                helperText={confirmError ? 'As senhas não coincidem' : undefined}
              />
              <TurnstileWidget
                ref={turnstileRef}
                status={captchaStatus}
                onSuccess={(t) => { setCaptchaToken(t); setCaptchaStatus('verified') }}
                onError={() => { setCaptchaToken(null); setCaptchaStatus('error') }}
                onExpire={() => { setCaptchaToken(null); setCaptchaStatus('pending') }}
              />
              <Button
                variant="primary"
                type="submit" fullWidth loading={loading} disabled={!captchaToken} sx={{ mt: 0.5 }}
              >
                Criar conta
              </Button>
            </Stack>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ mt: 3.5, color: 'rgba(30,58,95,0.5)', fontSize: '0.85rem' }}>
          Já tem conta?{' '}
          <Link to="/login" style={{ color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' }}>Entrar</Link>
        </Typography>
      </Stack>
      <ScrollHint />
    </Box>
  )
}
