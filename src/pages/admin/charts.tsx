import { Box, Stack, Typography } from '@mui/material'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useBackground } from '../../context/BackgroundContext'
import { radius } from '../../design-system'
import type { Change } from './insights'
import { formatNumber, niceCeil, percentLabel, share } from './format'

function useTones() {
  const { theme } = useBackground()
  return {
    up: { fg: theme.isDark ? '#4ade80' : '#15803d', bg: theme.isDark ? 'rgba(74,222,128,0.14)' : 'rgba(21,128,61,0.1)' },
    down: { fg: theme.isDark ? '#fb7185' : '#be123c', bg: theme.isDark ? 'rgba(251,113,133,0.14)' : 'rgba(190,18,60,0.09)' },
    flat: { fg: theme.textOnBgMuted, bg: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
  }
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

export function AnimatedNumber({ value }: { value: number }) {
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? value : 0))
  const from = useRef(prefersReducedMotion() ? value : 0)

  useEffect(() => {
    if (prefersReducedMotion()) {
      from.current = value
      setShown(value)
      return
    }
    const start = performance.now()
    const initial = from.current
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 750)
      const eased = 1 - (1 - progress) ** 3
      setShown(Math.round(initial + (value - initial) * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
      else from.current = value
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      from.current = value
    }
  }, [value])

  return <>{formatNumber(shown)}</>
}

export function DeltaBadge({ change, suffix }: { change: Change; suffix?: string }) {
  const tones = useTones()
  if (change.previous === null) return null
  let text: string
  let tone = tones.flat
  if (change.ratio === null) {
    text = 'novo'
    tone = tones.up
  } else if (Math.abs(change.ratio) < 0.005) {
    text = 'igual'
  } else {
    const pct = Math.abs(change.ratio) >= 10 ? '+999%' : `${Math.round(Math.abs(change.ratio) * 100)}%`
    text = `${change.ratio > 0 ? '▲' : '▼'} ${pct}`
    tone = change.ratio > 0 ? tones.up : tones.down
  }
  return (
    <Box
      component="span"
      title={`antes ${formatNumber(change.previous)} · agora ${formatNumber(change.current)}`}
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.4, px: 0.8, py: 0.15, borderRadius: radius.full,
        fontSize: '0.68rem', fontWeight: 800, lineHeight: 1.5, whiteSpace: 'nowrap', color: tone.fg, background: tone.bg,
      }}
    >
      {text}
      {suffix && <Box component="span" sx={{ fontWeight: 600, opacity: 0.8 }}>{suffix}</Box>}
    </Box>
  )
}

function smoothPath(points: Array<[number, number]>): string {
  if (points.length < 2) return ''
  let path = `M${points[0][0]},${points[0][1]}`
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[Math.max(0, i - 1)]
    const [x1, y1] = points[i]
    const [x2, y2] = points[i + 1]
    const [x3, y3] = points[Math.min(points.length - 1, i + 2)]
    const c1x = x1 + (x2 - x0) / 6
    const c1y = y1 + (y2 - y0) / 6
    const c2x = x2 - (x3 - x1) / 6
    const c2y = y2 - (y3 - y1) / 6
    path += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${x2.toFixed(2)},${y2.toFixed(2)}`
  }
  return path
}

export function Sparkline({ values, color, height = 34 }: { values: number[]; color: string; height?: number }) {
  const gradientId = `spark${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  if (values.length < 2) return null
  const width = 100
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const points = values.map((value, i): [number, number] => [
    (i / (values.length - 1)) * width,
    height - 3 - ((value - min) / span) * (height - 6),
  ])
  const line = smoothPath(points)
  const last = points[points.length - 1]
  return (
    <Box component="svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden sx={{ width: '100%', height, display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${width},${height} L0,${height} Z`} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="2.6" fill={color} vectorEffect="non-scaling-stroke" />
    </Box>
  )
}

export function Ring({ ratio, color, size = 46, stroke = 5, children }: { ratio: number; color: string; size?: number; stroke?: number; children?: ReactNode }) {
  const { theme } = useBackground()
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(1, ratio))
  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <Box component="svg" viewBox={`0 0 ${size} ${size}`} aria-hidden sx={{ width: size, height: size, transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={theme.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${circumference * clamped} ${circumference}`}
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </Box>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.66rem', fontWeight: 800, color: theme.textOnBg }}>
        {children ?? percentLabel(clamped)}
      </Box>
    </Box>
  )
}

export function ProgressBar({ ratio, color, label }: { ratio: number; color: string; label?: string }) {
  const { theme } = useBackground()
  return (
    <Box>
      <Box sx={{ height: 6, borderRadius: radius.full, background: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <Box sx={{ width: `${Math.max(0, Math.min(1, ratio)) * 100}%`, height: '100%', borderRadius: radius.full, background: color, transition: 'width 0.8s ease' }} />
      </Box>
      {label && (
        <Typography sx={{ mt: 0.6, fontSize: '0.68rem', fontWeight: 600, color: theme.textOnBgMuted }}>{label}</Typography>
      )}
    </Box>
  )
}

interface BarPoint {
  key: string
  value: number
}

export function BarChart({ points, color, height = 180, average, focus, onFocus, ticks }: {
  points: BarPoint[]
  color: string
  height?: number
  average?: number
  focus: number
  onFocus: (index: number | null) => void
  ticks: Array<{ index: number; label: string }>
}) {
  const { theme } = useBackground()
  const areaRef = useRef<HTMLDivElement>(null)
  const max = niceCeil(Math.max(1, ...points.map((point) => point.value)))
  const count = points.length

  function pick(clientX: number) {
    const rect = areaRef.current?.getBoundingClientRect()
    if (!rect || !count) return
    const index = Math.floor(((clientX - rect.left) / rect.width) * count)
    onFocus(Math.max(0, Math.min(count - 1, index)))
  }

  return (
    <Box sx={{ pl: 4 }}>
      <Box sx={{ position: 'relative', height }}>
        {[1, 0.5, 0].map((fraction) => (
          <Box key={fraction} sx={{ position: 'absolute', left: 0, right: 0, top: `${(1 - fraction) * 100}%`, borderTop: `1px ${fraction === 0 ? 'solid' : 'dashed'} ${theme.surfaceBorder}` }}>
            <Typography sx={{ position: 'absolute', right: '100%', mr: 1, top: -8, fontSize: '0.62rem', fontWeight: 600, color: theme.textOnBgMuted, whiteSpace: 'nowrap' }}>
              {formatNumber(Math.round(max * fraction))}
            </Typography>
          </Box>
        ))}

        {average !== undefined && average > 0 && (
          <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: `${(average / max) * 100}%`, borderTop: `1.5px dashed ${color}`, opacity: 0.75, zIndex: 1, pointerEvents: 'none' }}>
            <Typography sx={{ position: 'absolute', right: 0, bottom: 2, px: 0.6, borderRadius: radius.sm, fontSize: '0.6rem', fontWeight: 800, color, background: theme.surfaceBg }}>
              média {average.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
            </Typography>
          </Box>
        )}

        <Box
          ref={areaRef}
          onPointerDown={(e) => pick(e.clientX)}
          onPointerMove={(e) => pick(e.clientX)}
          onPointerLeave={(e) => { if (e.pointerType === 'mouse') onFocus(null) }}
          sx={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end',
            gap: count > 60 ? '1px' : count > 20 ? { xs: '2px', md: '4px' } : { xs: '4px', md: '8px' },
            touchAction: 'pan-y', cursor: 'crosshair',
          }}
        >
          {points.map((point, i) => (
            <Box key={point.key} sx={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
              {i === focus && (
                <Box sx={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: `${color}55`, transform: 'translateX(-50%)' }} />
              )}
              <Box sx={{
                width: '100%', minHeight: 2, height: `${(point.value / max) * 100}%`, position: 'relative',
                borderRadius: count > 60 ? '2px 2px 0 0' : '5px 5px 1px 1px',
                background: i === focus ? color : `${color}${point.value ? '5c' : '24'}`,
                boxShadow: i === focus ? `0 0 0 3px ${color}22` : 'none',
                transition: 'height 0.45s cubic-bezier(0.22,1,0.36,1), background 0.15s',
              }} />
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ position: 'relative', height: 18, mt: 0.8 }}>
        {ticks.map(({ index, label }) => (
          <Typography
            key={index}
            sx={{
              position: 'absolute', top: 0, left: `${((index + 0.5) / count) * 100}%`,
              transform: index === 0 ? 'translateX(-20%)' : index === count - 1 ? 'translateX(-80%)' : 'translateX(-50%)',
              fontSize: '0.64rem', fontWeight: 700, color: theme.textOnBgMuted, whiteSpace: 'nowrap',
            }}
          >
            {label}
          </Typography>
        ))}
      </Box>
    </Box>
  )
}

export function ColumnStrip({ values, labels, color, height = 72, onFocus, focus }: {
  values: number[]
  labels: string[]
  color: string
  height?: number
  focus: number
  onFocus: (index: number | null) => void
}) {
  const { theme } = useBackground()
  const max = Math.max(1, ...values)
  return (
    <Box>
      <Box
        onPointerLeave={(e) => { if (e.pointerType === 'mouse') onFocus(null) }}
        sx={{ height, display: 'flex', alignItems: 'flex-end', gap: '3px', borderBottom: `1px solid ${theme.surfaceBorder}` }}
      >
        {values.map((value, i) => (
          <Box
            key={i}
            onPointerEnter={() => onFocus(i)}
            onPointerDown={() => onFocus(i)}
            sx={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', cursor: 'pointer' }}
          >
            <Box sx={{
              width: '100%', minHeight: 2, height: `${(value / max) * 100}%`, borderRadius: '4px 4px 1px 1px',
              background: i === focus ? color : `${color}${value ? '55' : '22'}`, transition: 'background 0.15s, height 0.45s ease',
            }} />
          </Box>
        ))}
      </Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.6 }}>
        {labels.map((label) => (
          <Typography key={label} sx={{ fontSize: '0.62rem', fontWeight: 700, color: theme.textOnBgMuted }}>{label}</Typography>
        ))}
      </Stack>
    </Box>
  )
}

export function SegmentBar({ segments }: { segments: Array<{ label: string; count: number; color: string }> }) {
  const { theme } = useBackground()
  const total = segments.reduce((sum, segment) => sum + segment.count, 0)
  return (
    <Box>
      <Box sx={{ display: 'flex', height: 12, borderRadius: radius.full, overflow: 'hidden', gap: '2px', background: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
        {segments.filter((segment) => segment.count > 0).map((segment) => (
          <Box key={segment.label} title={`${segment.label}: ${segment.count}`} sx={{ flex: segment.count, background: segment.color, transition: 'flex 0.6s ease' }} />
        ))}
      </Box>
      <Box sx={{ mt: 1.1, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 0.8 }}>
        {segments.map((segment) => (
          <Stack key={segment.label} direction="row" spacing={0.8} alignItems="center" sx={{ minWidth: 0 }}>
            <Box sx={{ width: 9, height: 9, borderRadius: '3px', background: segment.color, flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.74rem', color: theme.textOnBg, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {segment.label}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: theme.textOnBgMuted, ml: 'auto !important', whiteSpace: 'nowrap' }}>
              {formatNumber(segment.count)} · {percentLabel(share(segment.count, total))}
            </Typography>
          </Stack>
        ))}
      </Box>
    </Box>
  )
}

export function SkeletonBlock({ height, radius: r = radius.xl }: { height: number | string; radius?: string }) {
  const { theme } = useBackground()
  return (
    <Box sx={{
      height, borderRadius: r, border: `1px solid ${theme.surfaceBorder}`,
      background: theme.isDark
        ? 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%)'
        : 'linear-gradient(90deg, rgba(255,255,255,0.45) 25%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.45) 75%)',
      backgroundSize: '200% 100%',
      animation: 'pdSkeleton 1.4s ease-in-out infinite',
      '@keyframes pdSkeleton': { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    }} />
  )
}
