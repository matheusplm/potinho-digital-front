import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import ReplayIcon from '@mui/icons-material/Replay'
import { Box, IconButton, ListItemIcon, Menu, MenuItem, Stack, Typography, useMediaQuery } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SupportChat, SupportComposer, TicketStatusChip } from '../../components/support/SupportChat'
import { ConfirmDeleteDialog, toast } from '../../components/ui'
import { useBackground } from '../../context/BackgroundContext'
import { font, radius } from '../../design-system'
import { SUPPORT_UNREAD_KEY, useSupportActions, useSupportTicketQuery, useSupportTicketsQuery } from '../../hooks/useAdmin'
import type { SupportTicket } from '../../types/admin'
import { withAlpha } from '../../utils/colorUtils'
import { AdminFrame, Pill } from './AdminShell'
import { SkeletonBlock } from './charts'
import { timeAgo } from './format'
import { Avatar, FilterChips, type FilterOption } from './Panel'
import { useSurface } from './surface'

type InboxFilter = 'waiting' | 'answered' | 'done' | 'all'

const FILTERS: Array<{ id: InboxFilter; label: string; test: (ticket: SupportTicket) => boolean }> = [
  { id: 'waiting', label: 'Esperando você', test: (ticket) => ticket.status === 'open' },
  { id: 'answered', label: 'Respondidas', test: (ticket) => ticket.status === 'answered' },
  { id: 'done', label: 'Resolvidas', test: (ticket) => ticket.status === 'done' },
  { id: 'all', label: 'Todas', test: () => true },
]

const EMPTY: Record<InboxFilter, string> = {
  waiting: 'Ninguém esperando resposta. Tudo tranquilo ✨',
  answered: 'Nenhuma conversa aguardando a pessoa.',
  done: 'Nenhuma conversa resolvida ainda.',
  all: 'Ninguém escreveu ainda.',
}

function device(userAgent: string | null): string | null {
  if (!userAgent) return null
  if (/iPhone|iPad/i.test(userAgent)) return 'iPhone'
  if (/Android/i.test(userAgent)) return 'Android'
  if (/Windows/i.test(userAgent)) return 'Windows'
  if (/Macintosh|Mac OS/i.test(userAgent)) return 'Mac'
  if (/Linux/i.test(userAgent)) return 'Linux'
  return null
}

function TicketRow({ ticket, active, onClick }: { ticket: SupportTicket; active: boolean; onClick: () => void }) {
  const { theme } = useBackground()
  const unread = ticket.unreadForAdmin
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer', display: 'flex', gap: 1.2, alignItems: 'flex-start',
        px: 1.3, py: 1.2, borderRadius: radius.lg,
        background: active ? withAlpha(theme.accent, 12) : 'transparent',
        border: `1px solid ${active ? withAlpha(theme.accent, 35) : 'transparent'}`,
        transition: 'background 0.15s',
        '&:hover': { background: active ? withAlpha(theme.accent, 14) : theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)' },
        '&:focus-visible': { outline: `2px solid ${theme.accent}`, outlineOffset: 2 },
      }}
    >
      <Avatar id={ticket.userId} name={ticket.name} tone="none" size={36} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="baseline" spacing={1}>
          <Typography sx={{ flex: 1, minWidth: 0, fontSize: '0.9rem', fontWeight: unread ? 850 : 700, color: theme.textOnBg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ticket.name}
          </Typography>
          <Typography variant="xs" sx={{ color: unread ? theme.accent : theme.textOnBgMuted, fontWeight: unread ? 800 : 500, flexShrink: 0 }}>
            {timeAgo(ticket.lastMessageAt)}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mt: 0.2 }}>
          <Typography sx={{
            flex: 1, minWidth: 0, fontSize: '0.82rem', lineHeight: 1.4, color: unread ? theme.textOnBg : theme.textOnBgMuted, fontWeight: unread ? 700 : 400,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {ticket.lastAuthor === 'admin' ? 'Você: ' : ''}{ticket.lastMessagePreview}
          </Typography>
          {unread && <Box sx={{ width: 9, height: 9, borderRadius: '50%', background: theme.accent, flexShrink: 0 }} />}
        </Stack>
      </Box>
    </Box>
  )
}

function ThreadView({ ticketId, onBack, onDeleted }: { ticketId: string; onBack?: () => void; onDeleted: () => void }) {
  const { theme } = useBackground()
  const { data: thread, isLoading } = useSupportTicketQuery(ticketId)
  const { reply, setStatus, remove } = useSupportActions()
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const ticket = thread?.ticket
  const origin = ticket ? [ticket.page, device(ticket.userAgent)].filter(Boolean).join(' · ') : ''
  const mailto = ticket ? `mailto:${ticket.email}?subject=${encodeURIComponent('Re: sua conversa com o Potinho Digital')}` : undefined

  const send = async (message: string) => {
    try {
      await reply.mutateAsync({ id: ticketId, message })
    } catch (err) {
      toast.error((err as Error).message || 'Não deu pra enviar.')
      throw err
    }
  }

  const toggleStatus = () => {
    if (!ticket) return
    setStatus.mutate({ id: ticketId, status: ticket.status === 'done' ? 'open' : 'done' }, { onError: (err) => toast.error(err.message) })
  }

  return (
    <>
      <SupportChat
        messages={thread?.messages ?? []}
        viewer="admin"
        loading={isLoading}
        header={(
          <Stack direction="row" alignItems="center" spacing={1.2} sx={{ px: { xs: 1, md: 1.8 }, py: 1.2, borderBottom: `1px solid ${theme.surfaceBorder}` }}>
            {onBack && (
              <IconButton aria-label="Voltar para a caixa de entrada" onClick={onBack} sx={{ color: theme.textOnBg }}>
                <ArrowBackIcon />
              </IconButton>
            )}
            {ticket && <Avatar id={ticket.userId} name={ticket.name} tone="none" size={38} />}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={0.8} sx={{ flexWrap: 'wrap', rowGap: 0.4 }}>
                <Typography sx={{ fontWeight: 850, color: theme.textOnBg, fontSize: '0.98rem', lineHeight: 1.25, overflowWrap: 'anywhere' }}>
                  {ticket?.name ?? '...'}
                </Typography>
                {ticket && <TicketStatusChip status={ticket.status} viewer="admin" />}
              </Stack>
              <Typography variant="xs" sx={{ display: 'block', color: theme.textOnBgMuted, overflowWrap: 'anywhere' }}>
                {ticket?.email}{origin ? ` · ${origin}` : ''}
              </Typography>
            </Box>
            {ticket && (
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Pill onClick={toggleStatus} disabled={setStatus.isPending} tone={ticket.status === 'done' ? undefined : '#22c55e'} label={ticket.status === 'done' ? 'Reabrir conversa' : 'Marcar como resolvida'}>
                  {ticket.status === 'done' ? <ReplayIcon /> : <CheckCircleOutlineIcon />}
                  {ticket.status === 'done' ? 'reabrir' : 'resolver'}
                </Pill>
              </Box>
            )}
            <IconButton aria-label="Mais ações" onClick={(event) => setMenuAnchor(event.currentTarget)} sx={{ color: theme.textOnBgMuted }}>
              <MoreHorizIcon />
            </IconButton>
          </Stack>
        )}
        footer={<SupportComposer onSend={send} sending={reply.isPending} placeholder="Responder como Equipe Potinho..." />}
      />
      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        {ticket && (
          <MenuItem onClick={() => { setMenuAnchor(null); toggleStatus() }} sx={{ display: { sm: 'none' } }}>
            <ListItemIcon>{ticket.status === 'done' ? <ReplayIcon fontSize="small" /> : <CheckCircleOutlineIcon fontSize="small" />}</ListItemIcon>
            {ticket.status === 'done' ? 'Reabrir conversa' : 'Marcar como resolvida'}
          </MenuItem>
        )}
        <MenuItem component="a" href={mailto} onClick={() => setMenuAnchor(null)}>
          <ListItemIcon><MailOutlineIcon fontSize="small" /></ListItemIcon>
          Responder por e-mail
        </MenuItem>
        <MenuItem onClick={() => { setMenuAnchor(null); setConfirmDelete(true) }} sx={{ color: '#e11d48' }}>
          <ListItemIcon><DeleteOutlineIcon fontSize="small" sx={{ color: '#e11d48' }} /></ListItemIcon>
          Apagar conversa
        </MenuItem>
      </Menu>
      <ConfirmDeleteDialog
        open={confirmDelete}
        title="Apagar conversa?"
        description={`A conversa com ${ticket?.name ?? 'essa pessoa'} some de vez, pros dois lados. Isso não dá pra desfazer.`}
        isPending={remove.isPending}
        onConfirm={() => remove.mutate(ticketId, {
          onSuccess: () => { setConfirmDelete(false); onDeleted() },
          onError: (err) => toast.error(err.message),
        })}
        onClose={() => setConfirmDelete(false)}
        confirmLabel="Apagar"
      />
    </>
  )
}

function SupportInbox({ tickets }: { tickets: SupportTicket[] }) {
  const { theme } = useBackground()
  const surface = useSurface()
  const isDesktop = useMediaQuery('(min-width: 900px)', { noSsr: true })
  const [searchParams, setSearchParams] = useSearchParams()
  const selected = searchParams.get('conversa')
  const [filter, setFilter] = useState<InboxFilter>(() => (tickets.some((ticket) => ticket.status === 'open') ? 'waiting' : 'all'))

  const options = useMemo<FilterOption<InboxFilter>[]>(
    () => FILTERS.map(({ id, label, test }) => ({ id, label, count: tickets.filter(test).length })),
    [tickets],
  )
  const visible = useMemo(() => tickets.filter(FILTERS.find((item) => item.id === filter)!.test), [tickets, filter])
  const select = (id: string | null) => setSearchParams(id ? { conversa: id } : {}, { replace: !isDesktop && !id })
  const showList = isDesktop || !selected
  const showThread = isDesktop || !!selected
  const panel = { ...surface, borderRadius: radius.xl, overflow: 'hidden', minHeight: 0 } as const

  return (
    <Box sx={{
      display: 'grid', gap: 1.6, gridTemplateColumns: { xs: 'minmax(0,1fr)', md: '340px minmax(0,1fr)' },
      height: { xs: 'calc(100dvh - 210px)', md: 'calc(100dvh - 190px)' }, minHeight: 440,
    }}>
      {showList && (
        <Box sx={{ ...panel, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 1.2, borderBottom: `1px solid ${theme.surfaceBorder}` }}>
            <FilterChips options={options} value={filter} onChange={setFilter} />
          </Box>
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 0.7 }}>
            {visible.length === 0 ? (
              <Typography sx={{ py: 6, px: 2, textAlign: 'center', fontFamily: font.serif, fontStyle: 'italic', color: theme.textOnBgMuted }}>
                {EMPTY[filter]}
              </Typography>
            ) : (
              <Stack spacing={0.3}>
                {visible.map((ticket) => (
                  <TicketRow key={ticket.id} ticket={ticket} active={ticket.id === selected} onClick={() => select(ticket.id)} />
                ))}
              </Stack>
            )}
          </Box>
        </Box>
      )}
      {showThread && (
        <Box sx={{ ...panel, height: '100%' }}>
          {selected ? (
            <ThreadView key={selected} ticketId={selected} onBack={isDesktop ? undefined : () => select(null)} onDeleted={() => select(null)} />
          ) : (
            <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ height: '100%', textAlign: 'center', px: 3 }}>
              <Typography sx={{ fontSize: '2.4rem' }}>📮</Typography>
              <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.2rem', color: theme.textOnBg }}>Escolha uma conversa</Typography>
              <Typography variant="md" sx={{ color: theme.textOnBgMuted, maxWidth: 320 }}>
                Sua resposta chega no app e a pessoa recebe um aviso por e-mail.
              </Typography>
            </Stack>
          )}
        </Box>
      )}
    </Box>
  )
}

export function AdminSupportPage() {
  const query = useSupportTicketsQuery()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (query.dataUpdatedAt) void queryClient.invalidateQueries({ queryKey: SUPPORT_UNREAD_KEY })
  }, [query.dataUpdatedAt, queryClient])

  return (
    <AdminFrame
      title="Suporte"
      subtitle="Conversas com quem usa o Potinho"
      query={query}
      skeleton={(
        <Box sx={{ display: 'grid', gap: 1.6, gridTemplateColumns: { xs: 'minmax(0,1fr)', md: '340px minmax(0,1fr)' } }}>
          <SkeletonBlock height={420} />
          <Box sx={{ display: { xs: 'none', md: 'block' } }}><SkeletonBlock height={420} /></Box>
        </Box>
      )}
    >
      {(tickets) => <SupportInbox tickets={tickets} />}
    </AdminFrame>
  )
}
