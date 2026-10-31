import { Box, Typography, type SxProps, type Theme } from '@mui/material'
import type { ReactNode } from 'react'
import { useBackground } from '../../context/BackgroundContext'
import { font, themeInk } from '../../design-system'
import { FurnitureSide } from './Furniture'

type Shape = 'panel' | 'arch' | 'round' | 'hatch' | 'cabin' | 'greenhouse' | 'ship' | 'dutch'
type Decor = 'wreath' | 'lantern' | 'vines' | 'pots' | 'lifering' | 'stripes' | null

const LOOK: Record<string, { shape: Shape; decor: Decor; window: 'round' | 'star' | 'heart' | 'none' }> = {
  papel: { shape: 'panel', decor: null, window: 'round' },
  romance: { shape: 'arch', decor: 'wreath', window: 'heart' },
  sunset: { shape: 'dutch', decor: null, window: 'none' },
  ocean: { shape: 'ship', decor: 'lifering', window: 'round' },
  mint: { shape: 'greenhouse', decor: 'pots', window: 'none' },
  peach: { shape: 'arch', decor: 'pots', window: 'round' },
  lavender: { shape: 'round', decor: null, window: 'round' },
  midnight: { shape: 'panel', decor: 'lantern', window: 'star' },
  velvet: { shape: 'arch', decor: 'lantern', window: 'star' },
  'rose-night': { shape: 'arch', decor: 'vines', window: 'heart' },
  'deep-ocean': { shape: 'hatch', decor: 'stripes', window: 'round' },
  'forest-night': { shape: 'cabin', decor: 'lantern', window: 'none' },
}

const BRASS = '#c9a14e'
const STEEL = '#59656f'
const HEART = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z'
const STAR = 'M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.2l7.1-.6z'

function Glass({ kind, frame, line, sky }: { kind: 'round' | 'star' | 'heart'; frame: string; line: string; sky: string }) {
  if (kind === 'round') {
    return (
      <Box sx={{ position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%)', width: '40%', aspectRatio: '1 / 1', borderRadius: '50%', background: sky, border: `3px solid ${frame}`, boxShadow: `0 0 0 1.5px ${line}`, overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, background: frame }} />
        <Box sx={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 2, background: frame }} />
      </Box>
    )
  }
  return (
    <Box component="svg" viewBox="0 0 24 24" sx={{ position: 'absolute', top: '9%', left: '50%', transform: 'translateX(-50%)', width: '42%', overflow: 'visible' }}>
      <defs><clipPath id={`door-${kind}`}><path d={kind === 'star' ? STAR : HEART} /></clipPath></defs>
      <foreignObject x="0" y="0" width="24" height="24" clipPath={`url(#door-${kind})`}>
        <Box sx={{ width: '100%', height: '100%', background: sky }} />
      </foreignObject>
      <path d={kind === 'star' ? STAR : HEART} fill="none" stroke={frame} strokeWidth="1.6" strokeLinejoin="round" />
    </Box>
  )
}

function Hatch({ line }: { line: string }) {
  return (
    <>
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2
        return <Box key={i} sx={{ position: 'absolute', width: 6, height: 6, borderRadius: '50%', background: '#9aa6b0', boxShadow: 'inset -1px -1px 0 rgba(0,0,0,0.4)', left: `calc(50% + 44% * ${Math.cos(a).toFixed(3)} - 3px)`, top: `calc(50% + 46% * ${Math.sin(a).toFixed(3)} - 3px)` }} />
      })}
      <Box sx={{ position: 'absolute', top: '58%', left: '50%', transform: 'translate(-50%, -50%)', width: '46%', aspectRatio: '1 / 1', borderRadius: '50%', border: `4px solid ${BRASS}`, boxShadow: `0 0 0 1.5px ${line}` }}>
        {[0, 45, 90, 135].map((r) => <Box key={r} sx={{ position: 'absolute', top: '50%', left: -4, right: -4, height: 4, mt: '-2px', background: BRASS, transform: `rotate(${r}deg)`, border: '0.5px solid rgba(0,0,0,0.3)' }} />)}
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', width: 12, height: 12, m: '-6px', borderRadius: '50%', background: '#a88638', border: '1px solid rgba(0,0,0,0.45)' }} />
      </Box>
    </>
  )
}

function Lantern({ side, night }: { side: 'left' | 'right'; night: boolean }) {
  return (
    <Box sx={{ position: 'absolute', top: '22%', [side]: -26, width: 16, zIndex: 3 }}>
      <Box sx={{ width: 6, height: 8, mx: 'auto', background: '#2a241d' }} />
      <Box sx={{ width: 16, height: 22, background: night ? 'radial-gradient(circle, #ffe9a8 30%, #f2b84b)' : '#f6e4b4', border: '2px solid #2a241d', borderRadius: '3px 3px 5px 5px', boxShadow: night ? '0 0 22px 8px rgba(255,214,120,0.45)' : 'none' }} />
    </Box>
  )
}

function Pots() {
  return (
    <>
      {(['left', 'right'] as const).map((side, i) => (
        <Box key={side} sx={{ position: 'absolute', bottom: 0, [side]: -34, zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ position: 'relative', width: 26, height: 26 }}>
            {[-30, 0, 30].map((r) => <Box key={r} sx={{ position: 'absolute', bottom: 0, left: 10, width: 7, height: 22, borderRadius: '50%', background: '#4f8f58', transform: `rotate(${r}deg)`, transformOrigin: 'bottom' }} />)}
            {i === 0 && <Box sx={{ position: 'absolute', top: -2, left: 8, width: 10, height: 10, borderRadius: '50%', background: '#e86a7a', border: '1px solid rgba(42,36,29,0.4)' }} />}
          </Box>
          <Box sx={{ width: 24, height: 18, background: '#c0673e', border: '1.5px solid rgba(42,36,29,0.6)', clipPath: 'polygon(0 0, 100% 0, 85% 100%, 15% 100%)' }} />
        </Box>
      ))}
    </>
  )
}

export function Door({ height = 200, ajar = false, mat = 'bem-vindo', furnished = false, pieces = 2, sx }: {
  height?: number
  ajar?: boolean
  mat?: string
  furnished?: boolean
  pieces?: number
  sx?: SxProps<Theme>
}) {
  const { theme } = useBackground()
  const { shape, decor, window: glass } = LOOK[theme.key] ?? LOOK.papel
  const night = theme.isDark
  const width = Math.round(height * (shape === 'round' ? 0.82 : shape === 'hatch' ? 0.64 : 0.56))
  const frame = shape === 'hatch' ? '#3c464f' : shape === 'ship' ? '#7a5a3a' : night ? '#2b241d' : '#fbf6ea'
  const line = night || shape === 'hatch' ? 'rgba(250,246,238,0.3)' : 'rgba(42,36,29,0.6)'
  const paint = shape === 'hatch' ? STEEL : shape === 'cabin' ? '#6b4a2e' : shape === 'greenhouse' ? '#e9efe6' : `color-mix(in srgb, ${themeInk.ink} 82%, #2a1d12)`
  const top = shape === 'arch' ? '50% 50% 2px 2px / 30% 30% 2px 2px' : shape === 'round' ? '50% 50% 4px 4px / 55% 55% 4px 4px' : shape === 'hatch' ? '38% 38% 30% 30% / 26% 26% 22% 22%' : '3px 3px 0 0'
  const panel = { position: 'absolute', left: '16%', right: '16%', border: '1.5px solid rgba(0,0,0,0.28)', borderRadius: '2px', boxShadow: 'inset 2px 2px 0 rgba(255,255,255,0.12), inset -2px -2px 0 rgba(0,0,0,0.18)' } as const
  const surface: Record<Shape, ReactNode> = {
    panel: <><Box sx={{ ...panel, top: '36%', height: '18%' }} /><Box sx={{ ...panel, top: '64%', height: '28%' }} /></>,
    arch: <><Box sx={{ ...panel, top: '40%', height: '16%' }} /><Box sx={{ ...panel, top: '64%', height: '28%' }} /></>,
    dutch: <><Box sx={{ ...panel, top: '10%', height: '34%' }} /><Box sx={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 4, background: 'rgba(0,0,0,0.3)' }} /><Box sx={{ ...panel, top: '60%', height: '32%', backgroundImage: 'linear-gradient(to top right, transparent 47%, rgba(0,0,0,0.22) 48% 52%, transparent 53%), linear-gradient(to top left, transparent 47%, rgba(0,0,0,0.22) 48% 52%, transparent 53%)' }} /></>,
    round: <Box sx={{ position: 'absolute', inset: '14% 12% 6%', borderRadius: '50% 50% 2px 2px / 40% 40% 2px 2px', border: '1.5px solid rgba(0,0,0,0.22)', backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 12px, rgba(0,0,0,0.12) 12px 13px)' }} />,
    hatch: <Hatch line={line} />,
    cabin: <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 15px, rgba(0,0,0,0.28) 15px 17px)' }}><Box sx={{ position: 'absolute', left: '8%', right: '8%', top: '20%', height: 7, background: '#4d341f', border: '1px solid rgba(0,0,0,0.4)' }} /><Box sx={{ position: 'absolute', left: '8%', right: '8%', bottom: '20%', height: 7, background: '#4d341f', border: '1px solid rgba(0,0,0,0.4)' }} /><Box sx={{ position: 'absolute', left: '10%', right: '10%', top: '50%', height: 7, background: '#4d341f', border: '1px solid rgba(0,0,0,0.4)', transform: 'rotate(-28deg)' }} /></Box>,
    greenhouse: <Box sx={{ position: 'absolute', inset: '6%', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'repeat(4, 1fr)', gap: '4px' }}>{Array.from({ length: 8 }, (_, i) => <Box key={i} sx={{ background: theme.sky, border: '1.5px solid rgba(42,36,29,0.4)', opacity: 0.85 }} />)}</Box>,
    ship: <><Box sx={{ ...panel, top: '50%', height: '40%' }} />{[12, 88].map((y) => [10, 90].map((x) => <Box key={`${x}${y}`} sx={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 5, height: 5, m: '-2.5px', borderRadius: '50%', background: BRASS }} />))}</>,
  }

  return (
    <Box aria-hidden sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', position: 'relative', ...sx }}>
      <Box sx={{ position: 'relative', width: width + 16, height, p: '7px', pb: 0, background: frame, border: `2px solid ${line}`, borderBottom: 'none', borderRadius: top }}>
        {decor === 'lantern' && <Lantern side="left" night={night} />}
        {decor === 'pots' && <Pots />}
        {decor === 'stripes' && <Box sx={{ position: 'absolute', left: -10, right: -10, bottom: 0, height: 12, zIndex: 4, background: 'repeating-linear-gradient(45deg, #e3b42f 0 8px, #2a241d 8px 16px)', border: '1.5px solid #2a241d' }} />}
        <Box sx={{ position: 'relative', width: '100%', height: '100%', borderRadius: top, background: 'radial-gradient(ellipse at 50% 70%, #ffe7a8, #f3b866 70%, #c98a3c)', perspective: '600px' }}>
          <Box sx={{
            position: 'absolute', inset: 0, background: paint, border: `1.5px solid ${line}`, borderRadius: top,
            transformOrigin: 'left center', transform: ajar ? 'rotateY(-32deg)' : 'none',
            boxShadow: ajar ? '6px 0 12px rgba(0,0,0,0.25)' : shape === 'hatch' ? 'inset 0 0 0 4px rgba(255,255,255,0.08), inset 0 -6px 0 rgba(0,0,0,0.2)' : 'none',
            backgroundImage: shape === 'panel' || shape === 'arch' ? 'repeating-linear-gradient(90deg, transparent 0 13px, rgba(0,0,0,0.05) 13px 14px)' : undefined,
          }}>
            {surface[shape]}
            {glass !== 'none' && shape !== 'greenhouse' && <Glass kind={glass} frame={frame} line={line} sky={theme.sky} />}
            {shape !== 'hatch' && (
              <Box sx={{ position: 'absolute', top: shape === 'round' ? '62%' : '57%', left: '24%', right: '24%', height: 6, background: BRASS, border: '1px solid rgba(0,0,0,0.4)', borderRadius: 1 }}>
              </Box>
            )}
            <Box sx={{ position: 'absolute', top: shape === 'round' ? '52%' : '50%', right: shape === 'hatch' ? '6%' : '10%', width: shape === 'hatch' ? 6 : 9, height: shape === 'hatch' ? 16 : 9, borderRadius: shape === 'hatch' ? 2 : '50%', background: BRASS, border: '1px solid rgba(0,0,0,0.45)', boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.45)' }} />
          </Box>
          {decor === 'wreath' && !ajar && (
            <Box sx={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: '46%', aspectRatio: '1 / 1', borderRadius: '50%', border: '6px dotted #5a9a62', boxShadow: 'inset 0 0 0 3px #3f7a4a', zIndex: 2 }}>
              <Box sx={{ position: 'absolute', bottom: -10, left: '50%', width: 14, height: 10, ml: '-7px', background: '#e86a7a', clipPath: 'polygon(0 0, 50% 45%, 100% 0, 100% 100%, 50% 55%, 0 100%)' }} />
            </Box>
          )}
          {decor === 'lifering' && (
            <Box sx={{ position: 'absolute', top: '30%', left: -22, width: 34, height: 34, borderRadius: '50%', zIndex: 2, background: 'conic-gradient(#e24b3b 0 25%, #fffcf5 0 50%, #e24b3b 0 75%, #fffcf5 0)', border: '1.5px solid rgba(42,36,29,0.6)', mask: 'radial-gradient(circle, transparent 7px, #000 7.5px)', WebkitMask: 'radial-gradient(circle, transparent 7px, #000 7.5px)' }} />
          )}
          {decor === 'vines' && (
            <Box component="svg" viewBox="0 0 60 120" preserveAspectRatio="none" sx={{ position: 'absolute', inset: '-6px -10px', width: 'calc(100% + 20px)', height: 'calc(100% + 6px)', zIndex: 2, overflow: 'visible' }}>
              <path d="M2 118 C 8 80, -2 50, 10 20 S 40 -4, 58 14" fill="none" stroke="#3f6b45" strokeWidth="2.4" />
              {[[6, 96], [5, 62], [12, 30], [30, 6], [50, 10]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="4" fill="#d24a63" stroke="#2a241d" strokeWidth="0.8" />)}
            </Box>
          )}
        </Box>
      </Box>
      <Box sx={{ width: width + 40, height: 8, background: night ? '#3a3027' : '#d8c4a0', border: `2px solid ${line}`, borderRadius: '2px', position: 'relative', zIndex: 1 }}>
        {furnished && (
          <>
            <FurnitureSide side="left" size={Math.round(height * 0.36)} max={pieces} sx={{ position: 'absolute', bottom: '100%', right: `calc(100% + ${Math.round(height * 0.08)}px)` }} />
            <FurnitureSide side="right" size={Math.round(height * 0.36)} max={pieces} sx={{ position: 'absolute', bottom: '100%', left: `calc(100% + ${Math.round(height * 0.08)}px)` }} />
          </>
        )}
      </Box>
      {mat && (
        <Box sx={{ mt: '3px', px: 1.2, py: '1px', background: night ? '#5a4632' : '#b98b56', border: `1.5px solid ${line}`, borderRadius: '2px', backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 3px, rgba(0,0,0,0.08) 3px 4px)' }}>
          <Typography sx={{ fontFamily: font.hand, fontSize: '0.95rem', lineHeight: 1.1, color: '#fff4dc', whiteSpace: 'nowrap' }}>{mat}</Typography>
        </Box>
      )}
    </Box>
  )
}
