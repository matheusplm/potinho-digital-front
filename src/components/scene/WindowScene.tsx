import { Box, type SxProps, type Theme } from '@mui/material'
import { keyframes } from '@emotion/react'
import type { ReactNode } from 'react'
import { useBackground } from '../../context/BackgroundContext'
import { themeInk } from '../../design-system'
import { FloatingParticles } from '../FloatingParticles'

const drift = keyframes`
  from { transform: translateX(-140px); }
  to   { transform: translateX(calc(100cqw + 40px)); }
`

const ROOFS = 'M0 60 V38 H18 V30 L30 20 L42 30 V38 H58 V26 H74 V34 H92 V22 L104 14 L116 22 V36 H134 V28 H150 V18 H166 V32 H184 V24 L198 16 L212 24 V36 H230 V30 H246 V20 H262 V34 H280 V26 H300 V60 Z'
const LIT = [[22, 33], [64, 30], [98, 26], [108, 30], [140, 32], [154, 22], [170, 36], [202, 28], [236, 34], [252, 25], [286, 30]]

function Cloud({ top, scale, duration, delay }: { top: string; scale: number; duration: number; delay: number }) {
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

function Shelf({ side }: { side: 'left' | 'right' }) {
  const books = side === 'left'
    ? [{ w: 9, h: 30, c: themeInk.ink }, { w: 7, h: 26, c: '#d9c9a8' }, { w: 10, h: 33, c: 'color-mix(in srgb, var(--pd-ink) 45%, #3a3128)' }, { w: 8, h: 24, c: 'color-mix(in srgb, var(--pd-accent) 60%, #fffcf5)', tilt: 14 }]
    : []
  return (
    <Box aria-hidden sx={{ position: 'absolute', bottom: '100%', [side]: 6, display: 'flex', alignItems: 'flex-end', gap: '1px' }}>
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
  const night = theme.isDark
  const frame = night ? '#2b241d' : '#fbf6ea'
  const line = night ? 'rgba(250,246,238,0.28)' : 'rgba(42,36,29,0.6)'
  const bar = { position: 'absolute', background: frame, zIndex: 3, border: `1.5px solid ${line}` } as const

  return (
    <Box sx={{ position: 'relative', width, ...sx }}>
      <Box sx={{
        position: 'relative', height, p: '9px', background: frame, border: `2px solid ${line}`, borderBottom: 'none',
        borderRadius: '8px 8px 0 0', boxShadow: night ? '3px 0 0 rgba(0,0,0,0.25)' : '3px 0 0 rgba(60,42,20,0.1)',
      }}>
        <Box sx={{ position: 'relative', height: '100%', overflow: 'hidden', background: theme.sky, border: `1.5px solid ${line}`, borderRadius: '3px', containerType: 'inline-size' }}>
          {night ? (
            <Box aria-hidden sx={{ position: 'absolute', top: '14%', right: '18%', width: 30, height: 30, borderRadius: '50%', boxShadow: '9px 5px 0 0 #f3ead2', filter: 'drop-shadow(0 0 10px rgba(243,234,210,0.45))' }} />
          ) : (
            <Box aria-hidden sx={{ position: 'absolute', top: '12%', right: '16%', width: 42, height: 42, borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, #fff7da, #f7d27a)', boxShadow: '0 0 0 8px rgba(255,236,170,0.35), 0 0 30px rgba(255,220,140,0.6)' }} />
          )}
          {!night && (
            <>
              <Cloud top="18%" scale={0.9} duration={70} delay={-12} />
              <Cloud top="38%" scale={0.6} duration={95} delay={-55} />
            </>
          )}
          <FloatingParticles />
          <Box component="svg" aria-hidden viewBox="0 0 300 60" preserveAspectRatio="xMidYMax slice" sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: '30%', zIndex: 1 }}>
            <path d={ROOFS} fill={night ? 'rgba(0,0,0,0.42)' : 'rgba(255,253,247,0.45)'} />
            {night && LIT.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="4" height="5" fill="#f7d98a" opacity="0.85" />)}
          </Box>
          <Box aria-hidden sx={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(125deg, transparent 30%, rgba(255,255,255,0.14) 38%, transparent 46%)', pointerEvents: 'none' }} />
          <Box aria-hidden sx={{ ...bar, top: -2, bottom: -2, left: '50%', width: 9, transform: 'translateX(-50%)', borderTop: 'none', borderBottom: 'none' }} />
          <Box aria-hidden sx={{ ...bar, left: -2, right: -2, top: '48%', height: 9, borderLeft: 'none', borderRight: 'none' }} />
        </Box>
      </Box>
      <Box sx={{
        position: 'relative', mx: '-14px', height: 14, background: frame, border: `2px solid ${line}`, borderRadius: '2px',
        boxShadow: night ? '0 5px 0 rgba(0,0,0,0.3)' : '0 5px 0 rgba(60,42,20,0.12)',
      }}>
        {shelves && <><Shelf side="left" /><Shelf side="right" /></>}
      </Box>
      {children}
    </Box>
  )
}
