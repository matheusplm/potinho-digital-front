import { Box, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useState, useRef } from 'react'
import { colors, font } from '../../design-system'
import { Button } from './Button'

const overlayIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`
const cardIn = keyframes`
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`
const slideR = keyframes`
  from { opacity: 0; transform: translateX(22px); }
  to   { opacity: 1; transform: translateX(0); }
`
const slideL = keyframes`
  from { opacity: 0; transform: translateX(-22px); }
  to   { opacity: 1; transform: translateX(0); }
`

const SLIDES = [
  {
    emoji: '💌',
    gradient: 'linear-gradient(135deg,#be185d,#e11d48)',
    title: 'Bem-vindo(a) ao Potinho Digital',
    desc: 'Aqui você cria um álbum digital cheio de bilhetes especiais para dar de presente para alguém que você ama.',
  },
  {
    emoji: '✍️',
    gradient: 'linear-gradient(135deg,#1e40af,#2563eb)',
    title: 'Escreva seus bilhetes',
    desc: 'Crie bilhetes com mensagens, memórias ou poemas. Cada um tem uma raridade — do Comum ao Lendário — e você define tudo.',
  },
  {
    emoji: '📦',
    gradient: 'linear-gradient(135deg,#b45309,#d97706)',
    title: 'Monte os pacotinhos',
    desc: 'Organize seus bilhetes em pacotinhos. A pessoa abre um por dia e vai descobrindo aos poucos, como uma carta esperada.',
  },
  {
    emoji: '🔗',
    gradient: 'linear-gradient(135deg,#065f46,#059669)',
    title: 'Compartilhe com quem ama',
    desc: 'Em Coleções → Leitores, adicione o email da pessoa. Ela cria a conta e começa a colecionar o que você escreveu.',
  },
  {
    emoji: '✨',
    gradient: 'linear-gradient(135deg,#5b21b6,#7c3aed)',
    title: 'Simule antes de enviar',
    desc: 'Use o botão Simular para ver tudo como ela vai ver — abra pacotinhos, confira os bilhetes e sinta a experiência completa.',
  },
]

interface Props {
  onDismiss?: () => void
}

export function OnboardingOverlay({ onDismiss }: Props) {
  const [open, setOpen] = useState(true)
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const touchX = useRef(0)

  if (!open) return null

  function dismiss() {
    setOpen(false)
    onDismiss?.()
  }

  function goTo(i: number) {
    if (i === step) return
    setDir(i > step ? 1 : -1)
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
  const anim = dir > 0 ? slideR : slideL

  return (
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
          maxWidth: 344, width: '100%', borderRadius: '22px',
          overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
          animation: `${cardIn} 0.22s ease`,
        }}
      >
        <Box
          key={`h${step}`}
          sx={{
            height: 148, background: slide.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            animation: `${anim} 0.22s ease both`,
          }}
        >
          <Typography sx={{ fontSize: '3.4rem', lineHeight: 1, userSelect: 'none' }}>{slide.emoji}</Typography>
          <Typography sx={{
            position: 'absolute', top: 13, right: 15,
            fontSize: '0.64rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.4,
          }}>
            {step + 1} / {SLIDES.length}
          </Typography>
          <Typography
            onClick={dismiss}
            sx={{
              position: 'absolute', top: 13, left: 15,
              fontSize: '0.64rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer', letterSpacing: 0.3,
              '&:hover': { color: 'rgba(255,255,255,0.9)' },
            }}
          >
            Pular
          </Typography>
        </Box>

        <Box sx={{ background: '#fff', px: 3, pt: 2.8, pb: 3 }}>
          <Box key={`b${step}`} sx={{ animation: `${anim} 0.22s ease both`, mb: 2.8 }}>
            <Typography sx={{
              fontFamily: font.serif, fontWeight: 700, fontSize: '1.15rem',
              color: '#1e3a5f', lineHeight: 1.3, mb: 1.1,
            }}>
              {slide.title}
            </Typography>
            <Typography sx={{ fontSize: '0.86rem', color: colors.text.secondary, lineHeight: 1.78 }}>
              {slide.desc}
            </Typography>
          </Box>

          <Stack direction="row" spacing={0.65} alignItems="center" sx={{ mb: 2.8 }}>
            {SLIDES.map((_, i) => (
              <Box
                key={i}
                onClick={() => goTo(i)}
                sx={{
                  height: 6, borderRadius: 3, cursor: 'pointer',
                  width: i === step ? 22 : 6,
                  background: i === step ? slide.gradient : 'rgba(0,0,0,0.1)',
                  transition: 'width 0.2s ease, background 0.25s ease',
                  flexShrink: 0,
                }}
              />
            ))}
          </Stack>

          <Stack spacing={0.9}>
            <Button variant="primary" fullWidth onClick={next} sx={{ py: 1.15, fontSize: '0.92rem' }}>
              {step === SLIDES.length - 1 ? 'Começar ✨' : 'Próximo →'}
            </Button>
            {step > 0 && (
              <Button variant="ghost" fullWidth onClick={prev} sx={{ py: 0.85, fontSize: '0.84rem' }}>
                Voltar
              </Button>
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}
