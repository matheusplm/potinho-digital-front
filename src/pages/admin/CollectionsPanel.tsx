import { Box, Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { Button, SegmentedControl } from '../../components/ui'
import { useBackground } from '../../context/BackgroundContext'
import { getBackgroundTheme, radius } from '../../design-system'
import type { AdminCollectionRow } from '../../types/admin'
import { Chip, Panel, SearchBox } from './Panel'
import { normalize, plural, shortDate, timeAgo } from './format'

type Sort = 'recent' | 'readers' | 'notes'

const PAGE_SIZE = 15

const SORTERS: Record<Sort, (a: AdminCollectionRow, b: AdminCollectionRow) => number> = {
  recent: (a, b) => (b.lastActivityAt ?? '').localeCompare(a.lastActivityAt ?? ''),
  readers: (a, b) => b.readers - a.readers || b.collected - a.collected,
  notes: (a, b) => b.notes - a.notes || b.releasedNotes - a.releasedNotes,
}

export function CollectionRow({ collection }: { collection: AdminCollectionRow }) {
  const { theme } = useBackground()
  const look = getBackgroundTheme(collection.theme ?? '')
  const releasedShare = collection.notes ? collection.releasedNotes / collection.notes : 0
  return (
    <Box sx={{
      px: 1.2, py: 1.1, display: 'grid', alignItems: 'center', columnGap: 1.5, rowGap: 0.8,
      gridTemplateColumns: { xs: 'minmax(0,1fr) auto', md: 'minmax(0,1.3fr) minmax(0,1.4fr) 150px' },
      gridTemplateAreas: { xs: '"who when" "stats stats"', md: '"who stats when"' },
      opacity: collection.deleted ? 0.55 : 1,
    }}>
      <Stack direction="row" spacing={1.2} alignItems="center" sx={{ gridArea: 'who', minWidth: 0 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: radius.md, flexShrink: 0, background: look.gradient,
          border: `1px solid ${theme.surfaceBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
        }}>
          {collection.emoji}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: theme.textOnBg, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {collection.name}
          </Typography>
          <Typography sx={{ fontSize: '0.74rem', color: theme.textOnBgMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            de {collection.ownerName ?? 'conta removida'}
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ gridArea: 'stats', minWidth: 0 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
          {collection.deleted && <Chip tone="#94a3b8">🗑️ na lixeira</Chip>}
          <Chip>📖 {plural(collection.readers, 'leitor', 'leitores')}</Chip>
          <Chip>📦 {plural(collection.collected, 'aberto', 'abertos')}</Chip>
          {collection.favorites > 0 && <Chip>❤️ {collection.favorites}</Chip>}
          {collection.pendingInvites > 0 && <Chip tone="#f59e0b">✉️ {plural(collection.pendingInvites, 'convite')}</Chip>}
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.7 }}>
          <Box sx={{ flex: 1, maxWidth: 180, height: 5, borderRadius: radius.full, background: `${theme.accent}22`, overflow: 'hidden' }}>
            <Box sx={{ width: `${releasedShare * 100}%`, height: '100%', borderRadius: radius.full, background: theme.accent }} />
          </Box>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: theme.textOnBgMuted, whiteSpace: 'nowrap' }}>
            {collection.releasedNotes} de {plural(collection.notes, 'bilhete')} lançados
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ gridArea: 'when', textAlign: 'right', minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: theme.textOnBg, whiteSpace: 'nowrap' }}>
          {collection.lastActivityAt ? timeAgo(collection.lastActivityAt) : 'sem aberturas'}
        </Typography>
        <Typography sx={{ fontSize: '0.68rem', color: theme.textOnBgMuted, whiteSpace: 'nowrap' }}>
          criada {shortDate(collection.createdAt)}
        </Typography>
      </Box>
    </Box>
  )
}

export function CollectionsPanel({ collections }: { collections: AdminCollectionRow[] }) {
  const { theme } = useBackground()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('recent')
  const [limit, setLimit] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    const term = normalize(query.trim())
    const list = term ? collections.filter((item) => normalize(`${item.name} ${item.ownerName ?? ''}`).includes(term)) : collections
    return [...list].sort((a, b) => Number(a.deleted) - Number(b.deleted) || SORTERS[sort](a, b))
  }, [collections, query, sort])

  const visible = filtered.slice(0, limit)

  return (
    <Panel title="Coleções" count={collections.filter((item) => !item.deleted).length}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 1.2 }}>
        <Box sx={{ flex: 1 }}>
          <SearchBox value={query} onChange={(value) => { setQuery(value); setLimit(PAGE_SIZE) }} placeholder="Buscar coleção ou dono" />
        </Box>
        <Box sx={{ width: { xs: '100%', md: 360 } }}>
          <SegmentedControl
            options={[{ id: 'recent', label: 'Atividade' }, { id: 'readers', label: 'Leitores' }, { id: 'notes', label: 'Bilhetes' }]}
            value={sort}
            onChange={setSort}
          />
        </Box>
      </Stack>

      {visible.length === 0 ? (
        <Typography sx={{ py: 4, textAlign: 'center', fontSize: '0.85rem', color: theme.textOnBgMuted }}>
          Nenhuma coleção encontrada.
        </Typography>
      ) : (
        <Stack divider={<Box sx={{ height: '1px', background: theme.surfaceBorder, mx: 1.2 }} />}>
          {visible.map((collection) => <CollectionRow key={collection.id} collection={collection} />)}
        </Stack>
      )}

      {filtered.length > limit && (
        <Button variant="ghost" onClick={() => setLimit((current) => current + PAGE_SIZE)} sx={{ mt: 1.4, width: '100%', py: 1, fontSize: '0.84rem' }}>
          Mostrar mais {Math.min(PAGE_SIZE, filtered.length - limit)} de {filtered.length - limit}
        </Button>
      )}
    </Panel>
  )
}
