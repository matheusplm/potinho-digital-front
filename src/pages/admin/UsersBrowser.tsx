import { Box, Stack, Typography, useMediaQuery } from '@mui/material'
import { useMemo, useState } from 'react'
import { Button, SegmentedControl } from '../../components/ui'
import { useBackground } from '../../context/BackgroundContext'
import { radius } from '../../design-system'
import type { AdminUserRow } from '../../types/admin'
import { Avatar, FilterChips, Panel, SearchBox, type FilterOption } from './Panel'
import { UserBadges, UserDrawer } from './UserDrawer'
import { activityTone, formatNumber, normalize, shortDate, timeAgo } from './format'
import { HOUR_MS, MONTH_MS, WEEK_MS, within } from './insights'

type UserFilter = 'all' | 'online' | 'week' | 'gone' | 'new' | 'writers' | 'readers' | 'push' | 'unverified' | 'google'
type SortKey = 'recent' | 'created' | 'collected' | 'name'

const PAGE_SIZE = 25

const FILTERS: Array<{ id: UserFilter; label: string; test: (user: AdminUserRow) => boolean }> = [
  { id: 'all', label: 'Todos', test: () => true },
  { id: 'online', label: 'Ativos 24h', test: (user) => within(user.lastActiveAt, 24 * HOUR_MS) },
  { id: 'week', label: 'Ativos 7 dias', test: (user) => within(user.lastActiveAt, WEEK_MS) },
  { id: 'gone', label: 'Sumidos 30d+', test: (user) => !within(user.lastActiveAt, MONTH_MS) },
  { id: 'new', label: 'Novos', test: (user) => within(user.createdAt, WEEK_MS) },
  { id: 'writers', label: 'Escrevem', test: (user) => user.collectionsOwned > 0 },
  { id: 'readers', label: 'Leem', test: (user) => user.collectionsReading > 0 },
  { id: 'push', label: 'Com notificação', test: (user) => user.push },
  { id: 'unverified', label: 'Sem verificar', test: (user) => user.emailVerified === false },
  { id: 'google', label: 'Google', test: (user) => !user.hasPassword },
]

const SORTERS: Record<SortKey, (a: AdminUserRow, b: AdminUserRow) => number> = {
  recent: (a, b) => (a.lastActiveAt ?? '').localeCompare(b.lastActiveAt ?? ''),
  created: (a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''),
  collected: (a, b) => a.collected - b.collected,
  name: (a, b) => b.name.localeCompare(a.name, 'pt-BR'),
}

const COLUMNS = 'minmax(0,2.3fr) 140px 100px 120px 110px minmax(0,1.5fr)'

function HeaderCell({ label, sortKey, sort, desc, onSort, align = 'left' }: {
  label: string
  sortKey?: SortKey
  sort: SortKey
  desc: boolean
  onSort: (key: SortKey) => void
  align?: 'left' | 'right'
}) {
  const { theme } = useBackground()
  const active = sortKey === sort
  const content = (
    <>
      {label}
      {sortKey && <Box component="span" sx={{ opacity: active ? 1 : 0.35, fontSize: '0.7rem' }}>{active && !desc ? '▲' : '▼'}</Box>}
    </>
  )
  const sx = {
    display: 'flex', alignItems: 'center', gap: 0.4, justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
    fontSize: '0.66rem', fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase' as const,
    color: active ? theme.textOnBg : theme.textOnBgMuted,
  }
  if (!sortKey) return <Box sx={sx}>{label}</Box>
  return (
    <Box
      component="button"
      type="button"
      onClick={() => onSort(sortKey)}
      aria-sort={active ? (desc ? 'descending' : 'ascending') : 'none'}
      sx={{ all: 'unset', cursor: 'pointer', ...sx, '&:hover': { color: theme.textOnBg }, '&:focus-visible': { outline: `2px solid ${theme.accent}`, borderRadius: '4px' } }}
    >
      {content}
    </Box>
  )
}

function TableRow({ user, onOpen }: { user: AdminUserRow; onOpen: () => void }) {
  const { theme } = useBackground()
  return (
    <Box
      component="button"
      type="button"
      onClick={onOpen}
      sx={{
        all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer',
        display: 'grid', gridTemplateColumns: COLUMNS, alignItems: 'center', columnGap: 2, px: 1.4, py: 1.1,
        borderRadius: radius.lg, transition: 'background 0.12s',
        '&:hover': { background: `${theme.accent}0f` },
        '&:focus-visible': { outline: `2px solid ${theme.accent}` },
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0 }}>
        <Avatar id={user.id} name={user.name} tone={activityTone(user.lastActiveAt)} />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.86rem', fontWeight: 800, color: theme.textOnBg, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.name}
            {user.username && <Box component="span" sx={{ ml: 0.6, fontWeight: 600, fontSize: '0.74rem', color: theme.textOnBgMuted }}>@{user.username}</Box>}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: theme.textOnBgMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.emailMasked}</Typography>
        </Box>
      </Stack>
      <Box>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: theme.textOnBg }}>{timeAgo(user.lastActiveAt)}</Typography>
        <Typography sx={{ fontSize: '0.68rem', color: theme.textOnBgMuted }}>{user.lastLoginAt ? `login ${shortDate(user.lastLoginAt)}` : 'login sem registro'}</Typography>
      </Box>
      <Typography sx={{ fontSize: '0.8rem', color: theme.textOnBg }}>{shortDate(user.createdAt)}</Typography>
      <Typography sx={{ fontSize: '0.8rem', color: theme.textOnBg }}>
        {user.collectionsOwned || user.collectionsReading ? `✍️ ${user.collectionsOwned} · 📖 ${user.collectionsReading}` : '—'}
      </Typography>
      <Box sx={{ textAlign: 'right' }}>
        <Typography sx={{ fontSize: '0.86rem', fontWeight: 800, color: theme.textOnBg }}>{formatNumber(user.collected)}</Typography>
        <Typography sx={{ fontSize: '0.68rem', color: theme.textOnBgMuted }}>❤️ {user.favorites}</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, minWidth: 0 }}>
        <UserBadges user={user} />
      </Box>
    </Box>
  )
}

function UserCard({ user, onOpen }: { user: AdminUserRow; onOpen: () => void }) {
  const { theme } = useBackground()
  return (
    <Box
      component="button"
      type="button"
      onClick={onOpen}
      sx={{
        all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer', px: 1.2, py: 1.2, borderRadius: radius.lg,
        transition: 'background 0.12s', '&:active': { background: `${theme.accent}12` },
        '&:focus-visible': { outline: `2px solid ${theme.accent}` },
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="center">
        <Avatar id={user.id} name={user.name} tone={activityTone(user.lastActiveAt)} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: theme.textOnBg, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.name}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: theme.textOnBgMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.username ? `@${user.username} · ` : ''}{user.emailMasked}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: theme.textOnBg, whiteSpace: 'nowrap' }}>{timeAgo(user.lastActiveAt)}</Typography>
          <Typography sx={{ fontSize: '0.68rem', color: theme.textOnBgMuted, whiteSpace: 'nowrap' }}>💌 {formatNumber(user.collected)} · ❤️ {user.favorites}</Typography>
        </Box>
      </Stack>
      <Box sx={{ mt: 0.9, pl: '50px', display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        <UserBadges user={user} />
      </Box>
    </Box>
  )
}

export function UsersBrowser({ users }: { users: AdminUserRow[] }) {
  const { theme } = useBackground()
  const isDesktop = useMediaQuery('(min-width: 900px)', { noSsr: true })
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<UserFilter>('all')
  const [sort, setSort] = useState<SortKey>('recent')
  const [desc, setDesc] = useState(true)
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [openId, setOpenId] = useState<string | null>(null)

  const filterOptions = useMemo<FilterOption<UserFilter>[]>(
    () => FILTERS.map(({ id, label, test }) => ({ id, label, count: users.filter(test).length }))
      .filter((option) => option.id === 'all' || option.count > 0 || option.id === filter),
    [users, filter],
  )

  const filtered = useMemo(() => {
    const term = normalize(query.trim())
    const test = FILTERS.find((item) => item.id === filter)?.test ?? (() => true)
    const list = users.filter((user) => test(user) && (!term || normalize(`${user.name} ${user.username ?? ''}`).includes(term)))
    const direction = desc ? -1 : 1
    return list.sort((a, b) => SORTERS[sort](a, b) * direction)
  }, [users, query, filter, sort, desc])

  const visible = filtered.slice(0, limit)
  const openUser = users.find((user) => user.id === openId) ?? null

  function changeSort(key: SortKey) {
    if (key === sort) setDesc((current) => !current)
    else {
      setSort(key)
      setDesc(key !== 'name')
    }
  }

  return (
    <Panel title="Pessoas" count={filtered.length} subtitle={filter === 'all' && !query ? 'Toque em alguém pra ver a ficha completa' : `de ${formatNumber(users.length)} no total`}>
      <Stack spacing={1.2} sx={{ mb: 1.4 }}>
        <SearchBox value={query} onChange={(value) => { setQuery(value); setLimit(PAGE_SIZE) }} placeholder="Buscar por nome ou @usuário" />
        <FilterChips options={filterOptions} value={filter} onChange={(value) => { setFilter(value); setLimit(PAGE_SIZE) }} />
        {!isDesktop && (
          <SegmentedControl
            options={[{ id: 'recent', label: 'Recentes' }, { id: 'created', label: 'Novos' }, { id: 'collected', label: 'Bilhetes' }]}
            value={sort === 'name' ? 'recent' : sort}
            onChange={(key) => { setSort(key); setDesc(true) }}
          />
        )}
      </Stack>

      {isDesktop && visible.length > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: COLUMNS, columnGap: 2, px: 1.4, pb: 1, mb: 0.4, borderBottom: `1px solid ${theme.surfaceBorder}` }}>
          <HeaderCell label="Pessoa" sortKey="name" sort={sort} desc={desc} onSort={changeSort} />
          <HeaderCell label="Último acesso" sortKey="recent" sort={sort} desc={desc} onSort={changeSort} />
          <HeaderCell label="Cadastro" sortKey="created" sort={sort} desc={desc} onSort={changeSort} />
          <HeaderCell label="Coleções" sort={sort} desc={desc} onSort={changeSort} />
          <HeaderCell label="Bilhetes" sortKey="collected" sort={sort} desc={desc} onSort={changeSort} align="right" />
          <HeaderCell label="Sinais" sort={sort} desc={desc} onSort={changeSort} />
        </Box>
      )}

      {visible.length === 0 ? (
        <Stack alignItems="center" spacing={0.6} sx={{ py: 5, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '1.8rem' }}>🔎</Typography>
          <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: theme.textOnBg }}>Ninguém por aqui</Typography>
          <Typography sx={{ fontSize: '0.78rem', color: theme.textOnBgMuted }}>Tente outro nome ou outro filtro.</Typography>
        </Stack>
      ) : (
        <Stack divider={isDesktop ? undefined : <Box sx={{ height: '1px', background: theme.surfaceBorder, mx: 1.2 }} />} spacing={isDesktop ? 0.3 : 0}>
          {visible.map((user) => isDesktop
            ? <TableRow key={user.id} user={user} onOpen={() => setOpenId(user.id)} />
            : <UserCard key={user.id} user={user} onOpen={() => setOpenId(user.id)} />)}
        </Stack>
      )}

      {filtered.length > limit && (
        <Button variant="ghost" onClick={() => setLimit((current) => current + PAGE_SIZE)} sx={{ mt: 1.6, width: '100%', py: 1, fontSize: '0.84rem' }}>
          Mostrar mais {Math.min(PAGE_SIZE, filtered.length - limit)} · faltam {filtered.length - limit}
        </Button>
      )}

      <UserDrawer user={openUser} onClose={() => setOpenId(null)} />
    </Panel>
  )
}
