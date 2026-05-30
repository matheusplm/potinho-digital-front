import FavoriteIcon from '@mui/icons-material/Favorite'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { Alert, Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { api } from '../services/api'

const floatUp = (i: number) => keyframes`
  0%   { transform: translateY(0) rotate(${i % 2 === 0 ? -6 : 6}deg); opacity: 0; }
  8%   { opacity: ${0.1 + i * 0.02}; }
  92%  { opacity: ${(0.1 + i * 0.02) * 0.5}; }
  100% { transform: translateY(-100vh) rotate(${i % 2 === 0 ? 12 : -10}deg); opacity: 0; }
`

const HEARTS = [
  { size: 12, left: '10%', delay: '0s',   dur: '9s'  },
  { size: 16, left: '30%', delay: '3s',   dur: '11s' },
  { size: 10, left: '70%', delay: '1.5s', dur: '8s'  },
  { size: 14, left: '88%', delay: '5s',   dur: '10s' },
]

type Mode = 'criar' | 'convite'

export function RegisterPage() {
  const navigate = useNavigate()
  const { setUser } = useUser()
  const [mode, setMode] = useState<Mode>('criar')
  const [form, setForm] = useState({ name: '', email: '', password: '', inviteCode: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const inviteCode = mode === 'convite' ? form.inviteCode : undefined
      const result = await api.register(form.name, form.email, form.password, inviteCode)

      if (mode === 'criar') {
        navigate('/login', { state: { coupleCode: result.coupleCode, name: result.name } })
      } else {
        navigate('/login')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar conta.'
      setError(msg === 'INVALID_INVITE_CODE' ? 'Código de convite inválido.' : msg)
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
      background: mode === 'criar'
        ? 'linear-gradient(160deg,#0f2a6e 0%,#1d4ed8 40%,#be185d 100%)'
        : 'linear-gradient(160deg,#4a0072 0%,#7c3aed 40%,#be185d 100%)',
      transition: 'background 0.6s ease',
    }}>
      <FavoriteIcon sx={{
        position: 'absolute', fontSize: 380,
        color: 'rgba(255,255,255,0.04)',
        top: -80, right: -60, pointerEvents: 'none',
      }} />

      {HEARTS.map((h, i) => (
        <FavoriteIcon key={i} sx={{
          position: 'absolute', bottom: '38%', left: h.left,
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
            fontWeight: 700, fontSize: '2rem', color: '#fff', lineHeight: 1.1, textAlign: 'center',
          }}>
            Potinho Digital
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', fontStyle: 'italic' }}>
            {mode === 'criar' ? 'crie o seu potinho' : 'entre no potinho de alguém'}
          </Typography>
        </Stack>
      </Stack>

      <Box sx={{
        borderRadius: '28px 28px 0 0',
        background: '#faf9f8',
        px: 3, pt: 3.5, pb: 4,
        zIndex: 1,
        boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
      }}>
        <Typography sx={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '1.35rem', color: '#1e3a5f', mb: 2 }}>
          Criar conta
        </Typography>

        <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
          <Box
            onClick={() => setMode('criar')}
            sx={{
              flex: 1, p: 1.5, borderRadius: 2.5, cursor: 'pointer',
              border: mode === 'criar' ? '2px solid #1d4ed8' : '1.5px solid rgba(0,0,0,0.1)',
              bgcolor: mode === 'criar' ? 'rgba(29,78,216,0.06)' : '#fff',
              transition: 'all 0.2s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.6,
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 22, color: mode === 'criar' ? '#1d4ed8' : '#94a3b8' }} />
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: mode === 'criar' ? '#1d4ed8' : '#64748b', textAlign: 'center', lineHeight: 1.2 }}>
              Criar potinho
            </Typography>
            <Typography sx={{ fontSize: '0.67rem', color: '#94a3b8', textAlign: 'center', lineHeight: 1.2 }}>
              Sou quem escreve
            </Typography>
          </Box>

          <Box
            onClick={() => setMode('convite')}
            sx={{
              flex: 1, p: 1.5, borderRadius: 2.5, cursor: 'pointer',
              border: mode === 'convite' ? '2px solid #7c3aed' : '1.5px solid rgba(0,0,0,0.1)',
              bgcolor: mode === 'convite' ? 'rgba(124,58,237,0.06)' : '#fff',
              transition: 'all 0.2s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.6,
            }}
          >
            <MailOutlineIcon sx={{ fontSize: 22, color: mode === 'convite' ? '#7c3aed' : '#94a3b8' }} />
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: mode === 'convite' ? '#7c3aed' : '#64748b', textAlign: 'center', lineHeight: 1.2 }}>
              Tenho convite
            </Typography>
            <Typography sx={{ fontSize: '0.67rem', color: '#94a3b8', textAlign: 'center', lineHeight: 1.2 }}>
              Fui convidado
            </Typography>
          </Box>
        </Stack>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={1.8}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2, fontSize: '0.82rem', py: 0.5 }}>
                {error}
              </Alert>
            )}
            <TextField
              label="Seu nome" value={form.name} onChange={set('name')}
              fullWidth required size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
            />
            <TextField
              label="Email" type="email" value={form.email} onChange={set('email')}
              fullWidth required size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
            />
            <TextField
              label="Senha" type="password" value={form.password} onChange={set('password')}
              fullWidth required size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
            />
            {mode === 'convite' && (
              <TextField
                label="Código de convite"
                value={form.inviteCode}
                onChange={(e) => setForm((f) => ({ ...f, inviteCode: e.target.value.toUpperCase() }))}
                fullWidth required size="small"
                placeholder="Ex: AMOR01"
                inputProps={{ style: { letterSpacing: '0.15em', fontWeight: 700, fontSize: '1rem' } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff', borderColor: '#7c3aed' } }}
              />
            )}
            <Button
              type="submit" variant="contained" fullWidth disabled={loading}
              sx={{
                borderRadius: 2, py: 1.2, mt: 0.5,
                fontWeight: 700, textTransform: 'none', fontSize: '0.95rem',
                background: mode === 'criar'
                  ? 'linear-gradient(135deg,#1d4ed8,#3b82f6)'
                  : 'linear-gradient(135deg,#7c3aed,#a855f7)',
                boxShadow: mode === 'criar'
                  ? '0 4px 14px rgba(29,78,216,0.35)'
                  : '0 4px 14px rgba(124,58,237,0.35)',
                transition: 'background 0.3s',
              }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Criar conta'}
            </Button>
          </Stack>
        </Box>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2.5, color: '#94a3b8' }}>
          Já tem conta?{' '}
          <Link to="/login" style={{ color: '#1d4ed8', fontWeight: 600, textDecoration: 'none' }}>
            Entrar
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}
