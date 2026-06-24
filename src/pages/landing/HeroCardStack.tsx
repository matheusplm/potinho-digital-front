import { Box, Stack, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { colors, font, hintWiggle, radius, shadow, shimmer, sway } from '../../design-system'
import { DEMO_NOTES } from './landingData'
import type { DemoNote } from './landingData'

function CardContent({ note }: { note: DemoNote }) {
  return (
    <>
      {note.legendary && (
        <Box sx={{
          position: 'absolute', inset: 0, borderRadius: radius.xl,
          background: 'linear-gradient(90deg,transparent 20%,rgba(253,230,138,0.35) 50%,transparent 80%)',
          backgroundSize: '200% auto', animation: `${shimmer} 2.5s linear infinite`,
          pointerEvents: 'none',
        }} />
      )}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flexShrink: 0, mb: 1 }}>
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 0.4,
          px: 0.7, py: 0.3, borderRadius: radius.full,
          background: `${note.rarityColor}15`, border: `1px solid ${note.rarityColor}30`,
        }}>
          <Typography sx={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: note.rarityColor }}>
            {note.legendary ? '★' : '◆'} {note.rarity}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.7rem', opacity: 0.4, lineHeight: 1 }}>💌</Typography>
      </Stack>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', py: 0.5 }}>
        <Typography sx={{ fontFamily: font.serif, fontSize: '0.84rem', color: note.rarityColor, lineHeight: 1.65, opacity: 0.88 }}>
          {note.content}
        </Typography>
      </Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flexShrink: 0, mt: 1 }}>
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', px: 0.7, py: 0.25,
          borderRadius: radius.full, background: `${note.rarityColor}10`, border: `1px solid ${note.rarityColor}20`,
        }}>
          <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: note.rarityColor }}>{note.type}</Typography>
        </Box>
        <Typography sx={{ fontSize: '0.52rem', fontWeight: 600, fontFamily: font.serif, color: note.rarityColor, opacity: 0.4, letterSpacing: 0.3 }}>
          Potinho Digital
        </Typography>
      </Stack>
    </>
  )
}

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

  const cardSx = (note: DemoNote, zIndex: number, transform: string, transition: string, extraSx?: object) => ({
    position: 'absolute' as const, inset: 0, zIndex,
    transform, transition,
    background: note.rarityBg, borderRadius: radius.xl,
    border: `1.5px solid ${note.border}`, boxShadow: note.glow || shadow.sm,
    display: 'flex', flexDirection: 'column' as const, p: 1.75, overflow: 'hidden',
    ...extraSx,
  })

  return (
    <Box sx={{ flexShrink: 0 }}>
      <Box
        sx={{ position: 'relative', width: 248, height: 328, userSelect: 'none', touchAction: 'pan-y' }}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      >
        <Box sx={cardSx(n2, 1, 'translateY(16px) scale(0.9) rotate(6deg)', 'transform 0.3s ease')}>
          <CardContent note={n2} />
        </Box>
        <Box sx={cardSx(n1, 5, 'translateY(8px) scale(0.95) rotate(-2deg)', 'transform 0.3s ease')}>
          <CardContent note={n1} />
        </Box>
        <Box
          key={topIdx}
          onMouseDown={(e) => { e.preventDefault(); handleStart(e.clientX, e.clientY) }}
          onMouseEnter={() => { if (!isDragging && !isSnapping && exitDir === null) setIsHovered(true) }}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={handleEnd}
          sx={cardSx(n0, 10, topTransform, topTransition, {
            opacity: topOpacity,
            animation: exitDir !== null || isDragging || isSnapping || isHovered
              ? 'none'
              : hinting
              ? `${hintWiggle} 0.85s ease-in-out`
              : `${sway} 3s ease-in-out infinite`,
            cursor: isDragging ? 'grabbing' : 'grab',
          })}
        >
          <CardContent note={n0} />
        </Box>
      </Box>
      <Typography sx={{ mt: 1.5, textAlign: 'center', fontSize: '0.62rem', color: colors.text.muted, letterSpacing: 0.3 }}>
        ← arraste para descobrir →
      </Typography>
    </Box>
  )
}
