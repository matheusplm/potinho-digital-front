import { useUser } from '../context/UserContext'
import { useReader } from '../context/ReaderContext'
import { isCollectionReader } from '../utils/collectionAccess'
import { useCollectionsQuery } from './useNotes'

export function useActiveReaderCollection() {
  const { user, persona } = useUser()
  const { activeCollectionId } = useReader()
  const { data: collections = [], isLoading } = useCollectionsQuery()
  const isReader = persona === 'reader'
  const readerCollections = isReader ? collections.filter((c) => isCollectionReader(c, user?.id)) : []
  const collection = readerCollections.find((c) => c.id === activeCollectionId) ?? readerCollections[0]
  return { collection, isReader, isLoading }
}
