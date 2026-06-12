import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiRequestError } from '../services/api'
import type { CollectionAchievementFormData, CollectionPackFormData, NoteFormData, PackStatusResponse, RarityConfig, NoteTypeConfig } from '../types/note'

export function useCollectionsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['collections'],
    queryFn: api.listCollections,
    enabled: options?.enabled ?? true,
  })
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

export function useCollectionNotesQuery(cid: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['col-notes', cid],
    queryFn: () => api.getCollectionNotes(cid),
    enabled: !!cid && (options?.enabled ?? true),
  })
}

export function useCreateCollectionNoteMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: NoteFormData) => api.createCollectionNote(cid, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['col-notes', cid] }) },
  })
}

export function useImportCollectionNotesMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (json: string) => api.importCollectionNotes(cid, json),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['col-notes', cid] }) },
  })
}

export function useUpdateCollectionNoteMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NoteFormData> }) =>
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

export function useCreateCollectionRarityMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof api.createCollectionRarity>[1]) => api.createCollectionRarity(cid, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['col-rarities', cid] }) },
  })
}

export function useUpdateCollectionRarityMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RarityConfig> }) =>
      api.updateCollectionRarity(cid, id, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['col-rarities', cid] }) },
  })
}

export function useDeleteCollectionRarityMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteCollectionRarity(cid, id),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['col-rarities', cid] }) },
  })
}

export function useCollectionTypesQuery(cid: string) {
  return useQuery({ queryKey: ['col-types', cid], queryFn: () => api.getCollectionTypes(cid), enabled: !!cid })
}

export function useCreateCollectionTypeMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof api.createCollectionType>[1]) => api.createCollectionType(cid, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['col-types', cid] }) },
  })
}

export function useUpdateCollectionTypeMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NoteTypeConfig> }) =>
      api.updateCollectionType(cid, id, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['col-types', cid] }) },
  })
}

export function useDeleteCollectionTypeMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteCollectionType(cid, id),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['col-types', cid] }) },
  })
}

export function useCollectionPacksQuery(cid: string) {
  return useQuery({ queryKey: ['col-packs', cid], queryFn: () => api.getCollectionPacks(cid), enabled: !!cid })
}

export function useCollectionPackStatusesQuery(cid: string, packIds: string[], enabled = true) {
  return useQuery({
    queryKey: ['col-pack-statuses', cid, packIds.join(',')],
    queryFn: async () => {
      const entries = await Promise.all(
        packIds.map(async (packId) => {
          try {
            const status = await api.getCollectionPackStatus(cid, packId)
            return [packId, status] as const
          } catch (error) {
            if (error instanceof ApiRequestError && [404, 405].includes(error.status)) {
              return [packId, null] as const
            }
            throw error
          }
        }),
      )
      return Object.fromEntries(entries) as Record<string, PackStatusResponse | null>
    },
    enabled: !!cid && packIds.length > 0 && enabled,
    refetchInterval: enabled ? 30_000 : false,
  })
}

export function useCreateCollectionPackMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CollectionPackFormData) => api.createCollectionPack(cid, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['col-packs', cid] }) },
  })
}

export function useUpdateCollectionPackMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CollectionPackFormData> }) =>
      api.updateCollectionPack(cid, id, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['col-packs', cid] }) },
  })
}

export function useDeleteCollectionPackMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteCollectionPack(cid, id),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['col-packs', cid] }) },
  })
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

export function useSetAccessPacksMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ email, packIds }: { email: string; packIds: string[] }) =>
      api.setAccessPacks(cid, email, packIds),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['col-access', cid] }) },
  })
}

export function useAddPackOpensMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ email, packId, opens }: { email: string; packId: string; opens: number }) =>
      api.addPackOpens(cid, email, packId, opens),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['col-access', cid] }) },
  })
}

export function useCollectionPlayQuery(cid: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['col-play', cid],
    queryFn: () => api.getCollectionPlay(cid),
    enabled: !!cid && (options?.enabled ?? true),
    refetchInterval: options?.enabled === false ? false : 30_000,
  })
}

export function useOpenCollectionDailyMutation(cid: string) {
  return useMutation({
    mutationFn: () => api.openCollectionDaily(cid),
  })
}

export function useOpenCollectionPackMutation(cid: string) {
  return useMutation({
    mutationFn: (packId: string) => api.openCollectionPack(cid, packId),
  })
}

export function useToggleCollectionFavoriteMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, favorite }: { id: string; favorite: boolean }) =>
      api.setCollectionFavorite(cid, id, favorite),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['col-play', cid] })
      void queryClient.invalidateQueries({ queryKey: ['reader-achievements', cid] })
    },
  })
}

export function useCollectionAchievementsQuery(cid: string) {
  return useQuery({ queryKey: ['col-achievements', cid], queryFn: () => api.getCollectionAchievements(cid), enabled: !!cid })
}

export function useReaderAchievementsQuery(cid: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['reader-achievements', cid],
    queryFn: () => api.getReaderAchievements(cid),
    enabled: !!cid && (options?.enabled ?? true),
  })
}

export function useCreateCollectionAchievementMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CollectionAchievementFormData) => api.createCollectionAchievement(cid, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['col-achievements', cid] }) },
  })
}

export function useUpdateCollectionAchievementMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CollectionAchievementFormData> }) =>
      api.updateCollectionAchievement(cid, id, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['col-achievements', cid] }) },
  })
}

export function useDeleteCollectionAchievementMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteCollectionAchievement(cid, id),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['col-achievements', cid] }) },
  })
}
