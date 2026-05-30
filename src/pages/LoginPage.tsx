import FavoriteIcon from '@mui/icons-material/Favorite'
import { Alert, Box, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { api } from '../services/api'
import { Button, Input } from '../components/ui'

const fadeSlide = keyframes`
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
`

const floatHeart = (i: number) => keyframes`
  0%   { transform: translateY(0) rotate(${i % 2 === 0 ? -8 : 6}deg) scale(1); opacity: 0; }
  8%   { opacity: ${0.18 + (i % 3) * 0.05}; }
  90%  { opacity: ${0.08 + (i % 3) * 0.03}; }
  100% { transform: translateY(-100vh) rotate(${i % 2 === 0 ? 14 : -12}deg) scale(0.8); opacity: 0; }
`

const HEARTS = [
  { size: 13, left: '9%',  delay: '0s',   dur: '9s'  },
  { size: 9,  left: '24%', delay: '2.8s', dur: '11s' },
  { size: 16, left: '58%', delay: '1.2s', dur: '8.5s' },
  { size: 11, left: '78%', delay: '4.5s', dur: '10s' },
  { size: 8,  left: '43%', delay: '6.5s', dur: '7.5s' },
]

export function LoginPage() {
  const { setUser } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await api.login(email, password)
      setUser({ id: user.id, name: user.name, role: user.role as 'writer' | 'reader', token, coupleCode: user.coupleCode })
    } catch {
      setError('Email ou senha incorretos.')
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
    }}>
      <Box sx={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,78,216,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(225,29,72,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {HEARTS.map((h, i) => (
        <FavoriteIcon key={i} sx={{
          position: 'absolute', bottom: 0, left: h.left,
          fontSize: h.size,
          color: i % 2 === 0 ? '#1d4ed8' : '#e11d48',
          animation: `${floatHeart(i)} ${h.dur} ${h.delay} ease-in infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      <Stack sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', px: 3, py: 5, animation: `${fadeSlide} 0.5s ease both` }} spacing={0}>
        <FavoriteIcon sx={{ fontSize: 52, color: '#e11d48', filter: 'drop-shadow(0 4px 16px rgba(225,29,72,0.4))', mb: 3 }} />

        <Typography sx={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '2.8rem', lineHeight: 1, color: '#1e3a5f', textAlign: 'center', letterSpacing: '-0.5px' }}>
          Potinho
        </Typography>
        <Typography sx={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '2.8rem', lineHeight: 1, color: '#1d4ed8', textAlign: 'center', letterSpacing: '-0.5px', mb: 1.5 }}>
          Digital
        </Typography>

        <Box sx={{ width: 40, height: 3, borderRadius: 2, background: 'linear-gradient(90deg, #1d4ed8, #e11d48)', mb: 1.5 }} />

        <Typography sx={{ fontSize: '0.88rem', color: 'rgba(30,58,95,0.5)', fontStyle: 'italic', mb: 5 }}>
          sua memória afetiva
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 320 }}>
          <Stack spacing={2}>
            {error && <Alert severity="error" sx={{ borderRadius: 2.5, fontSize: '0.82rem', py: 0.5 }}>{error}</Alert>}
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" fullWidth required />
            <Input label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" fullWidth required />
            <Button variant="primary" type="submit" fullWidth loading={loading} sx={{ mt: 0.5 }}>
              Entrar
            </Button>
          </Stack>
        </Box>

        <Typography variant="body2" sx={{ mt: 3.5, color: 'rgba(30,58,95,0.5)', fontSize: '0.85rem' }}>
          Ainda não tem conta?{' '}
          <Link to="/register" style={{ color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' }}>Criar conta</Link>
        </Typography>
      </Stack>
    </Box>
  )
}
