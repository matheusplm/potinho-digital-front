import { Box, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBackground } from '../../context/BackgroundContext'
import { ActivityChart } from './ActivityChart'
import { AdminShell } from './AdminShell'
import { CollectionRow } from './CollectionsPanel'
import { Panel, StatCard } from './Panel'
import { UserRow } from './UsersPanel'
import { plural } from './format'

const PREVIEW_SIZE = 5

function SeeAll({ to, label }: { to: string; label: string }) {
  const { theme } = useBackground()
  const navigate = useNavigate()
  return (
    <Box
      component="button"
      type="button"
      onClick={() => navigate(to)}
      sx={{ all: 'unset', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, color: theme.accent, '&:focus-visible': { outline: `2px solid ${theme.accent}`, borderRadius: '4px' } }}
    >
      {label} →
    </Box>
  )
}

export function AdminOverviewPage() {
  const { theme } = useBackground()
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <AdminShell title="Como está o Potinho">
      {(data) => (
        <Stack spacing={2}>
          <Box sx={{ display: 'grid', gap: { xs: 1, md: 1.4 }, gridTemplateColumns: { xs: 'repeat(2, minmax(0,1fr))', md: 'repeat(4, minmax(0,1fr))' } }}>
            <StatCard emoji="👥" label="Usuários" value={data.totals.users} detail={`+${data.totals.newUsers7d} nos últimos 7 dias`} />
            <StatCard emoji="🟢" label="Ativos hoje" value={data.totals.activeToday} detail={`${data.totals.active7d} em 7 dias · ${data.totals.active30d} em 30`} />
            <StatCard emoji="🫙" label="Coleções" value={data.totals.collections} detail={`${plural(data.totals.owners, 'pessoa escrevendo', 'pessoas escrevendo')}${data.totals.deletedCollections ? ` · ${data.totals.deletedCollections} na lixeira` : ''}`} />
            <StatCard emoji="📖" label="Leitores" value={data.totals.readers} detail={plural(data.totals.invitesPending, 'convite pendente', 'convites pendentes')} />
            <StatCard emoji="✍️" label="Bilhetes escritos" value={data.totals.notes} detail={`${data.totals.releasedNotes.toLocaleString('pt-BR')} já lançados`} />
            <StatCard emoji="📦" label="Bilhetes abertos" value={data.totals.collected} detail={`+${data.totals.collected7d.toLocaleString('pt-BR')} nos últimos 7 dias`} />
            <StatCard emoji="❤️" label="Favoritados" value={data.totals.favorites} detail={plural(data.totals.achievementsUnlocked, 'conquista desbloqueada', 'conquistas desbloqueadas')} />
            <StatCard emoji="🔔" label="Com notificação" value={data.totals.pushUsers} detail={data.totals.users ? `${Math.round((data.totals.pushUsers / data.totals.users) * 100)}% dos usuários` : undefined} />
          </Box>

          <ActivityChart daily={data.daily} />

          <Panel title="Acessaram por último" actions={<SeeAll to="/admin/usuarios" label={`ver os ${data.users.length}`} />}>
            <Stack divider={<Box sx={{ height: '1px', background: theme.surfaceBorder, mx: 1.2 }} />}>
              {data.users.slice(0, PREVIEW_SIZE).map((user) => (
                <UserRow key={user.id} user={user} open={openId === user.id} onToggle={() => setOpenId((current) => (current === user.id ? null : user.id))} />
              ))}
            </Stack>
          </Panel>

          <Panel title="Coleções mais movimentadas" actions={<SeeAll to="/admin/colecoes" label={`ver as ${data.collections.length}`} />}>
            <Stack divider={<Box sx={{ height: '1px', background: theme.surfaceBorder, mx: 1.2 }} />}>
              {data.collections.filter((collection) => !collection.deleted).slice(0, PREVIEW_SIZE).map((collection) => (
                <CollectionRow key={collection.id} collection={collection} />
              ))}
            </Stack>
          </Panel>

          <Typography sx={{ fontSize: '0.68rem', color: theme.textOnBgMuted, textAlign: 'center' }}>
            "Acesso" conta login, volta ao app e abertura de pacotinho. Emails aparecem mascarados e o conteúdo dos bilhetes nunca sai do servidor.
          </Typography>
        </Stack>
      )}
    </AdminShell>
  )
}
