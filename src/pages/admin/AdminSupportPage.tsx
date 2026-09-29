import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import ReplyIcon from '@mui/icons-material/Reply'
import { Box, Stack, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { ConfirmDeleteDialog, toast } from '../../components/ui'
import { useBackground } from '../../context/BackgroundContext'
import { font, radius } from '../../design-system'
import { SUPPORT_UNREAD_KEY, useSupportActions, useSupportMessagesQuery } from '../../hooks/useAdmin'
import type { SupportMessage, SupportStatus } from '../../types/admin'
import { AdminFrame, Pill } from './AdminShell'
import { SkeletonBlock } from './charts'
import { dateTime, timeAgo } from './format'
import { Avatar, FilterChips, type FilterOption } from './Panel'
import { useSurface } from './surface'

type InboxFilter = 'open' | 'new' | 'done' | 'all'

const FILTERS: Array<{ id: InboxFilter; label: string; test: (message: SupportMessage) => boolean }> = [
  { id: 'open', label: 'Em aberto', test: (message) => message.status !== 'done' },
  { id: 'new', label: 'Não lidas', test: (message) => message.status === 'new' },
  { id: 'done', label: 'Resolvidas', test: (message) => message.status === 'done' },
  { id: 'all', label: 'Todas', test: () => true },
]

const EMPTY: Record<InboxFilter, string> = {
  open: 'Nada esperando resposta. Tudo tranquilo por aqui ✨',
  new: 'Você já leu tudo 👀',
  done: 'Nenhum recado resolvido ainda.',
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

function replyLink(message: SupportMessage): string {
  const firstName = message.name.trim().split(/\s+/)[0] ?? ''
  const quoted = message.message.split('\n').map((line) => `> ${line}`).join('\n')
  const subject = encodeURIComponent('Re: seu recado pro Potinho Digital')
  const body = encodeURIComponent(`Oi, ${firstName}!\n\n\n\n${quoted}`)
  return `mailto:${message.email}?subject=${subject}&body=${body}`
}

function SupportCard({ message, onStatus, onDelete, busy }: {
  message: SupportMessage
  onStatus: (status: SupportStatus) => void
  onDelete: () => void
  busy: boolean
}) {
  const { theme } = useBackground()
  const surface = useSurface()
  const [expanded, setExpanded] = useState(false)
  const unread = message.status === 'new'
  const done = message.status === 'done'
  const origin = [message.page, device(message.userAgent)].filter(Boolean).join(' · ')

  const open = () => {
    setExpanded((value) => !value)
    if (unread) onStatus('read')
  }

  return (
    <Box sx={{
      ...surface, borderRadius: radius.xl, p: { xs: 1.5, md: 1.9 }, minWidth: 0, position: 'relative',
      opacity: done ? 0.72 : 1,
      borderLeft: `3px solid ${unread ? theme.accent : 'transparent'}`,
    }}>
      <Stack direction="row" spacing={1.2} alignItems="flex-start" sx={{ minWidth: 0 }}>
        <Avatar id={message.userId} name={message.name} tone="none" size={34} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ gap: 1, flexWrap: 'wrap' }}>
            <Typography sx={{ fontWeight: unread ? 850 : 700, color: theme.textOnBg, fontSize: '0.95rem', wordBreak: 'break-word' }}>
              {message.name}
              {unread && (
                <Box component="span" sx={{ ml: 0.8, px: 0.8, py: 0.1, borderRadius: radius.full, fontSize: '0.64rem', fontWeight: 800, verticalAlign: 'middle', background: theme.accent, color: theme.onAccent }}>
                  nova
                </Box>
              )}
              {done && (
                <Box component="span" sx={{ ml: 0.8, fontSize: '0.72rem', fontWeight: 700, color: '#22c55e' }}>✓ resolvida</Box>
              )}
            </Typography>
            <Typography variant="xs" title={dateTime(message.createdAt)} sx={{ color: theme.textOnBgMuted, whiteSpace: 'nowrap' }}>
              {timeAgo(message.createdAt)}
            </Typography>
          </Stack>
          <Typography variant="sm" sx={{ color: theme.textOnBgMuted, wordBreak: 'break-all' }}>
            {message.email}
          </Typography>

          <Typography
            component="div"
            onClick={open}
            sx={{
              mt: 1, color: theme.textOnBg, fontSize: '0.92rem', lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              cursor: 'pointer',
              ...(expanded ? {} : { display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }),
            }}
          >
            {message.message}
          </Typography>

          {origin && (
            <Typography variant="xs" sx={{ mt: 0.8, color: theme.textOnBgMuted, fontStyle: 'italic', wordBreak: 'break-all' }}>
              {origin}
            </Typography>
          )}

          <Stack direction="row" sx={{ mt: 1.2, gap: 0.7, flexWrap: 'wrap' }}>
            <Pill href={replyLink(message)} onClick={() => { if (unread) onStatus('read') }} label={`Responder ${message.name} por e-mail`}>
              <ReplyIcon />
              responder
            </Pill>
            {done ? (
              <Pill onClick={() => onStatus('read')} disabled={busy} label="Reabrir recado">
                <ReplayIcon />
                reabrir
              </Pill>
            ) : (
              <Pill onClick={() => onStatus('done')} disabled={busy} tone="#22c55e" label="Marcar como resolvido">
                <CheckCircleOutlineIcon />
                resolvido
              </Pill>
            )}
            <Pill onClick={onDelete} disabled={busy} label="Apagar recado">
              <DeleteOutlineIcon />
              apagar
            </Pill>
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
}

function SupportInbox({ messages }: { messages: SupportMessage[] }) {
  const { theme } = useBackground()
  const { setStatus, remove } = useSupportActions()
  const [filter, setFilter] = useState<InboxFilter>('open')
  const [deleting, setDeleting] = useState<SupportMessage | null>(null)

  const options = useMemo<FilterOption<InboxFilter>[]>(
    () => FILTERS.map(({ id, label, test }) => ({ id, label, count: messages.filter(test).length })),
    [messages],
  )
  const visible = useMemo(() => messages.filter(FILTERS.find((item) => item.id === filter)!.test), [messages, filter])

  const changeStatus = (message: SupportMessage, status: SupportStatus) => {
    setStatus.mutate({ id: message.id, status }, { onError: (err) => toast.error(err.message) })
  }

  const confirmDelete = () => {
    if (!deleting) return
    remove.mutate(deleting.id, {
      onSuccess: () => setDeleting(null),
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <Stack spacing={1.6}>
      <FilterChips options={options} value={filter} onChange={setFilter} />
      {visible.length === 0 ? (
        <Typography sx={{ py: 6, textAlign: 'center', fontFamily: font.serif, fontStyle: 'italic', color: theme.textOnBgMuted }}>
          {EMPTY[filter]}
        </Typography>
      ) : (
        <Stack spacing={1.2}>
          {visible.map((message) => (
            <SupportCard
              key={message.id}
              message={message}
              busy={setStatus.isPending && setStatus.variables?.id === message.id}
              onStatus={(status) => changeStatus(message, status)}
              onDelete={() => setDeleting(message)}
            />
          ))}
        </Stack>
      )}
      <ConfirmDeleteDialog
        open={!!deleting}
        title="Apagar recado?"
        description={deleting ? `O recado de ${deleting.name} some de vez. Isso não dá pra desfazer.` : undefined}
        isPending={remove.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
        confirmLabel="Apagar"
      />
    </Stack>
  )
}

export function AdminSupportPage() {
  const query = useSupportMessagesQuery()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (query.dataUpdatedAt) void queryClient.invalidateQueries({ queryKey: SUPPORT_UNREAD_KEY })
  }, [query.dataUpdatedAt, queryClient])

  return (
    <AdminFrame
      title="Recados"
      subtitle="Mensagens de suporte"
      query={query}
      skeleton={<Stack spacing={1.2}>{Array.from({ length: 3 }, (_, i) => <SkeletonBlock key={i} height={132} />)}</Stack>}
    >
      {(messages) => <SupportInbox messages={messages} />}
    </AdminFrame>
  )
}
