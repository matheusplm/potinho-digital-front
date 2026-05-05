import FavoriteIcon from '@mui/icons-material/Favorite'
import { CircularProgress, Stack, Typography } from '@mui/material'
import { NoteCard } from '../components/NoteCard'
import { useCollectionQuery, useToggleFavoriteMutation } from '../hooks/useNotes'
import type { Note } from '../types/note'

export function FavoritesPage() {
  const collectionQuery = useCollectionQuery()
  const toggleFavoriteMutation = useToggleFavoriteMutation()

  function handleToggleFavorite(note: Note) {
    toggleFavoriteMutation.mutate({
      id: note.id,
      favorite: !note.favorite,
    })
  }

  if (collectionQuery.isPending) {
    return (
      <Stack sx={{ py: 4, alignItems: 'center' }}>
        <CircularProgress />
      </Stack>
    )
  }

  const favoriteNotes = (collectionQuery.data?.items ?? []).filter((note) => note.favorite)

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Bilhetes favoritos</Typography>
      {favoriteNotes.length === 0 ? (
        <Stack sx={{ py: 4, alignItems: 'center' }} spacing={1}>
          <FavoriteIcon color="disabled" />
          <Typography color="text.secondary">Nenhum favorito ainda.</Typography>
        </Stack>
      ) : (
        <Stack spacing={1.5}>
          {favoriteNotes.map((note) => (
            <NoteCard key={note.id} note={note} onToggleFavorite={handleToggleFavorite} />
          ))}
        </Stack>
      )}
    </Stack>
  )
}
