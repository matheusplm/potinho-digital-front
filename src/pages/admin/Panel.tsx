import { Box, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { useBackground } from '../../context/BackgroundContext'
import { font, radius } from '../../design-system'

export function Panel({ title, count, actions, children }: {
  title: string
  count?: number
  actions?: ReactNode
  children: ReactNode
}) {
  const { theme } = useBackground()
  return (
    <Box sx={{
      p: { xs: 1.6, md: 2.2 }, borderRadius: radius.xl, minWidth: 0,
      background: theme.surfaceBg, border: `1px solid ${theme.surfaceBorder}`, backdropFilter: 'blur(12px)',
    }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.6, gap: 1.2, flexWrap: 'wrap' }}>
        <Typography component="h2" sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.15rem', color: theme.textOnBg }}>
          {title}
          {count !== undefined && (
            <Box component="span" sx={{ ml: 0.8, fontFamily: font.sans, fontSize: '0.8rem', fontWeight: 700, color: theme.textOnBgMuted }}>
              {count.toLocaleString('pt-BR')}
            </Box>
          )}
        </Typography>
        {actions}
      </Stack>
      {children}
    </Box>
  )
}

export function StatCard({ emoji, label, value, detail }: { emoji: string; label: string; value: number; detail?: string }) {
  const { theme } = useBackground()
  return (
    <Box sx={{
      p: { xs: 1.4, md: 1.8 }, borderRadius: radius.xl, minWidth: 0,
      background: theme.surfaceBg, border: `1px solid ${theme.surfaceBorder}`, backdropFilter: 'blur(12px)',
    }}>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: theme.textOnBgMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {emoji} {label}
      </Typography>
      <Typography sx={{ mt: 0.3, fontFamily: font.serif, fontWeight: 800, fontSize: { xs: '1.55rem', md: '1.85rem' }, lineHeight: 1.1, color: theme.textOnBg }}>
        {value.toLocaleString('pt-BR')}
      </Typography>
      {detail && (
        <Typography sx={{ mt: 0.4, fontSize: '0.7rem', color: theme.textOnBgMuted, lineHeight: 1.35 }}>
          {detail}
        </Typography>
      )}
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
        width: '100%', px: 1.4, py: 1, borderRadius: radius.lg, outline: 'none',
        border: `1.5px solid ${theme.surfaceBorder}`, background: theme.isDark ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.7)',
        fontSize: '0.86rem', fontFamily: 'inherit', color: theme.textOnBg,
        '&::placeholder': { color: theme.textOnBgMuted },
        '&:focus': { borderColor: theme.accent },
      }}
    />
  )
}
