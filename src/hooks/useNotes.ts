import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'

export function useCollectionQuery() {
  return useQuery({
    queryKey: ['collection'],
    queryFn: api.getCollection,
  })
}

export function useStatsQuery() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
  })
}

export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, favorite }: { id: string; favorite: boolean }) =>
      api.setFavorite(id, favorite),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['collection'] })
    },
  })
}

export function useOpenPackMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.openPack,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['collection'] })
      void queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function usePackStatusQuery() {
  return useQuery({
    queryKey: ['pack-status'],
    queryFn: api.getPackStatus,
    refetchInterval: 30_000,
  })
}

export function usePackOddsQuery() {
  return useQuery({
    queryKey: ['pack-odds'],
    queryFn: api.getPackOdds,
    staleTime: Infinity, // odds não mudam em runtime
  })
}

export function useDailyNoteStatusQuery() {
  return useQuery({
    queryKey: ['daily-note-status'],
    queryFn: api.getDailyNoteStatus,
    refetchInterval: 30_000,
  })
}

export function useOpenDailyNoteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.openDailyNote,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['collection'] })
      void queryClient.invalidateQueries({ queryKey: ['stats'] })
      void queryClient.invalidateQueries({ queryKey: ['daily-note-status'] })
      void queryClient.invalidateQueries({ queryKey: ['pack-status'] })
    },
  })
}
