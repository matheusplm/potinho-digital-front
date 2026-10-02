import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Box, IconButton, Stack, Typography, useMediaQuery } from '@mui/material'
import { useLocation, useSearchParams } from 'react-router-dom'
import { SupportChat, SupportComposer, TicketStatusChip } from '../components/support/SupportChat'
import { toast } from '../components/ui'
import { useBackground } from '../context/BackgroundContext'
import { font, radius } from '../design-system'
import { useMySupportActions, useMySupportTicketQuery, useMySupportTicketsQuery } from '../hooks/useSupport'
import type { MySupportTicket } from '../types/support'
import { timeAgo } from '../utils/timeAgo'
import { withAlpha } from '../utils/colorUtils'

const NEW = 'nova'

function TicketRow({ ticket, active, onClick }: { ticket: MySupportTicket; active: boolean; onClick: () => void }) {
  const { theme } = useBackground()
  const unread = ticket.unreadForUser
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer', display: 'block', px: 1.5, py: 1.3, borderRadius: radius.lg,
        background: active ? withAlpha(theme.accent, 12) : 'transparent',
        border: `1px solid ${active ? withAlpha(theme.accent, 35) : 'transparent'}`,
        transition: 'background 0.15s',
        '&:hover': { background: active ? withAlpha(theme.accent, 14) : theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)' },
        '&:focus-visible': { outline: `2px solid ${theme.accent}`, outlineOffset: 2 },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.4 }}>
        {unread && <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: theme.accent, flexShrink: 0 }} />}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <TicketStatusChip status={ticket.status} viewer="user" />
        </Box>
        <Typography variant="xs" sx={{ color: theme.textOnBgMuted, flexShrink: 0 }}>{timeAgo(ticket.lastMessageAt)}</Typography>
      </Stack>
      <Typography sx={{
        fontSize: '0.88rem', lineHeight: 1.4, color: theme.textOnBg, fontWeight: unread ? 800 : 500,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere',
      }}>
        {ticket.lastAuthor === 'admin' ? 'Equipe: ' : 'Você: '}{ticket.lastMessagePreview}
      </Typography>
    </Box>
  )
}

function ThreadHeader({ title, subtitle, onBack, status }: { title: string; subtitle: string; onBack?: () => void; status?: MySupportTicket['status'] }) {
  const { theme } = useBackground()
  return (
    <Stack direction="row" alignItems="center" spacing={1.2} sx={{ pl: { xs: 1.2, md: 2 }, pr: { xs: 7, md: 2 }, py: 1.3, borderBottom: `1px solid ${theme.surfaceBorder}` }}>
      {onBack && (
        <IconButton aria-label="Voltar para as conversas" onClick={onBack} sx={{ color: theme.textOnBg }}>
          <ArrowBackIcon />
        </IconButton>
      )}
      <Box sx={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', background: withAlpha(theme.accent, 14) }}>
        💬
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={0.8} sx={{ flexWrap: 'wrap', rowGap: 0.4 }}>
          <Typography sx={{ fontWeight: 800, color: theme.textOnBg, fontSize: '0.98rem', lineHeight: 1.25 }}>{title}</Typography>
          {status && <TicketStatusChip status={status} viewer="user" />}
        </Stack>
        <Typography variant="xs" sx={{ color: theme.textOnBgMuted, display: { xs: 'none', sm: 'block' } }}>{subtitle}</Typography>
      </Box>
    </Stack>
  )
}

export function SupportPage() {
  const { theme } = useBackground()
  const isDesktop = useMediaQuery('(min-width: 900px)', { noSsr: true })
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const cameFrom = (location.state as { from?: string } | null)?.from
  const selected = searchParams.get('conversa')
  const creating = selected === NEW
  const ticketId = selected && !creating ? selected : null
  const { data: tickets = [], isLoading } = useMySupportTicketsQuery()
  const { data: thread, isLoading: threadLoading, error: threadError } = useMySupportTicketQuery(ticketId)
  const { create, reply } = useMySupportActions()

  const select = (value: string | null) => setSearchParams(value ? { conversa: value } : {}, { replace: !isDesktop && !value, state: location.state })
  const showList = isDesktop || !selected
  const showThread = isDesktop || !!selected

  const startConversation = async (text: string) => {
    try {
      const ticket = await create.mutateAsync({ message: text, page: cameFrom })
      setSearchParams({ conversa: ticket.id }, { replace: true })
    } catch (err) {
      toast.error((err as Error).message || 'Não deu pra enviar agora.')
      throw err
    }
  }

  const sendReply = async (text: string) => {
    if (!ticketId) return
    try {
      await reply.mutateAsync({ id: ticketId, message: text })
    } catch (err) {
      toast.error((err as Error).message || 'Não deu pra enviar agora.')
      throw err
    }
  }

  const panel = {
    background: theme.surfaceBg, border: `1px solid ${theme.surfaceBorder}`, backdropFilter: 'blur(16px)',
    borderRadius: radius.xl, overflow: 'hidden', minHeight: 0,
  } as const

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: theme.gradient, px: { xs: 1.5, md: 3 }, pt: { xs: 2, md: 2.8 }, pb: { xs: 1.5, md: 2.5 } }}>
      <Stack spacing={0.3} sx={{ mb: 1.8, pr: { xs: 6, md: 0 }, display: showList || isDesktop ? 'flex' : 'none' }}>
        <Typography variant="md" sx={{ color: theme.textOnBgMuted, fontWeight: 700 }}>💬 Suporte</Typography>
        <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.6rem', color: theme.textOnBg, lineHeight: 1.1 }}>
          Fale com a gente
        </Typography>
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, display: 'grid', gap: 1.6, gridTemplateColumns: { xs: 'minmax(0,1fr)', md: '320px minmax(0,1fr)' } }}>
        {showList && (
          <Box sx={{ ...panel, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 1.2, borderBottom: `1px solid ${theme.surfaceBorder}` }}>
              <Box
                component="button"
                type="button"
                onClick={() => select(NEW)}
                sx={{
                  all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6,
                  py: 1.1, borderRadius: radius.lg, fontWeight: 800, fontSize: '0.9rem', color: theme.onAccent, background: theme.accent,
                  boxShadow: `0 6px 18px ${withAlpha(theme.accent, 30)}`,
                  '&:focus-visible': { outline: `2px solid ${theme.accent}`, outlineOffset: 2 },
                }}
              >
                <AddRoundedIcon sx={{ fontSize: 19 }} />
                Nova conversa
              </Box>
            </Box>
            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 0.8 }}>
              {!isLoading && tickets.length === 0 && (
                <Typography variant="md" sx={{ color: theme.textOnBgMuted, textAlign: 'center', py: 4, px: 2, lineHeight: 1.5 }}>
                  Nenhuma conversa ainda. Se algo der errado ou tiver uma ideia, é só chamar 💙
                </Typography>
              )}
              <Stack spacing={0.4}>
                {tickets.map((ticket) => (
                  <TicketRow key={ticket.id} ticket={ticket} active={ticket.id === ticketId} onClick={() => select(ticket.id)} />
                ))}
              </Stack>
            </Box>
          </Box>
        )}

        {showThread && (
          <Box sx={{ ...panel, height: '100%' }}>
            {creating && (
              <SupportChat
                messages={[]}
                viewer="user"
                header={<ThreadHeader title="Nova conversa" subtitle="A resposta chega aqui e no seu e-mail" onBack={isDesktop ? undefined : () => select(null)} />}
                intro={(
                  <Stack alignItems="center" spacing={1} sx={{ textAlign: 'center', py: { xs: 4, md: 7 }, px: 2 }}>
                    <Typography sx={{ fontSize: '2.4rem' }}>👋</Typography>
                    <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.25rem', color: theme.textOnBg }}>Como a gente pode ajudar?</Typography>
                    <Typography variant="md" sx={{ color: theme.textOnBgMuted, maxWidth: 360, lineHeight: 1.5 }}>
                      Conta o que aconteceu, uma dúvida ou uma ideia. Quanto mais detalhe, mais rápido a gente resolve.
                    </Typography>
                  </Stack>
                )}
                footer={<SupportComposer onSend={startConversation} sending={create.isPending} placeholder="Escreve sua mensagem..." minLength={5} autoFocus />}
              />
            )}

            {ticketId && (
              <SupportChat
                messages={thread?.messages ?? []}
                viewer="user"
                loading={threadLoading}
                header={<ThreadHeader title="Equipe Potinho" subtitle="Respondemos por aqui e avisamos no seu e-mail" onBack={isDesktop ? undefined : () => select(null)} status={thread?.ticket.status} />}
                intro={threadError ? (
                  <Typography variant="md" sx={{ color: theme.textOnBgMuted, textAlign: 'center', py: 6 }}>Não encontramos essa conversa.</Typography>
                ) : thread?.ticket.status === 'done' ? (
                  <Typography variant="xs" sx={{ display: 'block', color: theme.textOnBgMuted, textAlign: 'center', mb: 1 }}>
                    Essa conversa foi marcada como resolvida. Se escrever de novo, ela reabre.
                  </Typography>
                ) : null}
                footer={threadError ? null : <SupportComposer onSend={sendReply} sending={reply.isPending} placeholder="Escreve sua mensagem..." />}
              />
            )}

            {!selected && isDesktop && (
              <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ height: '100%', textAlign: 'center', px: 3 }}>
                <Typography sx={{ fontSize: '2.4rem' }}>💬</Typography>
                <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.2rem', color: theme.textOnBg }}>
                  {tickets.length ? 'Escolha uma conversa' : 'Começa uma conversa'}
                </Typography>
                <Typography variant="md" sx={{ color: theme.textOnBgMuted, maxWidth: 320 }}>
                  A gente responde por aqui e avisa no seu e-mail.
                </Typography>
              </Stack>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}
