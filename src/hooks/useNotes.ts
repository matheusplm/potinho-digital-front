import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiRequestError } from '../services/api'
import type { CollectionAchievementFormData, CollectionPackFormData, NoteFormData, NotifyConfig, PackStatusResponse, RarityConfig, NoteTypeConfig } from '../types/note'

export const queryKeys = {
  collections: () => ['collections'] as const,
  collectionsTrash: () => ['collections-trash'] as const,
  notes: (cid: string) => ['col-notes', cid] as const,
  rarities: (cid: string) => ['col-rarities', cid] as const,
  types: (cid: string) => ['col-types', cid] as const,
  packs: (cid: string) => ['col-packs', cid] as const,
  packStatuses: (cid: string, packIds: string[]) => ['col-pack-statuses', cid, packIds.join(',')] as const,
  access: (cid: string) => ['col-access', cid] as const,
  readerView: (cid: string, email: string) => ['reader-view', cid, email] as const,
  play: (cid: string) => ['col-play', cid] as const,
  achievements: (cid: string) => ['col-achievements', cid] as const,
  readerAchievements: (cid: string) => ['reader-achievements', cid] as const,
  invites: (cid: string) => ['col-invites', cid] as const,
  myNotifications: () => ['my-notifications'] as const,
  collectionNotifications: (cid: string) => ['col-notifications', cid] as const,
}

export function useCollectionsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.collections(),
    queryFn: api.listCollections,
    enabled: options?.enabled ?? true,
  })
}

export function useCreateCollectionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createCollection,
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.collections() }) },
  })
}

export function useUpdateCollectionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.updateCollection>[1] }) =>
      api.updateCollection(id, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.collections() }) },
  })
}

export function useDeleteCollectionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, force, confirmName }: { id: string; force?: boolean; confirmName?: string }) =>
      api.deleteCollection(id, { force, confirmName }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.collections() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.collectionsTrash() })
    },
  })
}

export function usePendingInvitesQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['pending-invites'],
    queryFn: () => api.getMyPendingInvites(),
    staleTime: 60_000,
    enabled: options?.enabled ?? true,
  })
}

export function useCollectionTrashQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.collectionsTrash(),
    queryFn: async () => (await api.getCollectionTrash()).item,
    enabled: options?.enabled ?? true,
  })
}

export function useRestoreCollectionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.restoreCollection(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.collections() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.collectionsTrash() })
    },
  })
}

export function useCollectionNotesQuery(cid: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.notes(cid),
    queryFn: () => api.getCollectionNotes(cid),
    enabled: !!cid && (options?.enabled ?? true),
  })
}

export function useCreateCollectionNoteMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: NoteFormData) => api.createCollectionNote(cid, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.notes(cid) }) },
  })
}

export function useImportCollectionNotesMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (json: string) => api.importCollectionNotes(cid, json),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.notes(cid) }) },
  })
}

export function useUpdateCollectionNoteMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NoteFormData> }) =>
      api.updateCollectionNote(cid, id, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.notes(cid) }) },
  })
}

export function useDisableCollectionNoteMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.disableCollectionNote(cid, id),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.notes(cid) }) },
  })
}

export function useRestoreCollectionNoteMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.restoreCollectionNote(cid, id),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.notes(cid) }) },
  })
}

export function usePermanentlyDeleteCollectionNoteMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.permanentlyDeleteCollectionNote(cid, id),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.notes(cid) }) },
  })
}

export function useCollectionRaritiesQuery(cid: string) {
  return useQuery({ queryKey: queryKeys.rarities(cid), queryFn: () => api.getCollectionRarities(cid), enabled: !!cid })
}

export function useCreateCollectionRarityMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof api.createCollectionRarity>[1]) => api.createCollectionRarity(cid, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.rarities(cid) }) },
  })
}

export function useUpdateCollectionRarityMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RarityConfig> }) =>
      api.updateCollectionRarity(cid, id, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.rarities(cid) }) },
  })
}

export function useDeleteCollectionRarityMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteCollectionRarity(cid, id),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.rarities(cid) }) },
  })
}

export function useImportCollectionRaritiesMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (json: string) => api.importCollectionRarities(cid, json),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.rarities(cid) }) },
  })
}

export function useCollectionTypesQuery(cid: string) {
  return useQuery({ queryKey: queryKeys.types(cid), queryFn: () => api.getCollectionTypes(cid), enabled: !!cid })
}

export function useCreateCollectionTypeMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof api.createCollectionType>[1]) => api.createCollectionType(cid, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.types(cid) }) },
  })
}

export function useUpdateCollectionTypeMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NoteTypeConfig> }) =>
      api.updateCollectionType(cid, id, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.types(cid) }) },
  })
}

export function useDeleteCollectionTypeMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteCollectionType(cid, id),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.types(cid) }) },
  })
}

export function useImportCollectionTypesMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (json: string) => api.importCollectionTypes(cid, json),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.types(cid) }) },
  })
}

export function useCollectionPacksQuery(cid: string) {
  return useQuery({ queryKey: queryKeys.packs(cid), queryFn: () => api.getCollectionPacks(cid), enabled: !!cid })
}

export function useCollectionPackStatusesQuery(cid: string, packIds: string[], enabled = true) {
  return useQuery({
    queryKey: queryKeys.packStatuses(cid, packIds),
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
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.packs(cid) }) },
  })
}

export function useUpdateCollectionPackMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CollectionPackFormData> }) =>
      api.updateCollectionPack(cid, id, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.packs(cid) }) },
  })
}

export function useDeleteCollectionPackMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteCollectionPack(cid, id),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.packs(cid) }) },
  })
}

export function useCollectionAccessQuery(cid: string) {
  return useQuery({ queryKey: queryKeys.access(cid), queryFn: () => api.listCollectionAccess(cid), enabled: !!cid })
}

export function useGrantAccessMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (email: string) => api.grantAccess(cid, email),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.access(cid) }) },
  })
}

export function useRevokeAccessMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (email: string) => api.revokeAccess(cid, email),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.access(cid) }) },
  })
}

export function useSetAccessPacksMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ email, packIds }: { email: string; packIds: string[] }) =>
      api.setAccessPacks(cid, email, packIds),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.access(cid) }) },
  })
}

export function useReaderViewQuery(cid: string, email: string | null) {
  return useQuery({
    queryKey: queryKeys.readerView(cid, email ?? ''),
    queryFn: () => api.getReaderView(cid, email!),
    enabled: !!cid && !!email,
  })
}

export function useAddPackOpensMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ email, packId, opens, notify }: { email: string; packId: string; opens: number; notify?: NotifyConfig }) =>
      api.addPackOpens(cid, email, packId, opens, notify),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.access(cid) }) },
  })
}

export function useReleaseNotesMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ noteIds, notify }: { noteIds: string[]; notify?: NotifyConfig }) =>
      api.releaseCollectionNotes(cid, noteIds, notify),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes(cid) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.play(cid) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.collectionNotifications(cid) })
    },
  })
}

export function useMyNotificationsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.myNotifications(),
    queryFn: () => api.getMyNotifications(),
    enabled: options?.enabled ?? true,
    refetchInterval: 5 * 60_000,
  })
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ cid, notificationId }: { cid: string; notificationId: string }) =>
      api.markNotificationRead(cid, notificationId),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.myNotifications() }) },
  })
}

export function useCollectionNotificationsQuery(cid: string) {
  return useQuery({
    queryKey: queryKeys.collectionNotifications(cid),
    queryFn: () => api.getCollectionNotifications(cid),
    enabled: !!cid,
  })
}

export function useCollectionPlayQuery(cid: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.play(cid),
    queryFn: () => api.getCollectionPlay(cid),
    enabled: !!cid && (options?.enabled ?? true),
    refetchInterval: (query) => {
      if (options?.enabled === false) return false
      if (query.state.data?.daily.canOpen) return false
      return 30 * 60_000
    },
  })
}

export function useOpenCollectionPackMutation(cid: string) {
  return useMutation({
    mutationFn: ({ packId, count = 1 }: { packId: string; count?: number }) =>
      api.openCollectionPack(cid, packId, count),
  })
}

export function useToggleCollectionFavoriteMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, favorite }: { id: string; favorite: boolean }) =>
      api.setCollectionFavorite(cid, id, favorite),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.play(cid) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.readerAchievements(cid) })
    },
  })
}

export function useCollectionAchievementsQuery(cid: string) {
  return useQuery({ queryKey: queryKeys.achievements(cid), queryFn: () => api.getCollectionAchievements(cid), enabled: !!cid })
}

export function useReaderAchievementsQuery(cid: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.readerAchievements(cid),
    queryFn: () => api.getReaderAchievements(cid),
    enabled: !!cid && (options?.enabled ?? true),
  })
}

export function useCreateCollectionAchievementMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CollectionAchievementFormData) => api.createCollectionAchievement(cid, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.achievements(cid) }) },
  })
}

export function useUpdateCollectionAchievementMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CollectionAchievementFormData> }) =>
      api.updateCollectionAchievement(cid, id, data),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.achievements(cid) }) },
  })
}

export function useDeleteCollectionAchievementMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteCollectionAchievement(cid, id),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.achievements(cid) }) },
  })
}

export function useCollectionInvitesQuery(cid: string) {
  return useQuery({
    queryKey: queryKeys.invites(cid),
    queryFn: () => api.listInvites(cid),
    enabled: !!cid,
  })
}

export function useSendInviteMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (email: string) => api.sendInvite(cid, email),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.access(cid) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.invites(cid) })
    },
  })
}

export function useCancelInviteMutation(cid: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (email: string) => api.cancelInvite(cid, email),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.invites(cid) }) },
  })
}
