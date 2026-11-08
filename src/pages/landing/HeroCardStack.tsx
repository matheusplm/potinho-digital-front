import { Box } from '@mui/material'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { colors, hintWiggle, sway } from '../../design-system'
import { DemoNoteCard } from './DemoNoteCard'
import { DEMO_NOTES } from './landingData'

const TAP_SLOP = 8
const TAP_MS = 300

export function HeroCardStack() {
  const [topIdx, setTopIdx] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [exitDir, setExitDir] = useState<null | 1 | -1>(null)
  const [hinting, setHinting] = useState(false)
  const [isSnapping, setIsSnapping] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const dragRef = useRef<{ x: number; y: number; t: number; id: number } | null>(null)
  const interactedRef = useRef(false)
  const stackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => { if (!interactedRef.current) setHinting(true) }, 1200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!hinting) return
    const t = setTimeout(() => setHinting(false), 900)
    return () => clearTimeout(t)
  }, [hinting])

  function advance(dir: 1 | -1) {
    setExitDir(dir)
    setTimeout(() => {
      setTopIdx((i) => (i + 1) % DEMO_NOTES.length)
      setExitDir(null)
      setDragX(0)
      setDragY(0)
    }, 350)
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (exitDir !== null) return
    if (e.pointerType === 'mouse') e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    interactedRef.current = true
    setHinting(false)
    setIsHovered(false)
    setIsDragging(true)
    dragRef.current = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId }
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const start = dragRef.current
    if (!start || start.id !== e.pointerId) return
    setDragX(e.clientX - start.x)
    setDragY(e.clientY - start.y)
  }

  function finish(e: PointerEvent<HTMLDivElement>) {
    const start = dragRef.current
    if (!start || start.id !== e.pointerId) return
    dragRef.current = null
    setIsDragging(false)
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    const width = stackRef.current?.offsetWidth ?? 300
    const isTap = Math.abs(dx) < TAP_SLOP && Math.abs(dy) < TAP_SLOP && performance.now() - start.t < TAP_MS
    if (isTap) { advance(1); return }
    if (Math.abs(dx) > Math.min(80, width * 0.22)) { advance(dx > 0 ? 1 : -1); return }
    setIsSnapping(true)
    setDragX(0)
    setDragY(0)
    setTimeout(() => setIsSnapping(false), 460)
  }

  function cancel() {
    if (!dragRef.current) return
    dragRef.current = null
    setIsDragging(false)
    setIsSnapping(true)
    setDragX(0)
    setDragY(0)
    setTimeout(() => setIsSnapping(false), 460)
  }

  const n0 = DEMO_NOTES[topIdx % DEMO_NOTES.length]
  const n1 = DEMO_NOTES[(topIdx + 1) % DEMO_NOTES.length]
  const n2 = DEMO_NOTES[(topIdx + 2) % DEMO_NOTES.length]

  let topTransform: string
  let topTransition: string
  let topOpacity = 1
  if (exitDir !== null) {
    topTransform = `rotate(${exitDir * 25}deg) translateX(${exitDir * 140}%)`
    topTransition = 'transform 0.35s ease-in, opacity 0.35s ease-in'
    topOpacity = 0
  } else if (isDragging) {
    topTransform = `rotate(${2 + dragX * 0.05}deg) translateX(${dragX}px) translateY(${dragY * 0.3}px)`
    topTransition = 'none'
  } else if (isHovered) {
    topTransform = 'rotate(8deg) translateX(14px) scale(1.02)'
    topTransition = 'transform 0.28s ease, box-shadow 0.28s ease'
  } else {
    topTransform = 'rotate(2deg)'
    topTransition = 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)'
  }

  const cardSx = (zIndex: number, transform: string, transition: string, extraSx?: object) => ({
    position: 'absolute' as const, inset: 0, zIndex,
    transform, transition,
    '& > *': { width: '100%', height: '100%' },
    ...extraSx,
  })

  return (
    <Box sx={{ flexShrink: 0, width: { xs: 'min(300px, calc(100vw - 56px))', md: 300 } }}>
      <Box ref={stackRef} sx={{ position: 'relative', width: '100%', height: { xs: 344, md: 292 }, userSelect: 'none', WebkitUserSelect: 'none' }}>
        <Box sx={cardSx(1, 'translateY(16px) scale(0.9) rotate(6deg)', 'transform 0.3s ease')}>
          <DemoNoteCard note={n2} eager fill />
        </Box>
        <Box sx={cardSx(5, 'translateY(8px) scale(0.95) rotate(-2deg)', 'transform 0.3s ease')}>
          <DemoNoteCard note={n1} eager fill />
        </Box>
        <Box
          key={topIdx}
          role="button"
          tabIndex={0}
          aria-label="Ver o próximo bilhete"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finish}
          onPointerCancel={cancel}
          onPointerEnter={(e) => { if (e.pointerType === 'mouse' && !isDragging && !isSnapping && exitDir === null) setIsHovered(true) }}
          onPointerLeave={(e) => { if (e.pointerType === 'mouse') setIsHovered(false) }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); advance(1) } }}
          sx={cardSx(10, topTransform, topTransition, {
            opacity: topOpacity,
            touchAction: 'pan-y',
            WebkitTouchCallout: 'none',
            WebkitTapHighlightColor: 'transparent',
            '& img': { pointerEvents: 'none', WebkitUserDrag: 'none' },
            animation: exitDir !== null || isDragging || isSnapping || isHovered
              ? 'none'
              : hinting
              ? `${hintWiggle} 0.85s ease-in-out`
              : `${sway} 3s ease-in-out infinite`,
            cursor: isDragging ? 'grabbing' : 'grab',
            outline: 'none',
            '&:focus-visible': { outline: `2px dashed ${colors.text.primary}`, outlineOffset: 6 },
          })}
        >
          <DemoNoteCard note={n0} eager fill />
        </Box>
      </Box>
    </Box>
  )
}
