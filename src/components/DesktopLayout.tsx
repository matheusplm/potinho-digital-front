import HomeIcon from '@mui/icons-material/Home'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import BlockIcon from '@mui/icons-material/Block'
import LogoutIcon from '@mui/icons-material/Logout'
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined'
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import { Box, Divider, Popover, Stack, Typography } from '@mui/material'
import { Suspense, startTransition, useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { PushPrompt } from './PushPrompt'
import { SimulateReaderSheet } from './SimulateReaderSheet'
import { SimulationBanner } from './SimulationBanner'
import { LoadingState, toast } from './ui'
import { useUser, type Persona } from '../context/UserContext'
import { useSimulation } from '../context/SimulationContext'
import { useReader } from '../context/ReaderContext'
import { useNotificationToggle } from '../hooks/useNotificationToggle'
import { useBackground } from '../context/BackgroundContext'
import { ThemeSwatches } from './ThemeSwatches'
import { MenuAction } from './MenuAction'
import { useTour } from '../tour/TourContext'
import { withAlpha } from '../utils/colorUtils'
import { useCollectionsQuery, useMyNotificationsQuery, usePendingInvitesQuery, useReaderAchievementsQuery } from '../hooks/useNotes'
import { useSupportUnreadQuery } from '../hooks/useAdmin'
import { backgroundThemes, bellRing, colors, dotPing, font, radius, clipOverflow } from '../design-system'
import { collectionSlug } from '../utils/slug'
import { BrandMark, Copyright } from './Brand'
import { isCollectionReader, personaCapabilities } from '../utils/collectionAccess'

const SIDEBAR_W = 240

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  action?: 'simulate' | 'end-simulation'
}

const ADMIN_NAV: NavItem[] = [
  { label: 'Visão geral', path: '/home', icon: <InsightsOutlinedIcon /> },
  { label: 'Usuários', path: '/admin/usuarios', icon: <PeopleAltOutlinedIcon /> },
  { label: 'Coleções', path: '/admin/colecoes', icon: <Inventory2Icon /> },
  { label: 'Suporte', path: '/admin/suporte', icon: <SupportAgentOutlinedIcon /> },
]

const WRITER_NAV: NavItem[] = [
  { label: 'Início', path: '/home', icon: <HomeIcon /> },
  { label: 'Coleções', path: '/colecoes', icon: <Inventory2Icon /> },
  { label: 'Simular', path: '/simular', icon: <VisibilityOutlinedIcon />, action: 'simulate' },
]

export function DesktopLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, persona, setPersona, logout } = useUser()
  const { theme, maskLightCards, setMaskLightCards } = useBackground()
  const tour = useTour()
  const { isActive, session, endSimulation, hasUnreadNotes } = useSimulation()
  const { hasUnread: readerHasUnread, activeCollectionId, setActiveCollectionId, unreadFor } = useReader()
  const [simulateOpen, setSimulateOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const themeAnchor = useRef<HTMLDivElement>(null)
  const isReader = persona === 'reader' && !isActive

  const { data: collections = [] } = useCollectionsQuery()
  const { data: pendingInvites = [] } = usePendingInvitesQuery({ enabled: !!user })
  const hasPendingInvites = pendingInvites.length > 0
  const { data: supportUnread = 0 } = useSupportUnreadQuery()

  const { canWriter, canReader } = useMemo(
    () => personaCapabilities(collections, user?.id, user?.role ?? 'writer'),
    [collections, user?.id, user?.role],
  )

  const readerCollections = useMemo(
    () => (isReader ? collections.filter((c) => isCollectionReader(c, user?.id)) : []),
    [collections, isReader, user?.id],
  )

  const readerActive = useMemo(() => {
    if (!isReader) return undefined
    return readerCollections.find((c) => c.id === activeCollectionId) ?? readerCollections[0]
  }, [isReader, readerCollections, activeCollectionId])

  const readerAlbumPath = readerActive ? `/colecoes/${collectionSlug(readerActive, collections)}` : '/home'

  const { data: myNotifications = [] } = useMyNotificationsQuery({ enabled: isReader })
  const hasUnreadNotifications = useMemo(() => myNotifications.some((n) => !n.readAt), [myNotifications])

  const { data: readerAch } = useReaderAchievementsQuery(readerActive?.id ?? '', { enabled: isReader && !!readerActive })
  const justUnlockedKey = (readerAch?.justUnlocked ?? []).join(',')
  useEffect(() => {
    if (!readerAch || readerAch.justUnlocked.length === 0) return
    const byId = Object.fromEntries(readerAch.achievements.map((a) => [a.id, a]))
    readerAch.justUnlocked.forEach((id) => {
      const a = byId[id]
      if (a) toast.achievement(a.emoji, a.label, a.description)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justUnlockedKey])

  const { supported: notifSupported, status: notifStatus, enabled: notifEnabled, toggle: handleNotificationToggle } = useNotificationToggle()

  const items = useMemo<NavItem[]>(() => {
    if (isReader) {
      return [
        { label: 'Início', path: '/home', icon: <HomeIcon /> },
        { label: 'Coleção', path: readerAlbumPath, icon: <AutoStoriesOutlinedIcon /> },
        { label: 'Conquistas', path: '/conquistas', icon: <EmojiEventsOutlinedIcon /> },
        { label: 'Favoritas', path: '/favoritas', icon: <FavoriteBorderIcon /> },
        { label: 'Novidades', path: '/notificacoes', icon: <NotificationsNoneOutlinedIcon /> },
      ]
    }
    if (persona === 'admin') return ADMIN_NAV
    if (persona !== 'writer') return [{ label: 'Início', path: '/home', icon: <HomeIcon /> }]
    if (isActive) {
      return [
        { label: 'Início', path: '/home', icon: <HomeIcon /> },
        { label: 'Coleção', path: session ? `/colecoes/${session.collectionSlug}` : '/colecoes', icon: <Inventory2Icon /> },
        { label: 'Encerrar', path: '/simular', icon: <StopCircleOutlinedIcon />, action: 'end-simulation' as const },
      ]
    }
    return WRITER_NAV
  }, [isReader, readerAlbumPath, persona, isActive, session])

  const navValue = useMemo(() => {
    if (isActive && location.pathname.startsWith('/colecoes/') && !location.pathname.endsWith('/gerenciar')) {
      return session ? `/colecoes/${session.collectionSlug}` : '/colecoes'
    }
    if (isReader && location.pathname.startsWith('/colecoes/')) return readerAlbumPath
    const match = items.find((item) => item.path !== '/simular' && location.pathname.startsWith(item.path))
    return match?.path ?? null
  }, [location.pathname, items, isActive, isReader, readerAlbumPath, session])

  function switchPersona(next: Persona) {
    if (next === persona) return
    if (next === 'admin' && !user?.isAdmin) return
    if (next === 'writer' && !canWriter) return
    if (next === 'reader' && !canReader && !hasPendingInvites) return
    startTransition(() => {
      setPersona(next)
      navigate('/home')
    })
  }

  return (
    <Box sx={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: theme.gradient }}>

      <Box sx={{
        width: SIDEBAR_W, flexShrink: 0, height: '100%',
        display: 'flex', flexDirection: 'column',
        background: theme.surfaceBg, backdropFilter: 'blur(20px)',
        borderRight: `1px solid ${theme.surfaceBorder}`,
        overflowY: 'auto', overflowX: 'hidden',
        scrollbarWidth: 'thin',
      }}>

        <BrandMark logo={36} size="1.2rem" color={theme.textOnBg} mutedColor={theme.textOnBgMuted} tagline sx={{ px: 2, pt: 2.5, pb: 2 }} />

        <Divider sx={{ borderColor: theme.surfaceBorder }} />

        <Box sx={{ px: 2, py: 1.6 }}>
          <Typography variant="xl" sx={{ fontFamily: font.serif, fontWeight: 700, color: theme.textOnBg, lineHeight: 1.2, wordBreak: 'break-word' }}>
            {user?.name}
          </Typography>
          <Typography variant="sm" sx={{ color: theme.textOnBgMuted, mt: 0.2 }}>
            {persona === 'writer' ? 'escritor' : persona === 'admin' ? 'admin' : 'leitor'}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: theme.surfaceBorder }} />

        {isActive && session && (
          <>
            <Box sx={{
              mx: 1.5, my: 1.2, px: 1.2, py: 1,
              borderRadius: radius.lg, background: `${colors.primary.main}0e`,
              border: `1.5px solid ${colors.primary.main}22`,
            }}>
              <Stack direction="row" spacing={0.8} alignItems="center">
                <VisibilityOutlinedIcon sx={{ fontSize: 14, color: colors.primary.text, flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="label" sx={{ color: colors.primary.text }}>
                    Prévia
                  </Typography>
                  <Typography variant="md" sx={{ fontWeight: 700, color: theme.textOnBg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {session.collectionEmoji} {session.collectionName}
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Divider sx={{ borderColor: theme.surfaceBorder }} />
          </>
        )}

        <Stack sx={{ px: 0.7, py: 1.4, flex: '0 0 auto' }} spacing={0.3}>
          {items.map((item) => {
            const active = navValue === item.path
            const isEnd = item.action === 'end-simulation'
            const newsAttention = item.label === 'Novidades' && (hasUnreadNotifications || hasPendingInvites) && !active
            const showDot = (item.label === 'Coleção' && ((isActive && hasUnreadNotes) || (isReader && readerHasUnread))) ||
              (item.label === 'Novidades' && (hasUnreadNotifications || hasPendingInvites)) ||
              (item.path === '/admin/suporte' && supportUnread > 0)
            const accentColor = isEnd ? colors.rose.main : theme.accent
            return (
              <Box
                key={item.path + item.label}
                data-tour={`nav-${item.path.split('/')[1]}`}
                onClick={() => {
                  if (item.action === 'simulate') { setSimulateOpen(true); return }
                  if (item.action === 'end-simulation') { endSimulation(); navigate('/colecoes'); return }
                  navigate(item.path)
                }}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.2,
                  px: 1.3, py: 0.85, borderRadius: radius.lg, cursor: 'pointer',
                  background: active || isEnd ? `${accentColor}12` : 'transparent',
                  transition: 'background 0.16s',
                  position: 'relative',
                  '&:hover': { background: active || isEnd ? `${accentColor}18` : colors.fill.subtle },
                  '& svg': {
                    fontSize: '1.18rem',
                    color: active || isEnd ? accentColor : theme.textOnBgMuted,
                    transition: 'color 0.16s',
                  },
                }}
              >
                <Box sx={{
                  position: 'relative', flexShrink: 0, display: 'flex',
                  ...(newsAttention ? {
                    '& > svg': { animation: `${bellRing} 2.8s ease-in-out 0.4s infinite`, transformOrigin: '50% 15%' },
                    '@media (prefers-reduced-motion: reduce)': { '& > svg': { animation: 'none' } },
                  } : {}),
                }}>
                  {item.icon}
                  {showDot && (
                    <Box sx={{
                      position: 'absolute', top: -2, right: -4,
                      width: 7, height: 7, borderRadius: radius.full,
                      background: colors.rose.main,
                      border: `2px solid ${theme.isDark ? 'rgba(0,0,0,0.88)' : 'rgba(255,253,251,0.97)'}`,
                      ...(newsAttention ? {
                        '&::after': {
                          content: '""', position: 'absolute', inset: -2, borderRadius: radius.full, background: colors.rose.main,
                          animation: `${dotPing} 1.6s cubic-bezier(0,0,0.2,1) infinite`,
                        },
                        '@media (prefers-reduced-motion: reduce)': { '&::after': { animation: 'none', display: 'none' } },
                      } : {}),
                    }} />
                  )}
                </Box>
                <Typography variant="lg" sx={{
                  fontWeight: active || isEnd ? 700 : 500,
                  color: active || isEnd ? accentColor : theme.textOnBgMuted,
                  transition: 'color 0.16s',
                }}>
                  {item.label}
                </Typography>
              </Box>
            )
          })}
        </Stack>

        {readerCollections.length > 1 && (
          <>
            <Divider sx={{ borderColor: theme.surfaceBorder }} />
            <Box sx={{ px: 2, py: 1.4 }}>
              <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mb: 1 }}>
                <SwapHorizIcon sx={{ fontSize: 13, color: theme.textOnBgMuted }} />
                <Typography variant="label" sx={{ color: theme.textOnBgMuted }}>
                  Seus potinhos
                </Typography>
              </Stack>
              <Stack spacing={0.4}>
                {readerCollections.map((col) => {
                  const active = col.id === activeCollectionId
                  const hasUnread = unreadFor(col.id).length > 0
                  const bg = backgroundThemes.find((t) => t.key === col.theme) ?? backgroundThemes[0]
                  return (
                    <Stack
                      key={col.id}
                      direction="row" spacing={0.9} alignItems="center"
                      onClick={() => { setActiveCollectionId(col.id); navigate('/home') }}
                      sx={{
                        px: 0.8, py: 0.65, borderRadius: radius.md, cursor: 'pointer',
                        border: `1.5px solid ${active ? `${theme.accent}55` : 'transparent'}`,
                        background: active ? `${theme.accent}0c` : 'transparent',
                        transition: 'background 0.12s',
                        '&:hover': { background: active ? `${theme.accent}14` : colors.fill.subtle },
                      }}
                    >
                      <Box sx={{
                        width: 26, height: 26, borderRadius: radius.sm, flexShrink: 0,
                        background: bg.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.85rem', position: 'relative',
                      }}>
                        {col.emoji}
                        {hasUnread && !active && (
                          <Box sx={{
                            position: 'absolute', top: -3, right: -3, width: 8, height: 8,
                            borderRadius: radius.full, background: colors.rose.main,
                            border: '2px solid rgba(255,253,251,0.97)',
                          }} />
                        )}
                      </Box>
                      <Typography variant="md" sx={{
                        flex: 1, minWidth: 0,
                        fontWeight: active ? 700 : 500, color: theme.textOnBg,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {col.name}
                      </Typography>
                    </Stack>
                  )
                })}
              </Stack>
            </Box>
          </>
        )}

        <Box sx={{ flex: 1 }} />

        <Divider sx={{ borderColor: theme.surfaceBorder }} />

        {(canWriter || canReader || user?.isAdmin) && (
          <Box sx={{ px: 2, pt: 1.75, pb: 1.25 }}>
            <Typography variant="label" sx={{ color: theme.textOnBgMuted, mb: 1 }}>
              Modo
            </Typography>
            <Stack direction="row" spacing={0.6}>
              {([
                { role: 'reader' as const, label: 'Leitor', icon: <MenuBookOutlinedIcon sx={{ fontSize: 13 }} />, enabled: canReader || hasPendingInvites },
                { role: 'writer' as const, label: 'Escritor', icon: <EditOutlinedIcon sx={{ fontSize: 13 }} />, enabled: canWriter },
                ...(user?.isAdmin ? [{ role: 'admin' as const, label: 'Admin', icon: <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 13 }} />, enabled: true }] : []),
              ] satisfies Array<{ role: Persona; label: string; icon: React.ReactNode; enabled: boolean }>).map(({ role, label, icon, enabled }) => {
                const active = persona === role
                const showInviteDot = (role === 'reader' && hasPendingInvites && persona !== 'reader') || (role === 'admin' && supportUnread > 0 && persona !== 'admin')
                return (
                  <Box
                    key={role}
                    onClick={() => enabled && switchPersona(role)}
                    sx={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.4,
                      position: 'relative',
                      py: 0.75, borderRadius: radius.md, cursor: enabled ? 'pointer' : 'default',
                      border: `1.5px solid ${active ? withAlpha(theme.accent, 34) : theme.surfaceBorder}`,
                      background: active ? withAlpha(theme.accent, 7) : 'transparent',
                      opacity: enabled ? 1 : 0.6,
                      transition: 'all 0.14s',
                      '&:hover': enabled ? { background: active ? withAlpha(theme.accent, 9) : colors.fill.subtle } : undefined,
                    }}
                  >
                    {showInviteDot && (
                      <Box sx={{ position: 'absolute', top: -3, right: -3, width: 10, height: 10, borderRadius: '50%', background: colors.status.danger, border: '2px solid #fff', boxShadow: '0 1px 4px rgba(239,68,68,0.5)' }} />
                    )}
                    <Box sx={{ display: 'flex', '& svg': { fontSize: '0.9rem', color: active ? theme.accent : theme.textOnBgMuted } }}>{icon}</Box>
                    <Typography variant="sm" sx={{ fontWeight: active ? 700 : 500, color: active ? theme.accent : theme.textOnBgMuted }}>
                      {label}
                    </Typography>
                  </Box>
                )
              })}
            </Stack>
          </Box>
        )}

        <Divider sx={{ borderColor: theme.surfaceBorder }} />

        <Stack spacing={0.3} sx={{ px: 0.7, pt: 1, pb: 0.5 }}>
          {notifSupported && (
            <MenuAction
              icon={notifStatus === 'denied' ? <BlockIcon /> : notifEnabled ? <NotificationsActiveIcon /> : <NotificationsNoneOutlinedIcon />}
              label="Notificações"
              tone={notifEnabled ? theme.accent : theme.textOnBgMuted}
              labelColor={theme.textOnBg}
              disabled={notifStatus === 'denied'}
              title={notifStatus === 'denied' ? 'Ative nas configurações do navegador' : undefined}
              onClick={() => { void handleNotificationToggle() }}
              badge={{ label: notifStatus === 'denied' ? 'bloqueadas' : notifEnabled ? 'ativas' : 'ativar', active: notifEnabled }}
            />
          )}
          <Box ref={themeAnchor}>
            <MenuAction
              icon={<PaletteOutlinedIcon />}
              label="Tema de fundo"
              tone={theme.accent}
              labelColor={theme.textOnBg}
              onClick={() => setThemeOpen(true)}
              badge={{ label: theme.label, active: false }}
            />
          </Box>
          <MenuAction icon={<ManageAccountsOutlinedIcon />} label="Minha conta" tone={theme.accent} labelColor={theme.textOnBg} onClick={() => navigate('/conta')} />
          {persona === 'writer' && (
            <MenuAction icon={<PlayCircleOutlineIcon />} label="Ver tutorial" tone={theme.accent} labelColor={theme.textOnBg} onClick={tour.start} />
          )}
          <MenuAction icon={<LogoutIcon />} label="Sair" tone={colors.rose.text} labelColor={colors.rose.text} onClick={logout} />
        </Stack>
        <Copyright color={theme.textOnBgMuted} sx={{ px: 2, pt: 1, pb: 2 }} />
        <Popover
          open={themeOpen}
          anchorEl={themeAnchor.current}
          onClose={() => setThemeOpen(false)}
          anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
          transformOrigin={{ vertical: 'center', horizontal: 'left' }}
          slotProps={{ paper: { sx: { ml: 1.2, p: 2, width: 248, borderRadius: radius.lg, background: theme.surfaceBg, backdropFilter: 'blur(24px)', border: `1px solid ${theme.surfaceBorder}`, boxShadow: '0 18px 48px rgba(0,0,0,0.22)' } } }}
        >
          <Typography variant="label" sx={{ color: theme.textOnBgMuted, mb: 1, display: 'block' }}>
            Tema de fundo
          </Typography>
          <ThemeSwatches size={24} labelColor={theme.textOnBgMuted} />
          {theme.isDark && (
            <Stack direction="row" spacing={1.1} alignItems="flex-start" onClick={() => setMaskLightCards(!maskLightCards)} sx={{ mt: 1.5, cursor: 'pointer', userSelect: 'none' }}>
              <Box sx={{
                width: 30, height: 17, mt: 0.2, borderRadius: radius.full, flexShrink: 0, position: 'relative',
                background: maskLightCards ? theme.accent : 'rgba(255,255,255,0.18)', transition: 'background 0.18s',
              }}>
                <Box sx={{
                  position: 'absolute', top: 2, left: maskLightCards ? 15 : 2, width: 13, height: 13, borderRadius: '50%',
                  background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.3)', transition: 'left 0.18s',
                }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="xs" sx={{ fontWeight: 700, color: theme.textOnBg, lineHeight: 1.3 }}>
                  Suavizar bilhetes claros
                </Typography>
                <Typography variant="xxs" sx={{ color: theme.textOnBgMuted, lineHeight: 1.35 }}>
                  máscara escura sobre cards muito brancos
                </Typography>
              </Box>
            </Stack>
          )}
        </Popover>
      </Box>

      <Box sx={{ flex: 1, height: '100%', ...clipOverflow, position: 'relative' }}>
        <SimulationBanner />
        {location.pathname === '/home' && !isActive && persona !== 'admin' && !tour.step && <PushPrompt />}
        <Suspense fallback={<Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoadingState label="Carregando" /></Box>}>
          <Outlet />
        </Suspense>
      </Box>

      <SimulateReaderSheet open={simulateOpen} onClose={() => setSimulateOpen(false)} />
    </Box>
  )
}
