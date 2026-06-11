import type { Collection } from '../types/note'
import type { UserRole } from '../context/UserContext'

export function isCollectionOwner(collection: Collection, userId?: string): boolean {
  if (!userId) return false
  return collection.ownerId === userId
}

export function isCollectionReader(collection: Collection, userId?: string): boolean {
  return !!userId && !isCollectionOwner(collection, userId)
}

export function partitionCollections(collections: Collection[], userId?: string) {
  const owned = collections.filter((c) => isCollectionOwner(c, userId))
  const reader = collections.filter((c) => isCollectionReader(c, userId))
  return { owned, reader }
}

export function personaStorageKey(userId: string) {
  return `potinho-persona-${userId}`
}

export function resolvePersona(
  collections: Collection[],
  userId: string,
  apiRole: UserRole,
): UserRole {
  const { owned, reader } = partitionCollections(collections, userId)
  const canWriter = owned.length > 0 || (reader.length === 0 && apiRole === 'writer')
  const canReader = reader.length > 0

  try {
    const saved = localStorage.getItem(personaStorageKey(userId)) as UserRole | null
    if (saved === 'reader' && canReader) return 'reader'
    if (saved === 'writer' && canWriter) return 'writer'
  } catch {
    void 0
  }

  if (reader.length > 0 && owned.length === 0) return 'reader'
  if (owned.length > 0) return 'writer'
  return apiRole
}

export function personaCapabilities(
  collections: Collection[],
  userId: string | undefined,
  apiRole: UserRole,
) {
  const { owned, reader } = partitionCollections(collections, userId)
  const canWriter = owned.length > 0 || (!!userId && reader.length === 0 && apiRole === 'writer')
  const canReader = reader.length > 0
  const canSwitch = canWriter && canReader
  return { owned, reader, canWriter, canReader, canSwitch }
}
