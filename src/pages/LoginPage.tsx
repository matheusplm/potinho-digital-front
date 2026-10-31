import { Box, Stack, Typography } from '@mui/material'
import { useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Turnstile } from '@marsidev/react-turnstile'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { useUser } from '../context/UserContext'
import { api, ApiRequestError } from '../services/api'
import { safeRedirect } from '../utils/safeRedirect'
import { Button, Input, PasswordInput, toast } from '../components/ui'
import { GoogleSignInButton } from '../components/GoogleSignInButton'
import { useBackground } from '../context/BackgroundContext'
import { BrandName, Copyright } from '../components/Brand'
import { OutsideScene, ViewPicker } from '../components/scene/OutsideScene'
import { BRAND_TAGLINE, colors, fadeSlide, font, radius } from '../design-system'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined


export function LoginPage() {
  const { theme } = useBackground()
  const darkTheme = theme.isDark
  const { setUser } = useUser()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromPath = safeRedirect(searchParams.get('from'))
  const [captchaToken, setCaptchaToken] = useState<string | null>(SITE_KEY ? null : 'bypass')
  const widgetRef = useRef<TurnstileInstance>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notVerified, setNotVerified] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const t = captchaToken
    if (!t) return
    setCaptchaToken(null)
    if (SITE_KEY) widgetRef.current?.reset()
    setError('')
    setNotVerified(false)
    setLoading(true)
    try {
      const { token, refreshToken, user } = await api.login(email, password, t)
      setUser({ id: user.id, name: user.name, email: user.email, role: user.role as 'writer' | 'reader', token, refreshToken, onboardingDone: user.onboardingDone })
      toast.success(`Bem-vindo, ${user.name.split(' ')[0]}! 💙`)
      navigate(fromPath)
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === 'EMAIL_NOT_VERIFIED') {
        setNotVerified(true)
        setError(err.message)
      } else {
        const msg = err instanceof Error ? err.message : 'Erro ao fazer login.'
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async (idToken: string) => {
    setError('')
    setNotVerified(false)
    setLoading(true)
    try {
      const { token, refreshToken, user } = await api.googleLogin(idToken)
      setUser({ id: user.id, name: user.name, email: user.email, role: user.role as 'writer' | 'reader', token, refreshToken, onboardingDone: user.onboardingDone })
      toast.success(`Bem-vindo, ${user.name.split(' ')[0]}! 💙`)
      navigate(fromPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar com o Google.')
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
    }}>
      <OutsideScene />

      <Stack sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', px: 2, pt: 3, pb: { xs: 18, sm: 3 }, position: 'relative', zIndex: 1, animation: `${fadeSlide} 0.5s ease both` }} spacing={2.5}>
        <Stack alignItems="center" sx={{
          width: '100%', maxWidth: 380, px: { xs: 2.5, sm: 3.5 }, pt: 3, pb: 2.5,
          background: theme.surfaceBg, border: `1.5px solid ${theme.surfaceBorder}`, borderRadius: radius.md,
          boxShadow: '4px 6px 0 rgba(0,0,0,0.18), 0 24px 40px -24px rgba(0,0,0,0.45)',
        }}>

        <Typography component="h1" sx={{ m: 0 }}>
          <BrandName size="2.3rem" sx={{ textAlign: 'center' }} />
        </Typography>

        <Typography sx={{ fontFamily: font.hand, fontSize: '1.35rem', color: colors.text.secondary, mt: 0.5, mb: 3 }}>
          {BRAND_TAGLINE}
        </Typography>

        <GoogleSignInButton onCredential={handleGoogle} disabled={loading} />

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 320 }}>
          <Stack spacing={2}>
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" fullWidth required />
            <Box>
              <PasswordInput label="Senha" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" autoComplete="current-password" fullWidth required />
              <Typography sx={{ mt: 0.5, textAlign: 'right' }}>
                <Link to="/esqueci-minha-senha" style={{ color: colors.primary.text, fontSize: '0.78rem', textDecoration: 'none', fontWeight: 600 }}>
                  Esqueci minha senha
                </Link>
              </Typography>
            </Box>
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
            <Button variant="primary" type="submit" fullWidth loading={loading} disabled={!captchaToken} sx={{ mt: 0.5 }}>
              Entrar
            </Button>
            {error && (
              <Box sx={{ mt: 0.5, px: 1.5, py: 1, borderRadius: '10px', background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.2)' }}>
                <Typography variant="md" sx={{ color: colors.rose.text, fontWeight: 600 }}>
                  {error}
                </Typography>
                {notVerified && (
                  <Typography
                    variant="md"
                    component="span"
                    onClick={() => { navigate(`/verificar-email?email=${encodeURIComponent(email)}`) }}
                    sx={{ display: 'block', mt: 0.5, color: colors.primary.text, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Reenviar email de confirmação
                  </Typography>
                )}
              </Box>
            )}
          </Stack>
        </Box>

        <Typography variant="body2" sx={{ mt: 3, color: colors.text.secondary, fontSize: '0.85rem' }}>
          Ainda não tem conta?{' '}
          <Link to="/register" style={{ color: colors.primary.text, fontWeight: 700, textDecoration: 'none' }}>Criar conta</Link>
        </Typography>
          <Copyright sx={{ mt: 2.5 }} />
        </Stack>
        <ViewPicker />
      </Stack>
    </Box>
  )
}
