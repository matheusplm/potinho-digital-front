import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import ViewAgendaOutlinedIcon from '@mui/icons-material/ViewAgendaOutlined'
import GridViewIcon from '@mui/icons-material/GridView'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import TuneIcon from '@mui/icons-material/Tune'
import { Box, Dialog, DialogContent, IconButton, Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { Card } from '../../components/ui'
import { NoteCard } from '../../components/collection/NoteCard'
import { colors, font, radius } from '../../design-system'
import type { BackgroundTheme } from '../../design-system'
import { gradientTextSx } from '../../utils/colorUtils'
import type { CollectionNoteView, NoteTypeConfig, RarityConfig } from '../../types/note'

export type AlbumView = 'list' | 'grid' | 'folders'
export type AlbumSort = 'recent' | 'rarity' | 'az'
type AlbumGroup = 'rarity' | 'type'
type AlbumFilter = 'all' | 'favorites'

export const ALBUM_VIEW_KEY = 'potinho-album-view'

const SORT_LABEL: Record<AlbumSort, string> = { recent: 'Recentes', rarity: 'Raridade', az: 'A-Z' }
const SORT_CYCLE: AlbumSort[] = ['recent', 'rarity', 'az']

function sortNotes(items: CollectionNoteView[], sort: AlbumSort, order: Record<string, number>) {
  const arr = [...items]
  if (sort === 'az') arr.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '', 'pt-BR'))
  else if (sort === 'rarity') arr.sort((a, b) => (order[b.rarity] ?? 0) - (order[a.rarity] ?? 0) || (a.title ?? '').localeCompare(b.title ?? '', 'pt-BR'))
  else arr.sort((a, b) => (b.obtainedAt ?? '').localeCompare(a.obtainedAt ?? ''))
  return arr
}

export function AlbumSection({
  search, setSearch, filter, setFilter, rarity, setRarity, type, setType,
  view, setView, sort, setSort, group, setGroup,
  hasFavorites, discoveredRarities, discoveredTypes, items, rarities, types, theme,
  onSelect, onToggleFavorite, unreadIds, emptyHint,
}: {
  search: string; setSearch: (v: string) => void
  filter: AlbumFilter; setFilter: (v: AlbumFilter) => void
  rarity: string; setRarity: (v: string) => void
  type: string; setType: (v: string) => void
  view: AlbumView; setView: (v: AlbumView) => void
  sort: AlbumSort; setSort: (v: AlbumSort) => void
  group: AlbumGroup; setGroup: (v: AlbumGroup) => void
  hasFavorites: boolean
  discoveredRarities: RarityConfig[]
  discoveredTypes: NoteTypeConfig[]
  items: CollectionNoteView[]
  rarities: RarityConfig[]
  types: NoteTypeConfig[]
  theme: BackgroundTheme
  onSelect: (note: CollectionNoteView) => void
  onToggleFavorite: (note: CollectionNoteView) => void
  unreadIds: string[]
  emptyHint: string
}) {
  const order = useMemo(() => Object.fromEntries(rarities.map((r) => [r.id, r.order])), [rarities])
  const sorted = useMemo(() => sortNotes(items, sort, order), [items, sort, order])
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const activeFilterCount = (rarity !== 'all' ? 1 : 0) + (type !== 'all' ? 1 : 0) + (view === 'folders' && group !== 'rarity' ? 1 : 0)

  const groups = useMemo(() => {
    if (view !== 'folders') return []
    if (group === 'rarity') {
      return [...discoveredRarities]
        .sort((a, b) => b.order - a.order)
        .map((r) => ({ key: r.id, label: `${r.emoji} ${r.label}`, accent: r.borderColor, items: sorted.filter((n) => n.rarity === r.id) }))
        .filter((g) => g.items.length > 0)
    }
    return discoveredTypes
      .map((t) => ({ key: t.id, label: `${t.emoji} ${t.label}`, accent: `${t.accentColor}66`, items: sorted.filter((n) => n.typeId === t.id) }))
      .filter((g) => g.items.length > 0)
  }, [view, group, discoveredRarities, discoveredTypes, sorted])

  function renderCard(note: CollectionNoteView, variant: 'list' | 'grid') {
    return (
      <NoteCard
        key={note.id}
        note={note}
        r={rarities.find((x) => x.id === note.rarity)}
        t={types.find((x) => x.id === note.typeId)}
        unread={unreadIds.includes(note.id)}
        variant={variant}
        onSelect={onSelect}
        onToggleFavorite={onToggleFavorite}
      />
    )
  }

  return (
    <Stack spacing={1.2}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.3, py: 0.82, background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(14px)', border: '1.5px solid rgba(255,255,255,0.62)', borderRadius: radius.xl }}>
        <SearchIcon sx={{ fontSize: 17, color: theme.textOnBgMuted, flexShrink: 0 }} />
        <Box component="input" value={search} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} placeholder="Buscar cartinha..." sx={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', color: theme.textOnBg, fontFamily: 'inherit', fontSize: '0.84rem', '&::placeholder': { color: theme.textOnBgMuted } }} />
        {search && (
          <Box onClick={() => setSearch('')} sx={{ display: 'flex', color: theme.textOnBgMuted, cursor: 'pointer', flexShrink: 0 }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </Box>
        )}
      </Box>

      <Stack direction="row" alignItems="center" spacing={0.6}>
        <Box sx={{ display: 'flex', gap: 0.6, flex: 1, overflowX: 'auto', pb: 0.2, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          {[
            { id: 'all' as AlbumFilter, label: 'Todas' },
            ...(hasFavorites ? [{ id: 'favorites' as AlbumFilter, label: 'Favoritas' }] : []),
          ].map((item) => (
            <Box key={item.id} onClick={() => setFilter(item.id)} sx={{ px: 1.1, py: 0.52, borderRadius: radius.full, cursor: 'pointer', flexShrink: 0, fontSize: '0.72rem', fontWeight: 800, color: filter === item.id ? '#fff' : theme.textOnBgMuted, background: filter === item.id ? theme.accent : 'rgba(255,255,255,0.48)', border: `1px solid ${filter === item.id ? theme.accent : 'rgba(255,255,255,0.58)'}`, backdropFilter: 'blur(10px)' }}>
              {item.label}
            </Box>
          ))}
        </Box>
        {(discoveredRarities.length > 0 || discoveredTypes.length > 0) && (
          <Box onClick={() => setFilterSheetOpen(true)} sx={{ display: 'flex', alignItems: 'center', gap: 0.4, px: 1, py: 0.52, borderRadius: radius.full, cursor: 'pointer', flexShrink: 0, fontSize: '0.72rem', fontWeight: 800, color: activeFilterCount > 0 ? '#fff' : theme.textOnBgMuted, background: activeFilterCount > 0 ? theme.accent : 'rgba(255,255,255,0.48)', border: `1px solid ${activeFilterCount > 0 ? theme.accent : 'rgba(255,255,255,0.58)'}`, backdropFilter: 'blur(10px)' }}>
            <TuneIcon sx={{ fontSize: 14 }} />
            {activeFilterCount > 0 ? `Filtros (${activeFilterCount})` : 'Filtros'}
          </Box>
        )}
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.2 }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {([
            { id: 'list' as AlbumView, Icon: ViewAgendaOutlinedIcon },
            { id: 'grid' as AlbumView, Icon: GridViewIcon },
            { id: 'folders' as AlbumView, Icon: FolderOutlinedIcon },
          ]).map(({ id, Icon }) => (
            <Box key={id} role="button" aria-label={`Exibição ${id}`} onClick={() => setView(id)} sx={{ width: 32, height: 32, borderRadius: radius.md, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: view === id ? '#fff' : theme.textOnBgMuted, background: view === id ? theme.accent : 'rgba(255,255,255,0.48)', border: `1px solid ${view === id ? theme.accent : 'rgba(255,255,255,0.58)'}`, backdropFilter: 'blur(10px)', transition: 'all 0.15s' }}>
              <Icon sx={{ fontSize: 16 }} />
            </Box>
          ))}
        </Box>
        <Box role="button" aria-label="ordenar" onClick={() => setSort(SORT_CYCLE[(SORT_CYCLE.indexOf(sort) + 1) % SORT_CYCLE.length])} sx={{ display: 'flex', alignItems: 'center', gap: 0.4, px: 1.1, py: 0.5, borderRadius: radius.full, cursor: 'pointer', fontSize: '0.72rem', fontWeight: 800, color: theme.textOnBgMuted, background: 'rgba(255,255,255,0.48)', border: '1px solid rgba(255,255,255,0.58)', backdropFilter: 'blur(10px)' }}>
          <SwapVertIcon sx={{ fontSize: 15 }} />
          {SORT_LABEL[sort]}
        </Box>
      </Stack>

      <Dialog open={filterSheetOpen} onClose={() => setFilterSheetOpen(false)} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: `${radius.xl} ${radius.xl} 0 0`, mx: 0, maxWidth: 480, width: '100%', position: 'fixed', bottom: 0, m: 0 } } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, pt: 2, pb: 1 }}>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.1rem', color: colors.text.primary }}>Filtros</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {activeFilterCount > 0 && (
              <Box onClick={() => { setRarity('all'); setType('all') }} sx={{ fontSize: '0.72rem', fontWeight: 700, color: colors.rose.main, cursor: 'pointer', px: 0.5 }}>
                Limpar
              </Box>
            )}
            <IconButton size="small" onClick={() => setFilterSheetOpen(false)}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
          </Stack>
        </Stack>

        <DialogContent sx={{ pt: 0.5, pb: 3 }}>
          <Stack spacing={2}>
            {discoveredRarities.length > 0 && (
              <Box>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: 0.6, color: colors.text.secondary, textTransform: 'uppercase', mb: 1 }}>Raridade</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
                  <Box onClick={() => setRarity('all')} sx={{ px: 1.2, py: 0.55, borderRadius: radius.full, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 800, color: rarity === 'all' ? '#fff' : colors.text.secondary, background: rarity === 'all' ? colors.primary.main : colors.surface.overlay, border: `1.5px solid ${rarity === 'all' ? colors.primary.main : colors.border.subtle}` }}>
                    Todas
                  </Box>
                  {discoveredRarities.map((r) => (
                    <Box key={r.id} onClick={() => setRarity(rarity === r.id ? 'all' : r.id)} sx={{ px: 1.2, py: 0.55, borderRadius: radius.full, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 800, background: rarity === r.id ? r.chipBg : colors.surface.overlay, border: `1.5px solid ${rarity === r.id ? r.borderColor : colors.border.subtle}` }}>
                      <Box component="span" sx={rarity === r.id ? gradientTextSx(r.chipColor) : { color: colors.text.secondary }}>{r.emoji} {r.label}</Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
            {discoveredTypes.length > 0 && (
              <Box>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: 0.6, color: colors.text.secondary, textTransform: 'uppercase', mb: 1 }}>Tipo</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
                  <Box onClick={() => setType('all')} sx={{ px: 1.2, py: 0.55, borderRadius: radius.full, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 800, color: type === 'all' ? '#fff' : colors.text.secondary, background: type === 'all' ? colors.purple.main : colors.surface.overlay, border: `1.5px solid ${type === 'all' ? colors.purple.main : colors.border.subtle}` }}>
                    Todos
                  </Box>
                  {discoveredTypes.map((t) => (
                    <Box key={t.id} onClick={() => setType(type === t.id ? 'all' : t.id)} sx={{ px: 1.2, py: 0.55, borderRadius: radius.full, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 800, color: type === t.id ? t.tagColor : colors.text.secondary, background: type === t.id ? t.tagBg : colors.surface.overlay, border: `1.5px solid ${type === t.id ? `${t.accentColor}66` : colors.border.subtle}` }}>
                      {t.emoji} {t.label}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
            {view === 'folders' && (
              <Box>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: 0.6, color: colors.text.secondary, textTransform: 'uppercase', mb: 1 }}>Agrupamento</Typography>
                <Box sx={{ display: 'flex', gap: 0.7 }}>
                  {([
                    { id: 'rarity' as AlbumGroup, label: 'Por raridade' },
                    { id: 'type' as AlbumGroup, label: 'Por tipo' },
                  ]).map((g) => (
                    <Box key={g.id} onClick={() => setGroup(g.id)} sx={{ px: 1.2, py: 0.55, borderRadius: radius.full, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 800, color: group === g.id ? '#fff' : colors.text.secondary, background: group === g.id ? colors.purple.main : colors.surface.overlay, border: `1.5px solid ${group === g.id ? colors.purple.main : colors.border.subtle}` }}>
                      {g.label}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Stack>
        </DialogContent>
      </Dialog>

      {items.length === 0 ? (
        <Card sx={{ p: 2, textAlign: 'center' }}>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 800, color: colors.text.primary, mb: 0.3 }}>Nenhuma cartinha encontrada</Typography>
          <Typography sx={{ fontSize: '0.78rem', color: colors.text.secondary }}>{emptyHint}</Typography>
        </Card>
      ) : view === 'folders' ? (
        <Stack spacing={1}>
          {groups.map((g) => {
            const isCollapsed = collapsed[g.key]
            return (
              <Box key={g.key}>
                <Stack direction="row" alignItems="center" spacing={0.8} onClick={() => setCollapsed((c) => ({ ...c, [g.key]: !c[g.key] }))} sx={{ px: 1.2, py: 0.8, mb: 0.8, borderRadius: radius.lg, cursor: 'pointer', background: 'rgba(255,255,255,0.5)', border: `1px solid ${g.accent}`, backdropFilter: 'blur(10px)' }}>
                  <ExpandMoreIcon sx={{ fontSize: 18, color: theme.textOnBgMuted, transition: 'transform 0.18s', transform: isCollapsed ? 'rotate(-90deg)' : 'none' }} />
                  <Typography sx={{ flex: 1, fontSize: '0.8rem', fontWeight: 800, color: theme.textOnBg }}>{g.label}</Typography>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: theme.textOnBgMuted }}>{g.items.length}</Typography>
                </Stack>
                {!isCollapsed && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 0.5 }}>
                    {g.items.map((note) => renderCard(note, 'grid'))}
                  </Box>
                )}
              </Box>
            )
          })}
        </Stack>
      ) : (
        <Stack spacing={1}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: 1.1, color: theme.textOnBgMuted, textTransform: 'uppercase' }}>
            Cartinhas da coleção — {sorted.length}
          </Typography>
          {view === 'grid' ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
              {sorted.map((note) => renderCard(note, 'grid'))}
            </Box>
          ) : (
            <Stack spacing={1}>
              {sorted.map((note) => renderCard(note, 'list'))}
            </Stack>
          )}
        </Stack>
      )}
    </Stack>
  )
}

export type { AlbumGroup, AlbumFilter }
