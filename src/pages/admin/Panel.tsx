import { Box, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { useBackground } from '../../context/BackgroundContext'
import { font, radius } from '../../design-system'
import { AnimatedNumber } from './charts'
import { TONE_COLOR, type ActivityTone } from './format'
import { useSurface } from './surface'

const AVATAR_COLORS = ['#db2777', '#7c3aed', '#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626', '#4f46e5']

export function Panel({ title, subtitle, count, actions, children, dense }: {
  title: string
  subtitle?: ReactNode
  count?: number
  actions?: ReactNode
  children: ReactNode
  dense?: boolean
}) {
  const { theme } = useBackground()
  const surface = useSurface()
  return (
    <Box sx={{ ...surface, p: dense ? { xs: 1.4, md: 1.8 } : { xs: 1.6, md: 2.2 }, borderRadius: radius.xl, minWidth: 0 }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1.6, gap: 1.2, flexWrap: 'wrap' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h2" sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.1rem', color: theme.textOnBg, lineHeight: 1.25 }}>
            {title}
            {count !== undefined && (
              <Box component="span" sx={{ ml: 0.8, fontFamily: font.sans, fontSize: '0.78rem', fontWeight: 700, color: theme.textOnBgMuted }}>
                {count.toLocaleString('pt-BR')}
              </Box>
            )}
          </Typography>
          {subtitle && (
            <Typography component="div" sx={{ mt: 0.3, fontSize: '0.76rem', color: theme.textOnBgMuted, lineHeight: 1.45 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions}
      </Stack>
      {children}
    </Box>
  )
}

export function StatCard({ emoji, label, value, badge, detail, aside, footer }: {
  emoji: string
  label: string
  value: number
  badge?: ReactNode
  detail?: ReactNode
  aside?: ReactNode
  footer?: ReactNode
}) {
  const { theme } = useBackground()
  const surface = useSurface()
  return (
    <Box sx={{
      ...surface, p: { xs: 1.4, md: 1.7 }, borderRadius: radius.xl, minWidth: 0,
      display: 'flex', flexDirection: 'column', gap: 0.9,
      transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      '@media (hover: hover)': { '&:hover': { transform: 'translateY(-2px)' } },
    }}>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: theme.textOnBgMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {emoji} {label}
      </Typography>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={0.8} sx={{ flexWrap: 'wrap', rowGap: 0.4 }}>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: { xs: '1.6rem', md: '1.95rem' }, lineHeight: 1, color: theme.textOnBg, fontVariantNumeric: 'tabular-nums' }}>
              <AnimatedNumber value={value} />
            </Typography>
            {badge}
          </Stack>
          {detail && (
            <Typography component="div" sx={{ mt: 0.6, fontSize: '0.7rem', color: theme.textOnBgMuted, lineHeight: 1.4 }}>
              {detail}
            </Typography>
          )}
        </Box>
        {aside}
      </Stack>
      {footer && <Box sx={{ mt: 'auto' }}>{footer}</Box>}
    </Box>
  )
}

export function Chip({ children, tone }: { children: ReactNode; tone?: string }) {
  const { theme } = useBackground()
  const color = tone ?? theme.accent
  return (
    <Box component="span" sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.4, px: 0.8, py: 0.2, borderRadius: radius.full,
      fontSize: '0.68rem', fontWeight: 700, whiteSpace: 'nowrap', lineHeight: 1.5,
      color: theme.textOnBg, background: `${color}1a`, border: `1px solid ${color}33`,
    }}>
      {children}
    </Box>
  )
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  const { theme } = useBackground()
  return (
    <Box
      component="input"
      type="search"
      value={value}
      placeholder={placeholder}
      aria-label={placeholder}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      sx={{
        width: '100%', px: 1.5, py: 1.05, borderRadius: radius.lg, outline: 'none',
        border: `1.5px solid ${theme.surfaceBorder}`, background: theme.isDark ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.75)',
        fontSize: '0.86rem', fontFamily: 'inherit', color: theme.textOnBg,
        transition: 'border-color 0.15s, box-shadow 0.15s',
        '&::placeholder': { color: theme.textOnBgMuted },
        '&:focus': { borderColor: theme.accent, boxShadow: `0 0 0 3px ${theme.accent}22` },
      }}
    />
  )
}

export interface FilterOption<T extends string> {
  id: T
  label: string
  count: number
}

export function FilterChips<T extends string>({ options, value, onChange }: { options: FilterOption<T>[]; value: T; onChange: (value: T) => void }) {
  const { theme } = useBackground()
  return (
    <Box
      role="tablist"
      sx={{
        display: 'flex', gap: 0.7, overflowX: 'auto', flexWrap: { xs: 'nowrap', md: 'wrap' },
        mx: { xs: -1.6, md: 0 }, px: { xs: 1.6, md: 0 }, pb: 0.4,
        scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {options.map((option) => {
        const active = option.id === value
        return (
          <Box
            key={option.id}
            component="button"
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.id)}
            sx={{
              all: 'unset', flexShrink: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 0.6,
              px: 1.2, py: 0.6, borderRadius: radius.full, fontSize: '0.76rem', fontWeight: 700, whiteSpace: 'nowrap',
              color: active ? '#fff' : theme.textOnBg,
              background: active ? theme.accent : theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)',
              border: `1px solid ${active ? theme.accent : theme.surfaceBorder}`,
              boxShadow: active ? `0 4px 14px ${theme.accent}40` : 'none',
              transition: 'all 0.15s',
              '&:focus-visible': { outline: `2px solid ${theme.accent}`, outlineOffset: 2 },
            }}
          >
            {option.label}
            <Box component="span" sx={{
              minWidth: 18, px: 0.5, borderRadius: radius.full, textAlign: 'center', fontSize: '0.66rem', fontWeight: 800,
              background: active ? 'rgba(255,255,255,0.25)' : `${theme.accent}1f`, color: active ? '#fff' : theme.textOnBg,
            }}>
              {option.count.toLocaleString('pt-BR')}
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}

function avatarColor(id: string): string {
  let hash = 0
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function Avatar({ id, name, tone, size = 38 }: { id: string; name: string; tone: ActivityTone; size?: number }) {
  const { theme } = useBackground()
  const color = avatarColor(id)
  return (
    <Box sx={{ position: 'relative', flexShrink: 0 }}>
      <Box sx={{
        width: size, height: size, borderRadius: '50%', color: '#fff',
        background: `linear-gradient(135deg, ${color}, ${color}bb)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.4,
        boxShadow: `0 4px 12px ${color}40`,
      }}>
        {name.trim().charAt(0).toUpperCase() || '?'}
      </Box>
      {tone !== 'none' && (
        <Box sx={{
          position: 'absolute', right: -1, bottom: -1, width: size * 0.3, height: size * 0.3, borderRadius: '50%',
          background: TONE_COLOR[tone], border: `2px solid ${theme.isDark ? '#1b2238' : '#fff'}`,
        }} />
      )}
    </Box>
  )
}
