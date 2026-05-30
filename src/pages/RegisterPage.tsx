import FavoriteIcon from '@mui/icons-material/Favorite'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { Box, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../services/api'
import { Button, Input, SegmentedControl, toast } from '../components/ui'

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
  { size: 18, left: '11%', delay: '0s',   dur: '13s' },
  { size: 22, left: '33%', delay: '4s',   dur: '11s' },
  { size: 15, left: '67%', delay: '2s',   dur: '14s' },
  { size: 20, left: '85%', delay: '6.5s', dur: '12s' },
]

type Mode = 'criar' | 'convite'

export function RegisterPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('criar')
  const [form, setForm] = useState({ name: '', email: '', password: '', inviteCode: '' })
  const [loading, setLoading] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const inviteCode = mode === 'convite' ? form.inviteCode : undefined
      await api.register(form.name, form.email, form.password, inviteCode)
      toast.success('Conta criada!', { description: 'Agora é só entrar.' })
      navigate('/login')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar conta.'
      toast.error(msg === 'INVALID_INVITE_CODE' ? 'Código de convite inválido.' : msg)
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
        ? 'linear-gradient(160deg, #dbeafe 0%, #fce7f3 55%, #ede9fe 100%)'
        : 'linear-gradient(160deg, #fce7f3 0%, #ede9fe 55%, #dbeafe 100%)',
      transition: 'background 0.5s ease',
    }}>
      <Box sx={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: mode === 'criar' ? 'radial-gradient(circle, rgba(29,78,216,0.12) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(225,29,72,0.12) 0%, transparent 70%)', transition: 'background 0.5s ease', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {HEARTS.map((h, i) => (
        <FavoriteIcon key={i} sx={{
          position: 'absolute', bottom: -8, left: h.left,
          fontSize: h.size, zIndex: 0,
          color: i % 2 === 0 ? (mode === 'criar' ? '#1d4ed8' : '#e11d48') : '#7c3aed',
          filter: 'blur(0.5px)',
          animation: `${floatHeart(i)} ${h.dur} ${h.delay} ease-in infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      <Stack sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', px: 3, py: 5, animation: `${fadeSlide} 0.5s ease both` }} spacing={0}>
        <FavoriteIcon sx={{
          fontSize: 52,
          color: mode === 'criar' ? '#1d4ed8' : '#e11d48',
          filter: mode === 'criar' ? 'drop-shadow(0 4px 16px rgba(29,78,216,0.4))' : 'drop-shadow(0 4px 16px rgba(225,29,72,0.4))',
          mb: 3, transition: 'all 0.4s ease',
        }} />

        <Typography sx={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '2.8rem', lineHeight: 1, color: '#1e3a5f', textAlign: 'center', letterSpacing: '-0.5px' }}>
          Criar
        </Typography>
        <Typography sx={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '2.8rem', lineHeight: 1, color: mode === 'criar' ? '#1d4ed8' : '#e11d48', textAlign: 'center', letterSpacing: '-0.5px', mb: 1.5, transition: 'color 0.4s ease' }}>
          Conta
        </Typography>

        <Box sx={{ width: 40, height: 3, borderRadius: 2, background: mode === 'criar' ? 'linear-gradient(90deg, #1d4ed8, #e11d48)' : 'linear-gradient(90deg, #e11d48, #7c3aed)', mb: 4, transition: 'background 0.4s ease' }} />

        <Box sx={{ width: '100%', maxWidth: 320 }}>
          <Box sx={{ mb: 3 }}>
            <SegmentedControl
              value={mode}
              onChange={setMode}
              options={[
                { id: 'criar', label: 'Criar potinho', icon: <AutoAwesomeIcon />, activeColor: '#1d4ed8' },
                { id: 'convite', label: 'Tenho convite', icon: <FavoriteBorderIcon />, activeColor: '#e11d48' },
              ]}
            />
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <Input label="Seu nome" value={form.name} onChange={set('name')} placeholder="Como te chamamos?" fullWidth required />
              <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="seu@email.com" fullWidth required />
              <Input label="Senha" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" fullWidth required />
              {mode === 'convite' && (
                <Input
                  label="Código de convite"
                  value={form.inviteCode}
                  onChange={(e) => setForm((f) => ({ ...f, inviteCode: e.target.value.toUpperCase() }))}
                  placeholder="Ex: AMOR01"
                  fullWidth required
                  inputProps={{ style: { letterSpacing: '0.2em', fontWeight: 700 } }}
                />
              )}
              <Button
                variant={mode === 'criar' ? 'primary' : 'rose'}
                type="submit" fullWidth loading={loading} sx={{ mt: 0.5 }}
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
    </Box>
  )
}
