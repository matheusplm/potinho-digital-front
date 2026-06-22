import FavoriteIcon from '@mui/icons-material/Favorite'
import { Box, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useRef, useState } from 'react'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { api } from '../services/api'
import { Button, Input, TurnstileWidget, toast } from '../components/ui'
import { ScrollHint } from '../components/ui/ScrollHint'
import { font } from '../design-system'

const fadeSlide = keyframes`
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
`

const floatHeart = (i: number) => keyframes`
  0%   { transform: translateY(0) rotate(${i % 2 === 0 ? -6 : 5}deg); opacity: 0; }
  10%  { opacity: ${0.06 + (i % 3) * 0.02}; }
  85%  { opacity: ${0.04 + (i % 3) * 0.01}; }
  100% { transform: translateY(-100vh) rotate(${i % 2 === 0 ? 10 : -8}deg); opacity: 0; }
`

const HEARTS = [
  { size: 20, left: '7%',  delay: '0s',    dur: '12s' },
  { size: 14, left: '23%', delay: '3.5s',  dur: '15s' },
  { size: 24, left: '57%', delay: '1.5s',  dur: '11s' },
  { size: 16, left: '77%', delay: '5.5s',  dur: '13s' },
  { size: 12, left: '42%', delay: '8s',    dur: '14s' },
]

export function LoginPage() {
  const { setUser } = useUser()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaStatus, setCaptchaStatus] = useState<'pending' | 'verified' | 'error'>('pending')
  const turnstileRef = useRef<TurnstileInstance>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!captchaToken) return
    setError('')
    setLoading(true)
    try {
      const { token, refreshToken, user } = await api.login(email, password, captchaToken)
      setUser({ id: user.id, name: user.name, email: user.email, role: user.role as 'writer' | 'reader', token, refreshToken, onboardingDone: user.onboardingDone })
      toast.success(`Bem-vindo, ${user.name.split(' ')[0]}! 💙`)
      navigate('/home')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao fazer login.'
      setError(msg)
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
      overflow: 'hidden',
      background: 'linear-gradient(160deg, #dbeafe 0%, #fce7f3 55%, #ede9fe 100%)',
      overflowX: 'hidden',
      overflowY: 'auto',
    }}>
      <Box sx={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,78,216,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(225,29,72,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {HEARTS.map((h, i) => (
        <FavoriteIcon key={i} sx={{
          position: 'absolute', bottom: -8, left: h.left,
          fontSize: h.size, zIndex: 0,
          color: i % 2 === 0 ? '#1d4ed8' : '#e11d48',
          filter: 'blur(0.5px)',
          animation: `${floatHeart(i)} ${h.dur} ${h.delay} ease-in infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      <Stack sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', px: 3, py: 5, animation: `${fadeSlide} 0.5s ease both` }} spacing={0}>
        <FavoriteIcon sx={{ fontSize: 52, color: '#e11d48', filter: 'drop-shadow(0 4px 16px rgba(225,29,72,0.4))', mb: 3 }} />

        <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '2.8rem', lineHeight: 1, color: '#1e3a5f', textAlign: 'center', letterSpacing: '-0.5px' }}>
          Potinho
        </Typography>
        <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '2.8rem', lineHeight: 1, color: '#1d4ed8', textAlign: 'center', letterSpacing: '-0.5px', mb: 1.5 }}>
          Digital
        </Typography>

        <Box sx={{ width: 40, height: 3, borderRadius: 2, background: 'linear-gradient(90deg, #1d4ed8, #e11d48)', mb: 1.5 }} />

        <Typography sx={{ fontSize: '0.88rem', color: 'rgba(30,58,95,0.5)', fontStyle: 'italic', mb: 5 }}>
          sua memória afetiva
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 320 }}>
          <Stack spacing={2}>
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" fullWidth required />
            <Input label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" fullWidth required />
            <TurnstileWidget
              ref={turnstileRef}
              status={captchaStatus}
              onSuccess={(t) => { setCaptchaToken(t); setCaptchaStatus('verified') }}
              onError={() => { setCaptchaToken(null); setCaptchaStatus('error') }}
              onExpire={() => { setCaptchaToken(null); setCaptchaStatus('pending') }}
            />
            <Button variant="primary" type="submit" fullWidth loading={loading} disabled={!captchaToken} sx={{ mt: 0.5 }}>
              Entrar
            </Button>
            {error && (
              <Box sx={{ mt: 0.5, px: 1.5, py: 1, borderRadius: '10px', background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.2)' }}>
                <Typography sx={{ fontSize: '0.8rem', color: '#e11d48', fontWeight: 600 }}>
                  {error}
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>

        <Typography variant="body2" sx={{ mt: 3.5, color: 'rgba(30,58,95,0.5)', fontSize: '0.85rem' }}>
          Ainda não tem conta?{' '}
          <Link to="/register" style={{ color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' }}>Criar conta</Link>
        </Typography>
      </Stack>
      <ScrollHint />
    </Box>
  )
}
