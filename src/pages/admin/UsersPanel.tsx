import { Box, Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { Button, SegmentedControl } from '../../components/ui'
import { useBackground } from '../../context/BackgroundContext'
import { font, radius } from '../../design-system'
import type { AdminUserRow } from '../../types/admin'
import { Chip, Panel, SearchBox } from './Panel'
import { TONE_COLOR, activityTone, dateTime, normalize, plural, shortDate, timeAgo } from './format'

type Sort = 'recent' | 'new' | 'collected'

const PAGE_SIZE = 20
const AVATAR_COLORS = ['#db2777', '#7c3aed', '#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626', '#4f46e5']

const SORTERS: Record<Sort, (a: AdminUserRow, b: AdminUserRow) => number> = {
  recent: (a, b) => (b.lastActiveAt ?? '').localeCompare(a.lastActiveAt ?? ''),
  new: (a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
  collected: (a, b) => b.collected - a.collected || (b.lastActiveAt ?? '').localeCompare(a.lastActiveAt ?? ''),
}

function avatarColor(id: string): string {
  let hash = 0
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function Detail({ label, value }: { label: string; value: string }) {
  const { theme } = useBackground()
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: '0.64rem', fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase', color: theme.textOnBgMuted }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: theme.textOnBg }}>{value}</Typography>
    </Box>
  )
}

export function UserRow({ user, open, onToggle }: { user: AdminUserRow; open: boolean; onToggle: () => void }) {
  const { theme } = useBackground()
  const tone = activityTone(user.lastActiveAt)
  return (
    <Box sx={{ borderRadius: radius.lg, transition: 'background 0.15s', background: open ? `${theme.accent}10` : 'transparent', '&:hover': { background: `${theme.accent}0c` } }}>
      <Box
        component="button"
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        sx={{
          all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer', px: 1.2, py: 1.1,
          display: 'grid', alignItems: 'center', columnGap: 1.5, rowGap: 0.8,
          gridTemplateColumns: { xs: 'minmax(0,1fr) auto', md: 'minmax(0,1.3fr) minmax(0,1.4fr) 150px' },
          gridTemplateAreas: { xs: '"who when" "stats stats"', md: '"who stats when"' },
          '&:focus-visible': { outline: `2px solid ${theme.accent}`, borderRadius: radius.lg },
        }}
      >
        <Stack direction="row" spacing={1.2} alignItems="center" sx={{ gridArea: 'who', minWidth: 0 }}>
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '50%', background: avatarColor(user.id), color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem',
            }}>
              {user.name.trim().charAt(0).toUpperCase() || '?'}
            </Box>
            <Box sx={{
              position: 'absolute', right: -1, bottom: -1, width: 11, height: 11, borderRadius: '50%',
              background: TONE_COLOR[tone], border: tone === 'none' ? 'none' : `2px solid ${theme.isDark ? '#1b2238' : '#fff'}`,
            }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: theme.textOnBg, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name}
              {user.username && (
                <Box component="span" sx={{ ml: 0.6, fontWeight: 600, fontSize: '0.76rem', color: theme.textOnBgMuted }}>@{user.username}</Box>
              )}
            </Typography>
            <Typography sx={{ fontSize: '0.74rem', color: theme.textOnBgMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.emailMasked}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ gridArea: 'stats', display: 'flex', flexWrap: 'wrap', gap: 0.6, minWidth: 0 }}>
          {user.collectionsOwned > 0 && <Chip>✍️ {plural(user.collectionsOwned, 'coleção', 'coleções')}</Chip>}
          {user.collectionsReading > 0 && <Chip>📖 lê {user.collectionsReading}</Chip>}
          <Chip>💌 {plural(user.collected, 'bilhete')}</Chip>
          {user.favorites > 0 && <Chip>❤️ {user.favorites}</Chip>}
          {user.push && <Chip tone="#22c55e">🔔 push</Chip>}
          {!user.hasPassword && <Chip tone="#4285f4">G Google</Chip>}
          {user.emailVerified === false && <Chip tone="#f59e0b">⚠️ não verificado</Chip>}
        </Box>

        <Box sx={{ gridArea: 'when', textAlign: 'right', minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: theme.textOnBg, whiteSpace: 'nowrap' }}>
            {timeAgo(user.lastActiveAt)}
          </Typography>
          <Typography sx={{ fontSize: '0.68rem', color: theme.textOnBgMuted, whiteSpace: 'nowrap' }}>
            desde {shortDate(user.createdAt)}
          </Typography>
        </Box>
      </Box>

      {open && (
        <Box sx={{
          px: 1.2, pb: 1.4, pt: 0.2, display: 'grid', gap: 1.2,
          gridTemplateColumns: { xs: 'repeat(2, minmax(0,1fr))', md: 'repeat(4, minmax(0,1fr))' },
        }}>
          <Detail label="Último acesso" value={dateTime(user.lastActiveAt)} />
          <Detail label="Último login" value={user.lastLoginAt ? dateTime(user.lastLoginAt) : 'ainda não registrado'} />
          <Detail label="Último pacotinho" value={dateTime(user.lastPackAt)} />
          <Detail label="Cadastro" value={dateTime(user.createdAt)} />
          <Detail label="Entra com" value={user.hasPassword ? 'Email e senha' : 'Google'} />
          <Detail label="Email" value={user.emailVerified === false ? 'Não verificado' : user.emailVerified ? 'Verificado' : '—'} />
          <Detail label="Notificações" value={user.push ? 'Ativadas' : 'Desativadas'} />
          <Detail label="Tutorial" value={user.onboardingDone ? 'Concluído' : 'Não concluído'} />
          <Detail label="Favoritos" value={String(user.favorites)} />
          <Detail label="Conquistas" value={String(user.achievements)} />
        </Box>
      )}
    </Box>
  )
}

export function UsersPanel({ users }: { users: AdminUserRow[] }) {
  const { theme } = useBackground()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('recent')
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [openId, setOpenId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const term = normalize(query.trim())
    const list = term ? users.filter((user) => normalize(`${user.name} ${user.username ?? ''}`).includes(term)) : users
    return [...list].sort(SORTERS[sort])
  }, [users, query, sort])

  const visible = filtered.slice(0, limit)

  return (
    <Panel title="Usuários" count={users.length}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 1.2 }}>
        <Box sx={{ flex: 1 }}>
          <SearchBox value={query} onChange={(value) => { setQuery(value); setLimit(PAGE_SIZE) }} placeholder="Buscar por nome ou @usuário" />
        </Box>
        <Box sx={{ width: { xs: '100%', md: 360 } }}>
          <SegmentedControl
            options={[{ id: 'recent', label: 'Acesso recente' }, { id: 'new', label: 'Mais novos' }, { id: 'collected', label: 'Mais bilhetes' }]}
            value={sort}
            onChange={setSort}
          />
        </Box>
      </Stack>

      <Stack direction="row" spacing={1.6} sx={{ mb: 1, px: 1.2, flexWrap: 'wrap', rowGap: 0.4 }}>
        {(['hot', 'warm', 'cold'] as const).map((tone) => (
          <Stack key={tone} direction="row" spacing={0.6} alignItems="center">
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: TONE_COLOR[tone] }} />
            <Typography sx={{ fontSize: '0.66rem', fontWeight: 600, color: theme.textOnBgMuted }}>
              {tone === 'hot' ? 'ativo nas últimas 24h' : tone === 'warm' ? 'nos últimos 7 dias' : 'há mais tempo'}
            </Typography>
          </Stack>
        ))}
      </Stack>

      {visible.length === 0 ? (
        <Typography sx={{ py: 4, textAlign: 'center', fontSize: '0.85rem', color: theme.textOnBgMuted }}>
          Ninguém encontrado com esse nome.
        </Typography>
      ) : (
        <Stack divider={<Box sx={{ height: '1px', background: theme.surfaceBorder, mx: 1.2 }} />}>
          {visible.map((user) => (
            <UserRow key={user.id} user={user} open={openId === user.id} onToggle={() => setOpenId((current) => (current === user.id ? null : user.id))} />
          ))}
        </Stack>
      )}

      {filtered.length > limit && (
        <Button variant="ghost" onClick={() => setLimit((current) => current + PAGE_SIZE)} sx={{ mt: 1.4, width: '100%', py: 1, fontSize: '0.84rem' }}>
          Mostrar mais {Math.min(PAGE_SIZE, filtered.length - limit)} de {filtered.length - limit}
        </Button>
      )}
      <Typography sx={{ mt: 1.2, fontFamily: font.sans, fontSize: '0.66rem', color: theme.textOnBgMuted, textAlign: 'center' }}>
        Emails aparecem mascarados. Toque numa pessoa pra ver os detalhes.
      </Typography>
    </Panel>
  )
}
