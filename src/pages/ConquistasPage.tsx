import { Box } from '@mui/material'
import { Navigate } from 'react-router-dom'
import { LoadingState } from '../components/ui'
import { useBackground } from '../context/BackgroundContext'
import { useActiveReaderCollection } from '../hooks/useActiveReaderCollection'
import { useCollectionsQuery } from '../hooks/useNotes'
import { collectionSlug } from '../utils/slug'

export function ConquistasPage() {
  const { theme } = useBackground()
  const { collection, isLoading } = useActiveReaderCollection()
  const { data: collections = [] } = useCollectionsQuery()

  if (isLoading) {
    return (
      <Box sx={{ height: '100%', background: theme.gradient }}>
        <LoadingState label="Abrindo conquistas" accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} sx={{ minHeight: 320 }} />
      </Box>
    )
  }
  if (!collection) return <Navigate to="/home" replace />
  return <Navigate to={`/colecoes/${collectionSlug(collection, collections)}?aba=conquistas`} replace />
}
