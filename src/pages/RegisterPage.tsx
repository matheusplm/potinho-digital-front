import FavoriteIcon from '@mui/icons-material/Favorite'
import { Alert, Box, Button, CircularProgress, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../services/api'

export function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'reader' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.register(form.name, form.email, form.password, form.role)
      navigate('/login')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.')
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

      <Stack alignItems="center" spacing={1} sx={{ mb: 4, zIndex: 1 }}>
        <FavoriteIcon sx={{ fontSize: 40, color: '#e11d48', filter: 'drop-shadow(0 2px 8px rgba(225,29,72,0.35))' }} />
        <Typography variant="h4" sx={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, color: '#1e3a5f' }}>
          Potinho Digital
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(30,58,95,0.5)', fontStyle: 'italic' }}>
          crie sua conta
        </Typography>
      </Stack>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ zIndex: 1, width: '100%', maxWidth: 340, px: 3 }}
      >
        <Box sx={{
          background: 'rgba(255,253,251,0.88)', backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', p: 3,
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2, fontSize: '0.82rem' }}>{error}</Alert>}
          <TextField label="Nome" value={form.name} onChange={set('name')} fullWidth required size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <TextField label="Email" type="email" value={form.email} onChange={set('email')} fullWidth required size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <TextField label="Senha" type="password" value={form.password} onChange={set('password')} fullWidth required size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <TextField
            label="Perfil" select value={form.role} onChange={set('role')} fullWidth size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          >
            <MenuItem value="reader">Reader — coleciona bilhetes</MenuItem>
            <MenuItem value="writer">Writer — escreve bilhetes</MenuItem>
          </TextField>
          <Button
            type="submit" variant="contained" fullWidth disabled={loading}
            sx={{
              borderRadius: 2, py: 1.1, fontWeight: 700, textTransform: 'none', fontSize: '0.95rem',
              background: 'linear-gradient(135deg,#e11d48,#fb7185)',
              boxShadow: '0 4px 14px rgba(225,29,72,0.3)',
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Criar conta'}
          </Button>
        </Box>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: 'rgba(30,58,95,0.5)' }}>
          Já tem conta?{' '}
          <Link to="/login" style={{ color: '#1d4ed8', fontWeight: 600 }}>Entrar</Link>
        </Typography>
      </Box>
    </Box>
  )
}
