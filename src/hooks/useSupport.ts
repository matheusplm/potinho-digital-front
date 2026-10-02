import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useUser } from '../context/UserContext'
import { api } from '../services/api'
import type { MySupportTicket, SupportThread } from '../types/support'
import { queryKeys } from './useNotes'

const MY_TICKETS_KEY = queryKeys.mySupportTickets()
const MY_UNREAD_KEY = queryKeys.mySupportUnread()
const ticketKey = queryKeys.mySupportTicket

export function useMySupportTicketsQuery() {
  const { user } = useUser()
  return useQuery({
    queryKey: MY_TICKETS_KEY,
    queryFn: api.listMySupportTickets,
    enabled: !!user,
    refetchInterval: 30_000,
  })
}

export function useMySupportUnreadQuery() {
  const { user } = useUser()
  return useQuery({
    queryKey: MY_UNREAD_KEY,
    queryFn: api.mySupportUnread,
    enabled: !!user,
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
    retry: false,
    select: (data) => data.unread,
  })
}

export function useMySupportTicketQuery(id: string | null) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: ticketKey(id),
    queryFn: async () => {
      const thread = await api.getMySupportTicket(id as string)
      queryClient.setQueryData<MySupportTicket[]>(MY_TICKETS_KEY, (list) => list?.map((item) => (item.id === thread.ticket.id ? thread.ticket : item)))
      void queryClient.invalidateQueries({ queryKey: MY_UNREAD_KEY })
      return thread
    },
    enabled: !!id,
    refetchInterval: 15_000,
    retry: false,
  })
}

export function useMySupportActions() {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: ({ message, page }: { message: string; page?: string }) => api.createSupportTicket(message, page),
    onSuccess: (ticket) => {
      queryClient.setQueryData<MySupportTicket[]>(MY_TICKETS_KEY, (list) => [ticket, ...(list ?? [])])
    },
    onError: () => { void queryClient.invalidateQueries({ queryKey: MY_TICKETS_KEY }) },
  })

  const reply = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) => api.replySupportTicket(id, message),
    onSuccess: ({ ticket, message }) => {
      queryClient.setQueryData<SupportThread<MySupportTicket>>(ticketKey(ticket.id), (thread) => thread && { ticket, messages: [...thread.messages, message] })
      queryClient.setQueryData<MySupportTicket[]>(MY_TICKETS_KEY, (list) => [ticket, ...(list ?? []).filter((item) => item.id !== ticket.id)])
    },
    onError: (_error, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ticketKey(id) })
      void queryClient.invalidateQueries({ queryKey: MY_TICKETS_KEY })
    },
  })

  return { create, reply }
}
