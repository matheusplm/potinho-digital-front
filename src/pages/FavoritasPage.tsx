import FavoriteIcon from '@mui/icons-material/Favorite'
import { Box, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useMemo, useState } from 'react'
import { LoadingState, ScrollablePage } from '../components/ui'
import { NoteCard, NoteDetailDialog, type ReadableNote } from './CollectionPlayPage'
import { useBackground } from '../context/BackgroundContext'
import { useReader } from '../context/ReaderContext'
import { useActiveReaderCollection } from '../hooks/useActiveReaderCollection'
import {
  useCollectionPlayQuery,
  useCollectionRaritiesQuery,
  useCollectionTypesQuery,
  useToggleCollectionFavoriteMutation,
} from '../hooks/useNotes'
import { font } from '../design-system'

const fadeIn = keyframes`from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); }`

export function FavoritasPage() {
  const { theme } = useBackground()
  const reader = useReader()
  const { collection, isLoading: collectionsLoading } = useActiveReaderCollection()
  const cid = collection?.id ?? ''
  const { data: play, isLoading: playLoading } = useCollectionPlayQuery(cid, { enabled: !!cid })
  const { data: rarities = [] } = useCollectionRaritiesQuery(cid)
  const { data: types = [] } = useCollectionTypesQuery(cid)
  const favoriteMutation = useToggleCollectionFavoriteMutation(cid)
  const [selected, setSelected] = useState<ReadableNote | null>(null)

  const favorites = useMemo(() => (play?.items ?? []).filter((i) => i.owned && i.favorite), [play?.items])
  const isLoading = collectionsLoading || (!!cid && playLoading)

  return (
    <Box sx={{ height: '100%', position: 'relative', overflow: 'hidden', background: theme.gradient }}>
      <FavoriteIcon sx={{ position: 'absolute', bottom: -80, right: -70, fontSize: 460, color: 'rgba(225,29,72,0.05)', pointerEvents: 'none' }} />
      <ScrollablePage sx={{ px: 2.5, py: 2.5, animation: `${fadeIn} 0.35s ease` }}>
        <Stack spacing={0.3} sx={{ mb: 2.2 }}>
          <Typography sx={{ fontSize: '0.78rem', color: theme.textOnBgMuted, fontWeight: 700 }}>
            ❤️ Favoritas
          </Typography>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.6rem', color: theme.textOnBg, lineHeight: 1.1 }}>
            {collection?.name ?? 'Suas favoritas'}
          </Typography>
          {favorites.length > 0 && (
            <Typography sx={{ fontSize: '0.82rem', color: theme.textOnBgMuted, fontStyle: 'italic', mt: 0.3 }}>
              {favorites.length} cartinha{favorites.length !== 1 ? 's' : ''} que você mais ama
            </Typography>
          )}
        </Stack>

        {isLoading && (
          <LoadingState label="Carregando favoritas" accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} sx={{ minHeight: 320 }} />
        )}

        {!isLoading && favorites.length === 0 && (
          <Stack spacing={1.2} alignItems="center" justifyContent="center" sx={{ minHeight: 320, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '2.6rem' }}>💛</Typography>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.2rem', color: theme.textOnBg }}>
              Nenhuma favorita ainda
            </Typography>
            <Typography sx={{ fontSize: '0.84rem', color: theme.textOnBgMuted, maxWidth: 260 }}>
              Toque na estrelinha de uma cartinha pra guardá-la aqui.
            </Typography>
          </Stack>
        )}

        {!isLoading && favorites.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
            {favorites.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                r={rarities.find((x) => x.id === note.rarity)}
                t={types.find((x) => x.id === note.typeId)}
                unread={cid ? reader.unreadFor(cid).includes(note.id) : false}
                variant="grid"
                onSelect={(n) => { if (cid) reader.markViewed(cid, n.id); setSelected(n) }}
                onToggleFavorite={(n) => favoriteMutation.mutate({ id: n.id, favorite: !n.favorite })}
              />
            ))}
          </Box>
        )}
      </ScrollablePage>
      <NoteDetailDialog note={selected} rarities={rarities} types={types} onClose={() => setSelected(null)} />
    </Box>
  )
}
