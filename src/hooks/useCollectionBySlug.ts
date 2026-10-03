import { useEffect, useState } from 'react'
import { findCollectionBySlug } from '../utils/slug'
import { useCollectionsQuery } from './useNotes'

const MISSING_RETRIES = 3
const RETRY_DELAY_MS = 800

export function useCollectionBySlug(slug: string | undefined) {
  const { data: collections = [], isLoading, isSuccess, refetch } = useCollectionsQuery()
  const collection = findCollectionBySlug(collections, slug)
  const [retry, setRetry] = useState({ slug, count: 0 })
  const retries = retry.slug === slug ? retry.count : 0
  const missing = isSuccess && !!slug && !collection
  const waitingForList = missing && retries < MISSING_RETRIES

  useEffect(() => {
    if (!waitingForList) return
    const timer = window.setTimeout(() => {
      setRetry({ slug, count: retries + 1 })
      void refetch()
    }, RETRY_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [waitingForList, retries, slug, refetch])

  return { collections, collection, loading: isLoading || waitingForList }
}
