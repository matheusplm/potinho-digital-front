import FavoriteIcon from '@mui/icons-material/Favorite'
import { Box, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { cardIn, font, ink, overlayIn, packCtaFloat, radius, shimmer, slideL, slideR } from '../../design-system'
import { queryKeys } from '../../hooks/useNotes'
import { useUser } from '../../context/UserContext'
import { COLLECTION_TEMPLATES, createCollectionFromTemplate } from '../../services/collectionTemplates'
import type { CollectionTemplate } from '../../services/collectionTemplates'
import { slugify } from '../../utils/slug'
import { TemplateKitRow } from '../TemplateKitRow'
import { KitConfirmDialog } from '../KitConfirmDialog'
import { Button } from './Button'
import { Input } from './Input'
import { toast } from './toast'

const heartRise = keyframes`
  0%   { transform: translateY(0) scale(0.85); opacity: 0; }
  18%  { opacity: 0.4; }
  100% { transform: translateY(-160px) scale(1.15); opacity: 0; }
`

const pulseHint = keyframes`
  0%, 100% { opacity: 0.55; transform: translateY(0); }
  50%      { opacity: 1; transform: translateY(-2px); }
`

const popOut = (x: number, rot: number) => keyframes`
  0%   { opacity: 0; transform: translate(0, 48px) scale(0.4) rotate(0deg); }
  55%  { opacity: 1; }
  100% { opacity: 1; transform: translate(${x}px, 0) scale(1) rotate(${rot}deg); }
`

const heartBurst = (x: number, y: number) => keyframes`
  0%   { opacity: 0.9; transform: translate(0, 0) scale(0.5); }
  100% { opacity: 0; transform: translate(${x}px, ${y}px) scale(1.25); }
`

interface RarityLook {
  label: string
  color: string
  bg: string
  border: string
  glow: string
  legendary?: boolean
}

const RARITY: Record<'comum' | 'raro' | 'epico' | 'lendario', RarityLook> = {
  comum:    { label: 'Comum',    color: '#64748b', bg: 'rgba(255,255,255,0.96)', border: 'rgba(100,116,139,0.32)', glow: '0 8px 20px rgba(15,23,42,0.08)' },
  raro:     { label: 'Raro',     color: '#1d4ed8', bg: '#eff6ff', border: 'rgba(29,78,216,0.38)',  glow: '0 0 20px rgba(29,78,216,0.2)' },
  epico:    { label: 'Épico',    color: '#7c3aed', bg: '#f5f3ff', border: 'rgba(124,58,237,0.38)', glow: '0 0 22px rgba(124,58,237,0.22)' },
  lendario: { label: 'Lendário', color: '#b45309', bg: '#fffbeb', border: 'rgba(217,119,6,0.48)',  glow: '0 0 24px rgba(245,158,11,0.32)', legendary: true },
}

const RARITY_CYCLE = [RARITY.comum, RARITY.raro, RARITY.epico, RARITY.lendario]

const OPEN_CARDS = [
  { emoji: '📝', r: RARITY.comum,    x: -78, rot: -12, delay: '0s' },
  { emoji: '💙', r: RARITY.raro,     x: 0,   rot: 2,   delay: '0.09s' },
  { emoji: '👑', r: RARITY.lendario, x: 78,  rot: 12,  delay: '0.18s' },
].map((c) => ({ ...c, anim: popOut(c.x, c.rot) }))

const HEART_BURST = [
  { x: -64, y: -52, size: 13, delay: '0.05s' },
  { x: 58,  y: -64, size: 11, delay: '0.12s' },
  { x: -34, y: -84, size: 9,  delay: '0.2s' },
  { x: 40,  y: -40, size: 12, delay: '0.16s' },
].map((h) => ({ ...h, anim: heartBurst(h.x, h.y) }))

function StageHearts({ tint }: { tint: string }) {
  const hearts = [
    { left: '10%', size: 12, delay: '0s',   dur: '4.6s' },
    { left: '84%', size: 14, delay: '1.4s', dur: '5.4s' },
    { left: '48%', size: 9,  delay: '2.6s', dur: '5s' },
  ]
  return (
    <>
      {hearts.map((h, i) => (
        <FavoriteIcon key={i} sx={{
          position: 'absolute', bottom: -8, left: h.left, fontSize: h.size, color: tint,
          opacity: 0, animation: `${heartRise} ${h.dur} ${h.delay} ease-out infinite`, pointerEvents: 'none',
        }} />
      ))}
    </>
  )
}

function MiniNote({ r, message, sx }: { r: RarityLook; message: string; sx?: object }) {
  return (
    <Box sx={{
      background: r.bg, borderRadius: '14px', border: `1.5px solid ${r.border}`, boxShadow: r.glow,
      p: 1.3, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      ...sx,
    }}>
      {r.legendary && (
        <Box sx={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(90deg,transparent 20%,rgba(253,230,138,0.4) 50%,transparent 80%)',
          backgroundSize: '200% auto', animation: `${shimmer} 2.6s linear infinite`,
        }} />
      )}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flexShrink: 0 }}>
        <Box sx={{ px: 0.7, py: 0.2, borderRadius: radius.full, background: `${r.color}14`, border: `1px solid ${r.color}2e`, transition: 'all 0.35s ease' }}>
          <Typography sx={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: r.color, transition: 'color 0.35s ease' }}>
            {r.legendary ? '★' : '◆'} {r.label}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.66rem', opacity: 0.4, lineHeight: 1 }}>💌</Typography>
      </Stack>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Typography sx={{ fontFamily: font.serif, fontSize: '0.78rem', color: ink.primary, lineHeight: 1.55 }}>
          {message}
        </Typography>
      </Box>
    </Box>
  )
}

function StageWelcome() {
  return (
    <Box sx={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <StageHearts tint="#e11d48" />
      <Box sx={{ position: 'relative', width: 200, height: 128 }}>
        <MiniNote r={RARITY.comum} message="Lembra do nosso primeiro café? ☕" sx={{ position: 'absolute', inset: 0, transform: 'rotate(-9deg) translateX(-34px) scale(0.9)', opacity: 0.72 }} />
        <MiniNote r={RARITY.raro} message="Do jeitinho que você sorri 😊" sx={{ position: 'absolute', inset: 0, transform: 'rotate(8deg) translateX(34px) scale(0.9)', opacity: 0.72 }} />
        <MiniNote r={RARITY.lendario} message="Você é a melhor parte dos meus dias 💙" sx={{ position: 'absolute', inset: 0, transform: 'rotate(-1deg)' }} />
      </Box>
    </Box>
  )
}

function StageRarities() {
  const [active, setActive] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setActive((v) => (v + 1) % RARITY_CYCLE.length), 1600)
    return () => clearInterval(timer)
  }, [])
  const r = RARITY_CYCLE[active]
  return (
    <Box sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.3 }}>
      <MiniNote r={r} message="Lembra do nosso primeiro encontro? Eu lembro de tudo. 💫" sx={{ width: 218, height: 106, transition: 'background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease' }} />
      <Stack direction="row" spacing={0.5}>
        {RARITY_CYCLE.map((item, i) => (
          <Box key={item.label} onClick={() => setActive(i)} sx={{
            px: 0.9, py: 0.3, borderRadius: radius.full, cursor: 'pointer',
            background: i === active ? `${item.color}16` : 'rgba(255,255,255,0.55)',
            border: `1px solid ${i === active ? `${item.color}55` : 'rgba(0,0,0,0.06)'}`,
            transition: 'all 0.25s ease',
          }}>
            <Typography sx={{ fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: i === active ? item.color : ink.muted, transition: 'color 0.25s ease' }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

function StagePack() {
  const [opened, setOpened] = useState(false)
  return (
    <Box sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {!opened ? (
        <>
          <Box
            onClick={() => setOpened(true)}
            sx={{
              width: 92, height: 92, borderRadius: '24px', cursor: 'pointer', position: 'relative', overflow: 'hidden',
              background: 'linear-gradient(135deg,#fb7185,#e11d48)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 14px 36px rgba(225,29,72,0.35)',
              animation: `${packCtaFloat} 2.6s ease-in-out infinite`,
              '&:active': { transform: 'scale(0.94)' },
            }}
          >
            <Box sx={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.45) 48%,transparent 65%)',
              backgroundSize: '220% auto', animation: `${shimmer} 2.4s linear infinite`,
            }} />
            <Typography sx={{ fontSize: '2.4rem', lineHeight: 1, userSelect: 'none' }}>💌</Typography>
          </Box>
          <Typography sx={{ mt: 1.7, fontSize: '0.74rem', fontWeight: 800, color: '#b45309', letterSpacing: 0.4, animation: `${pulseHint} 1.6s ease-in-out infinite`, userSelect: 'none' }}>
            👆 toque no pacotinho para abrir
          </Typography>
        </>
      ) : (
        <>
          <Box sx={{ position: 'relative', width: 240, height: 112 }}>
            {OPEN_CARDS.map((c) => (
              <Box key={c.r.label} sx={{
                position: 'absolute', left: '50%', top: '50%', ml: '-34px', mt: '-46px',
                width: 68, height: 92, borderRadius: '12px', overflow: 'hidden',
                background: c.r.bg, border: `1.5px solid ${c.r.border}`, boxShadow: c.r.glow,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.4,
                animation: `${c.anim} 0.55s cubic-bezier(0.34,1.56,0.64,1) ${c.delay} both`,
              }}>
                {c.r.legendary && (
                  <Box sx={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: 'linear-gradient(90deg,transparent 20%,rgba(253,230,138,0.45) 50%,transparent 80%)',
                    backgroundSize: '200% auto', animation: `${shimmer} 2.4s linear infinite`,
                  }} />
                )}
                <Typography sx={{ fontSize: '1.3rem', lineHeight: 1 }}>{c.emoji}</Typography>
                <Typography sx={{ fontSize: '0.5rem', fontWeight: 900, letterSpacing: 0.6, textTransform: 'uppercase', color: c.r.color }}>
                  {c.r.legendary ? '★' : '◆'} {c.r.label}
                </Typography>
              </Box>
            ))}
            {HEART_BURST.map((h, i) => (
              <FavoriteIcon key={i} sx={{
                position: 'absolute', left: '50%', top: '50%', ml: `-${h.size / 2}px`, mt: `-${h.size / 2}px`,
                fontSize: h.size, color: '#e11d48',
                animation: `${h.anim} 0.9s ease-out ${h.delay} both`, pointerEvents: 'none',
              }} />
            ))}
          </Box>
          <Typography sx={{ mt: 1.2, fontSize: '0.72rem', fontWeight: 700, color: ink.secondary }}>
            ✨ Veio até um Lendário!
          </Typography>
          <Typography onClick={() => setOpened(false)} sx={{ mt: 0.3, fontSize: '0.66rem', fontWeight: 800, color: '#d97706', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
            abrir de novo
          </Typography>
        </>
      )}
    </Box>
  )
}

function StageInvite() {
  return (
    <Box sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.1 }}>
      <StageHearts tint="#1d4ed8" />
      <Box sx={{
        width: 240, borderRadius: '16px', p: 1.4,
        background: 'rgba(255,255,255,0.94)', border: '1.5px solid rgba(29,78,216,0.16)',
        boxShadow: '0 10px 30px rgba(29,78,216,0.12)',
      }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: '0.95rem', lineHeight: 1 }}>💙</Typography>
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: ink.primary, lineHeight: 1.2 }}>Pessoa amada</Typography>
            <Typography sx={{ fontSize: '0.64rem', color: ink.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>amor@email.com</Typography>
          </Box>
          <Box sx={{ px: 0.8, py: 0.3, borderRadius: radius.full, background: 'rgba(220,252,231,0.9)', border: '1px solid rgba(21,128,61,0.25)', flexShrink: 0 }}>
            <Typography sx={{ fontSize: '0.56rem', fontWeight: 900, color: '#15803d' }}>✓ convidado</Typography>
          </Box>
        </Stack>
      </Box>
      <Box sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.6, px: 1.5, py: 0.65, borderRadius: radius.full,
        background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 8px 22px rgba(79,70,229,0.32)',
      }}>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff' }}>👀 Simular como leitor</Typography>
      </Box>
      <Typography sx={{ fontSize: '0.6rem', color: ink.muted }}>o Simular fica no menu principal</Typography>
    </Box>
  )
}

function StageStart() {
  return (
    <Box sx={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <StageHearts tint="#e11d48" />
      <Box sx={{ width: 244, borderRadius: '18px', overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 14px 34px rgba(190,24,93,0.2)' }}>
        <Box sx={{ p: 1.4, background: 'linear-gradient(135deg,#fb7185,#ec4899)', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', flexShrink: 0, background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: '1.1rem', lineHeight: 1 }}>💙</Typography>
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '0.92rem', color: '#fff', lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.18)' }}>
              Nosso Potinho
            </Typography>
            <Typography sx={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.88)' }}>pronta em segundos ✨</Typography>
          </Box>
        </Box>
        <Box sx={{ px: 1.2, py: 1, background: 'rgba(255,255,255,0.95)', display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {['✉️ 4 bilhetes', '🎁 2 pacotinhos', '⭐ 4 raridades'].map((chip) => (
            <Box key={chip} sx={{ px: 0.7, py: 0.3, borderRadius: radius.full, background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.16)' }}>
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#be123c' }}>{chip}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

const STEPS = [
  {
    accent: '#e11d48',
    stageBg: 'linear-gradient(160deg,#fdf2f8 0%,#fce7f3 55%,#ede9fe 100%)',
    title: 'Bem-vindo(a) ao Potinho Digital',
    desc: 'Crie um álbum de bilhetes para alguém especial descobrir aos pouquinhos, como um álbum de figurinhas, só que de amor.',
    stage: <StageWelcome />,
  },
  {
    accent: '#7c3aed',
    stageBg: 'linear-gradient(160deg,#eef2ff 0%,#f5f3ff 55%,#fce7f3 100%)',
    title: 'Escreva bilhetes com raridade',
    desc: 'Mensagens, memórias, poemas. Cada bilhete ganha uma raridade, e as mais especiais brilham diferente.',
    stage: <StageRarities />,
  },
  {
    accent: '#d97706',
    stageBg: 'linear-gradient(160deg,#fff7ed 0%,#ffedd5 55%,#fce7f3 100%)',
    title: 'Monte pacotinhos surpresa',
    desc: 'É assim que a pessoa recebe seus bilhetes: abrindo pacotinhos, um pouquinho por dia. Cada abertura é uma surpresa.',
    stage: <StagePack />,
  },
  {
    accent: '#1d4ed8',
    stageBg: 'linear-gradient(160deg,#eff6ff 0%,#dbeafe 55%,#e0f2fe 100%)',
    title: 'Convide quem você ama',
    desc: 'Adicione o email da pessoa na aba Acesso da coleção. E antes de enviar, use o Simular para sentir tudo como a pessoa vai sentir.',
    stage: <StageInvite />,
  },
  {
    accent: '#e11d48',
    stageBg: 'linear-gradient(160deg,#fdf2f8 0%,#ffe4e6 55%,#fce7f3 100%)',
    title: 'Escolha um kit e pronto',
    desc: 'A coleção já nasce com bilhetes de exemplo. É só trocar pelas suas palavras.',
    stage: <StageStart />,
  },
]

interface Props {
  onDismiss?: () => void
}

export function OnboardingOverlay({ onDismiss }: Props) {
  const [open, setOpen] = useState(true)
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [creating, setCreating] = useState<string | null>(null)
  const [selectedKit, setSelectedKit] = useState<CollectionTemplate | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const touchX = useRef(0)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useUser()

  function dismiss() {
    if (creating) return
    setOpen(false)
    onDismiss?.()
  }

  function goTo(i: number) {
    if (creating || i === step) return
    setDir(i > step ? 1 : -1)
    setStep(i)
  }

  function next() {
    if (creating) return
    if (step === STEPS.length - 1) {
      if (selectedKit) return
      dismiss()
      return
    }
    setDir(1)
    setStep((s) => s + 1)
  }

  function prev() {
    if (creating || step === 0) return
    if (step === STEPS.length - 1 && selectedKit) {
      setSelectedKit(null)
      return
    }
    setDir(-1)
    setStep((s) => s - 1)
  }

  function startFromScratch() {
    if (creating) return
    setOpen(false)
    onDismiss?.()
    navigate('/colecoes')
  }

  function validateInviteEmail(): string | false {
    const email = inviteEmail.trim().toLowerCase()
    if (!email) return ''
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Esse email não parece válido.')
      return false
    }
    if (user?.email && email === user.email.toLowerCase()) {
      toast.error('Você não pode convidar a si mesmo(a). 😅')
      return false
    }
    return email
  }

  function requestCreate() {
    if (creating || !selectedKit) return
    if (validateInviteEmail() === false) return
    setConfirmOpen(true)
  }

  async function handleTemplate(template: CollectionTemplate) {
    if (creating) return
    const email = validateInviteEmail()
    if (email === false) {
      setConfirmOpen(false)
      return
    }
    setCreating(template.id)
    try {
      const { collection, inviteSent } = await createCollectionFromTemplate(template, email || undefined)
      await queryClient.invalidateQueries({ queryKey: queryKeys.collections() })
      if (email && !inviteSent) {
        toast.info('Coleção criada! O convite não foi enviado. Reenvie na aba Acesso.')
      } else if (inviteSent) {
        toast.success(`Coleção pronta! Convite enviado para ${email} 💌`)
      } else {
        toast.success('Coleção pronta! Deixamos bilhetes de exemplo para você editar. 💙')
      }
      setOpen(false)
      onDismiss?.()
      navigate(`/colecoes/${slugify(collection.name)}/gerenciar`)
    } catch (error) {
      toast.error((error as Error).message || 'Não deu para criar a coleção agora. Tenta de novo?')
      setCreating(null)
      setConfirmOpen(false)
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open || creating || confirmOpen) return
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!open) return null

  const s = STEPS[step]
  const anim = dir > 0 ? slideR : slideL
  const isPicker = step === STEPS.length - 1
  const displayTitle = isPicker && selectedKit ? `${selectedKit.emoji} ${selectedKit.title}` : s.title
  const displayDesc = isPicker && selectedKit
    ? 'Dá uma olhada no que vem dentro. Você pode editar tudo depois.'
    : isPicker
      ? 'Toque num kit para ver o que vem dentro dele.'
      : s.desc

  return (
    <>
    <Box
      sx={{
        position: 'fixed', inset: 0, zIndex: 1200,
        background: 'rgba(10,15,30,0.68)', backdropFilter: 'blur(7px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2.5,
        animation: `${overlayIn} 0.18s ease`,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss() }}
    >
      <Box
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchX.current
          if (dx < -48) next()
          else if (dx > 48) prev()
        }}
        sx={{
          maxWidth: 356, width: '100%', borderRadius: '22px',
          overflow: 'hidden auto', maxHeight: '94vh',
          boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
          animation: `${cardIn} 0.22s ease`,
        }}
      >
        <Box sx={{ height: 196, flexShrink: 0, background: s.stageBg, position: 'relative', overflow: 'hidden' }}>
          <Box key={`stage${step}`} sx={{ height: '100%', animation: `${anim} 0.22s ease both` }}>
            {s.stage}
          </Box>
          <Typography sx={{
            position: 'absolute', top: 13, right: 15,
            fontSize: '0.64rem', fontWeight: 700, color: 'rgba(30,58,95,0.45)', letterSpacing: 0.4,
          }}>
            {step + 1} / {STEPS.length}
          </Typography>
          <Typography
            onClick={dismiss}
            sx={{
              position: 'absolute', top: 13, left: 15,
              fontSize: '0.64rem', fontWeight: 700, color: 'rgba(30,58,95,0.45)',
              cursor: 'pointer', letterSpacing: 0.3,
              '&:hover': { color: 'rgba(30,58,95,0.8)' },
            }}
          >
            Pular
          </Typography>
        </Box>

        <Box sx={{ background: '#fff', px: 3, pt: 2.6, pb: 3 }}>
          <Box key={`body${step}${isPicker && selectedKit ? '-kit' : ''}`} sx={{ animation: `${anim} 0.22s ease both`, mb: isPicker ? 1.6 : 2.4 }}>
            <Typography sx={{
              fontFamily: font.serif, fontWeight: 700, fontSize: '1.15rem',
              color: '#1e3a5f', lineHeight: 1.3, mb: 1,
            }}>
              {displayTitle}
            </Typography>
            <Typography sx={{ fontSize: '0.86rem', color: ink.secondary, lineHeight: 1.72, ...(isPicker ? {} : { minHeight: 66 }) }}>
              {displayDesc}
            </Typography>
          </Box>

          {isPicker && !selectedKit && (
            <Stack spacing={0.9} sx={{ mb: 2 }}>
              {COLLECTION_TEMPLATES.map((template) => (
                <TemplateKitRow
                  key={template.id}
                  template={template}
                  onClick={() => setSelectedKit(template)}
                />
              ))}
            </Stack>
          )}

          {isPicker && selectedKit && (
            <Stack spacing={1.2} sx={{ mb: 2 }}>
              <Box sx={{ borderRadius: '14px', overflow: 'hidden', border: `1.5px solid ${selectedKit.accent}30`, boxShadow: `0 5px 16px ${selectedKit.accent}1c` }}>
                <Box sx={{ p: 1.3, background: selectedKit.gradient, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 38, height: 38, borderRadius: '11px', flexShrink: 0, background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '1.15rem', lineHeight: 1 }}>{selectedKit.collection.emoji}</Typography>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontFamily: font.serif, fontSize: '0.9rem', fontWeight: 800, color: ink.primary, lineHeight: 1.2 }}>
                      {selectedKit.collection.name}
                    </Typography>
                    <Typography sx={{ fontSize: '0.64rem', color: ink.secondary }}>
                      nome da coleção, dá para renomear depois
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ px: 1.3, py: 1.1, background: 'rgba(255,255,255,0.97)', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: 0.8, color: ink.muted, textTransform: 'uppercase', mb: 0.7 }}>
                    Vem dentro
                  </Typography>
                  <Stack spacing={0.55}>
                    {selectedKit.notes.map((note) => {
                      const look = RARITY[note.rarity as keyof typeof RARITY] ?? RARITY.comum
                      return (
                        <Stack key={note.title} direction="row" spacing={0.8} alignItems="center">
                          <Box sx={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: look.color, boxShadow: `0 0 6px ${look.color}66` }} />
                          <Typography sx={{ flex: 1, minWidth: 0, fontSize: '0.74rem', color: ink.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {note.title}
                          </Typography>
                          <Typography sx={{ fontSize: '0.56rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5, color: look.color, flexShrink: 0 }}>
                            {look.label}
                          </Typography>
                        </Stack>
                      )
                    })}
                  </Stack>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1.1 }}>
                    {[
                      `⭐ ${selectedKit.raritiesCount} raridades`,
                      `✍️ ${selectedKit.typesCount} tipos`,
                      `🎁 ${selectedKit.packsCount} pacotinhos`,
                    ].map((chip) => (
                      <Box key={chip} sx={{ px: 0.75, py: 0.3, borderRadius: radius.full, background: `${selectedKit.accent}0f`, border: `1px solid ${selectedKit.accent}22` }}>
                        <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: selectedKit.accent }}>{chip}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 800, color: ink.primary, mb: 0.7 }}>
                  Quer convidar alguém agora?{' '}
                  <Box component="span" sx={{ color: ink.muted, fontWeight: 600 }}>(opcional)</Box>
                </Typography>
                <Input
                  type="email"
                  placeholder="email de quem vai receber"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={!!creating}
                  sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.82rem' }, '& input': { py: 0.9 } }}
                />
                <Typography sx={{ fontSize: '0.64rem', color: ink.muted, mt: 0.5 }}>
                  A pessoa recebe um convite por email para colecionar seus bilhetes.
                </Typography>
              </Box>
            </Stack>
          )}

          <Stack direction="row" spacing={0.65} alignItems="center" sx={{ mb: 2.4 }}>
            {STEPS.map((item, i) => (
              <Box
                key={i}
                onClick={() => goTo(i)}
                sx={{
                  height: 6, borderRadius: 3, cursor: 'pointer',
                  width: i === step ? 22 : 6,
                  background: i === step ? item.accent : 'rgba(0,0,0,0.1)',
                  transition: 'width 0.2s ease, background 0.25s ease',
                  flexShrink: 0,
                }}
              />
            ))}
          </Stack>

          <Stack spacing={0.9}>
            {isPicker && selectedKit ? (
              <>
                <Button variant="primary" fullWidth loading={!!creating} onClick={requestCreate} sx={{ py: 1.15, fontSize: '0.92rem' }}>
                  Criar coleção 💙
                </Button>
                <Button variant="ghost" fullWidth disabled={!!creating} onClick={() => setSelectedKit(null)} sx={{ py: 0.85, fontSize: '0.84rem' }}>
                  ← Escolher outro kit
                </Button>
              </>
            ) : isPicker ? (
              <>
                <Button variant="ghost" fullWidth onClick={startFromScratch} disabled={!!creating} sx={{ py: 0.85, fontSize: '0.84rem' }}>
                  Prefiro criar do zero
                </Button>
                <Typography
                  onClick={dismiss}
                  sx={{
                    textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: ink.muted,
                    cursor: creating ? 'default' : 'pointer', py: 0.3,
                    '&:hover': creating ? {} : { color: ink.secondary, textDecoration: 'underline' },
                  }}
                >
                  ou explorar por conta própria
                </Typography>
              </>
            ) : (
              <>
                <Button variant="primary" fullWidth onClick={next} sx={{ py: 1.15, fontSize: '0.92rem' }}>
                  Próximo →
                </Button>
                {step > 0 ? (
                  <Button variant="ghost" fullWidth onClick={prev} sx={{ py: 0.85, fontSize: '0.84rem' }}>
                    Voltar
                  </Button>
                ) : (
                  <Box sx={{ height: 36 }} />
                )}
              </>
            )}
          </Stack>
        </Box>
      </Box>
    </Box>

    <KitConfirmDialog
      open={confirmOpen}
      template={selectedKit}
      inviteEmail={inviteEmail.trim().toLowerCase() || undefined}
      isPending={!!creating}
      onConfirm={() => { if (selectedKit) void handleTemplate(selectedKit) }}
      onClose={() => setConfirmOpen(false)}
    />
    </>
  )
}
