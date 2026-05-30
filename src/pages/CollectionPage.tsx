import Inventory2Icon from '@mui/icons-material/Inventory2'
import FavoriteIcon from '@mui/icons-material/Favorite'
import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { NoteCard } from '../components/NoteCard'
import { useCollectionQuery, useToggleFavoriteMutation, useRaritiesQuery } from '../hooks/useNotes'
import type { Note } from '../types/note'

type SortOption = 'raridade' | 'nome' | 'recentes'

const FLOATING = [
  { size: 12, left: '6%',  delay: '0s',   dur: '10s', opacity: 0.13 },
  { size:  9, left: '22%', delay: '3s',   dur: '13s', opacity: 0.10 },
  { size: 15, left: '72%', delay: '1.5s', dur: '9s',  opacity: 0.12 },
  { size: 10, left: '88%', delay: '5s',   dur: '12s', opacity: 0.09 },
]

export function CollectionPage() {
  const collectionQuery = useCollectionQuery()
  const toggleFavoriteMutation = useToggleFavoriteMutation()
  const { data: rarities = [] } = useRaritiesQuery()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('raridade')
  const [ownershipFilter, setOwnershipFilter] = useState<'todos' | 'coletados' | 'faltando'>('todos')
  const [rarityFilter, setRarityFilter] = useState<'todas' | string>('todas')

  function handleToggleFavorite(note: Note) {
    toggleFavoriteMutation.mutate({ id: note.id, favorite: !note.favorite })
  }

  const organizedNotes = useMemo(() => {
    const sourceNotes = collectionQuery.data?.items ?? []
    const normalizedSearch = searchTerm.trim().toLowerCase()
    const filtered = sourceNotes.filter((note) => {
      const matchOwnership =
        ownershipFilter === 'todos' ||
        (ownershipFilter === 'coletados' && note.owned) ||
        (ownershipFilter === 'faltando' && !note.owned)
      const matchRarity = rarityFilter === 'todas' || note.rarity === rarityFilter
      const matchSearch =
        normalizedSearch.length === 0 ||
        note.title.toLowerCase().includes(normalizedSearch) ||
        note.message.toLowerCase().includes(normalizedSearch)
      return matchOwnership && matchRarity && matchSearch
    })
    return [...filtered].sort((a, b) => {
      if (sortBy === 'nome') return a.title.localeCompare(b.title, 'pt-BR')
      if (sortBy === 'recentes') {
        return (b.obtainedAt ? new Date(b.obtainedAt).getTime() : 0) -
               (a.obtainedAt ? new Date(a.obtainedAt).getTime() : 0)
      }
      const orderMap = Object.fromEntries(rarities.map((r) => [r.id, r.order]))
      return (orderMap[b.rarity] ?? 99) - (orderMap[a.rarity] ?? 99)
    })
  }, [collectionQuery.data?.items, searchTerm, sortBy, ownershipFilter, rarityFilter, rarities])

  return (
    <Box sx={{ height: '100%', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(145deg, #f4f8ff 0%, #eef4ff 45%, #f7efff 100%)' }}>

      {/* Background icon */}
      <Inventory2Icon sx={{
        position: 'absolute', bottom: -80, left: -80,
        fontSize: 520, color: '#1d4ed8', opacity: 0.045,
        transform: 'rotate(-18deg)', pointerEvents: 'none',
      }} />

      {/* Floating hearts */}
      {FLOATING.map((h, i) => (
        <FavoriteIcon key={i} sx={{
          position: 'absolute', bottom: '-4px', left: h.left,
          fontSize: h.size, color: '#f43f5e', opacity: h.opacity, pointerEvents: 'none',
          animation: `col-float-${i} ${h.dur} ${h.delay} ease-in infinite`,
          [`@keyframes col-float-${i}`]: {
            '0%':   { transform: 'translateY(0) rotate(-6deg)', opacity: 0 },
            '8%':   { opacity: h.opacity },
            '92%':  { opacity: h.opacity * 0.5 },
            '100%': { transform: 'translateY(-105vh) rotate(10deg)', opacity: 0 },
          },
        }} />
      ))}

      {/* Main: sticky header + scrollable list */}
      <Stack sx={{ height: '100%', position: 'relative', zIndex: 1 }}>

        {/* ── Sticky header ── */}
        <Box sx={{
          px: 2.5, pt: 2.4, pb: 1.6, flexShrink: 0,
          background: 'linear-gradient(to bottom, rgba(244,248,255,0.98) 80%, rgba(244,248,255,0))',
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 1.8 }}>
            <Stack spacing={0.2}>
              <Typography variant="h5" sx={{ color: '#1f2a44', lineHeight: 1.1 }}>
                Coleção
              </Typography>
              <Typography variant="body2" sx={{ color: '#4a5568' }}>
                {collectionQuery.data
                  ? `${collectionQuery.data.owned} de ${collectionQuery.data.total} bilhetes`
                  : 'Carregando...'}
              </Typography>
            </Stack>

            {collectionQuery.data && (
              <Box sx={{ position: 'relative', width: 44, height: 44 }}>
                <CircularProgress variant="determinate" value={100} size={44} thickness={4}
                  sx={{ color: 'rgba(29,78,216,0.1)', position: 'absolute', top: 0, left: 0 }} />
                <CircularProgress variant="determinate"
                  value={Math.round((collectionQuery.data.owned / collectionQuery.data.total) * 100)}
                  size={44} thickness={4}
                  sx={{ color: '#f43f5e', position: 'absolute', top: 0, left: 0 }} />
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#1f2a44', lineHeight: 1 }}>
                    {Math.round((collectionQuery.data.owned / collectionQuery.data.total) * 100)}%
                  </Typography>
                </Box>
              </Box>
            )}
          </Stack>

          {/* Filters */}
          <Box sx={{
            p: 1.6, borderRadius: 3,
            background: 'rgba(255, 253, 251, 0.94)',
            border: '1.5px solid rgba(30, 64, 175, 0.09)',
            boxShadow: '0 4px 18px rgba(0,0,0,0.05)',
          }}>
            <Stack spacing={1.3}>
              <TextField
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar bilhete..."
                size="small"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'rgba(248,250,252,0.8)' } }}
              />

              <Stack direction="row" spacing={1}>
                <FormControl fullWidth size="small">
                  <InputLabel>Ordenar</InputLabel>
                  <Select value={sortBy} label="Ordenar"
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    sx={{ borderRadius: 2.5 }}>
                    <MenuItem value="raridade">Raridade</MenuItem>
                    <MenuItem value="nome">Nome</MenuItem>
                    <MenuItem value="recentes">Mais recentes</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Raridade</InputLabel>
                  <Select value={rarityFilter} label="Raridade"
                    onChange={(e) => setRarityFilter(e.target.value)}
                    sx={{ borderRadius: 2.5 }}>
                    <MenuItem value="todas">Todas</MenuItem>
                    {rarities.map((r) => (
                      <MenuItem key={r.id} value={r.id}>{r.emoji} {r.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              <ToggleButtonGroup
                value={ownershipFilter} exclusive fullWidth size="small"
                onChange={(_, v: 'todos' | 'coletados' | 'faltando' | null) => { if (v) setOwnershipFilter(v) }}
                sx={{
                  gap: 0.5,
                  '& .MuiToggleButton-root': {
                    borderRadius: '20px !important',
                    border: '1px solid rgba(30,64,175,0.15) !important',
                    textTransform: 'none', fontWeight: 600, fontSize: '0.82rem', py: 0.55,
                    '&.Mui-selected': {
                      bgcolor: '#1d4ed8', color: '#fff',
                      '&:hover': { bgcolor: '#1e40af' },
                    },
                  },
                }}
              >
                <ToggleButton value="todos">Todos</ToggleButton>
                <ToggleButton value="coletados">Coletados</ToggleButton>
                <ToggleButton value="faltando">Faltando</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Box>
        </Box>

        {/* ── Scrollable list ── */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, pb: 3 }}>
          {collectionQuery.isPending ? (
            <Stack alignItems="center" sx={{ py: 6 }}>
              <CircularProgress size={32} sx={{ color: '#1d4ed8' }} />
            </Stack>
          ) : organizedNotes.length === 0 ? (
            <Box sx={{
              mt: 1, p: 3, borderRadius: 3, textAlign: 'center',
              background: 'rgba(255,253,251,0.92)',
              border: '1.5px solid rgba(30,64,175,0.08)',
            }}>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.92rem' }}>
                Nenhum bilhete encontrado com os filtros atuais.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.4} sx={{ pt: 0.5 }}>
              {organizedNotes.map((note) => (
                <NoteCard key={note.id} note={note} onToggleFavorite={handleToggleFavorite} />
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  )
}
