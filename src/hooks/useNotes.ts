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

export function useCollectionsQuery() {
  return useQuery({ queryKey: ['collections'], queryFn: api.listCollections })
}

export function useCreateCollectionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createCollection,
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['collections'] }) },
  })
}

export function useUpdateCollectionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.updateCollection>[1] }) =>
      api.updateCollection(id, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['collections'] }) },
  })
}

export function useDeleteCollectionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteCollection,
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['collections'] }) },
  })
}

export function useCollectionNotesQuery(cid: string) {
  return useQuery({ queryKey: ['col-notes', cid], queryFn: () => api.getCollectionNotes(cid), enabled: !!cid })
}

export function useCreateCollectionNoteMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: import('../types/note').NoteFormData) => api.createCollectionNote(cid, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['col-notes', cid] }) },
  })
}

export function useUpdateCollectionNoteMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<import('../types/note').NoteFormData> }) =>
      api.updateCollectionNote(cid, id, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['col-notes', cid] }) },
  })
}

export function useDeleteCollectionNoteMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteCollectionNote(cid, id),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['col-notes', cid] }) },
  })
}

export function useCollectionRaritiesQuery(cid: string) {
  return useQuery({ queryKey: ['col-rarities', cid], queryFn: () => api.getCollectionRarities(cid), enabled: !!cid })
}

export function useCollectionTypesQuery(cid: string) {
  return useQuery({ queryKey: ['col-types', cid], queryFn: () => api.getCollectionTypes(cid), enabled: !!cid })
}

export function useCollectionAccessQuery(cid: string) {
  return useQuery({ queryKey: ['col-access', cid], queryFn: () => api.listCollectionAccess(cid), enabled: !!cid })
}

export function useGrantAccessMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (email: string) => api.grantAccess(cid, email),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['col-access', cid] }) },
  })
}

export function useRevokeAccessMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (email: string) => api.revokeAccess(cid, email),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['col-access', cid] }) },
  })
}

export function useCollectionPlayQuery(cid: string) {
  return useQuery({
    queryKey: ['col-play', cid],
    queryFn: () => api.getCollectionPlay(cid),
    enabled: !!cid,
    refetchInterval: 30_000,
  })
}

export function useOpenCollectionDailyMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.openCollectionDaily(cid),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['col-play', cid] }) },
  })
}
