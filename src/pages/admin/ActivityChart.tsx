import { Box, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { SegmentedControl } from '../../components/ui'
import { useBackground } from '../../context/BackgroundContext'
import { font } from '../../design-system'
import type { AdminDailyPoint } from '../../types/admin'
import { Panel } from './Panel'
import { dayLabel } from './format'

type Metric = 'collected' | 'openers' | 'signups'

const METRICS: Array<{ id: Metric; label: string; unit: [string, string] }> = [
  { id: 'collected', label: 'Bilhetes', unit: ['bilhete aberto', 'bilhetes abertos'] },
  { id: 'openers', label: 'Pessoas', unit: ['pessoa abriu pacotinho', 'pessoas abriram pacotinho'] },
  { id: 'signups', label: 'Cadastros', unit: ['cadastro', 'cadastros'] },
]

export function ActivityChart({ daily }: { daily: AdminDailyPoint[] }) {
  const { theme } = useBackground()
  const [metric, setMetric] = useState<Metric>('collected')
  const [hovered, setHovered] = useState<number | null>(null)
  const config = METRICS.find((item) => item.id === metric) ?? METRICS[0]
  const values = daily.map((point) => point[metric])
  const max = Math.max(1, ...values)
  const total = values.reduce((sum, value) => sum + value, 0)
  const focus = hovered ?? daily.length - 1
  const focusValue = values[focus] ?? 0
  const lastIndex = daily.length - 1

  if (!daily.length) return null

  return (
    <Panel
      title="Últimos 30 dias"
      actions={
        <Box sx={{ width: { xs: '100%', sm: 320 } }}>
          <SegmentedControl options={METRICS.map(({ id, label }) => ({ id, label }))} value={metric} onChange={setMetric} />
        </Box>
      }
    >
      <Stack direction="row" alignItems="baseline" sx={{ mb: 1.6, gap: 1, flexWrap: 'wrap' }}>
        <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.9rem', lineHeight: 1, color: theme.textOnBg }}>
          {focusValue.toLocaleString('pt-BR')}
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: theme.textOnBgMuted }}>
          {focusValue === 1 ? config.unit[0] : config.unit[1]} {focus === lastIndex ? 'hoje' : `em ${dayLabel(daily[focus].date)}`}
          {' · '}{total.toLocaleString('pt-BR')} no período
        </Typography>
      </Stack>

      <Box sx={{ position: 'relative' }}>
        <Typography sx={{ position: 'absolute', top: -2, right: 0, fontSize: '0.62rem', fontWeight: 700, color: theme.textOnBgMuted }}>
          máx {max.toLocaleString('pt-BR')}
        </Typography>
        <Box
          role="img"
          aria-label={`${config.label} por dia nos últimos 30 dias, total ${total}`}
          onMouseLeave={() => setHovered(null)}
          sx={{
            height: { xs: 130, md: 170 }, pt: 2.2, display: 'flex', alignItems: 'flex-end', gap: { xs: '2px', md: '4px' },
            borderBottom: `1px solid ${theme.surfaceBorder}`,
          }}
        >
          {daily.map((point, i) => {
            const value = values[i]
            const active = i === focus
            return (
              <Box
                key={point.date}
                onMouseEnter={() => setHovered(i)}
                onClick={() => setHovered(i)}
                sx={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', cursor: 'pointer' }}
              >
                <Box sx={{
                  width: '100%', minHeight: 3, height: `${(value / max) * 100}%`,
                  borderRadius: '4px 4px 1px 1px',
                  background: active ? theme.accent : `${theme.accent}${value ? '66' : '26'}`,
                  transition: 'height 0.35s ease, background 0.15s',
                }} />
              </Box>
            )
          })}
        </Box>
      </Box>

      <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.8 }}>
        {[0, Math.floor(lastIndex / 2), lastIndex].map((i) => (
          <Typography key={i} sx={{ fontSize: '0.66rem', fontWeight: 600, color: theme.textOnBgMuted }}>
            {i === lastIndex ? 'hoje' : dayLabel(daily[i].date)}
          </Typography>
        ))}
      </Stack>
    </Panel>
  )
}
