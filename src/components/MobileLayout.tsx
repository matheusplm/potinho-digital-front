import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import FavoriteIcon from '@mui/icons-material/Favorite'
import HomeIcon from '@mui/icons-material/Home'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import QueryStatsIcon from '@mui/icons-material/QueryStats'
import EditNoteIcon from '@mui/icons-material/EditNote'
import GroupIcon from '@mui/icons-material/Group'
import SettingsIcon from '@mui/icons-material/Settings'
import { Box, Typography } from '@mui/material'
import { useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { FloatingMenu } from './FloatingMenu'
import { ScrollHint } from './ui'
import { useUser } from '../context/UserContext'
import { useBackground } from '../context/BackgroundContext'
import { colors, radius } from '../design-system'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

const READER_NAV: NavItem[] = [
  { label: 'Início',    path: '/home',      icon: <HomeIcon /> },
  { label: 'Coleções',  path: '/colecoes',  icon: <Inventory2Icon /> },
  { label: 'Pacote',    path: '/pacotinho', icon: <AutoAwesomeIcon /> },
  { label: 'Favoritos', path: '/favoritos', icon: <FavoriteIcon /> },
  { label: 'Progresso', path: '/progresso', icon: <QueryStatsIcon /> },
]

const WRITER_NAV: NavItem[] = [
  { label: 'Início',    path: '/home',      icon: <HomeIcon /> },
  { label: 'Coleções',  path: '/colecoes',  icon: <Inventory2Icon /> },
  { label: 'Bilhetes',  path: '/bilhetes',  icon: <EditNoteIcon /> },
  { label: 'Parceiros', path: '/parceiros', icon: <GroupIcon /> },
  { label: 'Config',    path: '/config',    icon: <SettingsIcon /> },
]

export function MobileLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useUser()
  const { theme } = useBackground()

  const items = user?.role === 'writer' ? WRITER_NAV : READER_NAV

  const navValue = useMemo(() => {
    const match = items.find((item) => location.pathname.startsWith(item.path))
    return match?.path ?? '/home'
  }, [location.pathname, items])

  return (
    <Box sx={{ width: '100%', maxWidth: 480, height: '100dvh', mx: 'auto', bgcolor: 'background.default', overflow: 'hidden' }}>
      <FloatingMenu />

      <Box component="main" sx={{ height: 'calc(100% - 64px - env(safe-area-inset-bottom, 0px))' }}>
        <Outlet />
      </Box>

      <ScrollHint />

      <Box sx={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480, zIndex: 100,
        background: 'rgba(255,253,251,0.96)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,0,0,0.055)',
        pb: 'env(safe-area-inset-bottom, 0px)',
      }}>
        <Box sx={{ display: 'flex', height: 64 }}>
          {items.map((item) => {
            const active = navValue === item.path
            return (
              <Box
                key={item.path}
                onClick={() => navigate(item.path)}
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
                  background: active ? `${theme.accent}18` : 'transparent',
                  transition: 'background 0.22s cubic-bezier(0.16,1,0.3,1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  '& svg': {
                    fontSize: '1.25rem',
                    color: active ? theme.accent : colors.text.muted,
                    transition: 'color 0.18s, transform 0.22s cubic-bezier(0.16,1,0.3,1)',
                    transform: active ? 'scale(1.15)' : 'scale(1)',
                  },
                }}>
                  {item.icon}
                </Box>
                <Typography sx={{
                  fontSize: '0.62rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? theme.accent : colors.text.muted,
                  lineHeight: 1, letterSpacing: 0.1,
                  transition: 'color 0.18s',
                }}>
                  {item.label}
                </Typography>
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
