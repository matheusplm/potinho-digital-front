import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { api, ApiRequestError } from '../services/api'
import { clearAdminSession, useAdminSession } from '../services/adminSession'
import type { SupportThread, SupportTicket } from '../types/support'

export const ADMIN_QUERY_ROOT = 'admin'
const SUPPORT_LIST_KEY = [ADMIN_QUERY_ROOT, 'support']
export const SUPPORT_UNREAD_KEY = ['support-unread']

function reauthError() {
  return new ApiRequestError('Confirme sua identidade para continuar no modo admin.', 403, undefined, 'ADMIN_REAUTH_REQUIRED')
}

function useAdminQuery<T>(key: string, fetcher: (adminToken: string) => Promise<T>, staleTime: number, refetchInterval?: number) {
  const session = useAdminSession()
  const query = useQuery({
    queryKey: [ADMIN_QUERY_ROOT, key],
    queryFn: () => {
      if (!session) throw reauthError()
      return fetcher(session.token)
    },
    enabled: !!session,
    staleTime,
    refetchInterval,
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

export function useSupportTicketsQuery() {
  return useAdminQuery('support', api.adminSupportList, 15_000, 30_000)
}

export function useSupportTicketQuery(id: string | null) {
  const session = useAdminSession()
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: [ADMIN_QUERY_ROOT, 'support-ticket', id],
    queryFn: async () => {
      if (!session) throw reauthError()
      const thread = await api.adminSupportTicket(session.token, id as string)
      queryClient.setQueryData<SupportTicket[]>(SUPPORT_LIST_KEY, (list) => list?.map((item) => (item.id === thread.ticket.id ? thread.ticket : item)))
      void queryClient.invalidateQueries({ queryKey: SUPPORT_UNREAD_KEY })
      return thread
    },
    enabled: !!session && !!id,
    refetchInterval: 15_000,
    retry: false,
  })
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
  const syncTicket = (updated: SupportTicket) => {
    queryClient.setQueryData<SupportTicket[]>(SUPPORT_LIST_KEY, (list) => list?.map((item) => (item.id === updated.id ? updated : item)))
    queryClient.setQueryData<SupportThread<SupportTicket>>([ADMIN_QUERY_ROOT, 'support-ticket', updated.id], (thread) => thread && { ...thread, ticket: updated })
    void queryClient.invalidateQueries({ queryKey: SUPPORT_UNREAD_KEY })
  }

  const resyncTicket = (id: string) => {
    void queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_ROOT, 'support-ticket', id] })
    void queryClient.invalidateQueries({ queryKey: SUPPORT_LIST_KEY })
  }

  const reply = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) => api.adminSupportReply(token(), id, message),
    onSuccess: ({ ticket, message }) => {
      queryClient.setQueryData<SupportThread<SupportTicket>>([ADMIN_QUERY_ROOT, 'support-ticket', ticket.id], (thread) => thread && { ticket, messages: [...thread.messages, message] })
      syncTicket(ticket)
    },
    onError: (_error, { id }) => resyncTicket(id),
  })

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'open' | 'done' }) => api.adminSupportStatus(token(), id, status),
    onSuccess: syncTicket,
    onError: (_error, { id }) => resyncTicket(id),
  })

  const remove = useMutation({
    mutationFn: (id: string) => api.adminSupportDelete(token(), id).then(() => id),
    onSuccess: (id) => {
      queryClient.setQueryData<SupportTicket[]>(SUPPORT_LIST_KEY, (list) => list?.filter((item) => item.id !== id))
      queryClient.removeQueries({ queryKey: [ADMIN_QUERY_ROOT, 'support-ticket', id] })
      void queryClient.invalidateQueries({ queryKey: SUPPORT_UNREAD_KEY })
    },
    onError: () => { void queryClient.invalidateQueries({ queryKey: SUPPORT_LIST_KEY }) },
  })

  return { reply, setStatus, remove }
}
