import FavoriteIcon from '@mui/icons-material/Favorite'
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead'
import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { api } from '../services/api'
import { Button, toast } from '../components/ui'
import { fadeSlide, floatHeart, font } from '../design-system'

const HEARTS = [
  { size: 20, left: '8%',  delay: '0s',   dur: '13s' },
  { size: 14, left: '28%', delay: '4s',   dur: '15s' },
  { size: 22, left: '62%', delay: '1.5s', dur: '11s' },
  { size: 16, left: '82%', delay: '6s',   dur: '14s' },
]

export function VerifyEmailPage() {
  const { setUser } = useUser()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')
  const emailFromState = params.get('email') ?? ''

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'waiting'>(token ? 'verifying' : 'waiting')
  const [errorMsg, setErrorMsg] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const verified = useRef(false)

  useEffect(() => {
    if (!token || verified.current) return
    verified.current = true
    api.verifyEmail(token)
      .then(({ token: authToken, refreshToken, user }) => {
        setUser({ id: user.id, name: user.name, email: user.email, role: user.role as 'writer' | 'reader', token: authToken, refreshToken, onboardingDone: user.onboardingDone, emailVerified: true })
        setStatus('success')
        setTimeout(() => navigate('/home'), 1500)
      })
      .catch((err: Error) => {
        setErrorMsg(err.message || 'Link inválido ou expirado.')
        setStatus('error')
      })
  }, [token, setUser, navigate])

  const handleResend = async () => {
    if (!emailFromState) return
    setResendLoading(true)
    try {
      await api.resendVerification(emailFromState)
      setResendSent(true)
      toast.success('Email reenviado!')
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Erro ao reenviar. Tente novamente.')
    } finally {
      setResendLoading(false)
    }
  }

  const handleDevVerify = async () => {
    if (!emailFromState) return
    const mockToken = btoa(emailFromState)
    try {
      const { token: authToken, refreshToken, user } = await api.verifyEmail(mockToken)
      setUser({ id: user.id, name: user.name, email: user.email, role: user.role as 'writer' | 'reader', token: authToken, refreshToken, onboardingDone: user.onboardingDone, emailVerified: true })
      navigate('/home')
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Erro ao verificar.')
    }
  }

  return (
    <Box sx={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative',
      overflowX: 'hidden', overflowY: 'auto',
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
        {status === 'verifying' && (
          <Stack alignItems="center" spacing={2}>
            <CircularProgress sx={{ color: '#1d4ed8' }} />
            <Typography sx={{ fontFamily: font.serif, fontSize: '1.2rem', color: '#1e3a5f' }}>
              Verificando seu email...
            </Typography>
          </Stack>
        )}

        {status === 'success' && (
          <Stack alignItems="center" spacing={2}>
            <MarkEmailReadIcon sx={{ fontSize: 64, color: '#1d4ed8', filter: 'drop-shadow(0 4px 16px rgba(29,78,216,0.3))' }} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.8rem', color: '#1e3a5f', textAlign: 'center' }}>
              Email verificado!
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: 'rgba(30,58,95,0.6)', textAlign: 'center' }}>
              Entrando no seu potinho...
            </Typography>
          </Stack>
        )}

        {status === 'error' && (
          <Stack alignItems="center" spacing={2.5} sx={{ maxWidth: 320, width: '100%' }}>
            <FavoriteIcon sx={{ fontSize: 52, color: '#e11d48', filter: 'drop-shadow(0 4px 16px rgba(225,29,72,0.3))' }} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.8rem', color: '#1e3a5f', textAlign: 'center' }}>
              Link inválido
            </Typography>
            <Typography sx={{ fontSize: '0.88rem', color: 'rgba(30,58,95,0.6)', textAlign: 'center' }}>
              {errorMsg}
            </Typography>
            <Typography sx={{ mt: 1, fontSize: '0.85rem', color: 'rgba(30,58,95,0.5)' }}>
              <Link to="/login" style={{ color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' }}>Voltar ao login</Link>
            </Typography>
          </Stack>
        )}

        {status === 'waiting' && (
          <Stack alignItems="center" spacing={2.5} sx={{ maxWidth: 320, width: '100%' }}>
            <MarkEmailReadIcon sx={{ fontSize: 64, color: '#1d4ed8', filter: 'drop-shadow(0 4px 16px rgba(29,78,216,0.3))' }} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '2rem', color: '#1e3a5f', textAlign: 'center', letterSpacing: '-0.5px' }}>
              Verifique seu email
            </Typography>
            <Box sx={{ width: 40, height: 3, borderRadius: 2, background: 'linear-gradient(90deg, #1d4ed8, #e11d48)' }} />
            <Typography sx={{ fontSize: '0.88rem', color: 'rgba(30,58,95,0.65)', textAlign: 'center', lineHeight: 1.6 }}>
              Enviamos um link de confirmação para{' '}
              {emailFromState && <strong>{emailFromState}</strong>}.
              {!emailFromState && 'o seu email.'}
              {' '}Clique no link para ativar sua conta.
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: 'rgba(30,58,95,0.4)', textAlign: 'center' }}>
              Não recebeu? Verifique a pasta de spam.
            </Typography>
            {emailFromState && !resendSent && (
              <Button variant="ghost" loading={resendLoading} onClick={handleResend} sx={{ width: '100%' }}>
                Reenviar email
              </Button>
            )}
            {resendSent && (
              <Typography sx={{ fontSize: '0.85rem', color: '#1d4ed8', fontWeight: 600 }}>
                Email reenviado!
              </Typography>
            )}
            {import.meta.env.DEV && emailFromState && (
              <Button variant="primary" onClick={handleDevVerify} sx={{ width: '100%', mt: 1 }}>
                DEV: Simular clique no email
              </Button>
            )}
            <Typography sx={{ mt: 1, fontSize: '0.85rem', color: 'rgba(30,58,95,0.5)' }}>
              <Link to="/login" style={{ color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' }}>Voltar ao login</Link>
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
