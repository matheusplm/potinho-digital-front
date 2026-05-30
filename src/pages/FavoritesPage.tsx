import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import { NoteCard } from '../components/NoteCard'
import { useCollectionQuery, useToggleFavoriteMutation } from '../hooks/useNotes'
import type { Note } from '../types/note'

const FLOATING = [
  { size: 16, left: '8%',  delay: '0s',   dur: '9s',  opacity: 0.20 },
  { size: 11, left: '20%', delay: '2.5s', dur: '12s', opacity: 0.14 },
  { size: 19, left: '75%', delay: '1s',   dur: '10s', opacity: 0.17 },
  { size: 10, left: '88%', delay: '4s',   dur: '13s', opacity: 0.12 },
  { size: 14, left: '48%', delay: '3.5s', dur: '11s', opacity: 0.15 },
]

export function FavoritesPage() {
  const collectionQuery = useCollectionQuery()
  const toggleFavoriteMutation = useToggleFavoriteMutation()

  function handleToggleFavorite(note: Note) {
    toggleFavoriteMutation.mutate({ id: note.id, favorite: !note.favorite })
  }

  const favoriteNotes = (collectionQuery.data?.items ?? []).filter((n) => n.favorite)

  return (
    <Box sx={{
      height: '100%', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(155deg, #fff5f7 0%, #ffe4ed 35%, #f5eeff 100%)',
    }}>
      <FavoriteIcon sx={{
        position: 'absolute', top: -60, right: -60,
        fontSize: 460, color: '#f43f5e', opacity: 0.055, pointerEvents: 'none',
        animation: 'fav-bg-pulse 5s ease-in-out infinite',
        '@keyframes fav-bg-pulse': {
          '0%,100%': { transform: 'scale(1)' },
          '50%':     { transform: 'scale(1.04)' },
        },
      }} />

      {FLOATING.map((h, i) => (
        <FavoriteIcon key={i} sx={{
          position: 'absolute', bottom: '-4px', left: h.left,
          fontSize: h.size, color: '#f43f5e', opacity: h.opacity, pointerEvents: 'none',
          animation: `fav-float-${i} ${h.dur} ${h.delay} ease-in infinite`,
          [`@keyframes fav-float-${i}`]: {
            '0%':   { transform: 'translateY(0) rotate(-8deg)', opacity: 0 },
            '8%':   { opacity: h.opacity },
            '92%':  { opacity: h.opacity * 0.5 },
            '100%': { transform: 'translateY(-105vh) rotate(12deg)', opacity: 0 },
          },
        }} />
      ))}

      <Stack sx={{ height: '100%', position: 'relative', zIndex: 1 }}>
        <Box sx={{
          px: 2.5, pt: 2.4, pb: 1.6, flexShrink: 0,
          background: 'linear-gradient(to bottom, rgba(255,245,247,0.98) 80%, rgba(255,245,247,0))',
        }}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box sx={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(244,63,94,0.1)', border: '1.5px solid rgba(244,63,94,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <FavoriteIcon sx={{ fontSize: 22, color: '#f43f5e' }} />
            </Box>
            <Stack spacing={0.15}>
              <Typography variant="h5" sx={{ color: '#1f2a44', lineHeight: 1.1 }}>Favoritos</Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                {collectionQuery.isPending
                  ? 'Carregando...'
                  : favoriteNotes.length > 0
                  ? `${favoriteNotes.length} bilhete${favoriteNotes.length !== 1 ? 's' : ''} favoritado${favoriteNotes.length !== 1 ? 's' : ''}`
                  : 'Nenhum favorito ainda'}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {collectionQuery.isPending ? (
            <Stack alignItems="center" justifyContent="center" sx={{ position: 'absolute', inset: 0 }}>
              <CircularProgress size={32} sx={{ color: '#f43f5e' }} />
            </Stack>

          ) : favoriteNotes.length === 0 ? (
            <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ position: 'absolute', inset: 0 }}>
              <Box sx={{ position: 'relative', width: 100, height: 100 }}>
                <Box sx={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  border: '2px dashed rgba(244,63,94,0.2)',
                  animation: 'empty-ring-1 3s ease-in-out infinite',
                  '@keyframes empty-ring-1': {
                    '0%,100%': { transform: 'scale(1)', opacity: 0.5 },
                    '50%':     { transform: 'scale(1.1)', opacity: 0.2 },
                  },
                }} />
                <Box sx={{
                  position: 'absolute', inset: 14, borderRadius: '50%',
                  border: '1.5px dashed rgba(244,63,94,0.3)',
                  animation: 'empty-ring-2 3s ease-in-out infinite reverse',
                  '@keyframes empty-ring-2': {
                    '0%,100%': { transform: 'scale(1)', opacity: 0.6 },
                    '50%':     { transform: 'scale(1.08)', opacity: 0.3 },
                  },
                }} />
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FavoriteBorderIcon sx={{ fontSize: 38, color: '#f43f5e', opacity: 0.4 }} />
                </Box>
              </Box>
              <Stack spacing={0.6} alignItems="center">
                <Typography sx={{ color: '#1f2a44', fontWeight: 700, fontSize: '1.05rem', fontFamily: '"Playfair Display",Georgia,serif', fontStyle: 'italic' }}>
                  Nenhum favorito ainda
                </Typography>
                <Typography sx={{ color: '#9ca3af', fontSize: '0.88rem', textAlign: 'center', maxWidth: 250, lineHeight: 1.55 }}>
                  Toque no coração de um bilhete coletado para adicioná-lo aqui.
                </Typography>
              </Stack>
            </Stack>

          ) : (
            <Box sx={{ position: 'absolute', inset: 0, overflowY: 'auto', px: 2.5, pb: 3 }}>
              <Stack spacing={1.4} sx={{ pt: 0.5 }}>
                {favoriteNotes.map((note) => (
                  <NoteCard key={note.id} note={note} onToggleFavorite={handleToggleFavorite} />
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  )
}
