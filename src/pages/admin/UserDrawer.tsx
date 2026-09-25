import CloseIcon from '@mui/icons-material/Close'
import { Box, Drawer, IconButton, Stack, Typography, useMediaQuery } from '@mui/material'
import { useBackground } from '../../context/BackgroundContext'
import { font, radius } from '../../design-system'
import type { AdminUserRow } from '../../types/admin'
import { Avatar, Chip } from './Panel'
import { TONE_COLOR, activityTone, dateTime, formatNumber, timeAgo } from './format'
import { WEEK_MS, within } from './insights'

export function UserBadges({ user }: { user: AdminUserRow }) {
  return (
    <>
      {user.collectionsOwned > 0 && <Chip tone="#7c3aed">✍️ escreve</Chip>}
      {user.collectionsReading > 0 && <Chip tone="#0ea5e9">📖 lê</Chip>}
      {within(user.createdAt, WEEK_MS) && <Chip tone="#db2777">✨ novo</Chip>}
      {user.push && <Chip tone="#22c55e">🔔 push</Chip>}
      {!user.hasPassword && <Chip tone="#f59e0b">G Google</Chip>}
      {user.emailVerified === false && <Chip tone="#ef4444">⚠️ não verificado</Chip>}
    </>
  )
}

function Tile({ value, label }: { value: number; label: string }) {
  const { theme } = useBackground()
  return (
    <Box sx={{ p: 1.1, borderRadius: radius.lg, background: `${theme.accent}10`, border: `1px solid ${theme.accent}22`, textAlign: 'center', minWidth: 0 }}>
      <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.25rem', color: theme.textOnBg, lineHeight: 1.1 }}>{formatNumber(value)}</Typography>
      <Typography sx={{ mt: 0.3, fontSize: '0.64rem', fontWeight: 700, color: theme.textOnBgMuted, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</Typography>
    </Box>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useBackground()
  return (
    <Box sx={{ mt: 2.4 }}>
      <Typography sx={{ mb: 1, fontSize: '0.66rem', fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', color: theme.textOnBgMuted }}>{title}</Typography>
      {children}
    </Box>
  )
}

function Timeline({ user }: { user: AdminUserRow }) {
  const { theme } = useBackground()
  const events = [
    { label: 'Último acesso', at: user.lastActiveAt },
    { label: 'Último pacotinho aberto', at: user.lastPackAt },
    { label: 'Último login', at: user.lastLoginAt },
    { label: 'Criou a conta', at: user.createdAt },
  ].filter((event): event is { label: string; at: string } => !!event.at)
    .sort((a, b) => b.at.localeCompare(a.at))

  if (!events.length) {
    return <Typography sx={{ fontSize: '0.8rem', color: theme.textOnBgMuted }}>Sem registros ainda.</Typography>
  }

  return (
    <Box sx={{ position: 'relative', pl: 2.2 }}>
      <Box sx={{ position: 'absolute', left: 5, top: 6, bottom: 6, width: 2, borderRadius: 2, background: `${theme.accent}33` }} />
      <Stack spacing={1.4}>
        {events.map((event, i) => (
          <Box key={event.label} sx={{ position: 'relative' }}>
            <Box sx={{
              position: 'absolute', left: -21, top: 4, width: 12, height: 12, borderRadius: '50%',
              background: i === 0 ? theme.accent : theme.surfaceBg, border: `2px solid ${theme.accent}`,
            }} />
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: theme.textOnBg }}>{event.label}</Typography>
            <Typography sx={{ fontSize: '0.74rem', color: theme.textOnBgMuted }}>
              {dateTime(event.at)} · {timeAgo(event.at)}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  const { theme } = useBackground()
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.8, borderBottom: `1px solid ${theme.surfaceBorder}`, '&:last-of-type': { borderBottom: 'none' } }}>
      <Typography sx={{ fontSize: '0.8rem', color: theme.textOnBgMuted }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: theme.textOnBg }}>{value}</Typography>
    </Stack>
  )
}

function UserProfile({ user, onClose, handle }: { user: AdminUserRow; onClose: () => void; handle: boolean }) {
  const { theme } = useBackground()
  const tone = activityTone(user.lastActiveAt)
  return (
    <Box sx={{ p: { xs: 2.2, md: 2.8 }, pt: handle ? 1.2 : { xs: 2.2, md: 2.8 }, overflowY: 'auto' }}>
      {handle && <Box sx={{ width: 40, height: 4, borderRadius: 4, background: theme.surfaceBorder, mx: 'auto', mb: 1.6 }} />}
      <Stack direction="row" alignItems="flex-start" spacing={1.6}>
        <Avatar id={user.id} name={user.name} tone={tone} size={60} />
        <Box sx={{ minWidth: 0, flex: 1, pt: 0.3 }}>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.3rem', color: theme.textOnBg, lineHeight: 1.15, wordBreak: 'break-word' }}>
            {user.name}
          </Typography>
          {user.username && <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: theme.textOnBgMuted }}>@{user.username}</Typography>}
          <Typography sx={{ fontSize: '0.8rem', color: theme.textOnBgMuted }}>{user.emailMasked}</Typography>
        </Box>
        <IconButton aria-label="Fechar" onClick={onClose} size="small" sx={{ color: theme.textOnBgMuted, mt: -0.5 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mt: 1.6 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: tone === 'none' ? theme.textOnBgMuted : TONE_COLOR[tone] }} />
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: theme.textOnBg }}>
          {user.lastActiveAt ? `Ativo ${timeAgo(user.lastActiveAt)}` : 'Nunca apareceu depois do cadastro'}
        </Typography>
      </Stack>
      <Box sx={{ mt: 1.2, display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
        <UserBadges user={user} />
      </Box>

      <Box sx={{ mt: 2.2, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 0.8 }}>
        <Tile value={user.collectionsOwned} label="escreve" />
        <Tile value={user.collectionsReading} label="lê" />
        <Tile value={user.collected} label="bilhetes" />
        <Tile value={user.favorites} label="favoritos" />
        <Tile value={user.achievements} label="conquistas" />
        <Tile value={user.createdAt ? Math.max(0, Math.floor((Date.now() - Date.parse(user.createdAt)) / 86_400_000)) : 0} label="dias de conta" />
      </Box>

      <Section title="Linha do tempo">
        <Timeline user={user} />
      </Section>

      <Section title="Conta">
        <Row label="Entra com" value={user.hasPassword ? 'Email e senha' : 'Google'} />
        <Row label="Email" value={user.emailVerified === false ? 'Não verificado' : user.emailVerified ? 'Verificado' : 'Sem registro'} />
        <Row label="Notificações" value={user.push ? 'Ativadas' : 'Desativadas'} />
        <Row label="Tutorial" value={user.onboardingDone ? 'Concluído' : 'Não concluído'} />
      </Section>

      <Typography sx={{ mt: 2.4, fontSize: '0.66rem', color: theme.textOnBgMuted, textAlign: 'center' }}>
        Email mascarado por segurança · ref. {user.id.slice(0, 8)}
      </Typography>
    </Box>
  )
}

export function UserDrawer({ user, onClose }: { user: AdminUserRow | null; onClose: () => void }) {
  const { theme } = useBackground()
  const isDesktop = useMediaQuery('(min-width: 900px)', { noSsr: true })
  return (
    <Drawer
      anchor={isDesktop ? 'right' : 'bottom'}
      open={!!user}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: isDesktop ? 420 : '100%',
            maxHeight: isDesktop ? '100%' : '88dvh',
            borderRadius: isDesktop ? `${radius.xl} 0 0 ${radius.xl}` : `${radius.xl} ${radius.xl} 0 0`,
            background: theme.isDark ? 'rgba(17,22,38,0.97)' : 'rgba(255,255,255,0.98)',
            backgroundImage: `linear-gradient(160deg, ${theme.accent}14, transparent 40%)`,
            backdropFilter: 'blur(20px)',
            borderLeft: isDesktop ? `1px solid ${theme.surfaceBorder}` : 'none',
          },
        },
      }}
    >
      {user && <UserProfile user={user} onClose={onClose} handle={!isDesktop} />}
    </Drawer>
  )
}
