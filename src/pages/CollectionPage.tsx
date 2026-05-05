import {
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { NoteCard } from '../components/NoteCard'
import { useCollectionQuery, useToggleFavoriteMutation } from '../hooks/useNotes'
import type { Note, Rarity } from '../types/note'

type SortOption = 'raridade' | 'nome' | 'recentes'

const rarityOrder: Record<Rarity, number> = {
  comum: 1,
  incomum: 2,
  raro: 3,
  lendario: 4,
  mitico: 5,
}

export function CollectionPage() {
  const collectionQuery = useCollectionQuery()
  const toggleFavoriteMutation = useToggleFavoriteMutation()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('raridade')
  const [ownershipFilter, setOwnershipFilter] = useState<'todos' | 'coletados' | 'faltando'>('todos')
  const [rarityFilter, setRarityFilter] = useState<'todas' | Rarity>('todas')

  function handleToggleFavorite(note: Note) {
    toggleFavoriteMutation.mutate({
      id: note.id,
      favorite: !note.favorite,
    })
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
      if (sortBy === 'nome') {
        return a.title.localeCompare(b.title, 'pt-BR')
      }

      if (sortBy === 'recentes') {
        const dateA = a.obtainedAt ? new Date(a.obtainedAt).getTime() : 0
        const dateB = b.obtainedAt ? new Date(b.obtainedAt).getTime() : 0
        return dateB - dateA
      }

      return rarityOrder[b.rarity] - rarityOrder[a.rarity]
    })
  }, [collectionQuery.data?.items, searchTerm, sortBy, ownershipFilter, rarityFilter])

  if (collectionQuery.isPending) {
    return (
      <Stack sx={{ py: 4, alignItems: 'center' }}>
        <CircularProgress />
      </Stack>
    )
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Albuns estilo cartinha</Typography>
      <Paper sx={{ p: 1.5 }}>
        <Stack spacing={1.5}>
          <TextField
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            label="Pesquisar bilhete"
            placeholder="Digite titulo ou mensagem"
            size="small"
            fullWidth
          />

          <Stack direction="row" spacing={1}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-label">Ordenar</InputLabel>
              <Select
                labelId="sort-label"
                value={sortBy}
                label="Ordenar"
                onChange={(event) => setSortBy(event.target.value as SortOption)}
              >
                <MenuItem value="raridade">Raridade</MenuItem>
                <MenuItem value="nome">Nome</MenuItem>
                <MenuItem value="recentes">Mais recentes</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="rarity-filter-label">Raridade</InputLabel>
              <Select
                labelId="rarity-filter-label"
                value={rarityFilter}
                label="Raridade"
                onChange={(event) => setRarityFilter(event.target.value as 'todas' | Rarity)}
              >
                <MenuItem value="todas">Todas</MenuItem>
                <MenuItem value="comum">Comum</MenuItem>
                <MenuItem value="incomum">Incomum</MenuItem>
                <MenuItem value="raro">Raro</MenuItem>
                <MenuItem value="lendario">Lendario</MenuItem>
                <MenuItem value="mitico">Mitico</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <ToggleButtonGroup
            color="primary"
            value={ownershipFilter}
            exclusive
            onChange={(_, value: 'todos' | 'coletados' | 'faltando' | null) => {
              if (value) {
                setOwnershipFilter(value)
              }
            }}
            fullWidth
            size="small"
          >
            <ToggleButton value="todos">Todos</ToggleButton>
            <ToggleButton value="coletados">Coletados</ToggleButton>
            <ToggleButton value="faltando">Faltando</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Paper>

      <Stack spacing={1.5}>
        {organizedNotes.length === 0 ? (
          <Paper sx={{ p: 2 }}>
            <Typography color="text.secondary">
              Nenhum bilhete encontrado com os filtros atuais.
            </Typography>
          </Paper>
        ) : (
          organizedNotes.map((note) => (
            <NoteCard key={note.id} note={note} onToggleFavorite={handleToggleFavorite} />
          ))
        )}
      </Stack>
    </Stack>
  )
}
