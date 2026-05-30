import FavoriteIcon from '@mui/icons-material/Favorite'
import { Box, Button, CircularProgress, Stack, TextField, Typography, Alert } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useState } from 'react'
import { useUser } from '../context/UserContext'
import { api } from '../services/api'
import { Link } from 'react-router-dom'

const floatUp = (i: number) => keyframes`
  0%   { transform: translateY(0) rotate(${i % 2 === 0 ? -6 : 6}deg); opacity: 0; }
  8%   { opacity: ${0.1 + i * 0.02}; }
  92%  { opacity: ${(0.1 + i * 0.02) * 0.5}; }
  100% { transform: translateY(-100vh) rotate(${i % 2 === 0 ? 12 : -10}deg); opacity: 0; }
`

const HEARTS = [
  { size: 14, left: '8%',  delay: '0s',   dur: '8s'  },
  { size: 10, left: '22%', delay: '2.5s', dur: '11s' },
  { size: 18, left: '65%', delay: '1s',   dur: '9s'  },
  { size: 12, left: '82%', delay: '4s',   dur: '10s' },
  { size: 8,  left: '45%', delay: '6s',   dur: '7s'  },
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
      background: 'linear-gradient(160deg, #0f2a6e 0%, #1d4ed8 40%, #be185d 100%)',
    }}>
      <FavoriteIcon sx={{
        position: 'absolute',
        fontSize: 420,
        color: 'rgba(255,255,255,0.04)',
        top: -100, right: -80,
        pointerEvents: 'none',
      }} />

      {HEARTS.map((h, i) => (
        <FavoriteIcon key={i} sx={{
          position: 'absolute', bottom: '40%', left: h.left,
          fontSize: h.size, color: 'rgba(255,255,255,0.35)',
          animation: `${floatUp(i)} ${h.dur} ${h.delay} ease-in infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      <Stack alignItems="center" justifyContent="center" sx={{ flex: 1, px: 3, pb: 2, zIndex: 1 }}>
        <Stack alignItems="center" spacing={1.5}>
          <Box sx={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid rgba(255,255,255,0.25)',
          }}>
            <FavoriteIcon sx={{ fontSize: 28, color: '#fff' }} />
          </Box>
          <Typography sx={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: '2rem',
            color: '#fff',
            lineHeight: 1.1,
            textAlign: 'center',
          }}>
            Potinho Digital
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', fontStyle: 'italic' }}>
            sua memória afetiva
          </Typography>
        </Stack>
      </Stack>

      <Box sx={{
        borderRadius: '28px 28px 0 0',
        background: '#faf9f8',
        px: 3,
        pt: 3.5,
        pb: 4,
        zIndex: 1,
        boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
      }}>
        <Typography sx={{
          fontFamily: '"Playfair Display",serif',
          fontWeight: 700,
          fontSize: '1.35rem',
          color: '#1e3a5f',
          mb: 0.5,
        }}>
          Entrar
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5, fontSize: '0.85rem' }}>
          Bem-vindo de volta 💙
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={1.8}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2, fontSize: '0.82rem', py: 0.5 }}>
                {error}
              </Alert>
            )}
            <TextField
              label="Email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth required size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
            />
            <TextField
              label="Senha" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth required size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
            />
            <Button
              type="submit" variant="contained" fullWidth disabled={loading}
              sx={{
                borderRadius: 2, py: 1.2, mt: 0.5,
                fontWeight: 700, textTransform: 'none', fontSize: '0.95rem',
                background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
                boxShadow: '0 4px 14px rgba(29,78,216,0.35)',
              }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Entrar'}
            </Button>
          </Stack>
        </Box>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2.5, color: '#94a3b8' }}>
          Ainda não tem conta?{' '}
          <Link to="/register" style={{ color: '#1d4ed8', fontWeight: 600, textDecoration: 'none' }}>
            Criar conta
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}
