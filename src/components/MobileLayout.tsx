import HomeIcon from '@mui/icons-material/Home'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined'
import { Box, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { FloatingMenu } from './FloatingMenu'
import { PushPrompt } from './PushPrompt'
import { SimulateReaderSheet } from './SimulateReaderSheet'
import { SimulationBanner } from './SimulationBanner'
import { ScrollHint, toast } from './ui'
import { useUser } from '../context/UserContext'
import { useSimulation } from '../context/SimulationContext'
import { useReader } from '../context/ReaderContext'
import { useBackground } from '../context/BackgroundContext'
import { useCollectionsQuery, useReaderAchievementsQuery } from '../hooks/useNotes'
import { slugify } from '../utils/slug'
import { isCollectionReader } from '../utils/collectionAccess'
import { colors, radius } from '../design-system'

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

export function MobileLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, persona } = useUser()
  const { theme } = useBackground()
  const { isActive, session, endSimulation, hasUnreadNotes } = useSimulation()
  const { hasUnread: readerHasUnread, activeCollectionId } = useReader()
  const [simulateOpen, setSimulateOpen] = useState(false)
  const isReader = persona === 'reader' && !isActive

  const { data: collections = [] } = useCollectionsQuery()
  const readerActive = useMemo(() => {
    if (!isReader) return undefined
    const readerCollections = collections.filter((c) => isCollectionReader(c, user?.id))
    return readerCollections.find((c) => c.id === activeCollectionId) ?? readerCollections[0]
  }, [isReader, collections, activeCollectionId, user?.id])
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

  const items = useMemo<NavItem[]>(() => {
    if (isReader) {
      return [
        { label: 'Início', path: '/home', icon: <HomeIcon /> },
        { label: 'Coleção', path: readerAlbumPath, icon: <AutoStoriesOutlinedIcon /> },
        { label: 'Conquistas', path: '/conquistas', icon: <EmojiEventsOutlinedIcon /> },
        { label: 'Favoritas', path: '/favoritas', icon: <FavoriteBorderIcon /> },
      ]
    }
    if (persona !== 'writer') {
      return [{ label: 'Início', path: '/home', icon: <HomeIcon /> }]
    }
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
    if (isReader && location.pathname.startsWith('/colecoes/')) {
      return readerAlbumPath
    }
    const match = items.find((item) => item.path !== '/simular' && location.pathname.startsWith(item.path))
    return match?.path ?? '/home'
  }, [location.pathname, items, isActive, isReader, readerAlbumPath, session])

  const bannerOffset = isActive ? '52px' : '0px'

  return (
    <Box sx={{ background: theme.gradient, minHeight: '100dvh' }}>
    <Box sx={{ width: '100%', maxWidth: 480, height: '100dvh', mx: 'auto', overflow: 'hidden' }}>
      <FloatingMenu />
      <SimulationBanner />
      {location.pathname === '/home' && !isActive && <PushPrompt />}

      <Box component="main" sx={{
        height: `calc(100% - 64px - env(safe-area-inset-bottom, 0px) - ${bannerOffset})`,
        mt: bannerOffset,
        transition: 'margin-top 0.22s ease, height 0.22s ease',
      }}>
        <Outlet />
      </Box>

      <ScrollHint />

      <Box sx={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480, zIndex: 100,
        background: theme.surfaceBg, backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${theme.surfaceBorder}`,
        pb: 'env(safe-area-inset-bottom, 0px)',
      }}>
        <Box sx={{ display: 'flex', height: 64 }}>
          {items.map((item) => {
            const active = navValue === item.path
            const isEnd = item.action === 'end-simulation'
            const showUnreadDot =
              item.label === 'Coleção' && ((isActive && hasUnreadNotes) || (isReader && readerHasUnread))
            return (
              <Box
                key={item.path + item.label}
                onClick={() => {
                  if (item.action === 'simulate') {
                    setSimulateOpen(true)
                    return
                  }
                  if (item.action === 'end-simulation') {
                    endSimulation()
                    navigate('/colecoes')
                    return
                  }
                  navigate(item.path)
                }}
                sx={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 0.45, cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  '&:active': { opacity: 0.65 },
                }}
              >
                <Box sx={{
                  px: 1.8, py: 0.5, borderRadius: radius.full,
                  background: active || isEnd ? `${isEnd ? colors.rose.main : theme.accent}18` : 'transparent',
                  transition: 'background 0.22s cubic-bezier(0.16,1,0.3,1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                  '& svg': {
                    fontSize: '1.25rem',
                    color: active || isEnd ? (isEnd ? colors.rose.main : theme.accent) : theme.textOnBgMuted,
                    transition: 'color 0.18s, transform 0.22s cubic-bezier(0.16,1,0.3,1)',
                    transform: active ? 'scale(1.15)' : 'scale(1)',
                  },
                }}>
                  {item.icon}
                  {showUnreadDot && (
                    <Box sx={{
                      position: 'absolute',
                      top: 2,
                      right: 8,
                      width: 8,
                      height: 8,
                      borderRadius: radius.full,
                      background: colors.rose.main,
                      boxShadow: `0 0 0 3px ${theme.isDark ? 'rgba(0,0,0,0.88)' : 'rgba(255,253,251,0.96)'}, 0 0 12px ${colors.rose.glow}`,
                    }} />
                  )}
                </Box>
                <Typography sx={{
                  fontSize: '0.70rem',
                  fontWeight: active || isEnd ? 700 : 500,
                  color: active || isEnd ? (isEnd ? colors.rose.main : theme.accent) : theme.textOnBgMuted,
                  lineHeight: 1, letterSpacing: 0.1,
                  transition: 'color 0.18s',
                  whiteSpace: 'nowrap',
                }}>
                  {item.label}
                </Typography>
              </Box>
            )
          })}
        </Box>
      </Box>

      <SimulateReaderSheet open={simulateOpen} onClose={() => setSimulateOpen(false)} />
    </Box>
    </Box>
  )
}
