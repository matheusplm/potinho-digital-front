import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import { Box, Chip, Stack, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { Card, EmptyState, LoadingState, ScrollablePage } from '../components/ui'
import { useBackground } from '../context/BackgroundContext'
import { api } from '../services/api'
import type { MailLogEntry, MailLogType } from '../types/note'
import { colors, fadeIn, font, radius } from '../design-system'

const TYPE_LABEL: Record<MailLogType, string> = {
  'invite': 'Convite',
  'verify-email': 'Verificação',
  'resend-verification': 'Reenvio verificação',
  'password-reset': 'Recuperação de senha',
  'change-email': 'Troca de email',
  'confirm-email-change': 'Confirmação de email',
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

function MailLogRow({ entry }: { entry: MailLogEntry }) {
  const { theme } = useBackground()
  return (
    <Card sx={{ px: 2, py: 1.4 }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box sx={{ width: 32, height: 32, borderRadius: radius.md, background: `${theme.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <EmailOutlinedIcon sx={{ fontSize: 16, color: theme.accent }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {entry.to}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: colors.text.muted }}>
            {formatDate(entry.sentAt)}
          </Typography>
        </Box>
        <Chip
          label={TYPE_LABEL[entry.type] ?? entry.type}
          size="small"
          sx={{ fontSize: '0.68rem', fontWeight: 700, height: 22, bgcolor: `${theme.accent}14`, color: theme.accent, border: `1px solid ${theme.accent}28`, '& .MuiChip-label': { px: 1 } }}
        />
      </Stack>
    </Card>
  )
}

export function MailLogPage() {
  const { theme } = useBackground()
  const { data: logs = [], isLoading } = useQuery({ queryKey: ['mail-logs'], queryFn: () => api.getMailLogs() })

  return (
    <Box sx={{ height: '100%', position: 'relative', overflow: 'hidden', background: theme.gradient }}>
      <EmailOutlinedIcon sx={{ position: 'absolute', bottom: -70, right: -60, fontSize: 420, color: `${theme.accent}08`, pointerEvents: 'none' }} />
      <ScrollablePage sx={{ px: 2.5, py: 2.5, animation: `${fadeIn} 0.35s ease` }}>
        <Stack spacing={0.3} sx={{ mb: 2.5 }}>
          <Typography sx={{ fontSize: '0.78rem', color: theme.textOnBgMuted, fontWeight: 700 }}>
            ✉️ Emails
          </Typography>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.6rem', color: theme.textOnBg, lineHeight: 1.1 }}>
            Log de emails
          </Typography>
        </Stack>

        {isLoading && (
          <LoadingState compact label="Carregando logs" accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} />
        )}

        {!isLoading && logs.length === 0 && (
          <EmptyState emoji="✉️" title="Nenhum email enviado ainda." />
        )}

        {!isLoading && logs.length > 0 && (
          <Stack spacing={1}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.8, color: theme.textOnBgMuted, textTransform: 'uppercase', mb: 0.5 }}>
              {logs.length} registro{logs.length !== 1 ? 's' : ''}
            </Typography>
            {logs.map((entry) => (
              <MailLogRow key={entry.id} entry={entry} />
            ))}
          </Stack>
        )}
      </ScrollablePage>
    </Box>
  )
}
