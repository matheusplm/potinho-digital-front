import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { Box, Fab, Stack, Typography, Backdrop, Divider } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'

export function FloatingMenu() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useUser()
  const navigate = useNavigate()

  function handleSettings() { setOpen(false); navigate('/config') }
  function handleLogout() { setOpen(false); logout() }

  return (
    <>
      <Backdrop open={open} onClick={() => setOpen(false)} sx={{ zIndex: 90, backdropFilter: 'blur(2px)', bgcolor: 'rgba(0,0,0,0.12)' }} />

      <Box sx={{ position: 'fixed', top: 14, right: 14, zIndex: 100 }}>
        {open && (
          <Box sx={{
            position: 'absolute', top: 46, right: 0,
            background: 'rgba(255,253,251,0.97)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 2,
            boxShadow: '0 12px 40px rgba(0,0,0,0.16)',
            overflow: 'hidden',
            minWidth: 200,
            animation: 'menu-in 0.16s cubic-bezier(0.16,1,0.3,1)',
            '@keyframes menu-in': {
              from: { opacity: 0, transform: 'translateY(-6px) scale(0.97)' },
              to:   { opacity: 1, transform: 'translateY(0) scale(1)' },
            },
          }}>
            <Box sx={{ px: 2, py: 1.4 }}>
              <Stack direction="row" spacing={0.7} alignItems="center">
                <FavoriteIcon sx={{ fontSize: 12, color: '#e11d48' }} />
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e3a5f' }}>
                  {user?.name}
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', mt: 0.2, pl: 0.1 }}>
                {user?.role === 'writer' ? 'Criador do potinho' : 'Leitor do potinho'}
              </Typography>
            </Box>

            <Divider sx={{ opacity: 0.5 }} />

            <Stack
              direction="row" spacing={1} alignItems="center"
              onClick={handleSettings}
              sx={{ px: 2, py: 1.1, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.035)' }, transition: 'background 0.12s' }}
            >
              <SettingsIcon sx={{ fontSize: 16, color: '#64748b' }} />
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#1e3a5f' }}>Configurações</Typography>
            </Stack>

            <Divider sx={{ opacity: 0.5 }} />

            <Stack
              direction="row" spacing={1} alignItems="center"
              onClick={handleLogout}
              sx={{ px: 2, py: 1.1, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(225,29,72,0.04)' }, transition: 'background 0.12s' }}
            >
              <LogoutIcon sx={{ fontSize: 16, color: '#e11d48' }} />
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#e11d48' }}>Sair</Typography>
            </Stack>
          </Box>
        )}

        <Fab
          size="small"
          onClick={() => setOpen((v) => !v)}
          sx={{
            width: 38, height: 38,
            background: open ? 'linear-gradient(135deg,#1d4ed8,#3b82f6)' : 'rgba(255,253,251,0.95)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 1.5,
            transition: 'all 0.2s',
            '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.16)' },
            color: open ? '#fff' : '#1e3a5f',
          }}
        >
          {open ? <CloseIcon sx={{ fontSize: 17 }} /> : <MenuIcon sx={{ fontSize: 17 }} />}
        </Fab>
      </Box>
    </>
  )
}
