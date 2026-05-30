import FavoriteIcon from '@mui/icons-material/Favorite'
import { Box, Button, CircularProgress, Stack, TextField, Typography, Alert } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useState } from 'react'
import { useUser } from '../context/UserContext'
import { api } from '../services/api'
import { Link } from 'react-router-dom'

const floatUp = (dx: number, dy: number) => keyframes`
  0%   { transform: translate(0,0) scale(1); opacity: 0.18; }
  50%  { transform: translate(${dx * 0.5}px,${dy * 0.5}px) scale(1.1); opacity: 0.28; }
  100% { transform: translate(${dx}px,${dy}px) scale(1); opacity: 0.18; }
`

const HEARTS = [
  { size: 18, top: '10%', left: '8%',   delay: '0s',    dur: '4.2s', dx: 6,  dy: -8  },
  { size: 12, top: '20%', right: '10%', delay: '1.1s',  dur: '3.8s', dx: -5, dy: 10  },
  { size: 22, top: '55%', left: '5%',   delay: '0.6s',  dur: '5.0s', dx: 8,  dy: -6  },
  { size: 14, top: '72%', right: '8%',  delay: '2.0s',  dur: '4.5s', dx: -6, dy: 8   },
  { size: 10, top: '40%', left: '14%',  delay: '1.5s',  dur: '3.6s', dx: 4,  dy: -10 },
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
      setUser({ id: user.id, name: user.name, role: user.role as 'writer' | 'reader', token })
    } catch (err) {
      setError('Email ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100dvh', width: '100%',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(145deg,#eff6ff 0%,#fce7f3 50%,#fdf4ff 100%)',
    }}>
      <FavoriteIcon sx={{ position: 'absolute', fontSize: 480, color: 'rgba(244,114,182,0.06)', bottom: -80, right: -80, pointerEvents: 'none' }} />

      {HEARTS.map((h, i) => (
        <FavoriteIcon key={i} sx={{
          position: 'absolute', fontSize: h.size,
          top: h.top, left: 'left' in h ? h.left : undefined, right: 'right' in h ? h.right : undefined,
          color: i % 2 === 0 ? 'rgba(29,78,216,0.22)' : 'rgba(244,114,182,0.26)',
          animation: `${floatUp(h.dx, h.dy)} ${h.dur} ease-in-out ${h.delay} infinite alternate`,
          pointerEvents: 'none',
        }} />
      ))}

      <Stack alignItems="center" spacing={1} sx={{ mb: 4, zIndex: 1 }}>
        <FavoriteIcon sx={{ fontSize: 40, color: '#e11d48', filter: 'drop-shadow(0 2px 8px rgba(225,29,72,0.35))' }} />
        <Typography variant="h4" sx={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, color: '#1e3a5f' }}>
          Potinho Digital
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(30,58,95,0.5)', fontStyle: 'italic' }}>
          bem-vindo de volta, meu amor
        </Typography>
      </Stack>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          zIndex: 1, width: '100%', maxWidth: 340, px: 3,
          display: 'flex', flexDirection: 'column', gap: 2,
        }}
      >
        <Box sx={{
          background: 'rgba(255,253,251,0.88)', backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', p: 3,
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2, fontSize: '0.82rem' }}>{error}</Alert>}
          <TextField
            label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            fullWidth required size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            fullWidth required size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Button
            type="submit" variant="contained" fullWidth disabled={loading}
            sx={{
              borderRadius: 2, py: 1.1, fontWeight: 700, textTransform: 'none', fontSize: '0.95rem',
              background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
              boxShadow: '0 4px 14px rgba(29,78,216,0.3)',
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Entrar'}
          </Button>
        </Box>

        <Typography variant="caption" sx={{ textAlign: 'center', color: 'rgba(30,58,95,0.5)' }}>
          Não tem conta?{' '}
          <Link to="/register" style={{ color: '#1d4ed8', fontWeight: 600 }}>Criar conta</Link>
        </Typography>
      </Box>
    </Box>
  )
}
