import FavoriteIcon from '@mui/icons-material/Favorite'
import HomeIcon from '@mui/icons-material/Home'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import CheckIcon from '@mui/icons-material/Check'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import BlockIcon from '@mui/icons-material/Block'
import LogoutIcon from '@mui/icons-material/Logout'
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import { Box, Divider, Stack, Tooltip, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { PushPrompt } from './PushPrompt'
import { SimulateReaderSheet } from './SimulateReaderSheet'
import { SimulationBanner } from './SimulationBanner'
import { toast } from './ui'
import { useUser, type UserRole } from '../context/UserContext'
import { useSimulation } from '../context/SimulationContext'
import { useReader } from '../context/ReaderContext'
import { useBackground } from '../context/BackgroundContext'
import { useCollectionsQuery, useReaderAchievementsQuery } from '../hooks/useNotes'
import { backgroundThemes, colors, font, radius } from '../design-system'
import { slugify } from '../utils/slug'
import { isCollectionReader, personaCapabilities } from '../utils/collectionAccess'

const SIDEBAR_W = 240

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  action?: 'simulate' | 'end-simulation'
}

const WRITER_NAV: NavItem[] = [
  { label: 'Início', path: '/home', icon: <HomeIcon /> },
  { label: 'Coleções', path: '/colecoes', icon: <Inventory2Icon /> },
  { label: 'Simular', path: '/simular', icon: <VisibilityOutlinedIcon />, action: 'simulate' },
]

export function DesktopLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, persona, setPersona, logout } = useUser()
  const { theme, themeKey, setThemeKey } = useBackground()
  const { isActive, session, endSimulation, hasUnreadNotes } = useSimulation()
  const { hasUnread: readerHasUnread, activeCollectionId, setActiveCollectionId, unreadFor } = useReader()
  const [simulateOpen, setSimulateOpen] = useState(false)
  const isReader = persona === 'reader' && !isActive

  const { data: collections = [] } = useCollectionsQuery()

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

  const readerAlbumPath = readerActive ? `/colecoes/${slugify(readerActive.name)}` : '/home'

  const { data: readerAch } = useReaderAchievementsQuery(readerActive?.id ?? '', { enabled: isReader && !!readerActive })
  const justUnlockedKey = (readerAch?.justUnlocked ?? []).join(',')
  useEffect(() => {
    if (!readerAch || readerAch.justUnlocked.length === 0) return
    const byId = Object.fromEntries(readerAch.achievements.map((a) => [a.id, a]))
    readerAch.justUnlocked.forEach((id) => {
      const a = byId[id]
      if (a) toast.love('Conquista desbloqueada! 🏆', { description: `${a.emoji} ${a.label}` })
    })
  }, [justUnlockedKey])

  const notifSupported = typeof Notification !== 'undefined'
  const [notifEnabled, setNotifEnabled] = useState(
    () => notifSupported && Notification.permission === 'granted' && localStorage.getItem('potinho-notif') === 'true',
  )
  const notifStatus = notifSupported ? Notification.permission : 'denied'

  async function handleNotificationToggle() {
    if (!notifSupported || notifStatus === 'denied') return
    if (notifEnabled) {
      localStorage.removeItem('potinho-notif')
      setNotifEnabled(false)
      return
    }
    const result = await Notification.requestPermission()
    if (result === 'granted') {
      localStorage.setItem('potinho-notif', 'true')
      setNotifEnabled(true)
      new Notification('Potinho Digital 🎁', { body: 'Notificações ativadas!' })
    }
  }

  const items = useMemo<NavItem[]>(() => {
    if (isReader) {
      return [
        { label: 'Início', path: '/home', icon: <HomeIcon /> },
        { label: 'Coleção', path: readerAlbumPath, icon: <AutoStoriesOutlinedIcon /> },
        { label: 'Conquistas', path: '/conquistas', icon: <EmojiEventsOutlinedIcon /> },
        { label: 'Favoritas', path: '/favoritas', icon: <FavoriteBorderIcon /> },
      ]
    }
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
    return match?.path ?? '/home'
  }, [location.pathname, items, isActive, isReader, readerAlbumPath, session])

  function switchPersona(next: UserRole) {
    if (next === persona) return
    if (next === 'writer' && !canWriter) return
    if (next === 'reader' && !canReader) return
    setPersona(next)
    navigate('/home')
  }

  return (
    <Box sx={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: theme.gradient }}>

      {/* ── Sidebar ── */}
      <Box sx={{
        width: SIDEBAR_W, flexShrink: 0, height: '100%',
        display: 'flex', flexDirection: 'column',
        background: theme.surfaceBg, backdropFilter: 'blur(20px)',
        borderRight: `1px solid ${theme.surfaceBorder}`,
        overflowY: 'auto', overflowX: 'hidden',
        scrollbarWidth: 'thin',
      }}>

        {/* Brand */}
        <Stack direction="row" spacing={1.4} alignItems="center" sx={{ px: 2, pt: 2.5, pb: 2 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: radius.lg, flexShrink: 0,
            background: `linear-gradient(135deg, ${colors.primary.main}, ${theme.accent})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FavoriteIcon sx={{ fontSize: 17, color: '#fff' }} />
          </Box>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1rem', color: theme.textOnBg, lineHeight: 1.2 }}>
            Potinho Digital
          </Typography>
        </Stack>

        <Divider sx={{ borderColor: theme.surfaceBorder }} />

        {/* User info */}
        <Box sx={{ px: 2, py: 1.6 }}>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '0.94rem', color: theme.textOnBg, lineHeight: 1.2, wordBreak: 'break-word' }}>
            {user?.name}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: theme.textOnBgMuted, mt: 0.2 }}>
            {persona === 'writer' ? 'escritor' : 'leitor'}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: theme.surfaceBorder }} />

        {/* Simulation indicator */}
        {isActive && session && (
          <>
            <Box sx={{
              mx: 1.5, my: 1.2, px: 1.2, py: 1,
              borderRadius: radius.lg, background: `${colors.primary.main}0e`,
              border: `1.5px solid ${colors.primary.main}22`,
            }}>
              <Stack direction="row" spacing={0.8} alignItems="center">
                <VisibilityOutlinedIcon sx={{ fontSize: 14, color: colors.primary.main, flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, letterSpacing: 0.5, color: colors.primary.main, textTransform: 'uppercase' }}>
                    Prévia
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: theme.textOnBg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {session.collectionEmoji} {session.collectionName}
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Divider sx={{ borderColor: theme.surfaceBorder }} />
          </>
        )}

        {/* Nav items */}
        <Stack sx={{ px: 1.2, py: 1.4, flex: '0 0 auto' }} spacing={0.3}>
          {items.map((item) => {
            const active = navValue === item.path
            const isEnd = item.action === 'end-simulation'
            const showDot = item.label === 'Coleção' && ((isActive && hasUnreadNotes) || (isReader && readerHasUnread))
            const accentColor = isEnd ? colors.rose.main : theme.accent
            return (
              <Box
                key={item.path + item.label}
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
                  '&:hover': { background: active || isEnd ? `${accentColor}18` : theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' },
                  '& svg': {
                    fontSize: '1.18rem',
                    color: active || isEnd ? accentColor : theme.textOnBgMuted,
                    transition: 'color 0.16s',
                  },
                }}
              >
                <Box sx={{ position: 'relative', flexShrink: 0 }}>
                  {item.icon}
                  {showDot && (
                    <Box sx={{
                      position: 'absolute', top: -2, right: -4,
                      width: 7, height: 7, borderRadius: radius.full,
                      background: colors.rose.main,
                      border: `2px solid ${theme.isDark ? 'rgba(0,0,0,0.88)' : 'rgba(255,253,251,0.97)'}`,
                    }} />
                  )}
                </Box>
                <Typography sx={{
                  fontSize: '0.88rem', fontWeight: active || isEnd ? 700 : 500,
                  color: active || isEnd ? accentColor : theme.textOnBgMuted,
                  transition: 'color 0.16s',
                }}>
                  {item.label}
                </Typography>
              </Box>
            )
          })}
        </Stack>

        {/* Collection switcher */}
        {readerCollections.length > 1 && (
          <>
            <Divider sx={{ borderColor: theme.surfaceBorder }} />
            <Box sx={{ px: 2, py: 1.4 }}>
              <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mb: 1 }}>
                <SwapHorizIcon sx={{ fontSize: 13, color: theme.textOnBgMuted }} />
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: 0.5, color: theme.textOnBgMuted, textTransform: 'uppercase' }}>
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
                        '&:hover': { background: active ? `${theme.accent}14` : theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' },
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
                      <Typography sx={{
                        flex: 1, minWidth: 0, fontSize: '0.82rem',
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

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        <Divider sx={{ borderColor: theme.surfaceBorder }} />

        {/* Persona switch */}
        {(canWriter || canReader) && (
          <Box sx={{ px: 1.5, pt: 1.4, pb: 0.6 }}>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: 0.5, color: theme.textOnBgMuted, textTransform: 'uppercase', mb: 0.8, px: 0.3 }}>
              Modo
            </Typography>
            <Stack direction="row" spacing={0.5}>
              {([
                { role: 'reader' as const, label: 'Leitor', icon: <MenuBookOutlinedIcon sx={{ fontSize: 13 }} />, enabled: canReader },
                { role: 'writer' as const, label: 'Escritor', icon: <EditOutlinedIcon sx={{ fontSize: 13 }} />, enabled: canWriter },
              ]).map(({ role, label, icon, enabled }) => {
                const active = persona === role
                return (
                  <Box
                    key={role}
                    onClick={() => enabled && switchPersona(role)}
                    sx={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.4,
                      py: 0.7, borderRadius: radius.md, cursor: enabled ? 'pointer' : 'default',
                      border: `1.5px solid ${active ? `${theme.accent}55` : theme.surfaceBorder}`,
                      background: active ? `${theme.accent}10` : 'transparent',
                      opacity: enabled ? 1 : 0.4,
                      transition: 'all 0.14s',
                      '&:hover': enabled ? { background: active ? `${theme.accent}16` : theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' } : undefined,
                    }}
                  >
                    <Box sx={{ '& svg': { fontSize: '0.9rem', color: active ? theme.accent : theme.textOnBgMuted } }}>{icon}</Box>
                    <Typography sx={{ fontSize: '0.76rem', fontWeight: active ? 700 : 500, color: active ? theme.accent : theme.textOnBgMuted }}>
                      {label}
                    </Typography>
                  </Box>
                )
              })}
            </Stack>
          </Box>
        )}

        {/* Theme picker */}
        <Box sx={{ px: 2, pt: 1.2, pb: 1 }}>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: 0.5, color: theme.textOnBgMuted, textTransform: 'uppercase', mb: 0.9 }}>
            Tema de fundo
          </Typography>
          {([false, true] as const).map((dark) => (
            <Box key={String(dark)} sx={{ mb: 0.8 }}>
              <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: theme.textOnBgMuted, textTransform: 'uppercase', letterSpacing: 0.4, mb: 0.5 }}>
                {dark ? 'Escuros' : 'Claros'}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
                {backgroundThemes.filter((bg) => bg.isDark === dark).map((bg) => {
                  const active = bg.key === themeKey
                  return (
                    <Tooltip key={bg.key} title={bg.label} enterTouchDelay={0} placement="top" arrow>
                      <Box onClick={() => setThemeKey(bg.key)} sx={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: bg.gradient, cursor: 'pointer', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `2px solid ${active ? bg.accent : 'rgba(0,0,0,0.08)'}`,
                        boxShadow: active ? `0 2px 6px ${bg.accent}55` : 'none',
                        transition: 'all 0.16s',
                        '&:hover': { transform: 'scale(1.14)' },
                      }}>
                        {active && <CheckIcon sx={{ fontSize: 12, color: bg.accent }} />}
                      </Box>
                    </Tooltip>
                  )
                })}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Notifications */}
        {notifSupported && (
          <Box sx={{ px: 2, pb: 1 }}>
            <Stack
              direction="row" spacing={1.1} alignItems="center"
              onClick={() => { void handleNotificationToggle() }}
              sx={{
                py: 0.8, px: 1, borderRadius: radius.md, cursor: notifStatus === 'denied' ? 'not-allowed' : 'pointer',
                opacity: notifStatus === 'denied' ? 0.5 : 1,
                transition: 'background 0.12s',
                '&:hover': notifStatus !== 'denied' ? { bgcolor: `${theme.accent}0c` } : undefined,
              }}
            >
              <Box sx={{
                width: 28, height: 28, borderRadius: radius.sm, flexShrink: 0,
                background: notifEnabled ? `${theme.accent}16` : theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {notifStatus === 'denied'
                  ? <BlockIcon sx={{ fontSize: 14, color: theme.textOnBgMuted }} />
                  : notifEnabled
                    ? <NotificationsActiveIcon sx={{ fontSize: 14, color: theme.accent }} />
                    : <NotificationsNoneOutlinedIcon sx={{ fontSize: 14, color: theme.textOnBgMuted }} />
                }
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: theme.textOnBg }}>
                  {notifStatus === 'denied' ? 'Bloqueadas' : notifEnabled ? 'Notificações ativas' : 'Notificações'}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: theme.textOnBgMuted }}>
                  {notifStatus === 'denied' ? 'Ativar nas configurações' : notifEnabled ? 'Toque para desativar' : 'Toque para ativar'}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        {/* My account */}
        <Box sx={{ px: 2, pb: 0.5 }}>
          <Stack
            direction="row" spacing={1.1} alignItems="center"
            onClick={() => navigate('/conta')}
            sx={{
              py: 0.8, px: 1, borderRadius: radius.md, cursor: 'pointer',
              transition: 'background 0.12s',
              '&:hover': { bgcolor: `${theme.accent}0c` },
            }}
          >
            <Box sx={{
              width: 28, height: 28, borderRadius: radius.sm, flexShrink: 0,
              background: `${theme.accent}14`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ManageAccountsOutlinedIcon sx={{ fontSize: 14, color: theme.accent }} />
            </Box>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: theme.textOnBg }}>
              Minha conta
            </Typography>
          </Stack>
        </Box>

        {/* Logout */}
        <Box sx={{ px: 2, pb: 2.5 }}>
          <Stack
            direction="row" spacing={1.1} alignItems="center"
            onClick={logout}
            sx={{
              py: 0.8, px: 1, borderRadius: radius.md, cursor: 'pointer',
              transition: 'background 0.12s',
              '&:hover': { bgcolor: `${colors.rose.main}0c` },
            }}
          >
            <Box sx={{
              width: 28, height: 28, borderRadius: radius.sm, flexShrink: 0,
              background: `${colors.rose.main}14`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <LogoutIcon sx={{ fontSize: 14, color: colors.rose.main }} />
            </Box>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.rose.main }}>
              Sair
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* ── Content area ── */}
      <Box sx={{ flex: 1, height: '100%', overflow: 'hidden', position: 'relative' }}>
        <SimulationBanner />
        {location.pathname === '/home' && !isActive && <PushPrompt />}
        <Outlet />
      </Box>

      <SimulateReaderSheet open={simulateOpen} onClose={() => setSimulateOpen(false)} />
    </Box>
  )
}
