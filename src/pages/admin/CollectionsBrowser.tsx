import { Box, Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { Button, SegmentedControl } from '../../components/ui'
import { useBackground } from '../../context/BackgroundContext'
import { font, getBackgroundTheme, radius } from '../../design-system'
import type { AdminCollectionRow } from '../../types/admin'
import { ProgressBar } from './charts'
import { FilterChips, Panel, SearchBox, type FilterOption } from './Panel'
import { useSurface } from './surface'
import { TONE_COLOR, activityTone, formatNumber, normalize, percentLabel, share, shortDate, timeAgo } from './format'
import { WEEK_MS, within } from './insights'

type CollectionFilter = 'live' | 'active' | 'idle' | 'lonely' | 'invites' | 'trash'
type SortKey = 'recent' | 'collected' | 'readers'

const PAGE_SIZE = 18

const FILTERS: Array<{ id: CollectionFilter; label: string; test: (collection: AdminCollectionRow) => boolean }> = [
  { id: 'live', label: 'Todas', test: (collection) => !collection.deleted },
  { id: 'active', label: 'Ativas na semana', test: (collection) => !collection.deleted && within(collection.lastActivityAt, WEEK_MS) },
  { id: 'idle', label: 'Paradas', test: (collection) => !collection.deleted && !within(collection.lastActivityAt, WEEK_MS) },
  { id: 'lonely', label: 'Sem leitores', test: (collection) => !collection.deleted && collection.readers === 0 },
  { id: 'invites', label: 'Convite pendente', test: (collection) => !collection.deleted && collection.pendingInvites > 0 },
  { id: 'trash', label: 'Na lixeira', test: (collection) => collection.deleted },
]

const SORTERS: Record<SortKey, (a: AdminCollectionRow, b: AdminCollectionRow) => number> = {
  recent: (a, b) => (b.lastActivityAt ?? '').localeCompare(a.lastActivityAt ?? '') || (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
  collected: (a, b) => b.collected - a.collected,
  readers: (a, b) => b.readers - a.readers || b.collected - a.collected,
}

function BannerBadge({ children }: { children: React.ReactNode }) {
  return (
    <Box component="span" sx={{
      px: 0.9, py: 0.25, borderRadius: radius.full, fontSize: '0.66rem', fontWeight: 800, whiteSpace: 'nowrap',
      color: '#1e293b', background: 'rgba(255,255,255,0.92)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    }}>
      {children}
    </Box>
  )
}

function Metric({ value, label }: { value: number; label: string }) {
  const { theme } = useBackground()
  return (
    <Box sx={{ textAlign: 'center', minWidth: 0 }}>
      <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.15rem', color: theme.textOnBg, lineHeight: 1.1 }}>{formatNumber(value)}</Typography>
      <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: theme.textOnBgMuted, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</Typography>
    </Box>
  )
}

export function CollectionCard({ collection }: { collection: AdminCollectionRow }) {
  const { theme } = useBackground()
  const surface = useSurface()
  const look = getBackgroundTheme(collection.theme ?? '')
  const tone = activityTone(collection.lastActivityAt)
  return (
    <Box sx={{
      ...surface, borderRadius: radius.xl, overflow: 'hidden', display: 'flex', flexDirection: 'column',
      opacity: collection.deleted ? 0.6 : 1, transition: 'transform 0.18s ease',
      '@media (hover: hover)': { '&:hover': { transform: 'translateY(-3px)' } },
    }}>
      <Box sx={{ position: 'relative', height: 58, background: look.gradient, borderBottom: `1px solid ${theme.surfaceBorder}` }}>
        <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
          {collection.deleted && <BannerBadge>🗑️ na lixeira</BannerBadge>}
          {collection.pendingInvites > 0 && <BannerBadge>💌 {collection.pendingInvites} {collection.pendingInvites === 1 ? 'convite' : 'convites'}</BannerBadge>}
        </Box>
        <Box sx={{
          position: 'absolute', left: 14, bottom: -20, width: 44, height: 44, borderRadius: radius.lg,
          background: theme.isDark ? '#1b2238' : '#fff', border: `2px solid ${look.accent}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem',
          boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
        }}>
          {collection.emoji}
        </Box>
      </Box>

      <Box sx={{ p: 1.6, pt: 3.2, display: 'flex', flexDirection: 'column', gap: 1.3, flex: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.02rem', color: theme.textOnBg, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {collection.name}
          </Typography>
          <Typography sx={{ fontSize: '0.74rem', color: theme.textOnBgMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            de {collection.ownerName ?? 'conta removida'} · criada {shortDate(collection.createdAt)}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', py: 1, borderRadius: radius.lg, background: `${look.accent}0f`, border: `1px solid ${look.accent}22` }}>
          <Metric value={collection.readers} label="leitores" />
          <Metric value={collection.collected} label="abertos" />
          <Metric value={collection.favorites} label="favoritos" />
        </Box>

        <ProgressBar
          ratio={share(collection.releasedNotes, collection.notes)}
          color={look.accent}
          label={collection.notes ? `${formatNumber(collection.releasedNotes)} de ${formatNumber(collection.notes)} bilhetes lançados (${percentLabel(share(collection.releasedNotes, collection.notes))})` : 'Nenhum bilhete escrito ainda'}
        />

        <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mt: 'auto' }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: tone === 'none' ? theme.surfaceBorder : TONE_COLOR[tone] }} />
          <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: theme.textOnBg }}>
            {collection.lastActivityAt ? `última abertura ${timeAgo(collection.lastActivityAt)}` : 'nenhum bilhete aberto ainda'}
          </Typography>
        </Stack>
      </Box>
    </Box>
  )
}

export function CollectionsBrowser({ collections }: { collections: AdminCollectionRow[] }) {
  const { theme } = useBackground()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<CollectionFilter>('live')
  const [sort, setSort] = useState<SortKey>('recent')
  const [limit, setLimit] = useState(PAGE_SIZE)

  const filterOptions = useMemo<FilterOption<CollectionFilter>[]>(
    () => FILTERS.map(({ id, label, test }) => ({ id, label, count: collections.filter(test).length }))
      .filter((option) => option.id === 'live' || option.count > 0 || option.id === filter),
    [collections, filter],
  )

  const filtered = useMemo(() => {
    const term = normalize(query.trim())
    const test = FILTERS.find((item) => item.id === filter)?.test ?? (() => true)
    return collections
      .filter((collection) => test(collection) && (!term || normalize(`${collection.name} ${collection.ownerName ?? ''}`).includes(term)))
      .sort(SORTERS[sort])
  }, [collections, query, filter, sort])

  const visible = filtered.slice(0, limit)

  return (
    <Stack spacing={1.6}>
      <Panel title="Coleções" count={filtered.length} subtitle="Números de cada coleção, sem mostrar o conteúdo dos bilhetes">
        <Stack spacing={1.2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
            <Box sx={{ flex: 1 }}>
              <SearchBox value={query} onChange={(value) => { setQuery(value); setLimit(PAGE_SIZE) }} placeholder="Buscar coleção ou dono" />
            </Box>
            <Box sx={{ width: { xs: '100%', md: 360 } }}>
              <SegmentedControl
                options={[{ id: 'recent', label: 'Atividade' }, { id: 'collected', label: 'Abertos' }, { id: 'readers', label: 'Leitores' }]}
                value={sort}
                onChange={setSort}
              />
            </Box>
          </Stack>
          <FilterChips options={filterOptions} value={filter} onChange={(value) => { setFilter(value); setLimit(PAGE_SIZE) }} />
        </Stack>
      </Panel>

      {visible.length === 0 ? (
        <Stack alignItems="center" spacing={0.6} sx={{ py: 6, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '1.8rem' }}>🫙</Typography>
          <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: theme.textOnBg }}>Nenhuma coleção aqui</Typography>
        </Stack>
      ) : (
        <Box sx={{ display: 'grid', gap: { xs: 1.2, md: 1.6 }, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0,1fr))', lg: 'repeat(3, minmax(0,1fr))' } }}>
          {visible.map((collection) => <CollectionCard key={collection.id} collection={collection} />)}
        </Box>
      )}

      {filtered.length > limit && (
        <Button variant="ghost" onClick={() => setLimit((current) => current + PAGE_SIZE)} sx={{ width: '100%', py: 1, fontSize: '0.84rem' }}>
          Mostrar mais {Math.min(PAGE_SIZE, filtered.length - limit)} · faltam {filtered.length - limit}
        </Button>
      )}
    </Stack>
  )
}
