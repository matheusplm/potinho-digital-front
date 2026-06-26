import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import FavoriteIcon from '@mui/icons-material/Favorite'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { api, ApiRequestError } from '../services/api'
import { Button, toast } from '../components/ui'
import { fadeSlide, floatHeart, font } from '../design-system'

const HEARTS = [
  { size: 18, left: '6%',  delay: '0s',   dur: '14s' },
  { size: 13, left: '32%', delay: '3s',   dur: '12s' },
  { size: 22, left: '66%', delay: '1.5s', dur: '16s' },
  { size: 15, left: '88%', delay: '5s',   dur: '13s' },
]

export function InviteAcceptPage() {
  const { token = '' } = useParams<{ token: string }>()
  const { user } = useUser()
  const navigate = useNavigate()

  const { data: invite, isLoading, error } = useQuery({
    queryKey: ['invite', token],
    queryFn: () => api.getInviteDetails(token),
    enabled: !!token,
    retry: false,
  })

  const acceptMutation = useMutation({
    mutationFn: () => api.acceptInvite(token),
    onSuccess: () => {
      toast.success('Convite aceito! Bem-vindo à coleção.')
      setTimeout(() => navigate('/home'), 1200)
    },
    onError: (e: Error) => {
      toast.error(e.message || 'Erro ao aceitar convite.')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: () => api.rejectInvite(token),
    onSuccess: () => {
      toast.success('Convite recusado.')
    },
    onError: (e: Error) => {
      toast.error(e.message || 'Erro ao recusar convite.')
    },
  })

  const fromParam = encodeURIComponent(`/convite/${token}`)

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

      <Stack sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', px: 3, py: 5, animation: `${fadeSlide} 0.5s ease both`, position: 'relative', zIndex: 1 }} spacing={0}>

        {isLoading && (
          <Stack alignItems="center" spacing={2}>
            <CircularProgress sx={{ color: '#1d4ed8' }} />
            <Typography sx={{ fontFamily: font.serif, fontSize: '1.2rem', color: '#1e3a5f' }}>
              Carregando convite...
            </Typography>
          </Stack>
        )}

        {!isLoading && (error || !invite) && (
          <Stack alignItems="center" spacing={2.5} sx={{ maxWidth: 340, width: '100%' }}>
            <HighlightOffIcon sx={{ fontSize: 64, color: '#e11d48', filter: 'drop-shadow(0 4px 16px rgba(225,29,72,0.3))' }} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.8rem', color: '#1e3a5f', textAlign: 'center' }}>
              Convite não encontrado
            </Typography>
            <Typography sx={{ fontSize: '0.88rem', color: 'rgba(30,58,95,0.6)', textAlign: 'center', lineHeight: 1.6 }}>
              {error instanceof ApiRequestError ? error.message : 'Este convite pode ter expirado ou foi cancelado.'}
            </Typography>
            <Typography sx={{ mt: 1, fontSize: '0.85rem', color: 'rgba(30,58,95,0.5)' }}>
              <Link to="/" style={{ color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' }}>Ir para o início</Link>
            </Typography>
          </Stack>
        )}

        {!isLoading && invite && (invite.status === 'rejected' || invite.status === 'expired') && (
          <Stack alignItems="center" spacing={2.5} sx={{ maxWidth: 340, width: '100%' }}>
            <HighlightOffIcon sx={{ fontSize: 64, color: invite.status === 'expired' ? '#6b7280' : '#e11d48', filter: 'drop-shadow(0 4px 16px rgba(225,29,72,0.2))' }} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.8rem', color: '#1e3a5f', textAlign: 'center' }}>
              {invite.status === 'expired' ? 'Convite expirado' : 'Convite recusado'}
            </Typography>
            <Typography sx={{ fontSize: '0.88rem', color: 'rgba(30,58,95,0.6)', textAlign: 'center', lineHeight: 1.6 }}>
              {invite.status === 'expired'
                ? 'Este convite não é mais válido. Peça ao criador da coleção para enviar um novo convite.'
                : 'Este convite já foi recusado.'}
            </Typography>
            <Typography sx={{ mt: 1, fontSize: '0.85rem', color: 'rgba(30,58,95,0.5)' }}>
              <Link to={user ? '/home' : '/'} style={{ color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' }}>
                {user ? 'Ir para home' : 'Ir para o início'}
              </Link>
            </Typography>
          </Stack>
        )}

        {!isLoading && invite && invite.status === 'accepted' && (
          <Stack alignItems="center" spacing={2.5} sx={{ maxWidth: 340, width: '100%' }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 64, color: '#16a34a', filter: 'drop-shadow(0 4px 16px rgba(22,163,74,0.3))' }} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.8rem', color: '#1e3a5f', textAlign: 'center' }}>
              Convite já aceito!
            </Typography>
            <Typography sx={{ fontSize: '0.88rem', color: 'rgba(30,58,95,0.6)', textAlign: 'center', lineHeight: 1.6 }}>
              Você já tem acesso à coleção <strong>{invite.collectionName}</strong>.
            </Typography>
            {user && (
              <Button variant="primary" onClick={() => navigate('/home')} sx={{ width: '100%', mt: 1 }}>
                Ir para home
              </Button>
            )}
            {!user && (
              <Typography sx={{ mt: 1, fontSize: '0.85rem', color: 'rgba(30,58,95,0.5)' }}>
                <Link to="/login" style={{ color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' }}>Fazer login</Link>
              </Typography>
            )}
          </Stack>
        )}

        {!isLoading && invite && invite.status === 'pending' && !user && (
          <Stack alignItems="center" spacing={2.5} sx={{ maxWidth: 340, width: '100%' }}>
            <FavoriteIcon sx={{ fontSize: 64, color: '#1d4ed8', filter: 'drop-shadow(0 4px 16px rgba(29,78,216,0.3))' }} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '2rem', color: '#1e3a5f', textAlign: 'center', letterSpacing: '-0.5px' }}>
              Você foi convidado!
            </Typography>
            <Box sx={{ width: 40, height: 3, borderRadius: 2, background: 'linear-gradient(90deg, #1d4ed8, #e11d48)' }} />
            <Typography sx={{ fontSize: '0.9rem', color: 'rgba(30,58,95,0.7)', textAlign: 'center', lineHeight: 1.7 }}>
              <strong>{invite.inviterName || 'Alguém'}</strong> te convidou para a coleção{' '}
              <strong>{invite.collectionName}</strong>.
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', color: 'rgba(30,58,95,0.5)', textAlign: 'center' }}>
              Faça login ou crie uma conta para aceitar.
            </Typography>
            <Stack spacing={1} sx={{ width: '100%' }}>
              <Button variant="primary" onClick={() => navigate(`/login?from=${fromParam}`)} sx={{ width: '100%' }}>
                Fazer login
              </Button>
              <Button variant="ghost" onClick={() => navigate(`/register?from=${fromParam}`)} sx={{ width: '100%' }}>
                Criar conta
              </Button>
            </Stack>
          </Stack>
        )}

        {!isLoading && invite && invite.status === 'pending' && user && (user.email ?? '').toLowerCase() !== invite.email.toLowerCase() && (
          <Stack alignItems="center" spacing={2.5} sx={{ maxWidth: 340, width: '100%' }}>
            <HighlightOffIcon sx={{ fontSize: 64, color: '#d97706', filter: 'drop-shadow(0 4px 16px rgba(217,119,6,0.3))' }} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.8rem', color: '#1e3a5f', textAlign: 'center' }}>
              Convite de outro email
            </Typography>
            <Typography sx={{ fontSize: '0.88rem', color: 'rgba(30,58,95,0.6)', textAlign: 'center', lineHeight: 1.6 }}>
              Este convite foi enviado para <strong>{invite.email}</strong>, mas você está logado como <strong>{user.email}</strong>.
            </Typography>
            <Typography sx={{ mt: 1, fontSize: '0.85rem', color: 'rgba(30,58,95,0.5)' }}>
              <Link to="/home" style={{ color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' }}>Ir para home</Link>
            </Typography>
          </Stack>
        )}

        {!isLoading && invite && invite.status === 'pending' && user && (user.email ?? '').toLowerCase() === invite.email.toLowerCase() && !rejectMutation.isSuccess && (
          <Stack alignItems="center" spacing={2.5} sx={{ maxWidth: 340, width: '100%' }}>
            <FavoriteIcon sx={{ fontSize: 64, color: '#1d4ed8', filter: 'drop-shadow(0 4px 16px rgba(29,78,216,0.3))' }} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '2rem', color: '#1e3a5f', textAlign: 'center', letterSpacing: '-0.5px' }}>
              Você foi convidado!
            </Typography>
            <Box sx={{ width: 40, height: 3, borderRadius: 2, background: 'linear-gradient(90deg, #1d4ed8, #e11d48)' }} />
            <Typography sx={{ fontSize: '0.9rem', color: 'rgba(30,58,95,0.7)', textAlign: 'center', lineHeight: 1.7 }}>
              <strong>{invite.inviterName || 'Alguém'}</strong> te convidou para a coleção{' '}
              <strong>{invite.collectionName}</strong>.
            </Typography>
            {acceptMutation.isSuccess ? (
              <Stack alignItems="center" spacing={1.5}>
                <CheckCircleOutlineIcon sx={{ fontSize: 48, color: '#16a34a' }} />
                <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.4rem', color: '#1e3a5f' }}>
                  Aceito!
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: 'rgba(30,58,95,0.6)' }}>
                  Redirecionando...
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={1.5} sx={{ width: '100%', mt: 1 }}>
                <Button
                  variant="primary"
                  loading={acceptMutation.isPending}
                  disabled={rejectMutation.isPending}
                  onClick={() => acceptMutation.mutate()}
                  sx={{ width: '100%' }}
                >
                  Aceitar convite
                </Button>
                <Button
                  variant="ghost"
                  loading={rejectMutation.isPending}
                  disabled={acceptMutation.isPending}
                  onClick={() => rejectMutation.mutate()}
                  sx={{ width: '100%', color: 'rgba(30,58,95,0.5)' }}
                >
                  Recusar
                </Button>
              </Stack>
            )}
          </Stack>
        )}

        {!isLoading && invite && invite.status === 'pending' && user && (user.email ?? '').toLowerCase() === invite.email.toLowerCase() && rejectMutation.isSuccess && (
          <Stack alignItems="center" spacing={2.5} sx={{ maxWidth: 340, width: '100%' }}>
            <HighlightOffIcon sx={{ fontSize: 64, color: '#6b7280', filter: 'drop-shadow(0 4px 16px rgba(107,114,128,0.25))' }} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.8rem', color: '#1e3a5f', textAlign: 'center' }}>
              Convite recusado
            </Typography>
            <Typography sx={{ fontSize: '0.88rem', color: 'rgba(30,58,95,0.6)', textAlign: 'center' }}>
              Tudo bem! Você pode ignorar este convite.
            </Typography>
            <Button variant="ghost" onClick={() => navigate('/home')} sx={{ width: '100%', mt: 1 }}>
              Ir para home
            </Button>
          </Stack>
        )}

      </Stack>
    </Box>
  )
}
