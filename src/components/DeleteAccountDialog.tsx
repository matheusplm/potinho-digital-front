import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { colors, font, radius } from '../design-system'
import { useRetryAfter } from '../hooks/useRetryAfter'
import { api, ApiRequestError } from '../services/api'
import { clearAdminSession } from '../services/adminSession'
import { forgetPushEndpoint } from '../services/pushSubscription'
import { Button, Input, toast } from './ui'

const GONE = [
  'suas coleções, inclusive as da lixeira, com bilhetes, pacotinhos e conquistas',
  'o que quem lê suas coleções já abriu e favoritou',
  'seu progresso nas coleções que você lê',
  'seus convites, notificações e recados pro suporte',
]

export function DeleteAccountDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, setUser } = useUser()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [deleting, setDeleting] = useState(false)
  const retry = useRetryAfter()
  const needsPassword = user?.hasPassword !== false
  const emailMatches = !!user?.email && email.trim().toLowerCase() === user.email.toLowerCase()
  const ready = emailMatches && (!needsPassword || password.length > 0) && !retry.blocked

  const close = () => {
    if (deleting) return
    onClose()
    setEmail('')
    setPassword('')
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!ready || !user) return
    setDeleting(true)
    try {
      await api.deleteAccount(email.trim(), needsPassword ? password : undefined)
      clearAdminSession(false)
      forgetPushEndpoint()
      try {
        localStorage.removeItem(`potinho-persona-${user.id}`)
      } catch {
        void 0
      }
      setUser(null)
      navigate('/', { replace: true })
      toast.success('Sua conta foi excluída. Obrigado por ter passado por aqui 💙')
    } catch (err: unknown) {
      retry.captureFromError(err)
      const wrongPassword = err instanceof ApiRequestError && err.code === 'INVALID_CREDENTIALS'
      toast.error(wrongPassword ? 'Senha incorreta.' : (err as Error).message || 'Não deu pra excluir agora.')
      setDeleting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: radius.xl, mx: 2, background: 'var(--pd-surface-paper)', backdropFilter: 'blur(24px)' } } }}
    >
      <Box component="form" onSubmit={submit}>
        <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 700, color: colors.text.primary, pb: 0.5 }}>
          Excluir sua conta?
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            <Typography variant="md" sx={{ color: colors.text.secondary, lineHeight: 1.55 }}>
              Isso apaga na hora, e pra sempre:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.4, color: colors.text.secondary, '& li': { fontSize: '0.88rem', lineHeight: 1.5, mb: 0.4 } }}>
              {GONE.map((item) => <li key={item}>{item}</li>)}
            </Box>
            <Typography variant="md" sx={{ color: colors.text.secondary, lineHeight: 1.55 }}>
              As coleções de outras pessoas continuam com elas, você só sai delas. Não tem como desfazer.
            </Typography>
            <Input
              label="Digite o e-mail da conta pra confirmar"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              fullWidth
              autoComplete="off"
              placeholder={user?.email}
            />
            {needsPassword && (
              <Input
                label="Sua senha"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                fullWidth
                autoComplete="current-password"
                placeholder="••••••••"
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="ghost" onClick={close} disabled={deleting} sx={{ flex: 1 }}>Cancelar</Button>
          <Button variant="rose" type="submit" loading={deleting} disabled={!ready} sx={{ flex: 1 }}>
            {retry.blocked ? `Aguarde ${retry.label}` : 'Excluir conta'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
