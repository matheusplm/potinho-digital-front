import { useQueries, type UseQueryResult } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useUser } from '../../context/UserContext'
import { queryKeys, useCollectionsQuery } from '../../hooks/useNotes'
import { api } from '../../services/api'
import type { CollectionAccess, RarityConfig } from '../../types/note'
import { isCollectionOwner } from '../../utils/collectionAccess'
import { collectionSlug } from '../../utils/slug'
import {
  buildTodos, byObtainedDesc, hasAutoPack, isBonusPack, lastObtained, liveGreeting, ownedSince, readerName, readerStock, startOfYesterday,
  type CollectionSummary, type ReaderSummary,
} from './insights'

const MAX_READER_VIEWS = 8

function combineResults<T>(results: UseQueryResult<T>[]) {
  return { data: results.map((result) => result.data), pending: results.some((result) => result.isPending) }
}

export function useWriterHome() {
  const { user } = useUser()
  const { data: collections = [], isPending: collectionsPending } = useCollectionsQuery()
  const owned = useMemo(() => collections.filter((collection) => isCollectionOwner(collection, user?.id)), [collections, user?.id])

  const accesses = useQueries({
    queries: owned.map((c) => ({ queryKey: queryKeys.access(c.id), queryFn: () => api.listCollectionAccess(c.id) })),
    combine: combineResults,
  })
  const invites = useQueries({
    queries: owned.map((c) => ({ queryKey: queryKeys.invites(c.id), queryFn: () => api.listInvites(c.id), retry: false })),
    combine: combineResults,
  })
  const notes = useQueries({
    queries: owned.map((c) => ({ queryKey: queryKeys.notes(c.id), queryFn: () => api.getCollectionNotes(c.id) })),
    combine: combineResults,
  })
  const packs = useQueries({
    queries: owned.map((c) => ({ queryKey: queryKeys.packs(c.id), queryFn: () => api.getCollectionPacks(c.id) })),
    combine: combineResults,
  })
  const rarities = useQueries({
    queries: owned.map((c) => ({ queryKey: queryKeys.rarities(c.id), queryFn: () => api.getCollectionRarities(c.id) })),
    combine: combineResults,
  })

  const readerTargets = useMemo(() => {
    const targets: Array<{ index: number; access: CollectionAccess }> = []
    owned.forEach((_, index) => {
      for (const access of accesses.data[index] ?? []) targets.push({ index, access })
    })
    return targets
  }, [owned, accesses.data])
  const visibleTargets = useMemo(() => readerTargets.slice(0, MAX_READER_VIEWS), [readerTargets])

  const views = useQueries({
    queries: visibleTargets.map(({ index, access }) => ({
      queryKey: queryKeys.readerView(owned[index].id, access.email),
      queryFn: () => api.getReaderView(owned[index].id, access.email),
    })),
    combine: combineResults,
  })

  return useMemo(() => {
    const since = startOfYesterday()

    const collectionSummaries: CollectionSummary[] = owned.map((collection, index) => {
      const collectionNotes = (notes.data[index] ?? []).filter((note) => !note.disabledAt)
      return {
        collection,
        slug: collectionSlug(collection, collections),
        readers: accesses.data[index]?.length ?? 0,
        drafts: collectionNotes.filter((note) => note.status === 'preview'),
        released: collectionNotes.filter((note) => note.status !== 'preview').length,
        invites: invites.data[index] ?? [],
        hasAutoPack: hasAutoPack(packs.data[index] ?? []),
      }
    })

    const readers: ReaderSummary[] = []
    visibleTargets.forEach(({ index, access }, position) => {
      const view = views.data[position]
      if (!view) return
      const collection = owned[index]
      const collectionPacks = packs.data[index] ?? []
      readers.push({
        key: `${collection.id}:${access.email}`,
        email: access.email,
        name: readerName(access.email),
        collection,
        slug: collectionSummaries[index].slug,
        owned: view.owned,
        total: view.total,
        recent: ownedSince(view.items, since),
        lastObtainedAt: lastObtained(view.items),
        favorites: view.items.filter((item) => item.owned && item.favorite).sort(byObtainedDesc),
        stock: readerStock(view, collectionPacks, access),
        bonusPacks: collectionPacks.filter(isBonusPack),
        packOpens: view.packOpens ?? access.packOpens ?? {},
      })
    })
    readers.sort((a, b) => Date.parse(b.lastObtainedAt ?? '0') - Date.parse(a.lastObtainedAt ?? '0'))

    const raritiesByCollection = new Map<string, RarityConfig[]>(owned.map((collection, index) => [collection.id, rarities.data[index] ?? []]))

    return {
      loading: collectionsPending || accesses.pending || invites.pending || notes.pending || packs.pending || rarities.pending || views.pending,
      hiddenReaders: readerTargets.length - visibleTargets.length,
      collections: collectionSummaries,
      readers,
      raritiesByCollection,
      greeting: liveGreeting(readers, collectionSummaries),
      todos: buildTodos(readers, collectionSummaries),
    }
  }, [owned, collections, collectionsPending, accesses, invites, notes, packs, rarities, views, readerTargets.length, visibleTargets])
}
