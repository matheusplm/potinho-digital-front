import { Box, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useState, useRef } from 'react'
import { colors, font, radius } from '../../design-system'
import { Button } from './Button'

const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(32px); }
  to   { opacity: 1; transform: translateX(0); }
`
const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-32px); }
  to   { opacity: 1; transform: translateX(0); }
`

const SLIDES = [
  {
    emoji: '💌',
    title: 'Bem-vindo(a) ao Potinho Digital',
    desc: 'Aqui você cria um álbum digital cheio de bilhetes especiais para dar de presente para alguém que você ama.',
  },
  {
    emoji: '✍️',
    title: 'Escreva seus bilhetes',
    desc: 'Crie bilhetes com mensagens, memórias ou poemas. Cada um tem uma raridade — do Comum ao Lendário — e você define tudo.',
  },
  {
    emoji: '📦',
    title: 'Monte os pacotinhos',
    desc: 'Organize seus bilhetes em pacotinhos. A pessoa abre um por dia e vai descobrindo aos poucos, como uma carta esperada.',
  },
  {
    emoji: '🔗',
    title: 'Compartilhe com quem ama',
    desc: 'Em Coleções → Leitores, adicione o email da pessoa. Ela cria a conta dela e começa a colecionar o que você escreveu.',
  },
  {
    emoji: '✨',
    title: 'Simule antes de enviar',
    desc: 'Use o botão Simular para ver tudo como ela vai ver — abra pacotinhos, confira os bilhetes e sinta a experiência completa.',
  },
]

export function OnboardingOverlay({ userId }: { userId: string }) {
  const KEY = `potinho-onboarded-${userId}`
  const [open, setOpen] = useState(() => localStorage.getItem(KEY) !== '1')
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const touchStartX = useRef(0)

  if (!open) return null

  function dismiss() {
    localStorage.setItem(KEY, '1')
    setOpen(false)
  }

  function goTo(i: number) {
    setDir(i >= step ? 1 : -1)
    setStep(i)
  }

  function next() {
    if (step === SLIDES.length - 1) { dismiss(); return }
    setDir(1)
    setStep((s) => s + 1)
  }

  function prev() {
    if (step === 0) return
    setDir(-1)
    setStep((s) => s - 1)
  }

  const slide = SLIDES[step]
  const isLast = step === SLIDES.length - 1

  return (
    <Box
      sx={{
        position: 'fixed', inset: 0, zIndex: 1200,
        background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss() }}
    >
      <Box
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchStartX.current
          if (dx < -50) next()
          else if (dx > 50) prev()
        }}
        sx={{
          background: '#fff', borderRadius: radius.xl,
          p: 3.5, maxWidth: 348, width: '100%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
          <Typography
            onClick={dismiss}
            sx={{ fontSize: '0.76rem', color: colors.text.muted, cursor: 'pointer', '&:hover': { color: colors.text.secondary } }}
          >
            Pular
          </Typography>
        </Box>

        <Box
          key={step}
          sx={{ animation: `${dir > 0 ? slideInRight : slideInLeft} 0.25s ease both`, textAlign: 'center', mb: 3 }}
        >
          <Typography sx={{ fontSize: '3rem', lineHeight: 1, mb: 2 }}>{slide.emoji}</Typography>
          <Typography sx={{
            fontFamily: font.serif, fontWeight: 700, fontSize: '1.22rem',
            color: '#1e3a5f', lineHeight: 1.25, mb: 1.5,
          }}>
            {slide.title}
          </Typography>
          <Typography sx={{ fontSize: '0.88rem', color: colors.text.secondary, lineHeight: 1.75 }}>
            {slide.desc}
          </Typography>
        </Box>

        <Stack direction="row" justifyContent="center" spacing={0.75} sx={{ mb: 3 }}>
          {SLIDES.map((_, i) => (
            <Box
              key={i}
              onClick={() => goTo(i)}
              sx={{
                width: i === step ? 22 : 8, height: 8, borderRadius: 4, cursor: 'pointer',
                background: i === step ? colors.primary.main : 'rgba(0,0,0,0.1)',
                transition: 'width 0.2s ease, background 0.2s ease',
              }}
            />
          ))}
        </Stack>

        <Stack spacing={1}>
          <Button variant="primary" fullWidth onClick={next} sx={{ py: 1.2, fontSize: '0.92rem' }}>
            {isLast ? 'Começar ✨' : 'Próximo →'}
          </Button>
          {step > 0 && (
            <Button variant="ghost" fullWidth onClick={prev} sx={{ py: 0.9, fontSize: '0.86rem' }}>
              Voltar
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  )
}
