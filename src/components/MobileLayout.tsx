import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import FavoriteIcon from '@mui/icons-material/Favorite'
import HomeIcon from '@mui/icons-material/Home'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import QueryStatsIcon from '@mui/icons-material/QueryStats'
import { BottomNavigation, BottomNavigationAction, Box, Paper } from '@mui/material'
import { useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { FloatingMenu } from './FloatingMenu'
import { ScrollHint } from './ui'

type NavPath = '/home' | '/colecao' | '/pacotinho' | '/favoritos' | '/progresso'

function resolveNavValue(pathname: string): NavPath {
  if (pathname.startsWith('/colecao')) return '/colecao'
  if (pathname.startsWith('/pacotinho')) return '/pacotinho'
  if (pathname.startsWith('/favoritos')) return '/favoritos'
  if (pathname.startsWith('/progresso')) return '/progresso'
  return '/home'
}

export function MobileLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const navValue = useMemo(() => resolveNavValue(location.pathname), [location.pathname])

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
          onChange={(_, path: NavPath) => navigate(path)}
          sx={{
            bgcolor: 'transparent',
            '& .MuiBottomNavigationAction-root': { minWidth: 0, transition: 'color 0.2s ease' },
            '& .MuiBottomNavigationAction-label': { fontSize: '0.72rem', fontWeight: 600 },
            '& .Mui-selected': { color: '#1d4ed8' },
          }}
        >
          <BottomNavigationAction label="Início"    value="/home"      icon={<HomeIcon />} />
          <BottomNavigationAction label="Coleção"   value="/colecao"   icon={<Inventory2Icon />} />
          <BottomNavigationAction label="Pacote"    value="/pacotinho" icon={<AutoAwesomeIcon />} />
          <BottomNavigationAction label="Favoritos" value="/favoritos" icon={<FavoriteIcon />} />
          <BottomNavigationAction label="Progresso" value="/progresso" icon={<QueryStatsIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  )
}
