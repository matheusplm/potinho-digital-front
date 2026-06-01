import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import FavoriteIcon from '@mui/icons-material/Favorite'
import HomeIcon from '@mui/icons-material/Home'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import QueryStatsIcon from '@mui/icons-material/QueryStats'
import EditNoteIcon from '@mui/icons-material/EditNote'
import GroupIcon from '@mui/icons-material/Group'
import SettingsIcon from '@mui/icons-material/Settings'
import { BottomNavigation, BottomNavigationAction, Box, Paper } from '@mui/material'
import { useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { FloatingMenu } from './FloatingMenu'
import { ScrollHint } from './ui'
import { useUser } from '../context/UserContext'
import { useBackground } from '../context/BackgroundContext'
import { colors } from '../design-system'

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

      <Box component="main" sx={{ height: 'calc(100% - 56px - env(safe-area-inset-bottom, 0px))' }}>
        <Outlet />
      </Box>

      <ScrollHint />

      <Paper
        elevation={0}
        sx={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 480, borderRadius: 0, overflow: 'hidden',
          pb: 'env(safe-area-inset-bottom,0px)',
          background: 'rgba(255,253,251,0.96)', backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <BottomNavigation
          showLabels value={navValue}
          onChange={(_, path: string) => navigate(path)}
          sx={{
            bgcolor: 'transparent',
            '& .MuiBottomNavigationAction-root': { minWidth: 0, transition: 'color 0.2s ease', color: colors.text.muted },
            '& .MuiBottomNavigationAction-label': { fontSize: '0.72rem', fontWeight: 600 },
            '& .Mui-selected': { color: theme.accent },
            '& .Mui-selected .MuiBottomNavigationAction-label': { color: theme.accent },
          }}
        >
          {items.map((item) => (
            <BottomNavigationAction key={item.path} label={item.label} value={item.path} icon={item.icon} />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  )
}
