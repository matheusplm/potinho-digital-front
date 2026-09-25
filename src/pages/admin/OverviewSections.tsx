import { Box, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SegmentedControl } from '../../components/ui'
import { useBackground } from '../../context/BackgroundContext'
import { font, getBackgroundTheme, radius } from '../../design-system'
import type { AdminCollectionRow, AdminDailyPoint, AdminOverview, AdminRhythm, AdminUserRow } from '../../types/admin'
import { AnimatedNumber, BarChart, ColumnStrip, DeltaBadge, SegmentBar } from './charts'
import { Avatar, Panel } from './Panel'
import { useSurface } from './surface'
import {
  WEEKDAYS_LONG, WEEKDAYS_SHORT, activityTone, dayLabel, dayLabelLong, formatNumber, percentLabel, share, timeAgo,
} from './format'
import {
  HOUR_MS, funnel, loginSegments, peakIndex, periodChange, roleSegments, todayChange, topCollections, within, type Metric,
} from './insights'

const METRICS: Array<{ id: Metric; label: string; unit: [string, string] }> = [
  { id: 'collected', label: 'Bilhetes', unit: ['bilhete aberto', 'bilhetes abertos'] },
  { id: 'openers', label: 'Pessoas', unit: ['pessoa abriu pacotinho', 'pessoas abriram pacotinho'] },
  { id: 'signups', label: 'Cadastros', unit: ['cadastro', 'cadastros'] },
]

const RANGES = [7, 30, 90] as const
type Range = (typeof RANGES)[number]

function SeeAll({ to, label }: { to: string; label: string }) {
  const { theme } = useBackground()
  const navigate = useNavigate()
  return (
    <Box
      component="button"
      type="button"
      onClick={() => navigate(to)}
      sx={{
        all: 'unset', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 800, color: theme.accent, whiteSpace: 'nowrap',
        px: 1.1, py: 0.45, borderRadius: radius.full, background: `${theme.accent}14`,
        '&:hover': { background: `${theme.accent}22` },
        '&:focus-visible': { outline: `2px solid ${theme.accent}` },
      }}
    >
      {label} →
    </Box>
  )
}

function HeroMetric({ emoji, label, value, badge, detail }: { emoji: string; label: string; value: number; badge?: React.ReactNode; detail?: string }) {
  const { theme } = useBackground()
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: theme.textOnBgMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {emoji} {label}
      </Typography>
      <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 0.4, flexWrap: 'wrap', rowGap: 0.4 }}>
        <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: { xs: '1.9rem', md: '2.4rem' }, lineHeight: 1, color: theme.textOnBg, fontVariantNumeric: 'tabular-nums' }}>
          <AnimatedNumber value={value} />
        </Typography>
        {badge}
      </Stack>
      {detail && <Typography sx={{ mt: 0.5, fontSize: '0.7rem', color: theme.textOnBgMuted }}>{detail}</Typography>}
    </Box>
  )
}

export function TodayHero({ data }: { data: AdminOverview }) {
  const { theme } = useBackground()
  const surface = useSurface()
  const today = data.daily[data.daily.length - 1]?.date
  const online = data.users.filter((user) => within(user.lastActiveAt, 24 * HOUR_MS)).length
  return (
    <Box sx={{
      ...surface, position: 'relative', overflow: 'hidden', borderRadius: radius.xl, p: { xs: 1.8, md: 2.6 },
      background: `linear-gradient(125deg, ${theme.accent}2e 0%, ${theme.accent}0d 38%, transparent 70%), ${theme.surfaceBg}`,
    }}>
      <Box sx={{ position: 'absolute', right: -40, top: -60, width: 220, height: 220, borderRadius: '50%', background: `radial-gradient(circle, ${theme.accent}33, transparent 70%)`, pointerEvents: 'none' }} />
      <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: { xs: 1.6, md: 2.2 }, position: 'relative' }}>
        <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.2rem', color: theme.textOnBg }}>Hoje</Typography>
        {today && <Typography sx={{ fontSize: '0.8rem', color: theme.textOnBgMuted }}>{dayLabelLong(today)} · comparado com ontem</Typography>}
      </Stack>
      <Box sx={{ position: 'relative', display: 'grid', gap: { xs: 2, md: 3 }, gridTemplateColumns: { xs: 'repeat(2, minmax(0,1fr))', md: 'repeat(4, minmax(0,1fr))' } }}>
        <HeroMetric emoji="📦" label="Bilhetes abertos" value={todayChange(data.daily, 'collected').current} badge={<DeltaBadge change={todayChange(data.daily, 'collected')} />} />
        <HeroMetric emoji="🙋" label="Abriram pacotinho" value={todayChange(data.daily, 'openers').current} badge={<DeltaBadge change={todayChange(data.daily, 'openers')} />} />
        <HeroMetric emoji="✨" label="Cadastros" value={todayChange(data.daily, 'signups').current} badge={<DeltaBadge change={todayChange(data.daily, 'signups')} />} />
        <HeroMetric emoji="🟢" label="Ativos nas últimas 24h" value={online} detail={`${percentLabel(share(online, data.totals.users))} de ${formatNumber(data.totals.users)} pessoas`} />
      </Box>
    </Box>
  )
}

function rangeTicks(points: AdminDailyPoint[], range: Range) {
  const last = points.length - 1
  if (last < 0) return []
  if (range === 7) {
    return points.map((point, index) => {
      const [year, month, day] = point.date.split('-').map(Number)
      return { index, label: index === last ? 'hoje' : `${WEEKDAYS_SHORT[new Date(year, month - 1, day).getDay()]} ${day}` }
    })
  }
  const steps = range === 30 ? [0, 0.25, 0.5, 0.75] : [0, 0.33, 0.66]
  return [...steps.map((step) => Math.round(step * last)), last].map((index) => ({ index, label: index === last ? 'hoje' : dayLabel(points[index].date) }))
}

export function TrendPanel({ daily }: { daily: AdminDailyPoint[] }) {
  const { theme } = useBackground()
  const [metric, setMetric] = useState<Metric>('collected')
  const [range, setRange] = useState<Range>(30)
  const [hovered, setHovered] = useState<number | null>(null)
  const config = METRICS.find((item) => item.id === metric) ?? METRICS[0]
  const points = daily.slice(-range)
  const values = points.map((point) => point[metric])
  const total = values.reduce((sum, value) => sum + value, 0)
  const average = values.length ? total / values.length : 0
  const focus = Math.min(hovered ?? points.length - 1, points.length - 1)
  const focusValue = values[focus] ?? 0
  const comparison = periodChange(daily, metric, range)
  const ticks = rangeTicks(points, range)

  if (!points.length) return null

  return (
    <Panel
      title="Movimento"
      subtitle={`${formatNumber(total)} ${total === 1 ? config.unit[0] : config.unit[1]} em ${range} dias · média ${average.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}/dia`}
      actions={
        <Stack direction="row" spacing={0.6} alignItems="center">
          {RANGES.map((option) => (
            <Box
              key={option}
              component="button"
              type="button"
              onClick={() => { setRange(option); setHovered(null) }}
              aria-pressed={range === option}
              sx={{
                all: 'unset', cursor: 'pointer', px: 1, py: 0.35, borderRadius: radius.full, fontSize: '0.72rem', fontWeight: 800,
                color: range === option ? '#fff' : theme.textOnBgMuted, background: range === option ? theme.accent : 'transparent',
                border: `1px solid ${range === option ? theme.accent : theme.surfaceBorder}`,
                '&:focus-visible': { outline: `2px solid ${theme.accent}` },
              }}
            >
              {option}d
            </Box>
          ))}
        </Stack>
      }
    >
      <Box sx={{ mb: 1.8 }}>
        <SegmentedControl options={METRICS.map(({ id, label }) => ({ id, label }))} value={metric} onChange={(value) => { setMetric(value); setHovered(null) }} />
      </Box>

      <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ mb: 1.6, gap: 1, flexWrap: 'wrap' }}>
        <Box>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: { xs: '1.9rem', md: '2.2rem' }, lineHeight: 1, color: theme.textOnBg, fontVariantNumeric: 'tabular-nums' }}>
            {formatNumber(focusValue)}
          </Typography>
          <Typography sx={{ mt: 0.4, fontSize: '0.76rem', color: theme.textOnBgMuted }}>
            {focusValue === 1 ? config.unit[0] : config.unit[1]} · {focus === points.length - 1 ? 'hoje' : dayLabelLong(points[focus].date)}
          </Typography>
        </Box>
        {comparison.previous !== null && (
          <Stack direction="row" spacing={0.8} alignItems="center">
            <DeltaBadge change={comparison} />
            <Typography sx={{ fontSize: '0.7rem', color: theme.textOnBgMuted }}>vs {range} dias anteriores</Typography>
          </Stack>
        )}
      </Stack>

      <BarChart
        points={points.map((point, index) => ({ key: point.date, value: values[index] }))}
        color={theme.accent}
        height={190}
        average={average}
        focus={focus}
        onFocus={setHovered}
        ticks={ticks}
      />
    </Panel>
  )
}

export function RhythmPanel({ rhythm }: { rhythm?: AdminRhythm }) {
  const { theme } = useBackground()
  const [hovered, setHovered] = useState<number | null>(null)
  const hours = rhythm?.hours ?? []
  const weekdays = rhythm?.weekdays ?? []
  const total = hours.reduce((sum, value) => sum + value, 0)
  const peakHour = peakIndex(hours)
  const peakDay = peakIndex(weekdays)
  const focus = hovered ?? peakHour
  const maxDay = Math.max(1, ...weekdays)

  return (
    <Panel title="Quando abrem" subtitle="Bilhetes abertos nos últimos 30 dias, no horário de Brasília">
      {total === 0 ? (
        <Typography sx={{ py: 4, textAlign: 'center', fontSize: '0.82rem', color: theme.textOnBgMuted }}>Ainda sem aberturas pra mostrar o ritmo.</Typography>
      ) : (
        <Stack spacing={2.4}>
          <Box>
            <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: theme.textOnBg }}>
                {focus === peakHour ? '⏰ Pico ' : ''}às {focus}h
              </Typography>
              <Typography sx={{ fontSize: '0.74rem', color: theme.textOnBgMuted }}>
                {formatNumber(hours[focus] ?? 0)} bilhetes · {percentLabel(share(hours[focus] ?? 0, total))}
              </Typography>
            </Stack>
            <ColumnStrip values={hours} labels={['0h', '6h', '12h', '18h', '23h']} color={theme.accent} focus={focus} onFocus={setHovered} />
          </Box>

          <Box>
            <Typography sx={{ mb: 1, fontSize: '0.8rem', fontWeight: 800, color: theme.textOnBg }}>
              📅 Dia favorito: {peakDay >= 0 ? WEEKDAYS_LONG[peakDay] : '—'}
            </Typography>
            <Stack spacing={0.6}>
              {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                <Stack key={day} direction="row" alignItems="center" spacing={1}>
                  <Typography sx={{ width: 30, fontSize: '0.7rem', fontWeight: 700, color: day === peakDay ? theme.textOnBg : theme.textOnBgMuted }}>{WEEKDAYS_SHORT[day]}</Typography>
                  <Box sx={{ flex: 1, height: 8, borderRadius: radius.full, background: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <Box sx={{ width: `${(weekdays[day] / maxDay) * 100}%`, height: '100%', borderRadius: radius.full, background: day === peakDay ? theme.accent : `${theme.accent}66`, transition: 'width 0.6s ease' }} />
                  </Box>
                  <Typography sx={{ width: 34, textAlign: 'right', fontSize: '0.7rem', fontWeight: 700, color: theme.textOnBgMuted }}>{formatNumber(weekdays[day] ?? 0)}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Stack>
      )}
    </Panel>
  )
}

export function FunnelPanel({ users }: { users: AdminUserRow[] }) {
  const { theme } = useBackground()
  const steps = funnel(users)
  const total = steps[0]?.count ?? 0
  return (
    <Panel title="Jornada das pessoas" subtitle="Quantas chegam em cada etapa, de quem criou conta até quem segue usando">
      <Stack spacing={1.2}>
        {steps.map((step, i) => {
          const previous = i > 0 ? steps[i - 1].count : null
          const ratio = share(step.count, total)
          return (
            <Box key={step.label}>
              <Stack direction="row" alignItems="baseline" justifyContent="space-between" spacing={1}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: theme.textOnBg }}>{step.label}</Typography>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: theme.textOnBg, whiteSpace: 'nowrap' }}>
                  {formatNumber(step.count)}
                  <Box component="span" sx={{ ml: 0.6, fontWeight: 600, fontSize: '0.72rem', color: theme.textOnBgMuted }}>{percentLabel(ratio)}</Box>
                </Typography>
              </Stack>
              <Box sx={{ mt: 0.5, height: 10, borderRadius: radius.full, background: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <Box sx={{ width: `${ratio * 100}%`, height: '100%', borderRadius: radius.full, background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent}99)`, opacity: 1 - i * 0.12, transition: 'width 0.7s ease' }} />
              </Box>
              <Typography sx={{ mt: 0.3, fontSize: '0.68rem', color: theme.textOnBgMuted }}>
                {step.hint}{previous !== null && previous > 0 ? ` · ${percentLabel(share(step.count, previous))} da etapa anterior` : ''}
              </Typography>
            </Box>
          )
        })}
      </Stack>
    </Panel>
  )
}

export function CompositionPanel({ data }: { data: AdminOverview }) {
  const { theme } = useBackground()
  const extras = [
    { emoji: '❤️', label: 'favoritos', value: data.totals.favorites },
    { emoji: '🏆', label: 'conquistas', value: data.totals.achievementsUnlocked },
    { emoji: '💌', label: 'convites aceitos', value: data.totals.invitesAccepted },
  ]
  return (
    <Panel title="Quem usa o Potinho" subtitle="Como a base se divide hoje">
      <Stack spacing={2.2}>
        <Box>
          <Typography sx={{ mb: 1, fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase', color: theme.textOnBgMuted }}>Papel</Typography>
          <SegmentBar segments={roleSegments(data.users)} />
        </Box>
        <Box>
          <Typography sx={{ mb: 1, fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase', color: theme.textOnBgMuted }}>Como entram</Typography>
          <SegmentBar segments={loginSegments(data.users)} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 0.8 }}>
          {extras.map((extra) => (
            <Box key={extra.label} sx={{ p: 1, borderRadius: radius.lg, textAlign: 'center', background: `${theme.accent}0f`, border: `1px solid ${theme.accent}22` }}>
              <Typography sx={{ fontSize: '1rem' }}>{extra.emoji}</Typography>
              <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.1rem', color: theme.textOnBg, lineHeight: 1.2 }}>{formatNumber(extra.value)}</Typography>
              <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: theme.textOnBgMuted, textTransform: 'uppercase', letterSpacing: 0.3 }}>{extra.label}</Typography>
            </Box>
          ))}
        </Box>
      </Stack>
    </Panel>
  )
}

export function RecentUsersPanel({ users, onOpen }: { users: AdminUserRow[]; onOpen: (id: string) => void }) {
  const { theme } = useBackground()
  const recent = [...users].sort((a, b) => (b.lastActiveAt ?? '').localeCompare(a.lastActiveAt ?? '')).slice(0, 6)
  return (
    <Panel title="Acessaram por último" actions={<SeeAll to="/admin/usuarios" label="todas as pessoas" />} dense>
      <Stack spacing={0.3}>
        {recent.map((user) => (
          <Box
            key={user.id}
            component="button"
            type="button"
            onClick={() => onOpen(user.id)}
            sx={{
              all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.2,
              px: 1, py: 0.9, borderRadius: radius.lg, '&:hover': { background: `${theme.accent}0f` },
              '&:focus-visible': { outline: `2px solid ${theme.accent}` },
            }}
          >
            <Avatar id={user.id} name={user.name} tone={activityTone(user.lastActiveAt)} size={34} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: theme.textOnBg, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</Typography>
              <Typography sx={{ fontSize: '0.7rem', color: theme.textOnBgMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.emailMasked}</Typography>
            </Box>
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
              <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: theme.textOnBg }}>{timeAgo(user.lastActiveAt)}</Typography>
              <Typography sx={{ fontSize: '0.66rem', color: theme.textOnBgMuted }}>💌 {formatNumber(user.collected)}</Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Panel>
  )
}

export function TopCollectionsPanel({ collections }: { collections: AdminCollectionRow[] }) {
  const { theme } = useBackground()
  const top = topCollections(collections, 5)
  const max = Math.max(1, ...top.map((collection) => collection.collected))
  const medals = ['🥇', '🥈', '🥉']
  return (
    <Panel title="Coleções em alta" subtitle="Mais bilhetes abertos no total" actions={<SeeAll to="/admin/colecoes" label="todas as coleções" />} dense>
      {top.length === 0 ? (
        <Typography sx={{ py: 3, textAlign: 'center', fontSize: '0.82rem', color: theme.textOnBgMuted }}>Nenhuma coleção ainda.</Typography>
      ) : (
        <Stack spacing={1.1}>
          {top.map((collection, i) => {
            const look = getBackgroundTheme(collection.theme ?? '')
            return (
              <Stack key={collection.id} direction="row" alignItems="center" spacing={1.2} sx={{ px: 1 }}>
                <Typography sx={{ width: 22, textAlign: 'center', fontSize: i < 3 ? '1.05rem' : '0.8rem', fontWeight: 800, color: theme.textOnBgMuted }}>{medals[i] ?? `${i + 1}º`}</Typography>
                <Box sx={{ width: 34, height: 34, borderRadius: radius.md, background: look.gradient, border: `1px solid ${theme.surfaceBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {collection.emoji}
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" justifyContent="space-between" spacing={1}>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: theme.textOnBg, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{collection.name}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: theme.textOnBg }}>{formatNumber(collection.collected)}</Typography>
                  </Stack>
                  <Box sx={{ mt: 0.5, height: 6, borderRadius: radius.full, background: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <Box sx={{ width: `${(collection.collected / max) * 100}%`, height: '100%', borderRadius: radius.full, background: look.accent }} />
                  </Box>
                  <Typography sx={{ mt: 0.3, fontSize: '0.66rem', color: theme.textOnBgMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    de {collection.ownerName ?? 'conta removida'} · {collection.readers} {collection.readers === 1 ? 'leitor' : 'leitores'}
                  </Typography>
                </Box>
              </Stack>
            )
          })}
        </Stack>
      )}
    </Panel>
  )
}
