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

const fly = keyframes`
  from { transform: translateX(-12cqw); }
  to   { transform: translateX(112cqw); }
`

const flap = keyframes`
  0%, 100% { transform: scaleY(1); }
  50%      { transform: scaleY(0.45); }
`

const swim = keyframes`
  from { transform: translateX(-20cqw) scaleX(var(--dir)); }
  to   { transform: translateX(120cqw) scaleX(var(--dir)); }
`

const rock = keyframes`
  0%, 100% { transform: rotate(-3deg) translateY(0); }
  50%      { transform: rotate(3deg) translateY(-2px); }
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

function leafy(cx: number, cy: number, r: number, seed: number) {
  const n = 11
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    const k = 0.82 + (((Math.sin((i + 1) * 9.7 + seed * 3.1) * 4375.85) % 1 + 1) % 1) * 0.3
    return [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k * 0.92]
  })
  return pts.map(([px, py], i) => {
    const [nx, ny] = pts[(i + 1) % n]
    const mx = (px + nx) / 2 + (px + nx - 2 * cx) * 0.18
    const my = (py + ny) / 2 + (py + ny - 2 * cy) * 0.18
    return `${i === 0 ? `M${px.toFixed(1)} ${py.toFixed(1)}` : ''} Q${mx.toFixed(1)} ${my.toFixed(1)} ${nx.toFixed(1)} ${ny.toFixed(1)}`
  }).join(' ') + ' Z'
}

function crown(x: number, y: number, r: number, colors: string[]) {
  return (
    <g key={`${x}-${y}`}>
      <path d={`M${x - 1.5} 60 L${x - 1} ${y + r * 0.4} L${x + 1} ${y + r * 0.4} L${x + 1.5} 60 Z`} fill="#5e3f27" />
      <path d={leafy(x - r * 0.5, y + r * 0.25, r * 0.7, x)} fill={colors[0]} />
      <path d={leafy(x + r * 0.5, y + r * 0.15, r * 0.78, x + 1)} fill={colors[1]} />
      <path d={leafy(x, y - r * 0.3, r * 0.84, x + 2)} fill={colors[2]} />
      <path d={`M${x - r * 0.3} ${y - r * 0.55} q ${r * 0.2} -${r * 0.15} ${r * 0.4} 0`} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" strokeLinecap="round" />
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

function Fence() {
  return (
    <g fill="#fffaf0" stroke="#2a241d" strokeWidth="0.5">
      <rect x="0" y="52.4" width="300" height="1.6" />
      <rect x="0" y="56.4" width="300" height="1.6" />
      {Array.from({ length: 34 }, (_, i) => <path key={i} d={`M${i * 9 + 1} 60 V50.6 L${i * 9 + 3} 48.4 L${i * 9 + 5} 50.6 V60 Z`} />)}
    </g>
  )
}

function Grove({ palette, ground, hill, extras }: { palette: string[][]; ground: string; hill: string; extras: 'garden' | 'harvest' }) {
  const spots: [number, number, number][] = [[22, 36, 13], [58, 30, 17], [96, 38, 11], [136, 28, 19], [178, 35, 13], [214, 31, 16], [252, 37, 12], [284, 30, 15]]
  const blooms = ['#e86a7a', '#f4b544', '#fffcf5', '#c86fb4', '#e86a7a', '#7fb3e0']
  return (
    <Layer height="44%">
      <path d="M0 60 V40 Q 50 26 110 36 T 210 30 T 300 36 V60 Z" fill={hill} />
      {spots.map(([x, y, r], i) => crown(x, y, r, palette[i % palette.length]))}
      <path d="M0 60 V50 Q 40 46 80 50 T 160 49 T 240 51 T 300 49 V60 Z" fill={ground} />
      {extras === 'harvest' && [[30, 53, 3], [44, 54, 2.2], [120, 52.5, 2.8], [196, 53.5, 3.2], [208, 54.4, 2], [272, 53, 2.6]].map(([x, y, r]) => (
        <g key={x}>
          <ellipse cx={x} cy={y} rx={r * 1.25} ry={r} fill="#e07a2a" stroke="#2a241d" strokeWidth="0.4" />
          <path d={`M${x - r * 0.4} ${y - r * 0.9} Q ${x} ${y + r} ${x + r * 0.4} ${y - r * 0.9}`} fill="none" stroke="#a8501f" strokeWidth="0.35" />
          <rect x={x - 0.3} y={y - r - 1} width="0.6" height="1.3" fill="#4f6b2a" />
        </g>
      ))}
      {extras === 'garden' && Array.from({ length: 60 }, (_, i) => (
        <circle key={i} cx={i * 5 + (i % 3)} cy={51.2 + (i % 4) * 0.5} r={0.9} fill={blooms[i % blooms.length]} />
      ))}
      <Fence />
    </Layer>
  )
}

function Lavender() {
  const rows = Array.from({ length: 22 }, (_, i) => -110 + i * 24)
  return (
    <Layer height="46%">
      <path d="M0 60 V34 Q 70 24 150 32 T 300 30 V60 Z" fill="rgba(120,140,110,0.5)" />
      <g transform="translate(232 27)">
        <path d="M-6 6 V0 L0 -5 L6 0 V6 Z" fill="#fffaf0" stroke="#2a241d" strokeWidth="0.5" />
        <path d="M-7 0.5 L0 -6 L7 0.5" fill="none" stroke="#a8432a" strokeWidth="1.4" />
        <rect x="-1.4" y="2" width="2.8" height="4" fill="#6e4a2e" />
        <circle cx="12" cy="0" r="4.5" fill="#4f7a4a" /><rect x="11.6" y="2" width="0.8" height="4" fill="#5e3f27" />
      </g>
      <path d="M0 60 V40 Q 80 34 150 38 T 300 38 V60 Z" fill="#8770b8" />
      <g fill="none" stroke="#56408f" strokeWidth="2.4" strokeLinecap="round">
        {rows.map((x) => <path key={x} d={`M${150 + (x - 150) * 0.12} 39 Q ${150 + (x - 150) * 0.5} 46 ${x} 62`} />)}
      </g>
      <g fill="none" stroke="#b9a6e0" strokeWidth="0.8" strokeLinecap="round" opacity="0.8">
        {rows.map((x) => <path key={x} d={`M${150 + (x - 150) * 0.12 + 1.6} 39 Q ${150 + (x - 150) * 0.5 + 2} 46 ${x + 6} 62`} />)}
      </g>
    </Layer>
  )
}

function Paris() {
  const fill = 'color-mix(in srgb, var(--pd-ink) 30%, rgba(255,240,244,0.75))'
  return (
    <Layer height="40%">
      <g fill={fill}>
        <path d="M0 60 V44 H14 Q 20 38 26 44 H40 V40 Q 48 34 56 40 V46 H70 V42 Q 78 36 86 42 V60 Z" />
        <path d="M214 60 V42 Q 222 36 230 42 V46 H244 Q 250 38 256 44 H270 V40 Q 278 34 286 40 V44 H300 V60 Z" />
        <path d="M86 60 V48 H108 V44 Q 116 38 124 44 V48 H176 V44 Q 184 38 192 44 V48 H214 V60 Z" />
        <path d="M150 4 L151.6 18 L156 34 L163 52 L168 60 H160 Q 150 48 140 60 H132 L137 52 L144 34 L148.4 18 Z" />
        <rect x="149.2" y="0" width="1.6" height="5" />
      </g>
      <g stroke="color-mix(in srgb, var(--pd-ink) 45%, transparent)" strokeWidth="0.5" fill="none">
        <path d="M144.5 32 H155.5 M141 44 H159 M148 18 H152" />
        <path d="M0 30 Q 75 40 150 30 T 300 30" strokeDasharray="0.6 3" strokeWidth="1.4" stroke="#f4c86a" />
      </g>
    </Layer>
  )
}

function Mountains({ night }: { night: boolean }) {
  const rock = night ? 'rgba(20,34,28,0.9)' : 'rgba(90,110,100,0.6)'
  const snow = night ? 'rgba(220,232,226,0.55)' : '#fffcf5'
  const peaks: [number, number][] = [[20, 14], [64, 6], [112, 18], [160, 2], [206, 12], [252, 4], [296, 16]]
  return (
    <Layer height="62%">
      <path d={`M-10 60 ${peaks.map(([x, y]) => `L${x - 22} ${y + 26} L${x} ${y}`).join(' ')} L320 38 V60 Z`} fill={rock} />
      {peaks.map(([x, y]) => <path key={x} d={`M${x - 6} ${y + 7} L${x} ${y} L${x + 6} ${y + 7} L${x + 3} ${y + 5.5} L${x} ${y + 8} L${x - 3} ${y + 5.5} Z`} fill={snow} />)}
    </Layer>
  )
}

export function Birds() {
  return (
    <Box aria-hidden sx={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', containerType: 'inline-size', '@media (prefers-reduced-motion: reduce)': { display: 'none' } }}>
      {[[14, 38, 0], [20, 52, -14], [30, 46, -30]].map(([top, dur, delay], i) => (
        <Box key={i} sx={{ position: 'absolute', top: `${top}%`, left: 0, animation: `${fly} ${dur}s linear ${delay}s infinite` }}>
          {[0, 1, 2].map((k) => (
            <Box key={k} component="svg" viewBox="0 0 20 8" sx={{ position: 'absolute', left: k * 14 + (k % 2) * 4, top: (k % 2) * 7, width: 14 - k * 2, animation: `${flap} ${0.5 + k * 0.12}s ease-in-out infinite` }}>
              <path d="M1 6 Q 5 0 10 5 Q 15 0 19 6" fill="none" stroke="rgba(42,36,29,0.6)" strokeWidth="1.6" strokeLinecap="round" />
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  )
}

type Seg = [number, number, number, number, number, number]

const FAR_HILL: Seg[] = [[0, 34, 60, 18, 120, 30], [120, 30, 180, 42, 240, 24], [240, 24, 300, 6, 360, 28]]
const MID_HILL: Seg[] = [[0, 42, 70, 30, 150, 40], [150, 40, 230, 50, 310, 36]]

function hillY(segs: Seg[], x: number) {
  const [x0, y0, cx, cy, x1, y1] = segs.find(([sx, , , , ex]) => x >= sx && x <= ex) ?? segs[segs.length - 1]
  let best = y0
  let gap = Infinity
  for (let i = 0; i <= 40; i++) {
    const t = i / 40
    const px = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t ** 2 * x1
    if (Math.abs(px - x) < gap) {
      gap = Math.abs(px - x)
      best = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t ** 2 * y1
    }
  }
  return best
}

const NEAR_HILL: Seg[] = [[0, 50, 90, 42, 180, 50], [180, 50, 270, 58, 360, 48]]

function rand(i: number, seed: number) {
  return ((Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453) % 1 + 1) % 1
}

function cypressGroves(segs: Seg[], gap: number, base: number, spread: number, seed: number) {
  const row: [number, number, number][] = []
  let x = rand(0, seed) * gap
  for (let g = 0; x < 300; g++) {
    const count = 3 + Math.floor(rand(g, seed + 1) * 4)
    const tallest = base + rand(g, seed + 2) * spread
    for (let k = 0; k < count; k++) {
      const offset = (k - (count - 1) / 2) * (base * 0.62 + rand(k + g * 7, seed + 3) * 0.5)
      const fall = Math.abs(k - (count - 1) / 2) / count
      const tx = x + offset
      if (tx > -2 && tx < 302) row.push([tx, hillY(segs, tx) + 1.2, tallest * (1 - fall * 0.55)])
    }
    x += gap * (0.6 + rand(g, seed + 4) * 0.9)
  }
  return row
}

const FAR_CYPRESS = cypressGroves(FAR_HILL, 16, 2.2, 1.2, 1)
const MID_CYPRESS = cypressGroves(MID_HILL, 22, 3.4, 1.8, 7)
const NEAR_CYPRESS = cypressGroves(NEAR_HILL, 46, 5.2, 2.2, 13)

function Cypresses({ row, fill }: { row: [number, number, number][]; fill: string }) {
  return (
    <g fill={fill}>
      {row.map(([x, y, h]) => (
        <g key={x}>
          <ellipse cx={x} cy={y - h} rx={h * 0.32} ry={h} />
          <rect x={x - 0.25} y={y - 0.3} width="0.5" height="1.4" />
        </g>
      ))}
    </g>
  )
}

function Hills() {
  return (
    <Layer height="40%">
      <path d="M0 60 V28 Q 70 16 150 24 T 300 20 V60 Z" fill="rgba(255,226,180,0.45)" />
      <path d="M0 60 V34 Q 60 18 120 30 T 240 24 T 300 28 V60 Z" fill="rgba(196,104,64,0.45)" />
      <Cypresses row={FAR_CYPRESS} fill="rgba(110,52,32,0.55)" />
      <path d="M0 60 V42 Q 70 30 150 40 T 300 36 V60 Z" fill="rgba(160,72,46,0.65)" />
      <Cypresses row={MID_CYPRESS} fill="#4d2214" />
      <path d="M0 60 V50 Q 90 42 180 50 T 300 48 V60 Z" fill="#6e3420" />
      <Cypresses row={NEAR_CYPRESS} fill="#3a170c" />
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

function Sailboat() {
  return (
    <Box component="svg" aria-hidden viewBox="0 0 30 30" sx={{ position: 'absolute', left: '22%', bottom: 'calc(34% - 6px)', width: 'max(36px, 6%)', zIndex: 1, transformOrigin: 'bottom center', animation: `${rock} 4s ease-in-out infinite` }}>
      <path d="M15 2 V22" stroke="#2a241d" strokeWidth="1.2" />
      <path d="M16 3 L27 20 H16 Z" fill="#fffcf5" stroke="#2a241d" strokeWidth="1" />
      <path d="M14 6 L5 20 H14 Z" fill="#d24a3b" stroke="#2a241d" strokeWidth="1" />
      <path d="M3 22 H27 L23 28 H7 Z" fill="#8a5e3b" stroke="#2a241d" strokeWidth="1" />
    </Box>
  )
}

function Sea({ beach }: { beach: boolean }) {
  return (
    <>
      {beach && <Sailboat />}
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
            <defs><pattern id="pd-sand" width="4" height="3" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.35" fill="#b98f55" /><circle cx="3" cy="2.3" r="0.25" fill="#fff4d6" /></pattern></defs>
            <path d="M0 20 V10 Q 60 2 130 8 T 300 6 V20 Z" fill="#e9d39d" />
            <path d="M0 20 V10 Q 60 2 130 8 T 300 6 V20 Z" fill="url(#pd-sand)" />
            <path d="M0 20 V15 Q 80 10 160 14 T 300 12 V20 Z" fill="#dcc185" />
            {[[40, 12], [180, 13], [250, 11]].map(([x, y]) => <path key={x} d={`M${x} ${y} q 3 -4 6 0`} fill="none" stroke="#b98f55" strokeWidth="1.2" />)}
          </Layer>
        </>
      )}
    </>
  )
}

function Fish() {
  return (
    <Box aria-hidden sx={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', containerType: 'inline-size', '@media (prefers-reduced-motion: reduce)': { display: 'none' } }}>
      {[[24, 26, 0, 1, '#f2a65a'], [40, 34, -12, -1, '#e8d07a'], [58, 22, -6, 1, '#7cc3dc'], [32, 40, -24, -1, '#f2a65a']].map(([top, dur, delay, dir, color], i) => (
        <Box key={i} sx={{ position: 'absolute', top: `${top}%`, left: 0, '--dir': dir, animation: `${swim} ${dur}s linear ${delay}s infinite`, animationDirection: dir === -1 ? 'reverse' : 'normal' }}>
          <Box component="svg" viewBox="0 0 24 12" sx={{ width: 'max(22px, 3cqw)', display: 'block' }}>
            <path d="M2 6 Q 9 -1 17 6 Q 9 13 2 6 Z M16 6 L23 1 V11 Z" fill={color as string} stroke="#0c1b22" strokeWidth="0.8" strokeLinejoin="round" />
            <circle cx="6" cy="5" r="0.9" fill="#0c1b22" />
          </Box>
        </Box>
      ))}
    </Box>
  )
}

function Underwater() {
  return (
    <>
      <Fish />
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
  if (shape === 'porthole' || horizon === 'beach') return <Sea beach={horizon === 'beach'} />
  if (horizon === 'pines') return <><Mountains night={night} /><Pines night={night} /></>
  if (horizon === 'trees') return <Grove palette={GREENS} hill="rgba(120,170,120,0.55)" ground="#4f8f58" extras="garden" />
  if (horizon === 'autumn') return <Grove palette={AUTUMN} hill="rgba(190,140,80,0.5)" ground="#a5733f" extras="harvest" />
  if (horizon === 'lavender') return <Lavender />
  if (horizon === 'paris') return <Paris />
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
