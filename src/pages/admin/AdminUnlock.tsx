import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { Box, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { Button, Input } from '../../components/ui'
import { GoogleSignInButton } from '../../components/GoogleSignInButton'
import { useBackground } from '../../context/BackgroundContext'
import { font, radius } from '../../design-system'
import { api, ApiRequestError } from '../../services/api'
import { setAdminSession } from '../../services/adminSession'

export function AdminUnlock() {
  const { theme } = useBackground()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function unlock(proof: { password: string } | { googleIdToken: string }) {
    setLoading(true)
    setError(null)
    try {
      const session = await api.startAdminSession(proof)
      setPassword('')
      setAdminSession(session.adminToken, session.expiresAt)
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Não deu pra confirmar agora. Tente de novo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      width: '100%', maxWidth: 420, mx: 'auto', mt: { xs: 1, md: 4 }, p: { xs: 2.4, md: 3 }, borderRadius: radius.xl,
      background: theme.surfaceBg, border: `1px solid ${theme.surfaceBorder}`, backdropFilter: 'blur(12px)',
    }}>
      <Stack alignItems="center" spacing={1.2} sx={{ textAlign: 'center', mb: 2.4 }}>
        <Box sx={{
          width: 52, height: 52, borderRadius: '50%', background: `${theme.accent}1f`, color: theme.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <LockOutlinedIcon />
        </Box>
        <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.3rem', color: theme.textOnBg }}>
          Confirme que é você
        </Typography>
        <Typography sx={{ fontSize: '0.84rem', color: theme.textOnBgMuted, lineHeight: 1.6 }}>
          O modo admin mostra dados de todos os usuários. O acesso dura 30 minutos e acaba quando você recarrega ou fecha a página.
        </Typography>
      </Stack>

      <Stack alignItems="center">
        <GoogleSignInButton onCredential={(idToken) => { void unlock({ googleIdToken: idToken }) }} disabled={loading} dividerLabel="ou confirme com a senha" />
      </Stack>

      <Box component="form" onSubmit={(e: React.FormEvent) => { e.preventDefault(); if (password) void unlock({ password }) }}>
        <Stack spacing={1.6}>
          <Input
            label="Sua senha"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            autoFocus
          />
          <Button variant="primary" type="submit" fullWidth loading={loading} disabled={!password || loading}>
            Entrar no modo admin
          </Button>
          {error && (
            <Box role="alert" sx={{ px: 1.5, py: 1, borderRadius: radius.md, background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.25)' }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: theme.isDark ? '#fda4af' : '#be123c' }}>{error}</Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  )
}
