import FavoriteIcon from '@mui/icons-material/Favorite'
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead'
import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { api } from '../services/api'
import { colors, fadeSlide, floatHeart, font, gradients } from '../design-system'

const HEARTS = [
  { size: 18, left: '10%', delay: '0s',   dur: '13s' },
  { size: 22, left: '34%', delay: '3.5s', dur: '11s' },
  { size: 15, left: '66%', delay: '1.5s', dur: '14s' },
  { size: 20, left: '84%', delay: '5.5s', dur: '12s' },
]

export function ConfirmEmailChangePage() {
  const { patchUser } = useUser()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMsg, setErrorMsg] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const confirmed = useRef(false)

  useEffect(() => {
    if (!token || confirmed.current) return
    confirmed.current = true
    api.confirmEmailChange(token)
      .then((result) => {
        if (result.email) {
          patchUser({ email: result.email })
          setNewEmail(result.email)
        }
        setStatus('success')
        setTimeout(() => navigate('/conta'), 2000)
      })
      .catch((err: Error) => {
        setErrorMsg(err.message || 'Link inválido ou expirado.')
        setStatus('error')
      })
  }, [token, patchUser, navigate])

  return (
    <Box sx={{
      height: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative',
      overflow: 'hidden',
      background: gradients.page,
    }}>
      <Box sx={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,78,216,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      {HEARTS.map((h, i) => (
        <FavoriteIcon key={i} sx={{
          position: 'absolute', bottom: -8, left: h.left, fontSize: h.size, zIndex: 0,
          color: i % 2 === 0 ? '#1d4ed8' : '#7c3aed', filter: 'blur(0.5px)',
          animation: `${floatHeart(i)} ${h.dur} ${h.delay} ease-in infinite`, pointerEvents: 'none',
        }} />
      ))}

      <Stack sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', px: 3, py: 5, animation: `${fadeSlide} 0.5s ease both` }}>
        {status === 'verifying' && (
          <Stack alignItems="center" spacing={2}>
            <CircularProgress sx={{ color: colors.primary.text }} />
            <Typography sx={{ fontFamily: font.serif, fontSize: '1.2rem', color: colors.text.primary }}>
              Confirmando troca de email...
            </Typography>
          </Stack>
        )}

        {status === 'success' && (
          <Stack alignItems="center" spacing={2.5} sx={{ maxWidth: 320, textAlign: 'center' }}>
            <MarkEmailReadIcon sx={{ fontSize: 64, color: '#22c55e', filter: 'drop-shadow(0 4px 16px rgba(34,197,94,0.3))' }} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.8rem', color: colors.text.primary }}>
              Email atualizado!
            </Typography>
            {newEmail && (
              <Typography sx={{ fontSize: '0.88rem', color: colors.text.secondary, lineHeight: 1.6 }}>
                Seu novo email é <strong>{newEmail}</strong>.
              </Typography>
            )}
            <Typography sx={{ fontSize: '0.82rem', color: colors.text.muted }}>
              Redirecionando para sua conta...
            </Typography>
          </Stack>
        )}

        {status === 'error' && (
          <Stack alignItems="center" spacing={2.5} sx={{ maxWidth: 320, textAlign: 'center' }}>
            <FavoriteIcon sx={{ fontSize: 52, color: '#e11d48', filter: 'drop-shadow(0 4px 16px rgba(225,29,72,0.3))' }} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.8rem', color: colors.text.primary }}>
              Link inválido
            </Typography>
            <Typography sx={{ fontSize: '0.88rem', color: colors.text.secondary, lineHeight: 1.6 }}>
              {errorMsg}
            </Typography>
            <Typography sx={{ fontSize: '0.85rem' }}>
              <Link to="/conta" style={{ color: colors.primary.text, fontWeight: 700, textDecoration: 'none' }}>
                Voltar para minha conta
              </Link>
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
