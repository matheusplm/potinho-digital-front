import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import FavoriteIcon from '@mui/icons-material/Favorite'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { api, ApiRequestError } from '../services/api'
import { Button, ConfirmDeleteDialog, toast } from '../components/ui'
import { fadeSlide, floatHeart, font, radius, shimmer } from '../design-system'

const HEARTS = [
  { size: 18, left: '6%',  delay: '0s',   dur: '14s' },
  { size: 13, left: '32%', delay: '3s',   dur: '12s' },
  { size: 22, left: '66%', delay: '1.5s', dur: '16s' },
  { size: 15, left: '88%', delay: '5s',   dur: '13s' },
]

const NOTE_LOOKS = [
  {
    label: 'Comum', color: '#64748b', bg: 'rgba(255,255,255,0.97)', border: 'rgba(100,116,139,0.3)',
    glow: '0 10px 24px rgba(15,23,42,0.1)', message: 'Lembra do nosso primeiro café? ☕',
    sx: { transform: 'rotate(-9deg) translateX(-38px) scale(0.92)', opacity: 0.75 },
  },
  {
    label: 'Raro', color: '#1d4ed8', bg: '#eff6ff', border: 'rgba(29,78,216,0.35)',
    glow: '0 0 22px rgba(29,78,216,0.22)', message: 'Do jeitinho que você sorri 😊',
    sx: { transform: 'rotate(8deg) translateX(38px) scale(0.92)', opacity: 0.75 },
  },
  {
    label: 'Lendário', color: '#b45309', bg: '#fffbeb', border: 'rgba(217,119,6,0.45)',
    glow: '0 0 26px rgba(245,158,11,0.32)', message: 'Você é a melhor parte dos meus dias 💙',
    legendary: true, sx: { transform: 'rotate(-1deg)' },
  },
]

const PERKS = [
  { emoji: '🎁', text: 'Abra pacotinhos e descubra bilhetes surpresa' },
  { emoji: '🎴', text: 'Colecione raridades, do comum ao lendário' },
  { emoji: '❤️', text: 'Favorite as cartinhas que tocarem você' },
]

function MiniNote({ look }: { look: typeof NOTE_LOOKS[number] }) {
  return (
    <Box sx={{
      position: 'absolute', inset: 0,
      background: look.bg, borderRadius: '16px', border: `1.5px solid ${look.border}`,
      boxShadow: look.glow, p: 1.5, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      ...look.sx,
    }}>
      {look.legendary && (
        <Box sx={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(90deg,transparent 20%,rgba(253,230,138,0.42) 50%,transparent 80%)',
          backgroundSize: '200% auto', animation: `${shimmer} 2.6s linear infinite`,
        }} />
      )}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box sx={{ px: 0.8, py: 0.25, borderRadius: radius.full, background: `${look.color}14`, border: `1px solid ${look.color}2e` }}>
          <Typography sx={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: look.color }}>
            {look.legendary ? '★' : '◆'} {look.label}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.7rem', opacity: 0.4, lineHeight: 1 }}>💌</Typography>
      </Stack>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Typography sx={{ fontFamily: font.serif, fontSize: '0.84rem', color: '#1e3a5f', lineHeight: 1.55 }}>
          {look.message}
        </Typography>
      </Box>
    </Box>
  )
}

function ShowcasePanel() {
  return (
    <Box sx={{
      width: { xs: '100%', md: 380 }, flexShrink: 0, position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(160deg,#dbeafe 0%,#fce7f3 58%,#ede9fe 100%)',
      display: 'flex', flexDirection: 'column',
      p: { xs: 2.5, md: 3 }, minHeight: { xs: 230, md: 480 },
    }}>
      <Box sx={{ position: 'absolute', top: -70, right: -70, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,78,216,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(225,29,72,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <Stack direction="row" spacing={1} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ width: 30, height: 30, borderRadius: '9px', background: 'linear-gradient(135deg,#1d4ed8,#e11d48)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FavoriteIcon sx={{ fontSize: 15, color: '#fff' }} />
        </Box>
        <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '0.95rem', color: '#1e3a5f' }}>
          Potinho Digital
        </Typography>
      </Stack>

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: { xs: 2, md: 0 } }}>
        <Box sx={{ position: 'relative', width: 216, height: { xs: 128, md: 150 } }}>
          {NOTE_LOOKS.map((look) => <MiniNote key={look.label} look={look} />)}
        </Box>
      </Box>

      <Typography sx={{ position: 'relative', zIndex: 1, fontSize: '0.8rem', color: 'rgba(30,58,95,0.6)', fontStyle: 'italic', textAlign: 'center' }}>
        um álbum de bilhetes, feito com carinho, esperando por você 💌
      </Typography>
    </Box>
  )
}

function StateBlock({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Stack spacing={2} sx={{ alignItems: { xs: 'center', md: 'flex-start' }, textAlign: { xs: 'center', md: 'left' } }}>
      {icon}
      <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: { xs: '1.7rem', md: '2rem' }, color: '#1e3a5f', lineHeight: 1.15, letterSpacing: '-0.5px' }}>
        {title}
      </Typography>
      {children}
    </Stack>
  )
}

export function InviteAcceptPage() {
  const { token = '' } = useParams<{ token: string }>()
  const { user } = useUser()
  const navigate = useNavigate()
  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false)

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
      setRejectConfirmOpen(false)
      toast.success('Convite recusado.')
    },
    onError: (e: Error) => {
      setRejectConfirmOpen(false)
      toast.error(e.message || 'Erro ao recusar convite.')
    },
  })

  const fromParam = encodeURIComponent(`/convite/${token}`)
  const status = invite?.status
  const pendingForMe = !isLoading && invite && status === 'pending' && !!user && invite.isForMe !== false

  return (
    <Box sx={{
      minHeight: '100dvh', position: 'relative', overflowX: 'hidden', overflowY: 'auto',
      background: 'linear-gradient(160deg, #dbeafe 0%, #fce7f3 55%, #ede9fe 100%)',
    }}>
      {HEARTS.map((h, i) => (
        <FavoriteIcon key={i} sx={{
          position: 'absolute', bottom: -8, left: h.left, fontSize: h.size, zIndex: 0,
          color: i % 2 === 0 ? '#1d4ed8' : '#e11d48', filter: 'blur(0.5px)',
          animation: `${floatHeart(i)} ${h.dur} ${h.delay} ease-in infinite`, pointerEvents: 'none',
        }} />
      ))}

      <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, md: 4 }, position: 'relative', zIndex: 1 }}>
        <Box sx={{
          width: '100%', maxWidth: 880, borderRadius: '26px', overflow: 'hidden',
          background: '#fff', boxShadow: '0 32px 90px rgba(30,58,95,0.2)',
          display: 'flex', flexDirection: { xs: 'column', md: 'row' },
          animation: `${fadeSlide} 0.5s ease both`,
        }}>
          <ShowcasePanel />

          <Box sx={{ flex: 1, p: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: { md: 480 } }}>

            {isLoading && (
              <Stack spacing={2} sx={{ alignItems: { xs: 'center', md: 'flex-start' } }}>
                <CircularProgress size={30} sx={{ color: '#1d4ed8' }} />
                <Typography sx={{ fontFamily: font.serif, fontSize: '1.2rem', color: '#1e3a5f' }}>
                  Carregando convite...
                </Typography>
              </Stack>
            )}

            {!isLoading && (error || !invite) && (
              <StateBlock icon={<HighlightOffIcon sx={{ fontSize: 52, color: '#e11d48' }} />} title="Convite não encontrado">
                <Typography sx={{ fontSize: '0.9rem', color: 'rgba(30,58,95,0.6)', lineHeight: 1.65 }}>
                  {error instanceof ApiRequestError ? error.message : 'Este convite pode ter expirado ou foi cancelado.'}
                </Typography>
                <Button variant="ghost" onClick={() => navigate('/')} sx={{ px: 3 }}>
                  Ir para o início
                </Button>
              </StateBlock>
            )}

            {!isLoading && invite && (status === 'rejected' || status === 'expired') && (
              <StateBlock icon={<HighlightOffIcon sx={{ fontSize: 52, color: status === 'expired' ? '#6b7280' : '#e11d48' }} />} title={status === 'expired' ? 'Convite expirado' : 'Convite recusado'}>
                <Typography sx={{ fontSize: '0.9rem', color: 'rgba(30,58,95,0.6)', lineHeight: 1.65 }}>
                  {status === 'expired'
                    ? 'Este convite não é mais válido. Peça ao criador da coleção para enviar um novo.'
                    : 'Este convite já foi recusado.'}
                </Typography>
                <Button variant="ghost" onClick={() => navigate(user ? '/home' : '/')} sx={{ px: 3 }}>
                  {user ? 'Ir para home' : 'Ir para o início'}
                </Button>
              </StateBlock>
            )}

            {!isLoading && invite && status === 'accepted' && (
              <StateBlock icon={<CheckCircleOutlineIcon sx={{ fontSize: 52, color: '#16a34a' }} />} title="Convite já aceito!">
                <Typography sx={{ fontSize: '0.9rem', color: 'rgba(30,58,95,0.6)', lineHeight: 1.65 }}>
                  Você já tem acesso à coleção <strong style={{ color: '#1e3a5f' }}>{invite.collectionName}</strong>.
                </Typography>
                {user ? (
                  <Button variant="primary" onClick={() => navigate('/home')} sx={{ px: 4 }}>
                    Ir para home
                  </Button>
                ) : (
                  <Button variant="primary" onClick={() => navigate('/login')} sx={{ px: 4 }}>
                    Fazer login
                  </Button>
                )}
              </StateBlock>
            )}

            {!isLoading && invite && status === 'pending' && user && invite.isForMe === false && (
              <StateBlock icon={<MailOutlineIcon sx={{ fontSize: 52, color: '#d97706' }} />} title="Convite de outro email">
                <Typography sx={{ fontSize: '0.9rem', color: 'rgba(30,58,95,0.6)', lineHeight: 1.65 }}>
                  Este convite foi enviado para <strong style={{ color: '#1e3a5f' }}>{invite.email}</strong>, mas você está logado como <strong style={{ color: '#1e3a5f' }}>{user.email}</strong>. Entre com a conta certa para aceitar.
                </Typography>
                <Button variant="ghost" onClick={() => navigate('/home')} sx={{ px: 3 }}>
                  Ir para home
                </Button>
              </StateBlock>
            )}

            {!isLoading && invite && status === 'pending' && !user && (
              <Stack spacing={2.2} sx={{ alignItems: { xs: 'center', md: 'flex-start' }, textAlign: { xs: 'center', md: 'left' } }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: 1.4, color: '#1d4ed8', textTransform: 'uppercase' }}>
                  Convite especial
                </Typography>
                <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: { xs: '1.8rem', md: '2.3rem' }, color: '#1e3a5f', lineHeight: 1.12, letterSpacing: '-0.5px' }}>
                  Você foi convidado! 💌
                </Typography>
                <Typography sx={{ fontSize: '0.95rem', color: 'rgba(30,58,95,0.7)', lineHeight: 1.7 }}>
                  <strong style={{ color: '#1e3a5f' }}>{invite.inviterName || 'Alguém'}</strong> preparou a coleção{' '}
                  <strong style={{ color: '#1e3a5f' }}>{invite.collectionName}</strong> para você.
                </Typography>
                <Stack spacing={1}>
                  {PERKS.map((perk) => (
                    <Stack key={perk.text} direction="row" spacing={1.1} alignItems="center">
                      <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>{perk.emoji}</Typography>
                      <Typography sx={{ fontSize: '0.86rem', color: 'rgba(30,58,95,0.72)' }}>{perk.text}</Typography>
                    </Stack>
                  ))}
                </Stack>
                <Typography sx={{ fontSize: '0.8rem', color: 'rgba(30,58,95,0.5)' }}>
                  Entre ou crie uma conta gratuita para aceitar.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ width: '100%', maxWidth: 380 }}>
                  <Button variant="primary" onClick={() => navigate(`/login?from=${fromParam}`)} sx={{ flex: 1, py: 1.1 }}>
                    Fazer login
                  </Button>
                  <Button variant="ghost" onClick={() => navigate(`/register?from=${fromParam}`)} sx={{ flex: 1, py: 1.1 }}>
                    Criar conta
                  </Button>
                </Stack>
              </Stack>
            )}

            {pendingForMe && !rejectMutation.isSuccess && !acceptMutation.isSuccess && (
              <Stack spacing={2.2} sx={{ alignItems: { xs: 'center', md: 'flex-start' }, textAlign: { xs: 'center', md: 'left' } }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: 1.4, color: '#1d4ed8', textTransform: 'uppercase' }}>
                  Convite especial
                </Typography>
                <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: { xs: '1.8rem', md: '2.3rem' }, color: '#1e3a5f', lineHeight: 1.12, letterSpacing: '-0.5px' }}>
                  Você foi convidado! 💌
                </Typography>
                <Typography sx={{ fontSize: '0.95rem', color: 'rgba(30,58,95,0.7)', lineHeight: 1.7 }}>
                  <strong style={{ color: '#1e3a5f' }}>{invite?.inviterName || 'Alguém'}</strong> preparou a coleção{' '}
                  <strong style={{ color: '#1e3a5f' }}>{invite?.collectionName}</strong> especialmente para você.
                </Typography>
                <Stack spacing={1}>
                  {PERKS.map((perk) => (
                    <Stack key={perk.text} direction="row" spacing={1.1} alignItems="center">
                      <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>{perk.emoji}</Typography>
                      <Typography sx={{ fontSize: '0.86rem', color: 'rgba(30,58,95,0.72)' }}>{perk.text}</Typography>
                    </Stack>
                  ))}
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ width: '100%', maxWidth: 420, pt: 0.5 }}>
                  <Button
                    variant="primary"
                    loading={acceptMutation.isPending}
                    disabled={rejectMutation.isPending}
                    onClick={() => acceptMutation.mutate()}
                    sx={{ flex: 1.4, py: 1.15, fontSize: '0.95rem' }}
                  >
                    Aceitar convite 💙
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={acceptMutation.isPending || rejectMutation.isPending}
                    onClick={() => setRejectConfirmOpen(true)}
                    sx={{ flex: 1, py: 1.15, color: 'rgba(30,58,95,0.55)' }}
                  >
                    Recusar
                  </Button>
                </Stack>
                <Typography sx={{ fontSize: '0.72rem', color: 'rgba(30,58,95,0.45)' }}>
                  logado como {user?.email}
                </Typography>
              </Stack>
            )}

            {pendingForMe && acceptMutation.isSuccess && (
              <StateBlock icon={<CheckCircleOutlineIcon sx={{ fontSize: 56, color: '#16a34a' }} />} title="Aceito! 🎉">
                <Typography sx={{ fontSize: '0.9rem', color: 'rgba(30,58,95,0.6)', lineHeight: 1.65 }}>
                  A coleção <strong style={{ color: '#1e3a5f' }}>{invite?.collectionName}</strong> já é sua. Redirecionando...
                </Typography>
              </StateBlock>
            )}

            {pendingForMe && rejectMutation.isSuccess && (
              <StateBlock icon={<HighlightOffIcon sx={{ fontSize: 52, color: '#6b7280' }} />} title="Convite recusado">
                <Typography sx={{ fontSize: '0.9rem', color: 'rgba(30,58,95,0.6)', lineHeight: 1.65 }}>
                  Tudo bem! Você pode ignorar este convite.
                </Typography>
                <Button variant="ghost" onClick={() => navigate('/home')} sx={{ px: 3 }}>
                  Ir para home
                </Button>
              </StateBlock>
            )}

          </Box>
        </Box>
      </Box>

      <ConfirmDeleteDialog
        open={rejectConfirmOpen}
        title="Recusar este convite?"
        description={
          <Typography sx={{ fontSize: '0.88rem', color: 'rgba(30,58,95,0.65)', lineHeight: 1.6 }}>
            O link ficará inválido e <strong style={{ color: '#1e3a5f' }}>{invite?.inviterName || 'o criador'}</strong> precisará enviar um novo convite se você mudar de ideia.
          </Typography>
        }
        isPending={rejectMutation.isPending}
        confirmLabel="Recusar convite"
        onConfirm={() => rejectMutation.mutate()}
        onClose={() => setRejectConfirmOpen(false)}
      />
    </Box>
  )
}
