import { Box, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { colors, hintWiggle, sway } from '../../design-system'
import { DemoNoteCard } from './DemoNoteCard'
import { DEMO_NOTES } from './landingData'

export function HeroCardStack() {
  const [topIdx, setTopIdx] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [exitDir, setExitDir] = useState<null | 1 | -1>(null)
  const [hinting, setHinting] = useState(false)
  const [isSnapping, setIsSnapping] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const interactedRef = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => { if (!interactedRef.current) setHinting(true) }, 1200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!hinting) return
    const t = setTimeout(() => setHinting(false), 900)
    return () => clearTimeout(t)
  }, [hinting])

  function handleStart(clientX: number, clientY: number) {
    interactedRef.current = true
    setHinting(false)
    setIsHovered(false)
    setIsDragging(true)
    dragStartRef.current = { x: clientX, y: clientY }
  }

  function handleMove(clientX: number, clientY: number) {
    if (!isDragging) return
    setDragX(clientX - dragStartRef.current.x)
    setDragY(clientY - dragStartRef.current.y)
  }

  function handleEnd() {
    if (!isDragging) return
    setIsDragging(false)
    if (Math.abs(dragX) > 80) {
      const dir: 1 | -1 = dragX > 0 ? 1 : -1
      setExitDir(dir)
      setTimeout(() => {
        setTopIdx((i) => (i + 1) % DEMO_NOTES.length)
        setExitDir(null)
        setDragX(0)
        setDragY(0)
      }, 350)
    } else {
      setIsSnapping(true)
      setDragX(0)
      setDragY(0)
      setTimeout(() => setIsSnapping(false), 460)
    }
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
    <Box sx={{ flexShrink: 0 }}>
      <Box
        sx={{ position: 'relative', width: 300, height: 292, userSelect: 'none', touchAction: 'pan-y' }}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      >
        <Box sx={cardSx(1, 'translateY(16px) scale(0.9) rotate(6deg)', 'transform 0.3s ease')}>
          <DemoNoteCard note={n2} eager fill />
        </Box>
        <Box sx={cardSx(5, 'translateY(8px) scale(0.95) rotate(-2deg)', 'transform 0.3s ease')}>
          <DemoNoteCard note={n1} eager fill />
        </Box>
        <Box
          key={topIdx}
          onMouseDown={(e) => { e.preventDefault(); handleStart(e.clientX, e.clientY) }}
          onMouseEnter={() => { if (!isDragging && !isSnapping && exitDir === null) setIsHovered(true) }}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={handleEnd}
          sx={cardSx(10, topTransform, topTransition, {
            opacity: topOpacity,
            animation: exitDir !== null || isDragging || isSnapping || isHovered
              ? 'none'
              : hinting
              ? `${hintWiggle} 0.85s ease-in-out`
              : `${sway} 3s ease-in-out infinite`,
            cursor: isDragging ? 'grabbing' : 'grab',
          })}
        >
          <DemoNoteCard note={n0} eager fill />
        </Box>
      </Box>
      <Typography variant="xxs" sx={{ mt: 1.5, textAlign: 'center', color: colors.text.muted, letterSpacing: 0.3 }}>
        ← arraste para descobrir →
      </Typography>
    </Box>
  )
}
