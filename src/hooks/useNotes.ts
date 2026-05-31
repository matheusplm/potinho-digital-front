import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import type { NoteFormData } from '../types/note'

export function useCollectionQuery() {
  return useQuery({ queryKey: ['collection'], queryFn: api.getCollection })
}

export function useStatsQuery() {
  return useQuery({ queryKey: ['stats'], queryFn: api.getStats })
}

export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, favorite }: { id: string; favorite: boolean }) => api.setFavorite(id, favorite),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['collection'] }) },
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
  return useQuery({ queryKey: ['pack-status'], queryFn: api.getPackStatus, refetchInterval: 30_000 })
}

export function usePackOddsQuery() {
  return useQuery({ queryKey: ['pack-odds'], queryFn: api.getPackOdds, staleTime: Infinity })
}

export function useDailyNoteStatusQuery() {
  return useQuery({ queryKey: ['daily-note-status'], queryFn: api.getDailyNoteStatus, refetchInterval: 30_000 })
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

export function useRaritiesQuery() {
  return useQuery({ queryKey: ['rarities'], queryFn: api.getRarities, staleTime: Infinity })
}

export function useTypesQuery() {
  return useQuery({ queryKey: ['types'], queryFn: api.getTypes, staleTime: Infinity })
}

export function useUpdateRarityMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.updateRarity(id, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['rarities'] }) },
  })
}

export function useUpdateTypeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.updateType(id, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['types'] }) },
  })
}

export function useNotesQuery() {
  return useQuery({ queryKey: ['notes'], queryFn: api.getNotes })
}

export function useCreateNoteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: NoteFormData) => api.createNote(data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['notes'] }) },
  })
}

export function useUpdateNoteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NoteFormData> }) =>
      api.updateNote(id, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['notes'] }) },
  })
}

export function useDeleteNoteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteNote(id),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['notes'] }) },
  })
}

export function usePartnersQuery() {
  return useQuery({ queryKey: ['partners'], queryFn: api.getPartners })
}
