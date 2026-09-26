import { Box, Typography } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import { font } from '../../design-system'
import { foilSweep, hintSlide, pouchEnter, pouchExit, pouchFloat, pouchShake, stripFly } from './motion'
import { vibrate, withAlpha } from './tiers'

export type PouchState = 'idle' | 'torn' | 'waiting' | 'exit'

const WIDTH = 216
const HEIGHT = 300
const STRIP = 54
const TEETH = 18

function crimp(edge: 'top' | 'bottom', depth = 7): string {
  const points: string[] = []
  for (let i = 0; i <= TEETH * 2; i++) {
    const x = (i / (TEETH * 2)) * 100
    const inset = i % 2 === 0 ? depth : 0
    points.push(edge === 'top' ? `${x}% ${inset}px` : `${x}% calc(100% - ${inset}px)`)
  }
  return edge === 'top'
    ? `polygon(${points.join(', ')}, 100% 100%, 0% 100%)`
    : `polygon(0% 0%, 100% 0%, ${points.reverse().join(', ')})`
}

const TORN_EDGE = `polygon(${[0, 6, 11, 17, 24, 30, 37, 43, 50, 56, 63, 69, 76, 82, 89, 94, 100]
  .map((x, i) => `${x}% ${[3, 0, 4, 1, 5, 0, 3, 1, 4, 0, 5, 2, 3, 0, 4, 1, 3][i]}px`).join(', ')}, 100% calc(100% - 7px), ${Array.from({ length: TEETH * 2 + 1 }, (_, i) => `${100 - (i / (TEETH * 2)) * 100}% calc(100% - ${i % 2 === 0 ? 7 : 0}px)`).join(', ')})`

export function PackPouch({ gradient, accent, emoji, name, state, onTorn, reducedMotion }: {
  gradient: string
  accent: string
  emoji: string
  name: string
  state: PouchState
  onTorn: () => void
  reducedMotion: boolean
}) {
  const [progress, setProgress] = useState(0)
  const progressRef = useRef(0)
  const pouchRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; t: number; moved: boolean } | null>(null)
  const frame = useRef<number>(0)
  const tornRef = useRef(false)
  const onTornRef = useRef(onTorn)
  onTornRef.current = onTorn
  const torn = state !== 'idle'
  const fill = gradient || `linear-gradient(135deg, ${accent}, ${withAlpha(accent, 55)})`

  const update = useCallback((value: number) => {
    const next = Math.max(progressRef.current, Math.min(1, value))
    progressRef.current = next
    setProgress(next)
    if (next >= 1 && !tornRef.current) {
      tornRef.current = true
      vibrate(28)
      onTornRef.current()
    }
  }, [])

  const autoTear = useCallback(() => {
    if (tornRef.current) return
    if (reducedMotion) {
      update(1)
      return
    }
    const start = performance.now()
    const from = progressRef.current
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 420)
      update(from + (1 - from) * (1 - (1 - t) ** 3))
      if (t < 1) frame.current = requestAnimationFrame(step)
    }
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(step)
  }, [reducedMotion, update])

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  function relative(clientX: number) {
    const rect = pouchRef.current?.getBoundingClientRect()
    return rect ? (clientX - rect.left) / rect.width : 0
  }

  return (
    <Box sx={{
      position: 'relative', width: WIDTH, height: HEIGHT,
      animation: state === 'exit'
        ? `${pouchExit} 0.5s ease-in both`
        : `${pouchEnter} 0.7s cubic-bezier(.2,.9,.25,1.2) both`,
    }}>
      <Box sx={{ width: '100%', height: '100%', animation: state === 'waiting' ? `${pouchShake} 0.5s ease-in-out infinite` : `${pouchFloat} 3.4s ease-in-out 0.7s infinite` }}>
        <Box
          ref={pouchRef}
          role="button"
          tabIndex={torn ? -1 : 0}
          aria-label={`Rasgar o pacotinho ${name}`}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); autoTear() } }}
          onPointerDown={(e) => {
            if (torn) return
            e.currentTarget.setPointerCapture(e.pointerId)
            drag.current = { x: e.clientX, t: performance.now(), moved: false }
            vibrate(6)
          }}
          onPointerMove={(e) => {
            if (!drag.current || torn) return
            if (Math.abs(e.clientX - drag.current.x) > 8) drag.current.moved = true
            if (drag.current.moved) update(relative(e.clientX))
          }}
          onPointerUp={() => {
            const current = drag.current
            drag.current = null
            if (!current || torn) return
            const quickTap = !current.moved && performance.now() - current.t < 350
            if (quickTap || progressRef.current > 0.5) autoTear()
          }}
          sx={{
            position: 'relative', width: '100%', height: '100%', cursor: torn ? 'default' : 'grab', touchAction: 'pan-y',
            transform: 'perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))', transition: 'transform 0.18s ease-out',
            filter: `drop-shadow(0 24px 34px ${withAlpha(accent, 35)}) drop-shadow(0 6px 10px rgba(15,23,42,0.18))`,
            outline: 'none', '&:focus-visible': { filter: `drop-shadow(0 0 0 3px ${accent}) drop-shadow(0 24px 34px ${withAlpha(accent, 35)})` },
            '&:active': { cursor: torn ? 'default' : 'grabbing' },
          }}
        >
          <Box sx={{
            position: 'absolute', left: 0, right: 0, top: 0, height: STRIP, background: fill, clipPath: crimp('top'),
            transformOrigin: '100% 100%',
            transform: torn ? undefined : `translate3d(0, ${-progress * 9}px, 0) rotate(${-progress * 6}deg)`,
            animation: torn ? `${stripFly} 0.75s cubic-bezier(.3,.6,.4,1) both` : 'none',
            zIndex: 2,
            '&::after': { content: '""', position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(255,255,255,0.45), ${withAlpha(accent, 25)})` },
          }} />

          <Box sx={{
            position: 'absolute', left: 0, right: 0, top: STRIP - 2, bottom: 0, background: fill, overflow: 'hidden',
            clipPath: torn ? TORN_EDGE : crimp('bottom'),
          }}>
            <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(rgba(255,255,255,0.4) 1.2px, transparent 1.7px) 0 0 / 15px 15px', opacity: 0.55 }} />
            <Box sx={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, transparent 35%, ${withAlpha(accent, 38)} 100%)` }} />
            <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 25% 12%, rgba(255,255,255,0.75), transparent 45%), radial-gradient(circle at 85% 95%, rgba(0,0,0,0.16), transparent 50%)' }} />
            <Box sx={{ position: 'absolute', inset: 0, boxShadow: `inset 10px 0 18px -10px rgba(255,255,255,0.9), inset -12px 0 20px -10px ${withAlpha(accent, 45)}` }} />
            <Box sx={{
              position: 'absolute', top: 0, bottom: 0, left: 0, width: '45%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
              animation: reducedMotion ? 'none' : `${foilSweep} 3.6s ease-in-out 1s infinite`,
            }} />
            <Box sx={{ position: 'absolute', inset: '12px 12px 18px', borderRadius: '16px', border: '1.5px solid rgba(255,255,255,0.65)' }} />
            <Box sx={{
              position: 'absolute', left: '50%', top: '43%', transform: 'translate(-50%, -50%)',
              width: 112, height: 112, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95), rgba(255,255,255,0.55))',
              boxShadow: `inset 0 -6px 14px ${withAlpha(accent, 22)}, 0 10px 24px ${withAlpha(accent, 25)}`,
              fontSize: '3.6rem', lineHeight: 1,
            }}>
              {emoji}
            </Box>
            <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 34, display: 'flex', justifyContent: 'center', px: 2 }}>
              <Typography sx={{
                px: 1.4, py: 0.45, borderRadius: 99, maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                fontFamily: font.serif, fontWeight: 800, fontSize: '0.92rem', color: '#1e293b',
                background: 'rgba(255,255,255,0.82)', boxShadow: '0 4px 12px rgba(15,23,42,0.12)',
              }}>
                {name}
              </Typography>
            </Box>
          </Box>

          {!torn && (
            <Box sx={{ position: 'absolute', left: 10, right: 10, top: STRIP - 3, height: 6, zIndex: 3, pointerEvents: 'none' }}>
              <Box sx={{ position: 'absolute', inset: '2px 0', borderTop: '2px dashed rgba(255,255,255,0.85)' }} />
              <Box sx={{
                position: 'absolute', left: 0, top: 0, height: 6, width: `${progress * 100}%`, borderRadius: 6,
                background: `linear-gradient(90deg, #fff, ${accent})`, boxShadow: `0 0 12px ${accent}, 0 0 4px #fff`,
              }} />
              <Box sx={{
                position: 'absolute', top: '50%', left: `${progress * 100}%`, width: 30, height: 30, borderRadius: '50%',
                transform: 'translate(-50%, -50%)', background: '#fff', boxShadow: `0 4px 14px ${withAlpha(accent, 55)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem',
              }}>
                ✂️
              </Box>
              {progress === 0 && !reducedMotion && (
                <Box sx={{
                  position: 'absolute', top: 14, left: 0, fontSize: '1.5rem', '--track': `${WIDTH - 50}px`,
                  animation: `${hintSlide} 2.4s ease-in-out 1s infinite`, filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))',
                }}>
                  👆
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}
