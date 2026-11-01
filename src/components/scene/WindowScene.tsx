import { Box, type SxProps, type Theme } from '@mui/material'
import { keyframes } from '@emotion/react'
import type { ReactNode } from 'react'
import { useBackground } from '../../context/BackgroundContext'
import { themeInk } from '../../design-system'
import { FloatingParticles } from '../FloatingParticles'
import { sceneLook, type Shape } from './sceneLook'
import { Celestial, Horizon } from './Horizons'

const drift = keyframes`
  from { transform: translateX(-140px); }
  to   { transform: translateX(calc(100cqw + 40px)); }
`

const ROUND: Shape[] = ['round', 'porthole', 'submarine']

export function Cloud({ top, scale, duration, delay }: { top: string; scale: number; duration: number; delay: number }) {
  return (
    <Box aria-hidden sx={{
      position: 'absolute', top, left: 0, width: 96, height: 28, transform: `scale(${scale})`, transformOrigin: 'left top',
      animation: `${drift} ${duration}s linear ${delay}s infinite`,
      '@media (prefers-reduced-motion: reduce)': { animation: 'none', left: '20%' },
    }}>
      <Box sx={{
        position: 'absolute', inset: '10px 0 0', borderRadius: 99, background: 'rgba(255,253,247,0.85)',
        '&::before': { content: '""', position: 'absolute', left: 18, top: -12, width: 34, height: 30, borderRadius: '50%', background: 'inherit' },
        '&::after': { content: '""', position: 'absolute', left: 44, top: -18, width: 40, height: 36, borderRadius: '50%', background: 'inherit' },
      }} />
    </Box>
  )
}

function Rivets({ count, color, inset }: { count: number; color: string; inset: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2
        return (
          <Box key={i} aria-hidden sx={{
            position: 'absolute', width: 8, height: 8, borderRadius: '50%', background: color, zIndex: 4,
            boxShadow: 'inset -1px -1px 0 rgba(0,0,0,0.35), inset 1px 1px 0 rgba(255,255,255,0.35)',
            left: `calc(50% + (50% - ${inset}px) * ${Math.cos(a).toFixed(3)} - 4px)`,
            top: `calc(50% + (50% - ${inset}px) * ${Math.sin(a).toFixed(3)} - 4px)`,
          }} />
        )
      })}
    </>
  )
}

function Curtains({ color }: { color: string }) {
  const drape = {
    position: 'absolute', top: -10, height: 'calc(100% + 4px)', width: '24%', zIndex: 5,
    background: `repeating-linear-gradient(90deg, ${color} 0 9px, color-mix(in srgb, ${color} 80%, #000) 9px 12px)`,
    border: '1.5px solid rgba(42,36,29,0.45)',
  } as const
  return (
    <>
      <Box aria-hidden sx={{ position: 'absolute', top: -14, left: -12, right: -12, height: 7, zIndex: 6, background: '#6b5137', borderRadius: 4, border: '1.5px solid rgba(42,36,29,0.6)' }} />
      <Box aria-hidden sx={{ ...drape, left: -10, borderRadius: '0 0 70% 0 / 0 0 22% 0', clipPath: 'polygon(0 0, 100% 0, 100% 52%, 40% 64%, 70% 100%, 0 100%)' }} />
      <Box aria-hidden sx={{ ...drape, right: -10, borderRadius: '0 0 0 70% / 0 0 0 22%', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 30% 100%, 60% 64%, 0 52%)' }} />
    </>
  )
}

function Shutters({ color }: { color: string }) {
  const panel = {
    position: 'absolute', top: 0, bottom: 0, width: '20%', zIndex: 0,
    background: `repeating-linear-gradient(180deg, ${color} 0 7px, color-mix(in srgb, ${color} 75%, #000) 7px 9px)`,
    border: '1.5px solid rgba(42,36,29,0.5)', borderRadius: 2,
  } as const
  return (
    <>
      <Box aria-hidden sx={{ ...panel, right: 'calc(100% + 4px)' }} />
      <Box aria-hidden sx={{ ...panel, left: 'calc(100% + 4px)' }} />
    </>
  )
}

function FlowerBox({ flowers }: { flowers: boolean }) {
  const blooms = flowers ? ['#e86a7a', '#f4b544', '#fffcf5', '#e86a7a', '#c86fb4', '#f4b544', '#e86a7a'] : []
  return (
    <Box aria-hidden sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 36, zIndex: 2, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', px: 1, pb: '10px', pointerEvents: 'none' }}>
      <Box sx={{ position: 'absolute', left: 4, right: 4, bottom: 0, height: 12, background: '#8a5e3b', border: '1.5px solid rgba(42,36,29,0.6)', borderBottom: 'none', borderRadius: '2px 2px 0 0', backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 18px, rgba(0,0,0,0.18) 18px 19px)', zIndex: 1 }} />
      {Array.from({ length: 7 }, (_, i) => (
        <Box key={i} sx={{ position: 'relative', width: 12, height: 14 + ((i * 7) % 12) }}>
          <Box sx={{ position: 'absolute', bottom: 0, left: 5, width: 2, height: '100%', background: '#3f7a4a' }} />
          <Box sx={{ position: 'absolute', bottom: '30%', left: -1, width: 9, height: 6, borderRadius: '6px 0', background: '#4f8f58', transform: 'rotate(-20deg)' }} />
          {flowers
            ? <Box sx={{ position: 'absolute', top: -5, left: 1, width: 10, height: 10, borderRadius: '50%', background: blooms[i], border: '1px solid rgba(42,36,29,0.4)', boxShadow: 'inset 0 0 0 2.5px rgba(255,236,160,0.9)' }} />
            : <Box sx={{ position: 'absolute', top: -6, left: 0, width: 12, height: 12, borderRadius: '50% 0', background: '#5a9d62', transform: `rotate(${i * 40}deg)` }} />}
        </Box>
      ))}
    </Box>
  )
}

function Shelf({ side }: { side: 'left' | 'right' }) {
  const books = side === 'left'
    ? [{ w: 9, h: 30, c: themeInk.ink }, { w: 7, h: 26, c: '#d9c9a8' }, { w: 10, h: 33, c: 'color-mix(in srgb, var(--pd-ink) 45%, #3a3128)' }, { w: 8, h: 24, c: 'color-mix(in srgb, var(--pd-accent) 60%, #fffcf5)', tilt: 14 }]
    : []
  return (
    <Box aria-hidden sx={{ position: 'absolute', bottom: '100%', [side]: 6, zIndex: 4, display: 'flex', alignItems: 'flex-end', gap: '1px' }}>
      {books.map((b, i) => (
        <Box key={i} sx={{
          width: b.w, height: b.h, background: b.c, border: '1px solid rgba(42,36,29,0.55)', borderRadius: '1px',
          transform: b.tilt ? `rotate(${b.tilt}deg)` : undefined, transformOrigin: 'bottom left', ml: b.tilt ? '2px' : 0,
          backgroundImage: 'linear-gradient(transparent 18%, rgba(255,255,255,0.35) 18% 24%, transparent 24% 76%, rgba(255,255,255,0.35) 76% 82%, transparent 82%)',
        }} />
      ))}
      {side === 'right' && (
        <Box component="svg" viewBox="0 0 40 46" sx={{ width: 30, height: 34, display: 'block' }}>
          <rect x="12" y="2" width="16" height="7" rx="2" fill={themeInk.ink} stroke="#2a241d" strokeWidth="1.6" />
          <path d="M14 9 v5 c-7 3 -10 9 -10 15 c0 9 7 15 16 15 s16 -6 16 -15 c0 -6 -3 -12 -10 -15 v-5" fill="rgba(255,253,247,0.75)" stroke="#2a241d" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M20 37c-1-1-2-2-3.5-3.2-3.6-3.2-6.5-5.7-6.5-9.2 0-3 2.3-5.1 5-5.1 2.1 0 3.9 1.2 5 2.9 1.1-1.7 2.9-2.9 5-2.9 2.7 0 5 2.1 5 5.1 0 3.5-2.9 6-6.5 9.2-1.5 1.2-2.5 2.2-3.5 3.2Z" fill={themeInk.ink} />
        </Box>
      )}
    </Box>
  )
}

export function WindowScene({ width, height, children, shelves = true, sx }: {
  width: number | string | Record<string, number | string>
  height: number | Record<string, number>
  children?: ReactNode
  shelves?: boolean
  sx?: SxProps<Theme>
}) {
  const { theme } = useBackground()
  const { shape, decor, horizon, sky, stained } = sceneLook(theme.key)
  const night = theme.isDark
  const round = ROUND.includes(shape)
  const frame = shape === 'porthole' ? '#c2964a' : shape === 'submarine' ? '#4d5862' : night ? '#2b241d' : '#fbf6ea'
  const line = '#2a241d'
  const ring = shape === 'submarine' ? 22 : shape === 'porthole' ? 16 : 9
  const outerRadius = round ? '50%' : shape === 'arch' ? '50% 50% 6px 6px / 38% 38% 6px 6px' : '8px 8px 0 0'
  const innerRadius = round ? '50%' : shape === 'arch' ? '50% 50% 3px 3px / 36% 36% 3px 3px' : '3px'
  const bar = { position: 'absolute', background: frame, zIndex: 3, border: `1.5px solid ${line}` } as const
  const fabric = night ? 'color-mix(in srgb, var(--pd-accent) 45%, #1a1410)' : 'color-mix(in srgb, var(--pd-accent) 45%, #fffcf5)'

  return (
    <Box sx={{ position: 'relative', width: round ? 'auto' : width, display: round ? 'flex' : 'block', flexDirection: 'column', alignItems: 'center', px: decor === 'shutters' ? '15%' : 0, ...sx }}>
      <Box sx={{
        position: 'relative', height, aspectRatio: round ? '1 / 1' : undefined, p: `${ring}px`, background: frame,
        border: `2px solid ${line}`, borderBottom: round ? undefined : 'none', borderRadius: outerRadius,
        boxShadow: round
          ? `inset 0 0 0 3px rgba(255,255,255,0.18), inset 0 -4px 0 rgba(0,0,0,0.2), 3px 4px 0 rgba(42,36,29,${night ? 0.35 : 0.15})`
          : night ? '3px 0 0 rgba(0,0,0,0.25)' : '3px 0 0 rgba(60,42,20,0.1)',
        mb: round ? '-8px' : 0, zIndex: 1,
      }}>
        {decor === 'shutters' && <Shutters color={fabric} />}
        {decor === 'curtains' && <Curtains color={fabric} />}
        {shape === 'porthole' && <Rivets count={8} color="#d9b46a" inset={ring / 2 + 2} />}
        {shape === 'submarine' && <Rivets count={12} color="#8d99a3" inset={ring / 2 + 2} />}
        <Box sx={{ position: 'relative', height: '100%', overflow: 'hidden', background: theme.sky, border: `1.5px solid ${line}`, borderRadius: innerRadius, containerType: 'inline-size' }}>
          <Celestial sky={sky} night={night} />
          {!night && sky !== 'none' && (
            <>
              <Cloud top="20%" scale={0.9} duration={70} delay={-12} />
              <Cloud top="40%" scale={0.6} duration={95} delay={-55} />
            </>
          )}
          <FloatingParticles />
          <Horizon shape={shape} night={night} horizon={horizon} />
          {(decor === 'flowers' || decor === 'plants') && <FlowerBox flowers={decor === 'flowers'} />}
          {stained && <Box aria-hidden sx={{ position: 'absolute', left: 0, right: 0, top: 0, height: '54%', zIndex: 2, pointerEvents: 'none', opacity: 0.62, background: 'repeating-linear-gradient(45deg, rgba(20,8,10,0.85) 0 2px, transparent 2px 20px), repeating-linear-gradient(-45deg, rgba(20,8,10,0.85) 0 2px, transparent 2px 20px), conic-gradient(from 30deg at 50% 70%, #b3263f, #e0a73a, #2f6f73, #6b3f8a, #b3263f)' }} />}
          <Box aria-hidden sx={{ position: 'absolute', inset: 0, zIndex: 2, background: round ? 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.22), transparent 34%)' : 'linear-gradient(125deg, transparent 30%, rgba(255,255,255,0.14) 38%, transparent 46%)', pointerEvents: 'none' }} />
          {(shape === 'sash' || shape === 'arch' || shape === 'round') && (
            <>
              <Box aria-hidden sx={{ ...bar, top: -2, bottom: -2, left: '50%', width: shape === 'round' ? 7 : 9, transform: 'translateX(-50%)', borderTop: 'none', borderBottom: 'none' }} />
              <Box aria-hidden sx={{ ...bar, left: -2, right: -2, top: shape === 'arch' ? '54%' : '48%', height: shape === 'round' ? 7 : 9, borderLeft: 'none', borderRight: 'none' }} />
            </>
          )}
        </Box>
      </Box>
      <Box sx={{
        position: 'relative', mx: round ? 0 : '-14px', width: round ? 'calc(100% + 56px)' : undefined, minWidth: round ? 180 : undefined,
        height: 14, background: night ? '#2b241d' : '#e7d6b6', border: `2px solid ${night ? 'rgba(250,246,238,0.28)' : 'rgba(42,36,29,0.6)'}`, borderRadius: '2px',
        boxShadow: night ? '0 5px 0 rgba(0,0,0,0.3)' : '0 5px 0 rgba(60,42,20,0.12)', zIndex: 2,
      }}>
        {shelves && <><Shelf side="left" /><Shelf side="right" /></>}
      </Box>
      {children}
    </Box>
  )
}

export function SillScene({ emoji, height = 110 }: { emoji?: string; height?: number }) {
  return (
    <WindowScene width={Math.round(height * 1.5)} height={height} shelves={false} sx={{ mx: 'auto', mb: 1 }}>
      {emoji && (
        <Box aria-hidden sx={{ position: 'absolute', right: 6, bottom: 12, zIndex: 5, fontSize: Math.round(height * 0.3), lineHeight: 1, filter: 'drop-shadow(1px 2px 0 rgba(42,36,29,0.25))' }}>
          {emoji}
        </Box>
      )}
    </WindowScene>
  )
}
