import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { Box, Fab, Stack, Typography, Backdrop } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'

export function FloatingMenu() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useUser()
  const navigate = useNavigate()

  function handleSettings() {
    setOpen(false)
    navigate('/config')
  }

  function handleLogout() {
    setOpen(false)
    logout()
  }

  return (
    <>
      <Backdrop open={open} onClick={() => setOpen(false)} sx={{ zIndex: 90, backdropFilter: 'blur(2px)', bgcolor: 'rgba(0,0,0,0.15)' }} />

      <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 100 }}>
        {open && (
          <Box sx={{
            position: 'absolute', top: 52, right: 0,
            background: 'rgba(255,253,251,0.96)', backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(255,255,255,0.8)',
            borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
            overflow: 'hidden', minWidth: 180,
            animation: 'menu-in 0.18s cubic-bezier(0.16,1,0.3,1)',
            '@keyframes menu-in': {
              from: { opacity: 0, transform: 'translateY(-8px) scale(0.96)' },
              to:   { opacity: 1, transform: 'translateY(0) scale(1)' },
            },
          }}>
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <Stack direction="row" spacing={0.8} alignItems="center">
                <FavoriteIcon sx={{ fontSize: 14, color: '#e11d48' }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e3a5f' }}>
                  {user?.name}
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', mt: 0.2 }}>
                {user?.role === 'writer' ? 'Criador do potinho' : 'Leitor do potinho'}
              </Typography>
            </Box>

            {[
              { icon: <SettingsIcon sx={{ fontSize: 17 }} />, label: 'Configurações', action: handleSettings },
              { icon: <LogoutIcon sx={{ fontSize: 17 }} />, label: 'Sair', action: handleLogout, red: true },
            ].map((item) => (
              <Stack
                key={item.label}
                direction="row" spacing={1.2} alignItems="center"
                onClick={item.action}
                sx={{
                  px: 2, py: 1.2, cursor: 'pointer',
                  color: item.red ? '#e11d48' : '#1e3a5f',
                  '& svg': { color: item.red ? '#e11d48' : '#64748b' },
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                  transition: 'background 0.15s',
                }}
              >
                {item.icon}
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.label}</Typography>
              </Stack>
            ))}
          </Box>
        )}

        <Fab
          size="small"
          onClick={() => setOpen((v) => !v)}
          sx={{
            width: 40, height: 40,
            background: open
              ? 'linear-gradient(135deg,#1d4ed8,#3b82f6)'
              : 'rgba(255,253,251,0.95)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
            border: '1.5px solid rgba(255,255,255,0.7)',
            transition: 'all 0.2s',
            '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.18)' },
            color: open ? '#fff' : '#1e3a5f',
          }}
        >
          {open ? <CloseIcon sx={{ fontSize: 18 }} /> : <MenuIcon sx={{ fontSize: 18 }} />}
        </Fab>
      </Box>
    </>
  )
}
