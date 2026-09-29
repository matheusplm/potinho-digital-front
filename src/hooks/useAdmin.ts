import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { api, ApiRequestError } from '../services/api'
import { clearAdminSession, useAdminSession } from '../services/adminSession'
import type { SupportMessage, SupportStatus } from '../types/admin'

export const ADMIN_QUERY_ROOT = 'admin'
const SUPPORT_LIST_KEY = [ADMIN_QUERY_ROOT, 'support']
export const SUPPORT_UNREAD_KEY = ['support-unread']

function reauthError() {
  return new ApiRequestError('Confirme sua identidade para continuar no modo admin.', 403, undefined, 'ADMIN_REAUTH_REQUIRED')
}

function useAdminQuery<T>(key: string, fetcher: (adminToken: string) => Promise<T>, staleTime: number) {
  const session = useAdminSession()
  const query = useQuery({
    queryKey: [ADMIN_QUERY_ROOT, key],
    queryFn: () => {
      if (!session) throw reauthError()
      return fetcher(session.token)
    },
    enabled: !!session,
    staleTime,
    retry: (count, error) => !(error instanceof ApiRequestError && [403, 429].includes(error.status)) && count < 2,
  })

  useEffect(() => {
    if (query.error instanceof ApiRequestError && query.error.code === 'ADMIN_REAUTH_REQUIRED') clearAdminSession(false)
  }, [query.error])

  return { ...query, session }
}

export function useAdminOverviewQuery() {
  return useAdminQuery('overview', api.adminOverview, 60_000)
}

export function useSupportMessagesQuery() {
  return useAdminQuery('support', api.adminSupportList, 15_000)
}

export function useSupportUnreadQuery() {
  const { user, persona } = useUser()
  return useQuery({
    queryKey: SUPPORT_UNREAD_KEY,
    queryFn: api.adminSupportUnread,
    enabled: !!user?.isAdmin,
    staleTime: 60_000,
    refetchInterval: persona === 'admin' ? 60_000 : 5 * 60_000,
    retry: false,
    select: (data) => data.unread,
  })
}

export function useSupportActions() {
  const session = useAdminSession()
  const queryClient = useQueryClient()
  const token = () => {
    if (!session) throw reauthError()
    return session.token
  }
  const refreshUnread = () => queryClient.invalidateQueries({ queryKey: SUPPORT_UNREAD_KEY })

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: SupportStatus }) => api.adminSupportStatus(token(), id, status),
    onSuccess: (updated) => {
      queryClient.setQueryData<SupportMessage[]>(SUPPORT_LIST_KEY, (list) => list?.map((item) => (item.id === updated.id ? updated : item)))
      void refreshUnread()
    },
  })

  const remove = useMutation({
    mutationFn: (id: string) => api.adminSupportDelete(token(), id).then(() => id),
    onSuccess: (id) => {
      queryClient.setQueryData<SupportMessage[]>(SUPPORT_LIST_KEY, (list) => list?.filter((item) => item.id !== id))
      void refreshUnread()
    },
  })

  return { setStatus, remove }
}
