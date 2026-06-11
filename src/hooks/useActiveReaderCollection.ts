import { useUser } from '../context/UserContext'
import { useReader } from '../context/ReaderContext'
import { isCollectionReader } from '../utils/collectionAccess'
import { useCollectionsQuery } from './useNotes'

/** Resolve a coleção ativa do leitor (multi-tenant) — usada pelas telas do footer. */
export function useActiveReaderCollection() {
  const { user, persona } = useUser()
  const { activeCollectionId } = useReader()
  const { data: collections = [], isLoading } = useCollectionsQuery()
  const isReader = persona === 'reader'
  const readerCollections = isReader ? collections.filter((c) => isCollectionReader(c, user?.id)) : []
  const collection = readerCollections.find((c) => c.id === activeCollectionId) ?? readerCollections[0]
  return { collection, isReader, isLoading }
}
