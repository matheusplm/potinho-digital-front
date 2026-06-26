import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { Box, Chip, Stack, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
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

const PREVIEW_TYPES: { value: string; label: string }[] = [
  { value: 'verify-email', label: '💌 Verificação' },
  { value: 'resend-verification', label: '🔁 Reenvio' },
  { value: 'password-reset', label: '🔑 Senha' },
  { value: 'change-email', label: '📬 Trocar email' },
  { value: 'invite', label: '🎁 Convite' },
]

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

function EmailTemplatesTab() {
  const { theme } = useBackground()
  const [selected, setSelected] = useState('verify-email')

  const { data: html, isLoading, error } = useQuery({
    queryKey: ['email-preview', selected],
    queryFn: () => api.getEmailPreview(selected),
    staleTime: Infinity,
  })

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
        {PREVIEW_TYPES.map((t) => (
          <Box
            key={t.value}
            onClick={() => setSelected(t.value)}
            sx={{
              px: 1.5, py: 0.6, borderRadius: radius.full, cursor: 'pointer',
              fontSize: '0.78rem', fontWeight: 700, transition: 'all 0.15s',
              background: selected === t.value ? theme.accent : `${theme.accent}14`,
              color: selected === t.value ? '#fff' : theme.accent,
              border: `1.5px solid ${selected === t.value ? theme.accent : `${theme.accent}30`}`,
            }}
          >
            {t.label}
          </Box>
        ))}
      </Box>

      <Box sx={{ borderRadius: radius.lg, overflow: 'hidden', border: `1px solid ${theme.accent}20`, minHeight: 400 }}>
        {isLoading && (
          <Box sx={{ p: 3 }}>
            <LoadingState compact label="Carregando template" accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} />
          </Box>
        )}
        {error && (
          <Box sx={{ p: 3 }}>
            <Typography sx={{ fontSize: '0.82rem', color: '#e11d48' }}>Erro ao carregar template.</Typography>
          </Box>
        )}
        {html && !isLoading && (
          <iframe
            srcDoc={html}
            title={`preview-${selected}`}
            style={{ width: '100%', border: 'none', display: 'block' }}
            onLoad={(e) => {
              const iframe = e.currentTarget
              iframe.style.height = `${iframe.contentDocument?.body.scrollHeight ?? 600}px`
            }}
          />
        )}
      </Box>
    </Stack>
  )
}

type Tab = 'logs' | 'templates'

export function MailLogPage() {
  const { theme } = useBackground()
  const [tab, setTab] = useState<Tab>('logs')
  const { data: logs = [], isLoading } = useQuery({ queryKey: ['mail-logs'], queryFn: () => api.getMailLogs() })

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'logs', label: 'Logs', icon: <EmailOutlinedIcon sx={{ fontSize: 14 }} /> },
    { id: 'templates', label: 'Templates', icon: <VisibilityOutlinedIcon sx={{ fontSize: 14 }} /> },
  ]

  return (
    <Box sx={{ height: '100%', position: 'relative', overflow: 'hidden', background: theme.gradient }}>
      <EmailOutlinedIcon sx={{ position: 'absolute', bottom: -70, right: -60, fontSize: 420, color: `${theme.accent}08`, pointerEvents: 'none' }} />
      <ScrollablePage sx={{ px: 2.5, py: 2.5, animation: `${fadeIn} 0.35s ease` }}>
        <Stack spacing={0.3} sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: '0.78rem', color: theme.textOnBgMuted, fontWeight: 700 }}>
            ✉️ Emails
          </Typography>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.6rem', color: theme.textOnBg, lineHeight: 1.1 }}>
            Emails
          </Typography>
        </Stack>

        <Box sx={{ display: 'flex', gap: 0.8, mb: 2.5, p: 0.5, borderRadius: radius.lg, background: `${theme.accent}10`, width: 'fit-content' }}>
          {tabs.map((t) => (
            <Box
              key={t.id}
              onClick={() => setTab(t.id)}
              sx={{
                px: 1.8, py: 0.7, borderRadius: radius.md, cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.6,
                transition: 'all 0.15s',
                background: tab === t.id ? theme.accent : 'transparent',
                color: tab === t.id ? '#fff' : theme.textOnBgMuted,
              }}
            >
              {t.icon}
              {t.label}
            </Box>
          ))}
        </Box>

        {tab === 'logs' && (
          <>
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
          </>
        )}

        {tab === 'templates' && <EmailTemplatesTab />}
      </ScrollablePage>
    </Box>
  )
}
