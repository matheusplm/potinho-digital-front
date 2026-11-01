import { Box, type SxProps, type Theme } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useBackground } from '../../context/BackgroundContext'
import { themeInk } from '../../design-system'
import { SillScene } from './WindowScene'

const flicker = keyframes`
  0%, 100% { opacity: 0.9; transform: scale(1, 1) skewX(0deg); }
  25%      { opacity: 1; transform: scale(0.92, 1.12) skewX(-6deg); }
  50%      { opacity: 0.8; transform: scale(1.06, 0.9) skewX(4deg); }
  75%      { opacity: 1; transform: scale(0.96, 1.08) skewX(-3deg); }
`

const glowPulse = keyframes`
  0%, 100% { opacity: 0.75; transform: translateX(-50%) scale(1); }
  50%      { opacity: 1; transform: translateX(-50%) scale(1.08); }
`

function Flame({ d, fill, origin, duration, delay = 0 }: { d: string; fill: string; origin: string; duration: number; delay?: number }) {
  return (
    <Box component="path" d={d} sx={{
      fill, stroke: 'none', transformBox: 'view-box', transformOrigin: origin,
      animation: `${flicker} ${duration}s ease-in-out ${delay}s infinite`,
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    }} />
  )
}

export type Piece =
  | 'armchair' | 'lamp' | 'fern' | 'monstera' | 'cactus' | 'table-books' | 'table-vase' | 'table-lamp'
  | 'bookshelf' | 'telescope' | 'stove' | 'chest' | 'pipes' | 'barrel' | 'candelabra' | 'beanbag'

type WallPiece = 'frame' | 'heart-frame' | 'wheel' | 'gauge' | 'clock' | 'lights'

const SETS: Record<string, { left: Piece[]; right: Piece[]; extra: Piece; wall: WallPiece; rug: boolean }> = {
  papel: { left: ['lamp', 'armchair'], right: ['table-books', 'fern'], extra: 'bookshelf', wall: 'frame', rug: true },
  romance: { left: ['armchair'], right: ['table-vase'], extra: 'fern', wall: 'heart-frame', rug: true },
  sunset: { left: ['armchair'], right: ['cactus'], extra: 'table-books', wall: 'clock', rug: true },
  ocean: { left: ['barrel'], right: ['fern'], extra: 'chest', wall: 'wheel', rug: false },
  mint: { left: ['monstera'], right: ['table-vase', 'fern'], extra: 'table-books', wall: 'frame', rug: false },
  peach: { left: ['armchair'], right: ['table-vase'], extra: 'fern', wall: 'frame', rug: true },
  lavender: { left: ['bookshelf'], right: ['beanbag'], extra: 'table-lamp', wall: 'lights', rug: true },
  midnight: { left: ['armchair'], right: ['table-lamp'], extra: 'bookshelf', wall: 'clock', rug: true },
  velvet: { left: ['telescope'], right: ['bookshelf'], extra: 'table-lamp', wall: 'lights', rug: true },
  'rose-night': { left: ['candelabra'], right: ['armchair'], extra: 'table-vase', wall: 'heart-frame', rug: true },
  'deep-ocean': { left: ['chest'], right: ['pipes'], extra: 'barrel', wall: 'gauge', rug: false },
  'forest-night': { left: ['stove'], right: ['armchair'], extra: 'table-lamp', wall: 'frame', rug: true },
}

const INK = '#2a241d'

function fabricFor(night: boolean) {
  return night ? 'color-mix(in srgb, var(--pd-accent) 55%, #2a1d12)' : 'color-mix(in srgb, var(--pd-accent) 50%, #fffcf5)'
}
const WOOD = '#8a5e3b'
const WOOD_DARK = '#5e3f27'

function Svg({ w, h, children, size }: { w: number; h: number; children: React.ReactNode; size: number }) {
  return (
    <Box component="svg" viewBox={`0 0 ${w} ${h}`} sx={{ height: size, width: 'auto', display: 'block', overflow: 'visible' }}>
      <g stroke={INK} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">{children}</g>
    </Box>
  )
}

function PieceArt({ piece, size, fabric, night }: { piece: Piece; size: number; fabric: string; night: boolean }) {
  const glow = night ? 'rgba(255,214,120,0.55)' : 'rgba(255,230,160,0.35)'
  switch (piece) {
    case 'armchair':
      return (
        <Svg w={70} h={60} size={size}>
          <rect x="10" y="4" width="50" height="34" rx="10" fill={fabric} />
          <rect x="4" y="26" width="16" height="24" rx="6" fill={fabric} />
          <rect x="50" y="26" width="16" height="24" rx="6" fill={fabric} />
          <rect x="16" y="32" width="38" height="14" rx="4" fill={`color-mix(in srgb, ${fabric} 85%, #fff)`} />
          <path d="M10 50 v8 M60 50 v8" stroke={WOOD_DARK} strokeWidth="3" />
          <path d="M22 12 q13 6 26 0" fill="none" strokeOpacity="0.35" />
        </Svg>
      )
    case 'beanbag':
      return (
        <Svg w={60} h={40} size={size * 0.7}>
          <path d="M6 38 C 0 20, 14 4, 30 6 S 62 18, 54 38 Z" fill={fabric} />
          <path d="M18 24 q10 -6 22 0" fill="none" strokeOpacity="0.35" />
        </Svg>
      )
    case 'lamp':
      return (
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: -size * 0.1, left: '50%', width: size * 0.8, height: size * 0.8, transform: 'translateX(-50%)', borderRadius: '50%', background: `radial-gradient(circle, ${glow}, transparent 65%)`, pointerEvents: 'none' }} />
          <Svg w={30} h={100} size={size * 1.4}>
            <path d="M6 22 L 10 4 H 20 L 24 22 Z" fill={`color-mix(in srgb, ${fabric} 55%, #fff6dc)`} />
            <path d="M15 22 V 94" stroke={WOOD_DARK} strokeWidth="2.4" />
            <path d="M6 96 H 24" strokeWidth="3" />
          </Svg>
        </Box>
      )
    case 'table-books':
    case 'table-vase':
    case 'table-lamp':
      return (
        <Box sx={{ position: 'relative' }}>
          {piece === 'table-lamp' && <Box sx={{ position: 'absolute', top: -size * 0.3, left: '50%', width: size, height: size, transform: 'translateX(-50%)', borderRadius: '50%', background: `radial-gradient(circle, ${glow}, transparent 62%)`, pointerEvents: 'none' }} />}
          <Svg w={44} h={64} size={size * 0.95}>
            {piece === 'table-books' && <><rect x="10" y="14" width="22" height="5" fill={themeInk.ink} /><rect x="12" y="9" width="18" height="5" fill="#d9c9a8" /><rect x="11" y="4" width="20" height="5" fill={fabric} /></>}
            {piece === 'table-vase' && <><path d="M22 18 C 14 18, 15 8, 19 6 h6 c4 2 5 12 -3 12 Z" fill="#e9dcc3" /><path d="M22 6 C 20 0, 14 -2, 12 -6 M22 6 C 24 -2, 30 -4, 32 -8 M22 6 V -6" fill="none" stroke="#3f7a4a" /><circle cx="12" cy="-7" r="3.5" fill="#e86a7a" /><circle cx="32" cy="-9" r="3.5" fill="#f4b544" /><circle cx="22" cy="-8" r="3.5" fill={themeInk.ink} /></>}
            {piece === 'table-lamp' && <><path d="M14 10 L 17 0 H 27 L 30 10 Z" fill="#fff1c9" /><path d="M22 10 V 18" strokeWidth="2.4" /></>}
            <rect x="4" y="18" width="36" height="5" rx="1" fill={WOOD} />
            <path d="M9 23 V 62 M35 23 V 62" stroke={WOOD_DARK} strokeWidth="3" />
            <path d="M9 44 H 35" stroke={WOOD_DARK} strokeWidth="2" />
          </Svg>
        </Box>
      )
    case 'fern':
    case 'monstera':
    case 'cactus':
      return (
        <Svg w={50} h={piece === 'monstera' ? 90 : 64} size={piece === 'monstera' ? size * 1.35 : size}>
          {piece === 'fern' && [-50, -25, 0, 25, 50].map((r) => <path key={r} d="M25 46 C 22 30, 24 16, 25 6" fill="none" stroke="#3f7a4a" strokeWidth="5" transform={`rotate(${r} 25 46)`} />)}
          {piece === 'monstera' && <><path d="M25 66 V 30 M25 50 L 10 30 M25 44 L 40 22" fill="none" stroke="#3f6b45" strokeWidth="2" /><path d="M2 30 C 0 14, 20 10, 22 26 C 18 32, 8 34, 2 30 Z" fill="#4f8f58" /><path d="M28 22 C 30 2, 50 4, 48 20 C 42 28, 32 28, 28 22 Z" fill="#5a9d62" /><path d="M14 52 C 6 40, 22 30, 26 44 C 24 52, 18 54, 14 52 Z" fill="#4f8f58" /><path d="M25 32 C 20 12, 34 4, 36 16" fill="#3f7a4a" /></>}
          {piece === 'cactus' && <path d="M20 48 V 14 C 20 6, 30 6, 30 14 V 48 M20 30 H 12 V 22 M30 26 H 38 V 16" fill="#5a9d62" stroke={INK} strokeWidth="1.6" />}
          <path d={piece === 'monstera' ? 'M10 66 H 40 L 36 88 H 14 Z' : 'M12 46 H 38 L 35 62 H 15 Z'} fill="#c0673e" />
        </Svg>
      )
    case 'bookshelf':
      return (
        <Svg w={56} h={100} size={size * 1.45}>
          <rect x="2" y="2" width="52" height="96" fill={WOOD} />
          {[2, 34, 66].map((y) => <path key={y} d={`M2 ${y + 30} H 54`} stroke={WOOD_DARK} strokeWidth="3" />)}
          {[[6, 10, '#c0392b'], [12, 14, '#d9c9a8'], [18, 8, themeInk.ink], [26, 12, '#4f7d52'], [34, 10, fabric], [8, 44, fabric], [14, 42, '#e9dcc3'], [22, 46, '#27408b'], [30, 40, '#c0673e'], [40, 44, '#d9c9a8']].map(([x, y, c], i) => (
            <rect key={i} x={x as number} y={y as number} width="5" height={(i < 5 ? 32 : 64) - (y as number)} fill={c as string} strokeWidth="1" />
          ))}
          <path d="M8 92 c4 -14 10 -14 14 0 M30 92 h18 v-14 h-18 z" fill="#5a9d62" strokeWidth="1.2" />
        </Svg>
      )
    case 'telescope':
      return (
        <Svg w={60} h={80} size={size * 1.2}>
          <path d="M30 40 L 14 78 M30 40 L 46 78 M30 40 V 78" stroke={WOOD_DARK} strokeWidth="2.4" />
          <rect x="8" y="22" width="44" height="12" rx="3" fill={themeInk.ink} transform="rotate(-28 30 28)" />
          <rect x="44" y="6" width="10" height="14" rx="2" fill="#c9a14e" transform="rotate(-28 30 28)" />
        </Svg>
      )
    case 'stove':
      return (
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ position: 'absolute', bottom: '10%', left: '50%', width: size * 1.6, height: size * 1.3, transform: 'translateX(-50%)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,150,60,0.5), transparent 62%)', pointerEvents: 'none', animation: `${glowPulse} 1.6s ease-in-out infinite` }} />
          <Svg w={50} h={90} size={size * 1.4}>
            <rect x="20" y="0" width="10" height="34" fill="#3a332c" />
            <rect x="6" y="34" width="38" height="44" rx="4" fill="#3a332c" />
            <rect x="12" y="46" width="26" height="22" rx="3" fill="#2a1d12" />
            <Flame d="M15 66 C 13 58, 20 56, 19 47 C 27 53, 31 60, 28 66 Z" fill="#f2793a" origin="22px 66px" duration={0.9} />
            <Flame d="M20 66 C 19 60, 25 57, 25 50 C 32 56, 35 61, 33 66 Z" fill="#f29a3a" origin="27px 66px" duration={1.25} delay={0.2} />
            <Flame d="M21 66 C 21 62, 25 60, 25 56 C 29 60, 30 63, 29 66 Z" fill="#ffd36b" origin="25px 66px" duration={0.7} delay={0.1} />
            <path d="M10 78 v10 M40 78 v10" strokeWidth="3" />
          </Svg>
        </Box>
      )
    case 'chest':
      return (
        <Svg w={64} h={46} size={size * 0.85}>
          <path d="M4 18 C 4 4, 60 4, 60 18 Z" fill={WOOD} />
          <rect x="4" y="18" width="56" height="26" fill={WOOD_DARK} />
          <path d="M18 6 V 44 M46 6 V 44" stroke="#c9a14e" strokeWidth="3" />
          <rect x="28" y="16" width="8" height="10" fill="#c9a14e" />
          <circle cx="12" cy="14" r="2.5" fill="#f4d36b" stroke="none" />
          <circle cx="52" cy="12" r="2" fill="#f4d36b" stroke="none" />
        </Svg>
      )
    case 'pipes':
      return (
        <Svg w={50} h={110} size={size * 1.5}>
          <path d="M14 110 V 40 Q 14 26, 28 26 H 50" fill="none" stroke="#6d7a85" strokeWidth="9" />
          <path d="M14 110 V 40 Q 14 26, 28 26 H 50" fill="none" stroke={INK} strokeWidth="11" strokeOpacity="0.25" />
          <circle cx="14" cy="70" r="9" fill="#c9a14e" />
          <path d="M8 70 H 20 M14 64 V 76" strokeWidth="1.4" />
          <rect x="34" y="18" width="6" height="16" fill="#8d99a3" />
        </Svg>
      )
    case 'barrel':
      return (
        <Svg w={44} h={58} size={size * 0.9}>
          <path d="M6 4 H 38 C 44 20, 44 38, 38 54 H 6 C 0 38, 0 20, 6 4 Z" fill={WOOD} />
          <path d="M3 18 H 41 M3 40 H 41" stroke="#4d5862" strokeWidth="3" />
          <path d="M16 4 C 13 20, 13 38, 16 54 M28 4 C 31 20, 31 38, 28 54" fill="none" strokeOpacity="0.4" />
        </Svg>
      )
    case 'candelabra':
      return (
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: -size * 0.2, left: '50%', width: size * 0.9, height: size * 0.7, transform: 'translateX(-50%)', borderRadius: '50%', background: `radial-gradient(circle, ${glow}, transparent 65%)`, pointerEvents: 'none' }} />
          <Svg w={44} h={90} size={size * 1.3}>
            {[8, 22, 36].map((x, i) => <g key={x}><rect x={x - 3} y={i === 1 ? 8 : 16} width="6" height="14" fill="#fff4dc" /><Flame d={`M${x} ${i === 1 ? 6 : 14} c -2 -3, 0 -6, 0 -8 c 2 2, 2 5, 0 8`} fill="#f4b544" origin={`${x}px ${i === 1 ? 6 : 14}px`} duration={0.8 + i * 0.25} delay={i * 0.15} /></g>)}
            <path d="M8 30 Q 22 44, 36 30 M22 22 V 84 M12 86 H 32" fill="none" stroke="#c9a14e" strokeWidth="2.6" />
          </Svg>
        </Box>
      )
  }
}

function WallArt({ piece, size, night }: { piece: WallPiece; size: number; night: boolean }) {
  if (piece === 'lights') {
    return (
      <Svg w={140} h={30} size={size * 0.4}>
        <path d="M0 4 Q 70 34, 140 4" fill="none" strokeWidth="1.2" />
        {[14, 34, 54, 74, 94, 114, 130].map((x, i) => <circle key={x} cx={x} cy={4 + 26 * Math.sin((x / 140) * Math.PI) * 0.75} r="3.5" fill={['#f4d36b', '#f2a1b3', '#a8d8f0'][i % 3]} stroke="none" style={{ filter: night ? 'drop-shadow(0 0 4px rgba(255,220,140,0.9))' : undefined }} />)}
      </Svg>
    )
  }
  if (piece === 'wheel' || piece === 'gauge' || piece === 'clock') {
    return (
      <Svg w={50} h={50} size={size * 0.5}>
        {piece === 'wheel' && <>{[0, 45, 90, 135].map((r) => <path key={r} d="M25 0 V 50" stroke={WOOD_DARK} strokeWidth="4" transform={`rotate(${r} 25 25)`} />)}<circle cx="25" cy="25" r="16" fill="none" stroke={WOOD} strokeWidth="5" /><circle cx="25" cy="25" r="4" fill="#c9a14e" /></>}
        {piece === 'gauge' && <><circle cx="25" cy="25" r="22" fill="#c9a14e" /><circle cx="25" cy="25" r="16" fill="#f3ecd8" /><path d="M25 25 L 34 14" stroke="#c0392b" strokeWidth="2" />{[0, 1, 2, 3, 4].map((i) => <path key={i} d="M25 11 V 14" transform={`rotate(${-60 + i * 30} 25 25)`} strokeWidth="1" />)}</>}
        {piece === 'clock' && <><circle cx="25" cy="25" r="22" fill={WOOD} /><circle cx="25" cy="25" r="16" fill="#fffcf5" /><path d="M25 25 V 14 M25 25 L 32 29" strokeWidth="2" /></>}
      </Svg>
    )
  }
  return (
    <Box sx={{ width: size * 0.62, height: size * 0.5, p: '5px', background: WOOD, border: `1.5px solid ${INK}`, boxShadow: '2px 3px 0 rgba(42,36,29,0.18)', transform: 'rotate(-2deg)' }}>
      <Box sx={{ width: '100%', height: '100%', border: `1.5px solid ${INK}`, background: piece === 'heart-frame' ? '#fbe6e6' : 'var(--pd-sky)', position: 'relative', overflow: 'hidden' }}>
        {piece === 'heart-frame'
          ? <Box component="svg" viewBox="0 0 24 24" sx={{ position: 'absolute', inset: '18%', fill: themeInk.ink }}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z" /></Box>
          : <Box sx={{ position: 'absolute', left: '-10%', right: '-10%', bottom: 0, height: '45%', borderRadius: '50% 50% 0 0', background: '#5a9d62', border: `1px solid ${INK}` }} />}
      </Box>
    </Box>
  )
}

export function FurnitureSide({ side, size = 70, max = 2, sx }: { side: 'left' | 'right'; size?: number; max?: number; sx?: SxProps<Theme> }) {
  const { theme } = useBackground()
  const set = SETS[theme.key] ?? SETS.papel
  const fabric = fabricFor(theme.isDark)
  const pieces = (side === 'left' ? set.left : set.right).slice(side === 'left' ? -max : 0, side === 'left' ? undefined : max)
  return (
    <Box aria-hidden sx={{ display: 'flex', alignItems: 'flex-end', gap: `${Math.round(size * 0.12)}px`, flexDirection: side === 'left' ? 'row' : 'row-reverse', pointerEvents: 'none', ...sx }}>
      {pieces.map((p) => <PieceArt key={p} piece={p} size={size} fabric={fabric} night={theme.isDark} />)}
    </Box>
  )
}

export function RoomCorner({ side, size = 80, sx }: { side: 'left' | 'right'; size?: number; sx?: SxProps<Theme> }) {
  const { theme } = useBackground()
  const set = SETS[theme.key] ?? SETS.papel
  return (
    <Box aria-hidden sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: side === 'left' ? 'flex-start' : 'flex-end', gap: 3, pointerEvents: 'none', ...sx }}>
      {side === 'right' && <WallArt piece={set.wall} size={size * 1.4} night={theme.isDark} />}
      <Box sx={{ position: 'relative' }}>
        {set.rug && <Box sx={{ position: 'absolute', left: '-10%', right: '-10%', bottom: -10, height: 18, borderRadius: '50%', background: 'color-mix(in srgb, var(--pd-accent) 30%, transparent)', border: '1.5px dashed color-mix(in srgb, var(--pd-accent) 60%, transparent)' }} />}
        <PieceArt piece={set.extra} size={size} fabric={fabricFor(theme.isDark)} night={theme.isDark} />
      </Box>
    </Box>
  )
}

export function Room({ windowHeight = 120, pieces = 2, sx }: { windowHeight?: number; pieces?: number; sx?: SxProps<Theme> }) {
  const { theme } = useBackground()
  const set = SETS[theme.key] ?? SETS.papel
  const furniture = Math.round(windowHeight * 0.56)
  return (
    <Box aria-hidden sx={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none', ...sx }}>
      <SillScene height={windowHeight} />
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: `${Math.round(windowHeight * 0.5)}px`, mt: `${Math.round(windowHeight * 0.06)}px`, minWidth: windowHeight * 2 }}>
        {set.rug && <Box sx={{ position: 'absolute', left: '4%', right: '4%', bottom: -8, height: 16, borderRadius: '50%', background: 'color-mix(in srgb, var(--pd-accent) 28%, transparent)', border: '1.5px dashed color-mix(in srgb, var(--pd-accent) 55%, transparent)' }} />}
        <FurnitureSide side="left" size={furniture} max={pieces} sx={{ position: 'relative' }} />
        <FurnitureSide side="right" size={furniture} max={pieces} sx={{ position: 'relative' }} />
      </Box>
      <Box sx={{ alignSelf: 'stretch', mx: -3, mt: '6px', height: 2, background: 'color-mix(in srgb, var(--pd-text-primary) 25%, transparent)' }} />
    </Box>
  )
}
