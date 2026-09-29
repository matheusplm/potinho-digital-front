import { Box, useMediaQuery } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { useBackground } from '../context/BackgroundContext'
import { queryKeys } from '../hooks/useNotes'
import type { Collection } from '../types/note'
import { withAlpha } from '../utils/colorUtils'
import { collectionSlug } from '../utils/slug'
import { CoachCard } from './CoachCard'
import { isCollectionsPath, isManagePath, type TourStep } from './steps'
import { useTour } from './TourContext'
import { useTargetRect, type TargetBox } from './useTargetRect'

const Z = 1450
const PAD = 6
const GAP = 14
const EDGE = 12
const CARD_WIDTH = 340
const DIM = 'rgba(6, 10, 22, 0.58)'

const ringPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 3px var(--ring-soft), 0 0 22px var(--ring-glow); }
  50%      { box-shadow: 0 0 0 8px var(--ring-soft), 0 0 36px var(--ring-glow); }
`

function useViewport() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight })
  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return size
}

function useElementHeight(ref: RefObject<HTMLElement | null>) {
  const [height, setHeight] = useState(200)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver(() => setHeight(element.getBoundingClientRect().height))
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
  return height
}

function cardPosition(hole: TargetBox | null, height: number, isDesktop: boolean, viewport: { width: number; height: number }) {
  if (!isDesktop) {
    const width = viewport.width - EDGE * 2
    const bottomTop = viewport.height - height - EDGE - 4
    if (!hole) return { left: EDGE, top: bottomTop, width }
    const targetLow = (hole.top + hole.bottom) / 2 > viewport.height * 0.5
    return { left: EDGE, top: targetLow ? EDGE + 4 : bottomTop, width }
  }
  const width = CARD_WIDTH
  const clampTop = (top: number) => Math.min(Math.max(top, EDGE), viewport.height - height - EDGE)
  const clampLeft = (left: number) => Math.min(Math.max(left, EDGE), viewport.width - width - EDGE)
  if (!hole) return { left: (viewport.width - width) / 2, top: viewport.height - height - 24, width }
  if (viewport.width - hole.right - GAP >= width + EDGE) return { left: hole.right + GAP, top: clampTop(hole.top), width }
  if (viewport.height - hole.bottom - GAP >= height + EDGE) return { left: clampLeft(hole.left), top: hole.bottom + GAP, width }
  if (hole.top - GAP >= height + EDGE) return { left: clampLeft(hole.left), top: hole.top - GAP - height, width }
  if (hole.left - GAP >= width + EDGE) return { left: hole.left - GAP - width, top: clampTop(hole.top), width }
  return { left: clampLeft(hole.left), top: viewport.height - height - EDGE, width }
}

function Blockers({ hole }: { hole: TargetBox }) {
  const top = Math.max(0, hole.top)
  const bottom = Math.max(0, hole.bottom)
  const sides = [
    { left: 0, top: 0, right: 0, height: top },
    { left: 0, top: bottom, right: 0, bottom: 0 },
    { left: 0, top, width: Math.max(0, hole.left), height: Math.max(0, bottom - top) },
    { left: Math.max(0, hole.right), top, right: 0, height: Math.max(0, bottom - top) },
  ]
  return (
    <>
      {sides.map((side, index) => (
        <Box key={index} aria-hidden sx={{ position: 'fixed', zIndex: Z, background: DIM, ...side }} />
      ))}
    </>
  )
}

function Ring({ hole, accent }: { hole: TargetBox; accent: string }) {
  return (
    <Box aria-hidden sx={{
      position: 'fixed', zIndex: Z + 1, pointerEvents: 'none',
      left: hole.left, top: hole.top, width: hole.right - hole.left, height: hole.bottom - hole.top,
      borderRadius: '14px', border: `2px solid ${accent}`,
      '--ring-soft': withAlpha(accent, 25), '--ring-glow': withAlpha(accent, 55),
      animation: `${ringPulse} 1.6s ease-in-out infinite`,
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    }} />
  )
}

function CenterStage({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{
      position: 'fixed', inset: 0, zIndex: Z, background: DIM,
      display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1.5,
    }}>
      <Box sx={{ width: '100%', maxWidth: 420 }}>{children}</Box>
    </Box>
  )
}

export function TourLayer({ step, collectionId }: { step: TourStep; collectionId: string | null }) {
  const tour = useTour()
  const { theme } = useBackground()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const queryClient = useQueryClient()
  const isDesktop = useMediaQuery('(min-width: 900px)', { noSsr: true })
  const targetId = typeof step.target === 'function' ? step.target(collectionId) : step.target
  const { box, dialogOpen } = useTargetRect(targetId)
  const cardRef = useRef<HTMLDivElement>(null)
  const cardHeight = useElementHeight(cardRef)
  const viewport = useViewport()

  const inPlace = !step.place || (step.place === 'collections' ? isCollectionsPath(pathname) : isManagePath(pathname))
  const nextAction = step.advance.kind === 'next' ? { label: step.advance.label, onClick: tour.next } : undefined

  function placePath() {
    if (step.place === 'manage' && collectionId) {
      const all = queryClient.getQueryData<Collection[]>(queryKeys.collections()) ?? []
      const collection = all.find((item) => item.id === collectionId)
      if (collection) return `/colecoes/${collectionSlug(collection, all)}/gerenciar`
    }
    return '/colecoes'
  }

  if (!inPlace) {
    return createPortal(
      <CenterStage>
        <CoachCard
          step={step}
          mode="center"
          title="Bora continuar de onde parou?"
          body={step.place === 'manage' ? 'O próximo passo acontece dentro da sua coleção.' : 'O próximo passo acontece na tela de Coleções.'}
          primary={{ label: 'Me leva lá', onClick: () => navigate(placePath()) }}
          onExit={tour.exit}
        />
      </CenterStage>,
      document.body,
    )
  }

  if (step.inline) return null

  if (!targetId) {
    return createPortal(
      <CenterStage>
        <CoachCard step={step} mode="center" primary={nextAction} onExit={tour.exit} />
      </CenterStage>,
      document.body,
    )
  }

  const hole = box ? { left: box.left - PAD, top: box.top - PAD, right: box.right + PAD, bottom: box.bottom + PAD } : null
  const blocking = !!hole && !!step.block && !dialogOpen
  const position = cardPosition(hole, cardHeight, isDesktop, viewport)
  const hint = !hole ? 'carregando…' : step.block ? (isDesktop ? '👆 clique no destaque' : '👆 toque no destaque') : '👆 siga o destaque'

  return createPortal(
    <>
      {blocking && hole && <Blockers hole={hole} />}
      {hole && <Ring hole={hole} accent={theme.accent} />}
      <CoachCard
        ref={cardRef}
        step={step}
        mode="floating"
        primary={nextAction}
        hint={hint}
        onExit={tour.exit}
        sx={{
          position: 'fixed', zIndex: Z + 2, left: position.left, top: position.top, width: position.width,
          transition: 'left 0.25s ease, top 0.25s ease',
        }}
      />
    </>,
    document.body,
  )
}
