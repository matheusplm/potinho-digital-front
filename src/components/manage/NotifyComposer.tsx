import { Box, Stack, TextField, Typography } from '@mui/material'
import { ImagePicker } from '../ImagePicker'
import { colors, radius } from '../../design-system'
import type { NotificationChannels, NotifyConfig } from '../../types/note'

export interface NotifyDraft {
  enabled: boolean
  channels: NotificationChannels
  message: string
  imageUrl: string | null
}

export const EMPTY_NOTIFY_DRAFT: NotifyDraft = {
  enabled: false,
  channels: { inApp: true, push: true, email: false },
  message: '',
  imageUrl: null,
}

export function notifyDraftToConfig(draft: NotifyDraft): NotifyConfig | undefined {
  if (!draft.enabled) return undefined
  if (!draft.channels.inApp && !draft.channels.push && !draft.channels.email) return undefined
  return {
    channels: draft.channels,
    ...(draft.message.trim() ? { message: draft.message.trim() } : {}),
    imageUrl: draft.imageUrl,
  }
}

const CHANNEL_OPTIONS: { id: keyof NotificationChannels; emoji: string; label: string; hint: string }[] = [
  { id: 'inApp', emoji: '💌', label: 'No app', hint: 'anúncio em tela cheia ao abrir a coleção' },
  { id: 'push', emoji: '🔔', label: 'Push', hint: 'notificação no celular' },
  { id: 'email', emoji: '✉️', label: 'Email', hint: 'mensagem na caixa de entrada' },
]

function ToggleRow({ checked, onToggle, title, subtitle }: { checked: boolean; onToggle: () => void; title: string; subtitle: string }) {
  return (
    <Stack direction="row" spacing={1.2} alignItems="center" onClick={onToggle} sx={{ cursor: 'pointer', userSelect: 'none' }}>
      <Box sx={{
        width: 40, height: 22, borderRadius: radius.full, flexShrink: 0, position: 'relative',
        background: checked ? colors.primary.main : 'rgba(0,0,0,0.14)', transition: 'background 0.18s',
      }}>
        <Box sx={{
          position: 'absolute', top: 2, left: checked ? 20 : 2, width: 18, height: 18, borderRadius: '50%',
          background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.25)', transition: 'left 0.18s',
        }} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: colors.text.primary, lineHeight: 1.25 }}>{title}</Typography>
        <Typography sx={{ fontSize: '0.7rem', color: colors.text.muted }}>{subtitle}</Typography>
      </Box>
    </Stack>
  )
}

export function NotifyComposer({ value, onChange, toggleTitle, toggleSubtitle, messagePlaceholder }: {
  value: NotifyDraft
  onChange: (next: NotifyDraft) => void
  toggleTitle: string
  toggleSubtitle: string
  messagePlaceholder: string
}) {
  const toggleChannel = (id: keyof NotificationChannels) =>
    onChange({ ...value, channels: { ...value.channels, [id]: !value.channels[id] } })

  return (
    <Stack spacing={1.6}>
      <ToggleRow
        checked={value.enabled}
        onToggle={() => onChange({ ...value, enabled: !value.enabled })}
        title={toggleTitle}
        subtitle={toggleSubtitle}
      />

      {value.enabled && (
        <Stack spacing={1.6} sx={{ pl: 0.3 }}>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: colors.text.secondary, mb: 0.7 }}>
              Por onde avisar?
            </Typography>
            <Stack direction="row" spacing={0.7} sx={{ flexWrap: 'wrap', rowGap: 0.7 }}>
              {CHANNEL_OPTIONS.map((option) => {
                const active = value.channels[option.id]
                return (
                  <Box key={option.id} onClick={() => toggleChannel(option.id)} sx={{
                    px: 1.2, py: 0.7, borderRadius: radius.lg, cursor: 'pointer', flex: '1 1 30%', minWidth: 120,
                    background: active ? `${colors.primary.main}14` : 'rgba(0,0,0,0.04)',
                    border: `1.5px solid ${active ? colors.primary.main : 'transparent'}`,
                    transition: 'all 0.14s',
                  }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: active ? colors.primary.main : colors.text.secondary }}>
                      {option.emoji} {option.label}
                    </Typography>
                    <Typography sx={{ fontSize: '0.64rem', color: colors.text.muted, lineHeight: 1.3 }}>{option.hint}</Typography>
                  </Box>
                )
              })}
            </Stack>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: colors.text.secondary, mb: 0.7 }}>
              Mensagem (opcional)
            </Typography>
            <TextField
              multiline rows={3} fullWidth
              placeholder={messagePlaceholder}
              value={value.message}
              onChange={(e) => onChange({ ...value, message: e.target.value.slice(0, 600) })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: radius.md, fontSize: '0.86rem', background: colors.surface.overlay } }}
            />
          </Box>

          <ImagePicker value={value.imageUrl} onChange={(url) => onChange({ ...value, imageUrl: url })} />
        </Stack>
      )}
    </Stack>
  )
}
