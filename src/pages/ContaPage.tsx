import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { Box, CircularProgress, Collapse, Divider, Stack, Typography } from '@mui/material'
import { useRef, useState } from 'react'
import { useBackground } from '../context/BackgroundContext'
import { FloatingParticles } from '../components/FloatingParticles'
import { useUser } from '../context/UserContext'
import { api } from '../services/api'
import { useRetryAfter } from '../hooks/useRetryAfter'
import { Button, Input, ScrollablePage, toast } from '../components/ui'
import { fadeIn, font, radius } from '../design-system'

type Section = 'profile' | 'email' | 'password'
type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

const USERNAME_RE = /^[a-z0-9_]+$/

export function ContaPage() {
  const { theme } = useBackground()
  const { user, patchUser } = useUser()

  const [editing, setEditing] = useState<Section | null>(null)
  const [profileForm, setProfileForm] = useState({ name: user?.name ?? '', username: user?.username ?? '' })
  const [profileLoading, setProfileLoading] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle')
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const passwordRetry = useRetryAfter()

  const [emailForm, setEmailForm] = useState({ newEmail: '', password: '' })
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [pendingNewEmail, setPendingNewEmail] = useState('')
  const emailRetry = useRetryAfter()

  const handleUsernameChange = (value: string) => {
    const lower = value.toLowerCase()
    setProfileForm((f) => ({ ...f, username: lower }))
    if (usernameTimer.current) clearTimeout(usernameTimer.current)
    const trimmed = lower.trim()
    if (!trimmed || trimmed === user?.username) { setUsernameStatus('idle'); return }
    if (!USERNAME_RE.test(trimmed) || trimmed.length < 3) { setUsernameStatus('invalid'); return }
    setUsernameStatus('checking')
    usernameTimer.current = setTimeout(async () => {
      try {
        const { available } = await api.checkUsername(trimmed)
        setUsernameStatus(available ? 'available' : 'taken')
      } catch {
        setUsernameStatus('idle')
      }
    }, 700)
  }

  const handleProfileSave = async () => {
    if (usernameStatus === 'taken' || usernameStatus === 'checking' || usernameStatus === 'invalid') return
    const name = profileForm.name.trim()
    const username = profileForm.username.trim() || undefined
    if (!name) return
    setProfileLoading(true)
    try {
      await api.updateMe({ name, username })
      patchUser({ name, username: username ?? user?.username })
      toast.success('Perfil atualizado!')
      setEditing(null)
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Erro ao salvar.')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    const { currentPassword, newPassword, confirmPassword } = passwordForm
    if (!currentPassword || !newPassword || !confirmPassword || passwordRetry.blocked) return
    if (newPassword !== confirmPassword) { toast.error('As senhas não coincidem.'); return }
    setPasswordLoading(true)
    try {
      await api.changePassword(currentPassword, newPassword)
      toast.success('Senha alterada com sucesso!')
      setEditing(null)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: unknown) {
      passwordRetry.captureFromError(err)
      toast.error((err as Error).message || 'Erro ao alterar senha.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    const { newEmail, password } = emailForm
    if (!newEmail.trim() || !password || emailRetry.blocked) return
    setEmailLoading(true)
    try {
      await api.changeEmail(newEmail.trim(), password)
      setPendingNewEmail(newEmail.trim())
      setEmailSent(true)
    } catch (err: unknown) {
      emailRetry.captureFromError(err)
      toast.error((err as Error).message || 'Erro ao solicitar troca de email.')
    } finally {
      setEmailLoading(false)
    }
  }

  const handleDevConfirm = async () => {
    try {
      const result = await api.confirmEmailChange(btoa(pendingNewEmail))
      if (result.email) patchUser({ email: result.email })
      toast.success('Email atualizado!')
      setEditing(null)
      setEmailSent(false)
      setEmailForm({ newEmail: '', password: '' })
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Erro ao confirmar.')
    }
  }

  const surfaceBg = theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.72)'
  const borderColor = theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'

  return (
    <Box sx={{ height: '100%', position: 'relative', overflow: 'hidden', background: theme.gradient }}>
      <FloatingParticles />
      <AccountCircleOutlinedIcon sx={{ position: 'absolute', bottom: -70, right: -60, fontSize: 420, color: `${theme.accent}08`, pointerEvents: 'none' }} />

      <ScrollablePage sx={{ px: 2.5, py: 2.5, animation: `${fadeIn} 0.35s ease` }}>
        <Stack spacing={0.3} sx={{ mb: 2.5 }}>
          <Typography sx={{ fontSize: '0.78rem', color: theme.textOnBgMuted, fontWeight: 700 }}>
            👤 Conta
          </Typography>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.6rem', color: theme.textOnBg, lineHeight: 1.1 }}>
            Minha conta
          </Typography>
        </Stack>

        <Stack spacing={2}>
          {/* ── Perfil ── */}
          <Box sx={{ background: surfaceBg, backdropFilter: 'blur(16px)', borderRadius: radius.lg, border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
            <Stack
              direction="row" alignItems="center" spacing={1.5}
              onClick={() => {
                if (editing === 'profile') {
                  setEditing(null)
                  setProfileForm({ name: user?.name ?? '', username: user?.username ?? '' })
                  setUsernameStatus('idle')
                } else {
                  setEditing('profile')
                  setProfileForm({ name: user?.name ?? '', username: user?.username ?? '' })
                  setUsernameStatus('idle')
                }
              }}
              sx={{ px: 2, py: 1.8, cursor: 'pointer', '&:hover': { bgcolor: `${theme.accent}0a` }, transition: 'background 0.12s' }}
            >
              <Box sx={{ width: 36, height: 36, borderRadius: radius.md, background: `${theme.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AccountCircleOutlinedIcon sx={{ fontSize: 19, color: theme.accent }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: theme.textOnBg, wordBreak: 'break-word' }}>{user?.name}</Typography>
                {user?.username && (
                  <Typography sx={{ fontSize: '0.72rem', color: theme.textOnBgMuted }}>@{user.username}</Typography>
                )}
              </Box>
              <EditOutlinedIcon sx={{ fontSize: 16, color: theme.textOnBgMuted }} />
              {editing === 'profile' ? <KeyboardArrowUpIcon sx={{ fontSize: 18, color: theme.textOnBgMuted }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 18, color: theme.textOnBgMuted }} />}
            </Stack>

            <Collapse in={editing === 'profile'}>
              <Divider sx={{ borderColor }} />
              <Stack spacing={1.5} sx={{ px: 2, py: 2 }}>
                <Input
                  label="Nome"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                  fullWidth
                  placeholder="Seu nome completo"
                />
                <Box>
                  <Input
                    label="Username (opcional)"
                    value={profileForm.username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    fullWidth
                    placeholder="@meunome"
                    inputProps={{ maxLength: 30 }}
                    error={usernameStatus === 'taken' || usernameStatus === 'invalid'}
                    InputProps={usernameStatus === 'checking' ? {
                      endAdornment: <CircularProgress size={14} sx={{ color: theme.textOnBgMuted, mr: 0.5 }} />,
                    } : undefined}
                  />
                  <Typography sx={{
                    fontSize: '0.7rem', mt: 0.4, pl: 0.3, fontWeight: usernameStatus === 'idle' ? 400 : 600,
                    color: usernameStatus === 'available' ? '#22c55e' : (usernameStatus === 'taken' || usernameStatus === 'invalid') ? '#e11d48' : theme.textOnBgMuted,
                  }}>
                    {usernameStatus === 'available' ? '✓ disponível' : usernameStatus === 'taken' ? 'já está em uso' : usernameStatus === 'invalid' ? 'Apenas letras minúsculas, números e _ (mín. 3)' : 'Identificador único, sem espaços.'}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button variant="ghost" onClick={() => setEditing(null)} disabled={profileLoading} sx={{ fontSize: '0.82rem' }}>
                    Cancelar
                  </Button>
                  <Button variant="primary" onClick={handleProfileSave} loading={profileLoading} disabled={!profileForm.name.trim() || usernameStatus === 'taken' || usernameStatus === 'checking' || usernameStatus === 'invalid'} sx={{ fontSize: '0.82rem' }}>
                    Salvar
                  </Button>
                </Stack>
              </Stack>
            </Collapse>
          </Box>

          {/* ── Email ── */}
          <Box sx={{ background: surfaceBg, backdropFilter: 'blur(16px)', borderRadius: radius.lg, border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
            <Stack
              direction="row" alignItems="center" spacing={1.5}
              onClick={() => {
                if (editing === 'email') {
                  setEditing(null)
                  setEmailSent(false)
                  setEmailForm({ newEmail: '', password: '' })
                } else {
                  setEditing('email')
                }
              }}
              sx={{ px: 2, py: 1.8, cursor: 'pointer', '&:hover': { bgcolor: `${theme.accent}0a` }, transition: 'background 0.12s' }}
            >
              <Box sx={{ width: 36, height: 36, borderRadius: radius.md, background: `${theme.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <EmailOutlinedIcon sx={{ fontSize: 19, color: theme.accent }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={0.6}>
                  <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: theme.textOnBg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.email ?? '...'}
                  </Typography>
                  {user?.emailVerified === true && (
                    <CheckCircleIcon sx={{ fontSize: 14, color: '#22c55e', flexShrink: 0 }} />
                  )}
                  {user?.emailVerified === false && (
                    <ErrorOutlineIcon sx={{ fontSize: 14, color: '#f59e0b', flexShrink: 0 }} />
                  )}
                </Stack>
                <Typography sx={{ fontSize: '0.72rem', color: theme.textOnBgMuted }}>
                  {user?.emailVerified === true ? 'verificado' : user?.emailVerified === false ? 'não verificado' : 'email da conta'}
                </Typography>
              </Box>
              {editing === 'email' ? <KeyboardArrowUpIcon sx={{ fontSize: 18, color: theme.textOnBgMuted }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 18, color: theme.textOnBgMuted }} />}
            </Stack>

            <Collapse in={editing === 'email'}>
              <Divider sx={{ borderColor }} />
              {!emailSent ? (
                <Box component="form" onSubmit={handleEmailChange} sx={{ px: 2, py: 2 }}>
                  <Stack spacing={1.5}>
                    <Typography sx={{ fontSize: '0.8rem', color: theme.textOnBgMuted, lineHeight: 1.5 }}>
                      Você receberá um link de confirmação no novo email. Após confirmar, o email será trocado.
                    </Typography>
                    <Input
                      label="Novo email"
                      type="email"
                      value={emailForm.newEmail}
                      onChange={(e) => setEmailForm((f) => ({ ...f, newEmail: e.target.value }))}
                      fullWidth
                      required
                      placeholder="novo@email.com"
                      InputProps={{ startAdornment: <AlternateEmailIcon sx={{ fontSize: 16, color: theme.textOnBgMuted, mr: 0.5 }} /> }}
                    />
                    <Input
                      label="Senha atual"
                      type="password"
                      value={emailForm.password}
                      onChange={(e) => setEmailForm((f) => ({ ...f, password: e.target.value }))}
                      fullWidth
                      required
                      placeholder="••••••••"
                      InputProps={{ startAdornment: <LockOutlinedIcon sx={{ fontSize: 16, color: theme.textOnBgMuted, mr: 0.5 }} /> }}
                    />
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button variant="ghost" onClick={() => setEditing(null)} disabled={emailLoading} sx={{ fontSize: '0.82rem' }}>
                        Cancelar
                      </Button>
                      <Button variant="primary" type="submit" loading={emailLoading} disabled={!emailForm.newEmail || !emailForm.password || emailRetry.blocked} sx={{ fontSize: '0.82rem' }}>
                        {emailRetry.blocked ? `Aguarde ${emailRetry.label}` : 'Enviar confirmação'}
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              ) : (
                <Stack spacing={1.5} sx={{ px: 2, py: 2 }}>
                  <Stack direction="row" alignItems="flex-start" spacing={1}>
                    <CheckCircleIcon sx={{ fontSize: 18, color: '#22c55e', mt: 0.1, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.82rem', color: theme.textOnBg, lineHeight: 1.55 }}>
                      Email enviado para <strong>{pendingNewEmail}</strong>. Abra esse email e clique no link para confirmar a troca.
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: '0.72rem', color: theme.textOnBgMuted }}>
                    O link expira em 30 minutos. Verifique também a pasta de spam.
                  </Typography>
                  {import.meta.env.DEV && (
                    <Button variant="ghost" onClick={handleDevConfirm} sx={{ fontSize: '0.78rem', alignSelf: 'flex-start' }}>
                      DEV: Confirmar troca agora
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => { setEmailSent(false); setEditing(null) }} sx={{ fontSize: '0.78rem', alignSelf: 'flex-start' }}>
                    Fechar
                  </Button>
                </Stack>
              )}
            </Collapse>
          </Box>

          {/* ── Senha ── */}
          <Box sx={{ background: surfaceBg, backdropFilter: 'blur(16px)', borderRadius: radius.lg, border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
            <Stack
              direction="row" alignItems="center" spacing={1.5}
              onClick={() => {
                if (editing === 'password') {
                  setEditing(null)
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                } else {
                  setEditing('password')
                }
              }}
              sx={{ px: 2, py: 1.8, cursor: 'pointer', '&:hover': { bgcolor: `${theme.accent}0a` }, transition: 'background 0.12s' }}
            >
              <Box sx={{ width: 36, height: 36, borderRadius: radius.md, background: `${theme.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LockOutlinedIcon sx={{ fontSize: 19, color: theme.accent }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: theme.textOnBg }}>Senha</Typography>
                <Typography sx={{ fontSize: '0.72rem', color: theme.textOnBgMuted }}>alterar senha de acesso</Typography>
              </Box>
              {editing === 'password' ? <KeyboardArrowUpIcon sx={{ fontSize: 18, color: theme.textOnBgMuted }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 18, color: theme.textOnBgMuted }} />}
            </Stack>

            <Collapse in={editing === 'password'}>
              <Divider sx={{ borderColor }} />
              <Box component="form" onSubmit={handlePasswordChange} sx={{ px: 2, py: 2 }}>
                <Stack spacing={1.5}>
                  <Input
                    label="Senha atual"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                    fullWidth
                    required
                    placeholder="••••••••"
                    InputProps={{ startAdornment: <LockOutlinedIcon sx={{ fontSize: 16, color: theme.textOnBgMuted, mr: 0.5 }} /> }}
                  />
                  <Input
                    label="Nova senha"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                    fullWidth
                    required
                    placeholder="mínimo 6 caracteres"
                    inputProps={{ minLength: 6 }}
                    InputProps={{ startAdornment: <LockOutlinedIcon sx={{ fontSize: 16, color: theme.textOnBgMuted, mr: 0.5 }} /> }}
                  />
                  <Input
                    label="Confirmar nova senha"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    fullWidth
                    required
                    placeholder="••••••••"
                    error={!!passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword}
                    InputProps={{ startAdornment: <LockOutlinedIcon sx={{ fontSize: 16, color: theme.textOnBgMuted, mr: 0.5 }} /> }}
                  />
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button variant="ghost" onClick={() => { setEditing(null); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }) }} disabled={passwordLoading} sx={{ fontSize: '0.82rem' }}>
                      Cancelar
                    </Button>
                    <Button
                      variant="primary" type="submit" loading={passwordLoading}
                      disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || passwordForm.newPassword !== passwordForm.confirmPassword || passwordRetry.blocked}
                      sx={{ fontSize: '0.82rem' }}
                    >
                      {passwordRetry.blocked ? `Aguarde ${passwordRetry.label}` : 'Alterar senha'}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Collapse>
          </Box>

          {/* ── Username standalone (se não tem) ── */}
          {!user?.username && (
            <Box sx={{ px: 1.5, py: 1.2, borderRadius: radius.md, background: `${theme.accent}0e`, border: `1px solid ${theme.accent}22` }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <AlternateEmailIcon sx={{ fontSize: 15, color: theme.accent, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.78rem', color: theme.textOnBg }}>
                  Você ainda não definiu um username. Edite seu perfil acima para adicionar um.
                </Typography>
              </Stack>
            </Box>
          )}
        </Stack>
      </ScrollablePage>
    </Box>
  )
}
