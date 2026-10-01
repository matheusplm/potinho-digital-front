import { delay, http, HttpResponse } from 'msw'
import type { MessageAuthor, SupportChatMessage, SupportTicket } from '../types/support'
import { resolveUser } from './db'

interface MockTicket extends SupportTicket {
  messages: SupportChatMessage[]
}

const TEAM_NAME = 'Equipe Potinho'
let sequence = 0

function newId(at = Date.now()) {
  sequence += 1
  return `${at.toString(36).padStart(9, '0')}${sequence.toString(16).padStart(12, '0')}`
}

function minutesAgo(minutes: number) {
  return Date.now() - minutes * 60_000
}

function message(author: MessageAuthor, authorName: string, body: string, at: number): SupportChatMessage {
  return { id: newId(at), author, authorName, body, createdAt: new Date(at).toISOString() }
}

function seedTicket(base: Pick<SupportTicket, 'userId' | 'name' | 'email' | 'page' | 'userAgent'>, messages: SupportChatMessage[], extra: Partial<SupportTicket> = {}): MockTicket {
  const first = messages[0]
  const last = messages[messages.length - 1]
  return {
    ...base,
    id: newId(Date.parse(first.createdAt)),
    status: last.author === 'admin' ? 'answered' : 'open',
    createdAt: first.createdAt,
    updatedAt: last.createdAt,
    lastMessageAt: last.createdAt,
    lastMessagePreview: last.body.slice(0, 140),
    lastAuthor: last.author,
    messageCount: messages.length,
    unreadForAdmin: last.author === 'user',
    unreadForUser: false,
    messages,
    ...extra,
  }
}

const tickets: MockTicket[] = [
  seedTicket(
    { userId: 'mock-camila', name: 'Camila Souza', email: 'camila.souza@gmail.com', page: '/colecoes/nosso-cantinho/gerenciar', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)' },
    [message('user', 'Camila Souza', 'Oi! Mandei o convite pro meu namorado mas ele disse que não chegou nada. Já pedi pra olhar o spam também 😕', minutesAgo(40))],
  ),
  seedTicket(
    { userId: 'mock-diego', name: 'Diego', email: 'diego.m@outlook.com', page: '/home', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    [
      message('user', 'Diego', 'Seria muito legal poder agendar um pacotinho pra abrir só no dia do aniversário!', minutesAgo(26 * 60)),
      message('admin', TEAM_NAME, 'Que ideia boa, Diego! Anotei aqui pra próxima leva de novidades 💙', minutesAgo(20 * 60)),
    ],
    { unreadForAdmin: false },
  ),
  seedTicket(
    { userId: 'user_tester', name: 'Teste', email: 'teste@potinho.app', page: '/home', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    [
      message('user', 'Teste', 'Como faço pra mandar um mimo pra alguém?', minutesAgo(5 * 60)),
      message('admin', TEAM_NAME, 'Oi! Na coleção, vai em Acesso e toca no pacotinho bônus ao lado do nome da pessoa. Dá pra mandar até 10 aberturas por vez 🎁', minutesAgo(90)),
    ],
    { unreadForAdmin: false, unreadForUser: true },
  ),
]

function authUser(request: Request) {
  const header = request.headers.get('Authorization')
  return resolveUser(header?.startsWith('Bearer ') ? header.slice(7) : null)
}

function summary(ticket: MockTicket): SupportTicket {
  const copy: Partial<MockTicket> = { ...ticket }
  delete copy.messages
  return copy as SupportTicket
}

function mine(ticket: SupportTicket) {
  const copy: Partial<SupportTicket> = { ...ticket }
  delete copy.unreadForAdmin
  delete copy.userAgent
  delete copy.email
  delete copy.userId
  delete copy.name
  return copy
}

function append(ticket: MockTicket, author: MessageAuthor, body: string) {
  const entry = message(author, author === 'admin' ? TEAM_NAME : ticket.name, body, Date.now())
  ticket.messages.push(entry)
  ticket.status = author === 'admin' ? 'answered' : 'open'
  ticket.updatedAt = entry.createdAt
  ticket.lastMessageAt = entry.createdAt
  ticket.lastMessagePreview = body.slice(0, 140)
  ticket.lastAuthor = author
  ticket.messageCount = ticket.messages.length
  ticket.unreadForAdmin = author === 'user'
  ticket.unreadForUser = author === 'admin'
  return entry
}

const byRecent = (a: SupportTicket, b: SupportTicket) => b.lastMessageAt.localeCompare(a.lastMessageAt)

export function forgetSupportOf(userId: string) {
  for (let i = tickets.length - 1; i >= 0; i--) if (tickets[i].userId === userId) tickets.splice(i, 1)
}

export function supportHandlers(adminDenied: (request: Request) => Response | null, isAdmin: (request: Request) => Response | null) {
  return [
    http.get('/api/support/tickets', async ({ request }) => {
      await delay(150)
      const user = authUser(request)
      if (!user) return HttpResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
      return HttpResponse.json(tickets.filter((t) => t.userId === user.id).sort(byRecent).map((t) => mine(summary(t))))
    }),

    http.get('/api/support/unread', async ({ request }) => {
      const user = authUser(request)
      if (!user) return HttpResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
      return HttpResponse.json({ unread: tickets.filter((t) => t.userId === user.id && t.unreadForUser).length })
    }),

    http.get('/api/support/tickets/:id', async ({ request, params }) => {
      await delay(150)
      const user = authUser(request)
      if (!user) return HttpResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
      const ticket = tickets.find((t) => t.id === params.id && t.userId === user.id)
      if (!ticket) return HttpResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
      ticket.unreadForUser = false
      return HttpResponse.json({ ticket: mine(summary(ticket)), messages: ticket.messages })
    }),

    http.post('/api/support/tickets', async ({ request }) => {
      await delay(400)
      const user = authUser(request)
      if (!user) return HttpResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
      const { message: body, page } = (await request.json()) as { message: string; page?: string }
      if (body.trim().length < 5) return HttpResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 })
      const ticket = seedTicket(
        { userId: user.id, name: user.name, email: user.email, page: page ?? null, userAgent: navigator.userAgent },
        [message('user', user.name, body.trim(), Date.now())],
      )
      tickets.unshift(ticket)
      return HttpResponse.json(mine(summary(ticket)), { status: 201 })
    }),

    http.post('/api/support/tickets/:id/messages', async ({ request, params }) => {
      await delay(250)
      const user = authUser(request)
      if (!user) return HttpResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
      const ticket = tickets.find((t) => t.id === params.id && t.userId === user.id)
      if (!ticket) return HttpResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
      const { message: body } = (await request.json()) as { message: string }
      const entry = append(ticket, 'user', body.trim())
      return HttpResponse.json({ ticket: mine(summary(ticket)), message: entry }, { status: 201 })
    }),

    http.get('/api/admin/support/unread', async ({ request }) => {
      const denied = isAdmin(request)
      if (denied) return denied
      return HttpResponse.json({ unread: tickets.filter((t) => t.unreadForAdmin).length })
    }),

    http.get('/api/admin/support', async ({ request }) => {
      await delay(250)
      const denied = adminDenied(request)
      if (denied) return denied
      return HttpResponse.json([...tickets].sort(byRecent).map(summary))
    }),

    http.get('/api/admin/support/:id', async ({ request, params }) => {
      await delay(150)
      const denied = adminDenied(request)
      if (denied) return denied
      const ticket = tickets.find((t) => t.id === params.id)
      if (!ticket) return HttpResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
      ticket.unreadForAdmin = false
      return HttpResponse.json({ ticket: summary(ticket), messages: ticket.messages })
    }),

    http.post('/api/admin/support/:id/messages', async ({ request, params }) => {
      await delay(250)
      const denied = adminDenied(request)
      if (denied) return denied
      const ticket = tickets.find((t) => t.id === params.id)
      if (!ticket) return HttpResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
      const { message: body } = (await request.json()) as { message: string }
      const entry = append(ticket, 'admin', body.trim())
      return HttpResponse.json({ ticket: summary(ticket), message: entry }, { status: 201 })
    }),

    http.patch('/api/admin/support/:id', async ({ request, params }) => {
      await delay(150)
      const denied = adminDenied(request)
      if (denied) return denied
      const ticket = tickets.find((t) => t.id === params.id)
      if (!ticket) return HttpResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
      const { status } = (await request.json()) as { status: 'open' | 'done' }
      ticket.status = status === 'done' ? 'done' : ticket.lastAuthor === 'admin' ? 'answered' : 'open'
      ticket.unreadForAdmin = false
      ticket.updatedAt = new Date().toISOString()
      return HttpResponse.json(summary(ticket))
    }),

    http.delete('/api/admin/support/:id', async ({ request, params }) => {
      const denied = adminDenied(request)
      if (denied) return denied
      const index = tickets.findIndex((t) => t.id === params.id)
      if (index >= 0) tickets.splice(index, 1)
      return HttpResponse.json({ ok: true })
    }),
  ]
}
