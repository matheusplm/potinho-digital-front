export type TicketStatus = 'open' | 'answered' | 'done'
export type MessageAuthor = 'user' | 'admin'

export interface SupportTicket {
  id: string
  userId: string
  name: string
  email: string
  status: TicketStatus
  page: string | null
  userAgent: string | null
  createdAt: string
  updatedAt: string
  lastMessageAt: string
  lastMessagePreview: string
  lastAuthor: MessageAuthor
  messageCount: number
  unreadForAdmin: boolean
  unreadForUser: boolean
}

export type MySupportTicket = Omit<SupportTicket, 'unreadForAdmin' | 'userAgent' | 'email' | 'userId' | 'name'>

export interface SupportChatMessage {
  id: string
  author: MessageAuthor
  authorName: string
  body: string
  createdAt: string
}

export interface SupportThread<T> {
  ticket: T
  messages: SupportChatMessage[]
}
