import { Box, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useBackground } from '../../context/BackgroundContext'
import type { AdminOverview } from '../../types/admin'
import { AdminShell } from './AdminShell'
import { ProgressBar, Ring, Sparkline, DeltaBadge } from './charts'
import { StatCard } from './Panel'
import { UserDrawer } from './UserDrawer'
import { CompositionPanel, FunnelPanel, RecentUsersPanel, RhythmPanel, TodayHero, TopCollectionsPanel, TrendPanel } from './OverviewSections'
import { formatNumber, percentLabel, plural, share } from './format'
import { cumulativeUsers, movingAverage, periodChange } from './insights'

function KpiGrid({ data }: { data: AdminOverview }) {
  const { theme } = useBackground()
  const last30 = data.daily.slice(-30)
  const trend = (metric: 'collected' | 'signups' | 'openers') => movingAverage(data.daily.map((point) => point[metric]), 7).slice(-30)
  const totals = data.totals
  const live = data.collections.filter((collection) => !collection.deleted)
  const withReaders = live.filter((collection) => collection.readers > 0).length
  const signups30 = last30.reduce((sum, point) => sum + point.signups, 0)
  const growth = cumulativeUsers(data.users, data.daily).slice(-30)

  return (
    <Box sx={{ display: 'grid', gap: { xs: 1, md: 1.5 }, gridTemplateColumns: { xs: 'repeat(2, minmax(0,1fr))', lg: 'repeat(4, minmax(0,1fr))' } }}>
      <StatCard
        emoji="👥" label="Usuários" value={totals.users}
        detail={`+${formatNumber(totals.newUsers7d)} nos últimos 7 dias`}
        footer={<Sparkline values={growth} color={theme.accent} />}
      />
      <StatCard
        emoji="🟢" label="Ativos no mês" value={totals.active30d}
        detail={`hoje ${formatNumber(totals.activeToday)} · semana ${formatNumber(totals.active7d)}`}
        aside={<Ring ratio={share(totals.active30d, totals.users)} color="#22c55e" />}
      />
      <StatCard
        emoji="📦" label="Bilhetes abertos" value={totals.collected}
        badge={<DeltaBadge change={periodChange(data.daily, 'collected', 7)} />}
        detail={`+${formatNumber(totals.collected7d)} nos últimos 7 dias`}
        footer={<Sparkline values={trend('collected')} color={theme.accent} />}
      />
      <StatCard
        emoji="✨" label="Cadastros no mês" value={signups30}
        badge={<DeltaBadge change={periodChange(data.daily, 'signups', 30)} />}
        detail="comparado aos 30 dias anteriores"
        footer={<Sparkline values={trend('signups')} color={theme.accent} />}
      />
      <StatCard
        emoji="🫙" label="Coleções" value={totals.collections}
        detail={`${plural(totals.owners, 'pessoa escrevendo', 'pessoas escrevendo')}${totals.deletedCollections ? ` · ${totals.deletedCollections} na lixeira` : ''}`}
        footer={<ProgressBar ratio={share(withReaders, live.length)} color={theme.accent} label={`${percentLabel(share(withReaders, live.length))} já têm leitor`} />}
      />
      <StatCard
        emoji="✍️" label="Bilhetes escritos" value={totals.notes}
        detail={`${formatNumber(totals.releasedNotes)} já lançados`}
        footer={<ProgressBar ratio={share(totals.releasedNotes, totals.notes)} color={theme.accent} label={`${percentLabel(share(totals.releasedNotes, totals.notes))} liberados pros leitores`} />}
      />
      <StatCard
        emoji="📖" label="Leitores" value={totals.readers}
        detail={`${plural(totals.invitesPending, 'convite pendente', 'convites pendentes')} · ${formatNumber(totals.invitesAccepted)} aceitos`}
        footer={<Sparkline values={trend('openers')} color={theme.accent} />}
      />
      <StatCard
        emoji="🔔" label="Notificação ligada" value={totals.pushUsers}
        detail={`de ${plural(totals.users, 'pessoa', 'pessoas')}`}
        aside={<Ring ratio={share(totals.pushUsers, totals.users)} color="#f59e0b" />}
      />
    </Box>
  )
}

function Overview({ data }: { data: AdminOverview }) {
  const { theme } = useBackground()
  const [openId, setOpenId] = useState<string | null>(null)
  const openUser = data.users.find((user) => user.id === openId) ?? null

  return (
    <Stack spacing={{ xs: 1.4, md: 2 }}>
      <TodayHero data={data} />
      <KpiGrid data={data} />
      <Box sx={{ display: 'grid', gap: { xs: 1.4, md: 2 }, gridTemplateColumns: { xs: 'minmax(0,1fr)', lg: 'minmax(0,1.7fr) minmax(0,1fr)' } }}>
        <TrendPanel daily={data.daily} />
        <RhythmPanel rhythm={data.rhythm} />
      </Box>
      <Box sx={{ display: 'grid', gap: { xs: 1.4, md: 2 }, gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))' } }}>
        <FunnelPanel users={data.users} />
        <CompositionPanel data={data} />
      </Box>
      <Box sx={{ display: 'grid', gap: { xs: 1.4, md: 2 }, gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))' } }}>
        <RecentUsersPanel users={data.users} onOpen={setOpenId} />
        <TopCollectionsPanel collections={data.collections} />
      </Box>
      <Typography sx={{ fontSize: '0.68rem', color: theme.textOnBgMuted, textAlign: 'center', px: 2 }}>
        "Acesso" conta login, volta ao app e abertura de pacotinho. Emails aparecem mascarados e o conteúdo dos bilhetes nunca sai do servidor.
      </Typography>
      <UserDrawer user={openUser} onClose={() => setOpenId(null)} />
    </Stack>
  )
}

export function AdminOverviewPage() {
  return (
    <AdminShell title="Como está o Potinho" subtitle="Visão geral do sistema">
      {(data) => <Overview data={data} />}
    </AdminShell>
  )
}
