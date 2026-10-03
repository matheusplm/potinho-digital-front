import { Box, Stack, Typography } from '@mui/material'
import { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Turnstile } from '@marsidev/react-turnstile'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { useUser } from '../context/UserContext'
import { api } from '../services/api'
import { Button, Input, PasswordInput, toast } from '../components/ui'
import { GoogleSignInButton } from '../components/GoogleSignInButton'
import { ScrollHint } from '../components/ui/ScrollHint'
import { FloatingParticles } from '../components/FloatingParticles'
import { useBackground } from '../context/BackgroundContext'
import { BrandLogo, Copyright } from '../components/Brand'
import { brandAccent, brandGradient, colors, fadeSlide, font, gradients } from '../design-system'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

export function RegisterPage() {
  const darkTheme = useBackground().theme.isDark
  const navigate = useNavigate()
  const { setUser } = useUser()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(SITE_KEY ? null : 'bypass')
  const widgetRef = useRef<TurnstileInstance>(null)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const passwordError = passwordTouched && form.password.length < 6

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 6) { setPasswordTouched(true); return }
    const t = captchaToken
    if (!t) return
    setCaptchaToken(null)
    if (SITE_KEY) widgetRef.current?.reset()
    setLoading(true)
    try {
      await api.register(form.name, form.email, form.password, t)
      toast.success('Conta criada!', { description: 'Verifique seu email para ativar.' })
      navigate(`/verificar-email?email=${encodeURIComponent(form.email)}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar conta.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async (idToken: string) => {
    setLoading(true)
    try {
      const { token, refreshToken, user } = await api.googleLogin(idToken)
      setUser({ id: user.id, name: user.name, email: user.email, role: user.role as 'writer' | 'reader', token, refreshToken, onboardingDone: user.onboardingDone })
      toast.success(`Bem-vindo, ${user.name.split(' ')[0]}! 💙`)
      navigate('/home')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao entrar com o Google.')
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
      background: gradients.page,
    }}>
      <Box sx={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,78,216,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <FloatingParticles />

      <Stack sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', px: 3, py: 5, position: 'relative', zIndex: 1, animation: `${fadeSlide} 0.5s ease both` }} spacing={0}>
        <BrandLogo size={72} sx={{ mb: 3 }} />

        <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '2.8rem', lineHeight: 1, color: colors.text.primary, textAlign: 'center', letterSpacing: '-0.5px' }}>
          Criar
        </Typography>
        <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '2.8rem', lineHeight: 1.05, textAlign: 'center', letterSpacing: '-0.5px', mb: 1.5, ...brandAccent() }}>
          Conta
        </Typography>

        <Box sx={{ width: 40, height: 3, borderRadius: 2, background: brandGradient(), mb: 4 }} />

        <Box sx={{ width: '100%', maxWidth: 320 }}>
          <GoogleSignInButton onCredential={handleGoogle} disabled={loading} />
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <Input label="Seu nome" value={form.name} onChange={set('name')} placeholder="Como te chamamos?" fullWidth required />
              <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="seu@email.com" autoComplete="email" fullWidth required />
              <PasswordInput
                label="Senha" value={form.password}
                onChange={set('password')} onBlur={() => setPasswordTouched(true)}
                placeholder="Mínimo de 6 caracteres" autoComplete="new-password" fullWidth required
                error={passwordError}
                helperText={passwordError ? 'Mínimo de 6 caracteres' : undefined}
              />
              {SITE_KEY && (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Turnstile
                    ref={widgetRef}
                    siteKey={SITE_KEY}
                    onSuccess={setCaptchaToken}
                    onError={() => setCaptchaToken(null)}
                    onExpire={() => setCaptchaToken(null)}
                    options={{ size: 'normal', language: 'pt-BR', theme: darkTheme ? 'dark' : 'light' }}
                  />
                </Box>
              )}
              <Button
                variant="primary" type="submit" fullWidth loading={loading}
                disabled={!captchaToken}
                sx={{ mt: 0.5 }}
              >
                Criar conta
              </Button>
              <Typography variant="xs" sx={{ color: colors.text.muted, textAlign: 'center', lineHeight: 1.5, '& a': { color: colors.primary.text, fontWeight: 700, textDecoration: 'none' } }}>
                Ao criar a conta, você concorda com os <Link to="/termos">Termos de uso</Link> e a <Link to="/privacidade">Política de privacidade</Link>.
              </Typography>
            </Stack>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ mt: 3.5, color: colors.text.secondary, fontSize: '0.85rem' }}>
          Já tem conta?{' '}
          <Link to="/login" style={{ color: colors.primary.text, fontWeight: 700, textDecoration: 'none' }}>Entrar</Link>
        </Typography>
        <Copyright sx={{ mt: 4 }} />
      </Stack>
      <ScrollHint />
    </Box>
  )
}
