import { Box } from '@mui/material'
import { keyframes } from '@emotion/react'
import type { Horizon as HorizonKind, Shape, Sky } from './sceneLook'

const sea = keyframes`
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(-24px); }
`

const kelp = keyframes`
  0%, 100% { transform: skewX(-4deg); }
  50%      { transform: skewX(5deg); }
`

const beam = keyframes`
  0%, 100% { opacity: 0.15; }
  50%      { opacity: 0.55; }
`

const ROOFS = 'M0 60 V38 H18 V30 L30 20 L42 30 V38 H58 V26 H74 V34 H92 V22 L104 14 L116 22 V36 H134 V28 H150 V18 H166 V32 H184 V24 L198 16 L212 24 V36 H230 V30 H246 V20 H262 V34 H280 V26 H300 V60 Z'
const LIT = [[22, 33], [64, 30], [98, 26], [108, 30], [140, 32], [154, 22], [170, 36], [202, 28], [236, 34], [252, 25], [286, 30]]

function Layer({ height, children, view = '0 0 300 60' }: { height: string; children: React.ReactNode; view?: string }) {
  return (
    <Box component="svg" aria-hidden viewBox={view} preserveAspectRatio="xMidYMax slice" sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height, zIndex: 1 }}>
      {children}
    </Box>
  )
}

function crown(x: number, y: number, r: number, colors: string[]) {
  return (
    <g key={`${x}-${y}`}>
      <path d={`M${x - 1.5} 60 L${x - 1} ${y + r * 0.4} L${x + 1} ${y + r * 0.4} L${x + 1.5} 60 Z`} fill="#5e3f27" />
      <circle cx={x - r * 0.55} cy={y + r * 0.25} r={r * 0.72} fill={colors[0]} />
      <circle cx={x + r * 0.5} cy={y + r * 0.15} r={r * 0.8} fill={colors[1]} />
      <circle cx={x} cy={y - r * 0.3} r={r * 0.85} fill={colors[2]} />
    </g>
  )
}

function Pines({ night }: { night: boolean }) {
  const far = night ? 'rgba(10,30,18,0.85)' : 'rgba(70,120,80,0.55)'
  const near = night ? '#06140b' : '#3f6b45'
  const pine = (x: number, h: number, w: number) => {
    const tiers = [0, 0.32, 0.6].map((t, i) => {
      const top = 60 - h + h * t
      const base = top + h * 0.42
      const half = w * (0.55 + i * 0.22)
      return `M${x} ${top} L${x + half} ${base} L${x + half * 0.35} ${base} L${x} ${base - 2} L${x - half * 0.35} ${base} L${x - half} ${base} Z`
    })
    return `${tiers.join(' ')} M${x - 1.2} 60 V${60 - h * 0.12} H${x + 1.2} V60 Z`
  }
  return (
    <Layer height="48%">
      <path d={[14, 40, 66, 96, 122, 150, 178, 204, 232, 258, 286].map((x, i) => pine(x, 30 + (i % 3) * 7, 10)).join(' ')} fill={far} />
      <path d={[2, 30, 58, 86, 112, 142, 168, 198, 224, 254, 280, 300].map((x, i) => pine(x, 40 + ((i * 7) % 16), 13)).join(' ')} fill={near} />
      <rect x="0" y="57" width="300" height="3" fill={near} />
    </Layer>
  )
}

function Grove({ palette, ground, hill }: { palette: string[][]; ground: string; hill: string }) {
  const spots: [number, number, number][] = [[22, 36, 13], [58, 30, 17], [96, 38, 11], [136, 28, 19], [178, 35, 13], [214, 31, 16], [252, 37, 12], [284, 30, 15]]
  return (
    <Layer height="42%">
      <path d="M0 60 V40 Q 50 26 110 36 T 210 30 T 300 36 V60 Z" fill={hill} />
      {spots.map(([x, y, r], i) => crown(x, y, r, palette[i % palette.length]))}
      <path d="M0 60 V53 Q 40 49 80 53 T 160 52 T 240 54 T 300 52 V60 Z" fill={ground} />
    </Layer>
  )
}

function Hills() {
  return (
    <Layer height="40%">
      <path d="M0 60 V34 Q 60 18 120 30 T 240 24 T 300 28 V60 Z" fill="rgba(196,104,64,0.45)" />
      <path d="M0 60 V42 Q 70 30 150 40 T 300 36 V60 Z" fill="rgba(160,72,46,0.65)" />
      <path d="M0 60 V50 Q 90 42 180 50 T 300 48 V60 Z" fill="#6e3420" />
      {[[38, 41, 4.2], [43, 42, 3.2], [206, 37, 4.6], [211, 38, 3.4], [258, 39, 3.8]].map(([x, y, h]) => (
        <g key={x} fill="#4d2214">
          <ellipse cx={x} cy={y - h} rx={h * 0.34} ry={h} />
          <rect x={x - 0.3} y={y - 0.4} width="0.6" height="1.6" />
        </g>
      ))}
    </Layer>
  )
}

function Castle({ night }: { night: boolean }) {
  const towers: [number, number, number][] = [[18, 26, 8], [52, 34, 6], [86, 20, 10], [120, 30, 7], [150, 12, 12], [184, 30, 7], [214, 22, 9], [250, 32, 6], [282, 24, 8]]
  const fill = night ? 'rgba(8,2,6,0.82)' : 'rgba(60,30,40,0.55)'
  return (
    <Layer height="44%">
      <path d={`M0 60 V44 ${towers.map(([x, y, w]) => `H${x - w / 2} V${y} L${x} ${y - w * 1.6} L${x + w / 2} ${y} V44`).join(' ')} H300 V60 Z`} fill={fill} />
      {night && towers.map(([x, y], i) => <path key={i} d={`M${x - 1.4} ${y + 6} V${y + 3.6} Q ${x} ${y + 1.8} ${x + 1.4} ${y + 3.6} V${y + 6} Z`} fill="#f2c56b" opacity="0.85" />)}
    </Layer>
  )
}

function Planet() {
  return (
    <Layer height="26%" view="0 0 300 40">
      <path d="M-20 40 Q 150 -8 320 40 Z" fill="rgba(60,30,90,0.85)" />
      {[[60, 30, 5], [140, 22, 7], [222, 30, 4], [190, 34, 3]].map(([x, y, r]) => <ellipse key={x} cx={x} cy={y} rx={r} ry={r * 0.45} fill="rgba(20,8,36,0.6)" />)}
    </Layer>
  )
}

function City({ night }: { night: boolean }) {
  return (
    <Layer height="30%">
      <path d={ROOFS} fill={night ? 'rgba(0,0,0,0.42)' : 'color-mix(in srgb, var(--pd-ink) 14%, rgba(255,253,247,0.7))'} />
      {night && LIT.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="4" height="5" fill="#f7d98a" opacity="0.85" />)}
    </Layer>
  )
}

function Sea({ beach }: { beach: boolean }) {
  return (
    <>
      <Box aria-hidden sx={{ position: 'absolute', left: -30, right: -30, bottom: 0, height: '34%', zIndex: 1, animation: `${sea} 7s ease-in-out infinite` }}>
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #4f93b8, #2d6c8f)' }} />
        <Box sx={{ position: 'absolute', left: 0, right: 0, top: -6, height: 12, background: 'radial-gradient(circle at 10px 12px, transparent 9px, #4f93b8 9.5px) 0 0 / 20px 12px repeat-x' }} />
      </Box>
      {beach && (
        <>
          <Box component="svg" aria-hidden viewBox="0 0 40 80" sx={{ position: 'absolute', left: '72%', bottom: 'calc(34% - 4px)', height: '30%', zIndex: 1, overflow: 'visible' }}>
            <path d="M24 10 L60 0 V22 Z" fill="#fff4c9" style={{ animation: `${beam} 3s ease-in-out infinite` }} />
            <path d="M14 80 L17 18 H23 L26 80 Z" fill="#fffcf5" stroke="#2a241d" strokeWidth="1.4" />
            {[30, 50, 70].map((y) => <path key={y} d={`M${15.5 + (y - 18) * 0.05} ${y} H${24.5 - (y - 18) * 0.05} V${y + 7} H${15.2 + (y - 18) * 0.05} Z`} fill="#d24a3b" />)}
            <rect x="15" y="10" width="10" height="8" fill="#f7d98a" stroke="#2a241d" strokeWidth="1.4" />
            <path d="M13 10 L20 3 L27 10 Z" fill="#d24a3b" stroke="#2a241d" strokeWidth="1.4" />
          </Box>
          <Layer height="14%" view="0 0 300 20">
            <path d="M0 20 V10 Q 60 2 130 8 T 300 6 V20 Z" fill="#e9d39d" />
            <path d="M0 20 V15 Q 80 10 160 14 T 300 12 V20 Z" fill="#dcc185" />
            {[[40, 12], [180, 13], [250, 11]].map(([x, y]) => <path key={x} d={`M${x} ${y} q 3 -4 6 0`} fill="none" stroke="#b98f55" strokeWidth="1.2" />)}
          </Layer>
        </>
      )}
    </>
  )
}

function Underwater() {
  return (
    <>
      <Box aria-hidden sx={{ position: 'absolute', inset: 0, zIndex: 1, background: 'repeating-linear-gradient(100deg, transparent 0 22px, rgba(180,230,255,0.07) 22px 34px, transparent 34px 60px)', maskImage: 'linear-gradient(180deg, #000, transparent 75%)', WebkitMaskImage: 'linear-gradient(180deg, #000, transparent 75%)' }} />
      <Box component="svg" aria-hidden viewBox="0 0 200 60" preserveAspectRatio="xMidYMax slice" sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: '42%', zIndex: 1, transformOrigin: 'bottom', animation: `${kelp} 6s ease-in-out infinite` }}>
        <path d="M0 60 Q 20 48 36 54 T 80 50 T 130 55 T 200 48 V60 Z" fill="rgba(0,0,0,0.5)" />
        {[[24, 18], [44, 6], [120, 14], [150, 2], [176, 20]].map(([x, top]) => (
          <path key={x} d={`M${x} 60 C ${x - 8} 46, ${x + 8} 34, ${x} ${top + 10} C ${x - 6} ${top + 4}, ${x + 4} ${top}, ${x + 2} ${top}`} fill="none" stroke="rgba(30,90,80,0.75)" strokeWidth="4" strokeLinecap="round" />
        ))}
      </Box>
    </>
  )
}

const GREENS = [['#4f8f58', '#5a9d62', '#6aac6f'], ['#3f7a4a', '#4f8f58', '#5f9e5f'], ['#5a9d62', '#78b46f', '#4f8f58']]
const AUTUMN = [['#c4512b', '#d9792f', '#e3a83a'], ['#a8432a', '#c96a2c', '#d9a03a'], ['#d9792f', '#e8b64a', '#b9502c']]

export function Horizon({ shape, night, horizon }: { shape: Shape; night: boolean; horizon?: HorizonKind }) {
  if (shape === 'submarine') return <Underwater />
  if (shape === 'porthole') return <Sea beach={horizon === 'beach'} />
  if (horizon === 'pines') return <Pines night={night} />
  if (horizon === 'trees') return <Grove palette={GREENS} hill="rgba(120,170,120,0.55)" ground="#4f8f58" />
  if (horizon === 'autumn') return <Grove palette={AUTUMN} hill="rgba(190,140,80,0.5)" ground="#a5733f" />
  if (horizon === 'hills') return <Hills />
  if (horizon === 'castle') return <Castle night={night} />
  if (horizon === 'space') return <Planet />
  return <City night={night} />
}

export function Celestial({ sky, night, scale = 1 }: { sky?: Sky; night: boolean; scale?: number }) {
  const kind = sky ?? (night ? 'moon' : 'sun')
  if (kind === 'none') return null
  if (kind === 'planets') {
    return (
      <>
        <Box aria-hidden sx={{ position: 'absolute', top: '12%', right: '16%', width: 34 * scale, height: 34 * scale, borderRadius: '50%', background: '#e7b8e8', boxShadow: 'inset -6px -4px 0 rgba(90,40,110,0.45)', '&::after': { content: '""', position: 'absolute', left: '-38%', right: '-38%', top: '42%', height: '18%', borderRadius: '50%', border: '2px solid #f3d9a0', transform: 'rotate(-18deg)' } }} />
        <Box aria-hidden sx={{ position: 'absolute', top: '30%', left: '18%', width: 12 * scale, height: 12 * scale, borderRadius: '50%', background: '#9fd3e6', boxShadow: 'inset -3px -2px 0 rgba(20,60,90,0.4)' }} />
      </>
    )
  }
  if (kind === 'moon') {
    return <Box aria-hidden sx={{ position: 'absolute', top: '14%', right: '20%', width: 30 * scale, height: 30 * scale, borderRadius: '50%', boxShadow: `${9 * scale}px ${5 * scale}px 0 0 #f3ead2`, filter: 'drop-shadow(0 0 10px rgba(243,234,210,0.45))' }} />
  }
  const low = kind === 'sunLow'
  return (
    <Box aria-hidden sx={{
      position: 'absolute', top: low ? '46%' : '13%', right: low ? '28%' : '20%', width: (low ? 58 : 42) * scale, height: (low ? 58 : 42) * scale, borderRadius: '50%',
      background: low ? 'radial-gradient(circle at 45% 40%, #ffe2a0, #f28c4a)' : 'radial-gradient(circle at 40% 40%, #fff7da, #f7d27a)',
      boxShadow: low ? '0 0 0 10px rgba(255,190,120,0.3), 0 0 50px rgba(255,150,80,0.6)' : '0 0 0 8px rgba(255,236,170,0.35), 0 0 30px rgba(255,220,140,0.6)',
    }} />
  )
}
