import SendRoundedIcon from '@mui/icons-material/SendRounded'
import { Box, CircularProgress, IconButton, InputBase, Stack, Typography, useMediaQuery } from '@mui/material'
import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react'
import { useBackground } from '../../context/BackgroundContext'
import { radius } from '../../design-system'
import type { MessageAuthor, SupportChatMessage } from '../../types/admin'
import { withAlpha } from '../../utils/colorUtils'

export const SUPPORT_MESSAGE_MAX = 2000

const DAY_MS = 86_400_000

function dayLabel(iso: string): string {
  const date = new Date(iso)
  const today = new Date()
  const start = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diff = Math.round((start(today) - start(date)) / DAY_MS)
  if (diff === 0) return 'hoje'
  if (diff === 1) return 'ontem'
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', ...(date.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}) })
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function SupportComposer({ onSend, sending, placeholder, minLength = 1, autoFocus }: {
  onSend: (text: string) => Promise<unknown>
  sending: boolean
  placeholder: string
  minLength?: number
  autoFocus?: boolean
}) {
  const { theme } = useBackground()
  const touch = useMediaQuery('(pointer: coarse)', { noSsr: true })
  const [text, setText] = useState('')
  const trimmed = text.trim()
  const canSend = trimmed.length >= minLength && !sending

  const send = async () => {
    if (!canSend) return
    try {
      await onSend(trimmed)
      setText('')
    } catch {
      void 0
    }
  }

  return (
    <Box sx={{ p: 1.2, borderTop: `1px solid ${theme.surfaceBorder}` }}>
      <Stack direction="row" alignItems="flex-end" spacing={1} sx={{
        px: 1.4, py: 0.8, borderRadius: '22px', background: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.85)',
        border: `1px solid ${theme.surfaceBorder}`, transition: 'border-color 0.15s',
        '&:focus-within': { borderColor: withAlpha(theme.accent, 55) },
      }}>
        <InputBase
          value={text}
          onChange={(event) => setText(event.target.value.slice(0, SUPPORT_MESSAGE_MAX))}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && !touch) {
              event.preventDefault()
              void send()
            }
          }}
          placeholder={placeholder}
          multiline
          maxRows={6}
          autoFocus={autoFocus}
          inputProps={{ maxLength: SUPPORT_MESSAGE_MAX, 'aria-label': placeholder }}
          sx={{ flex: 1, py: 0.5, fontSize: '0.95rem', color: theme.textOnBg, '& textarea::placeholder': { color: theme.textOnBgMuted, opacity: 1 } }}
        />
        <IconButton
          aria-label="Enviar mensagem"
          onClick={() => { void send() }}
          disabled={!canSend}
          sx={{
            width: 38, height: 38, flexShrink: 0, color: theme.onAccent, background: theme.accent,
            '&:hover': { background: theme.accent, filter: 'brightness(1.08)' },
            '&.Mui-disabled': { background: withAlpha(theme.accent, 30), color: theme.onAccent },
          }}
        >
          {sending ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : <SendRoundedIcon sx={{ fontSize: 19 }} />}
        </IconButton>
      </Stack>
      {text.length > SUPPORT_MESSAGE_MAX * 0.8 && (
        <Typography variant="xs" sx={{ display: 'block', textAlign: 'right', mt: 0.4, color: theme.textOnBgMuted }}>
          {text.length}/{SUPPORT_MESSAGE_MAX}
        </Typography>
      )}
    </Box>
  )
}

export function SupportChat({ messages, viewer, loading, header, footer, intro }: {
  messages: SupportChatMessage[]
  viewer: MessageAuthor
  loading?: boolean
  header?: ReactNode
  footer: ReactNode
  intro?: ReactNode
}) {
  const { theme } = useBackground()
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastId = messages[messages.length - 1]?.id

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lastId, loading])

  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {header}
      <Box ref={scrollRef} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', px: { xs: 1.4, md: 2 }, py: 1.6 }}>
        {intro}
        {loading && (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress size={22} sx={{ color: theme.accent }} />
          </Stack>
        )}
        {!loading && messages.map((message, index) => {
          const previous = messages[index - 1]
          const mine = message.author === viewer
          const newDay = !previous || dayLabel(previous.createdAt) !== dayLabel(message.createdAt)
          const showName = !mine && (newDay || previous?.author !== message.author)
          return (
            <Fragment key={message.id}>
              {newDay && (
                <Typography variant="xs" sx={{ display: 'block', textAlign: 'center', my: 1.4, fontWeight: 700, color: theme.textOnBgMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                  {dayLabel(message.createdAt)}
                </Typography>
              )}
              <Stack alignItems={mine ? 'flex-end' : 'flex-start'} sx={{ mt: showName || newDay ? 1 : 0.5 }}>
                {showName && (
                  <Typography variant="xs" sx={{ fontWeight: 800, color: theme.textOnBgMuted, mb: 0.3, px: 0.6 }}>
                    {message.authorName}
                  </Typography>
                )}
                <Box sx={{
                  maxWidth: { xs: '86%', md: '72%' }, px: 1.5, py: 1,
                  borderRadius: mine ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
                  background: mine ? theme.accent : theme.isDark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.92)',
                  color: mine ? theme.onAccent : theme.textOnBg,
                  border: mine ? 'none' : `1px solid ${theme.surfaceBorder}`,
                  boxShadow: mine ? `0 4px 14px ${withAlpha(theme.accent, 25)}` : '0 2px 8px rgba(15,23,42,0.05)',
                }}>
                  <Typography sx={{ fontSize: '0.93rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', color: 'inherit' }}>
                    {message.body}
                  </Typography>
                  <Typography variant="xxs" sx={{ display: 'block', textAlign: 'right', mt: 0.3, opacity: 0.7, color: 'inherit' }}>
                    {timeLabel(message.createdAt)}
                  </Typography>
                </Box>
              </Stack>
            </Fragment>
          )
        })}
      </Box>
      {footer}
    </Box>
  )
}

export function TicketStatusChip({ status, viewer }: { status: 'open' | 'answered' | 'done'; viewer: MessageAuthor }) {
  const label = status === 'done'
    ? 'Resolvido'
    : status === 'answered'
      ? viewer === 'admin' ? 'Respondido' : 'Respondemos'
      : viewer === 'admin' ? 'Esperando você' : 'Aguardando resposta'
  const tone = status === 'done' ? '#22c55e' : status === 'answered' ? '#3b82f6' : '#f59e0b'
  return (
    <Box component="span" sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 0.9, py: 0.2, borderRadius: radius.full, flexShrink: 0,
      fontSize: '0.68rem', fontWeight: 800, whiteSpace: 'nowrap', color: tone, background: withAlpha(tone, 12), border: `1px solid ${withAlpha(tone, 30)}`,
    }}>
      <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', background: tone }} />
      {label}
    </Box>
  )
}
