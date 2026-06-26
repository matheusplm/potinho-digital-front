import FavoriteIcon from '@mui/icons-material/Favorite'
import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Turnstile } from '@marsidev/react-turnstile'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { api } from '../services/api'
import { Button, Input, toast } from '../components/ui'
import { ScrollHint } from '../components/ui/ScrollHint'
import { fadeSlide, floatHeart, font } from '../design-system'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

const USERNAME_RE = /^[a-z0-9_]+$/

const HEARTS = [
  { size: 18, left: '11%', delay: '0s',   dur: '13s' },
  { size: 22, left: '33%', delay: '4s',   dur: '11s' },
  { size: 15, left: '67%', delay: '2s',   dur: '14s' },
  { size: 20, left: '85%', delay: '6.5s', dur: '12s' },
]

export function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '', confirm: '' })
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [confirmTouched, setConfirmTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(SITE_KEY ? null : 'bypass')
  const widgetRef = useRef<TurnstileInstance>(null)
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle')
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase()
    setForm((f) => ({ ...f, username: value }))
    if (usernameTimer.current) clearTimeout(usernameTimer.current)
    if (!value.trim()) { setUsernameStatus('idle'); return }
    if (!USERNAME_RE.test(value) || value.length < 3) { setUsernameStatus('invalid'); return }
    setUsernameStatus('checking')
    usernameTimer.current = setTimeout(async () => {
      try {
        const { available } = await api.checkUsername(value.trim())
        setUsernameStatus(available ? 'available' : 'taken')
      } catch {
        setUsernameStatus('idle')
      }
    }, 700)
  }

  const passwordError = passwordTouched && form.password.length < 6
  const confirmError = confirmTouched && form.confirm !== form.password

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (usernameStatus === 'taken' || usernameStatus === 'invalid') return
    if (form.password.length < 6) { setPasswordTouched(true); return }
    if (form.confirm !== form.password) { setConfirmTouched(true); return }
    const t = captchaToken
    if (!t) return
    setCaptchaToken(null)
    if (SITE_KEY) widgetRef.current?.reset()
    setLoading(true)
    try {
      const username = form.username.trim() || undefined
      await api.register(form.name, form.email, form.password, t, username)
      toast.success('Conta criada!', { description: 'Verifique seu email para ativar.' })
      navigate(`/verificar-email?email=${encodeURIComponent(form.email)}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar conta.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const usernameHelperText = () => {
    if (usernameStatus === 'checking') return ''
    if (usernameStatus === 'available') return '✓ disponível'
    if (usernameStatus === 'taken') return 'já está em uso'
    if (usernameStatus === 'invalid') return 'Apenas letras minúsculas, números e _ (mín. 3 caracteres)'
    return 'Identificador único. Pode ser definido depois.'
  }

  const usernameHelperColor = () => {
    if (usernameStatus === 'available') return '#22c55e'
    if (usernameStatus === 'taken' || usernameStatus === 'invalid') return '#e11d48'
    return 'rgba(30,58,95,0.45)'
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
        <FavoriteIcon sx={{ fontSize: 52, color: '#1d4ed8', filter: 'drop-shadow(0 4px 16px rgba(29,78,216,0.4))', mb: 3 }} />

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
              <Box>
                <Input
                  label="Username (opcional)"
                  value={form.username}
                  onChange={handleUsernameChange}
                  placeholder="@meunome"
                  fullWidth
                  inputProps={{ maxLength: 30 }}
                  error={usernameStatus === 'taken' || usernameStatus === 'invalid'}
                  InputProps={usernameStatus === 'checking' ? {
                    endAdornment: <CircularProgress size={14} sx={{ color: 'rgba(30,58,95,0.35)', mr: 0.5 }} />,
                  } : undefined}
                />
                <Typography sx={{ fontSize: '0.72rem', color: usernameHelperColor(), mt: 0.5, pl: 0.5, fontWeight: usernameStatus === 'idle' ? 400 : 600 }}>
                  {usernameHelperText()}
                </Typography>
              </Box>
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
              {SITE_KEY && (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Turnstile
                    ref={widgetRef}
                    siteKey={SITE_KEY}
                    onSuccess={setCaptchaToken}
                    onError={() => setCaptchaToken(null)}
                    onExpire={() => setCaptchaToken(null)}
                    options={{ size: 'normal', language: 'pt-BR', theme: 'light' }}
                  />
                </Box>
              )}
              <Button
                variant="primary" type="submit" fullWidth loading={loading}
                disabled={!captchaToken || usernameStatus === 'taken' || usernameStatus === 'checking' || usernameStatus === 'invalid'}
                sx={{ mt: 0.5 }}
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
