import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { colors, font, radius } from '../design-system'
import { useRetryAfter } from '../hooks/useRetryAfter'
import { api } from '../services/api'
import { Button, Input, toast } from './ui'

const MAX_LENGTH = 2000
const MIN_LENGTH = 5

export function SupportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useUser()
  const location = useLocation()
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const retry = useRetryAfter()
  const trimmed = message.trim()

  const close = () => {
    if (sending) return
    onClose()
    if (sent) {
      setSent(false)
      setMessage('')
    }
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (trimmed.length < MIN_LENGTH || retry.blocked) return
    setSending(true)
    try {
      await api.sendSupportMessage(trimmed, location.pathname)
      setSent(true)
    } catch (err: unknown) {
      retry.captureFromError(err)
      toast.error((err as Error).message || 'Não deu pra enviar agora.')
    } finally {
      setSending(false)
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
      {sent ? (
        <>
          <DialogContent sx={{ pt: 4, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '2.2rem', mb: 1 }}>💌</Typography>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.2rem', color: colors.text.primary, mb: 0.8 }}>
              Recebido!
            </Typography>
            <Typography variant="lg" sx={{ color: colors.text.secondary, lineHeight: 1.55 }}>
              A gente responde no <strong>{user?.email ?? 'seu e-mail'}</strong> assim que der.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button variant="ghost" onClick={close} fullWidth>Fechar</Button>
          </DialogActions>
        </>
      ) : (
        <Box component="form" onSubmit={submit}>
          <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 700, color: colors.text.primary, pb: 0.5 }}>
            Falar com o suporte
          </DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Typography variant="md" sx={{ color: colors.text.secondary, lineHeight: 1.55 }}>
                Conta o que aconteceu, uma dúvida ou uma ideia. A resposta chega no seu e-mail.
              </Typography>
              <Input
                value={message}
                onChange={(event) => setMessage(event.target.value.slice(0, MAX_LENGTH))}
                multiline
                minRows={4}
                maxRows={10}
                fullWidth
                autoFocus
                placeholder="Escreve aqui..."
                inputProps={{ maxLength: MAX_LENGTH, 'aria-label': 'Sua mensagem' }}
                sx={{ '& textarea': { fontSize: '0.95rem', color: colors.text.primary, lineHeight: 1.5 } }}
              />
              <Typography variant="xs" sx={{ alignSelf: 'flex-end', color: colors.text.muted }}>
                {message.length}/{MAX_LENGTH}
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button variant="ghost" onClick={close} disabled={sending} sx={{ flex: 1 }}>Cancelar</Button>
            <Button variant="primary" type="submit" loading={sending} disabled={trimmed.length < MIN_LENGTH || retry.blocked} sx={{ flex: 1 }}>
              {retry.blocked ? `Aguarde ${retry.label}` : 'Enviar'}
            </Button>
          </DialogActions>
        </Box>
      )}
    </Dialog>
  )
}
