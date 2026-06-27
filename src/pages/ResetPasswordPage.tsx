import FavoriteIcon from '@mui/icons-material/Favorite'
import LockResetIcon from '@mui/icons-material/LockReset'
import { Box, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../services/api'
import { Button, Input, toast } from '../components/ui'
import { fadeSlide, floatHeart, font } from '../design-system'

const HEARTS = [
  { size: 16, left: '6%',  delay: '0s',   dur: '13s' },
  { size: 20, left: '31%', delay: '2.5s', dur: '11s' },
  { size: 14, left: '68%', delay: '1s',   dur: '14s' },
  { size: 22, left: '86%', delay: '5s',   dur: '12s' },
]

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''

  const [form, setForm] = useState({ password: '', confirm: '' })
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [confirmTouched, setConfirmTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const passwordError = passwordTouched && form.password.length < 6
  const confirmError = confirmTouched && form.confirm !== form.password

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 6) { setPasswordTouched(true); return }
    if (form.confirm !== form.password) { setConfirmTouched(true); return }
    if (!token) { setError('Link inválido. Solicite um novo link.'); return }
    setError('')
    setLoading(true)
    try {
      await api.resetPassword(token, form.password)
      toast.success('Senha redefinida!', { description: 'Agora é só entrar com a nova senha.' })
      navigate('/login')
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro ao redefinir senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      height: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(160deg, #dbeafe 0%, #fce7f3 55%, #ede9fe 100%)',
    }}>
      <Box sx={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,78,216,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(225,29,72,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      {HEARTS.map((h, i) => (
        <FavoriteIcon key={i} sx={{
          position: 'absolute', bottom: -8, left: h.left, fontSize: h.size, zIndex: 0,
          color: i % 2 === 0 ? '#1d4ed8' : '#e11d48', filter: 'blur(0.5px)',
          animation: `${floatHeart(i)} ${h.dur} ${h.delay} ease-in infinite`, pointerEvents: 'none',
        }} />
      ))}

      <Stack sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', px: 3, py: 5, animation: `${fadeSlide} 0.5s ease both` }} spacing={0}>
        <Stack alignItems="center" spacing={0} sx={{ maxWidth: 320, width: '100%' }}>
          <LockResetIcon sx={{ fontSize: 52, color: '#1d4ed8', filter: 'drop-shadow(0 4px 16px rgba(29,78,216,0.35))', mb: 3 }} />
          <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '2rem', lineHeight: 1, color: '#1e3a5f', textAlign: 'center', letterSpacing: '-0.5px' }}>
            Nova
          </Typography>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '2rem', lineHeight: 1, color: '#1d4ed8', textAlign: 'center', letterSpacing: '-0.5px', mb: 1.5 }}>
            senha
          </Typography>
          <Box sx={{ width: 40, height: 3, borderRadius: 2, background: 'linear-gradient(90deg, #1d4ed8, #e11d48)', mb: 3.5 }} />

          {!token ? (
            <Stack alignItems="center" spacing={2}>
              <Typography sx={{ fontSize: '0.88rem', color: '#e11d48', textAlign: 'center' }}>
                Link inválido. Solicite um novo link de recuperação.
              </Typography>
              <Link to="/esqueci-minha-senha" style={{ color: '#1d4ed8', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
                Solicitar novo link
              </Link>
            </Stack>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <Stack spacing={2}>
                <Input
                  label="Nova senha" type="password" value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  onBlur={() => setPasswordTouched(true)}
                  placeholder="••••••••" fullWidth required
                  error={passwordError}
                  helperText={passwordError ? 'Mínimo de 6 caracteres' : undefined}
                />
                <Input
                  label="Confirmar senha" type="password" value={form.confirm}
                  onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                  onBlur={() => setConfirmTouched(true)}
                  placeholder="••••••••" fullWidth required
                  error={confirmError}
                  helperText={confirmError ? 'As senhas não coincidem' : undefined}
                />
                <Button variant="primary" type="submit" fullWidth loading={loading} disabled={!form.password || !form.confirm}>
                  Redefinir senha
                </Button>
                {error && (
                  <Box sx={{ px: 1.5, py: 1, borderRadius: '10px', background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.2)' }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#e11d48', fontWeight: 600 }}>{error}</Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          )}

          <Typography sx={{ mt: 3.5, fontSize: '0.85rem', color: 'rgba(30,58,95,0.5)' }}>
            <Link to="/login" style={{ color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' }}>Voltar ao login</Link>
          </Typography>
        </Stack>
      </Stack>
    </Box>
  )
}
