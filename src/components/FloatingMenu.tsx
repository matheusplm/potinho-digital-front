import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import { Box, Stack, Typography, Backdrop, IconButton, Divider } from '@mui/material'
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
      <Backdrop open={open} onClick={() => setOpen(false)} sx={{ zIndex: 90, backdropFilter: 'blur(1px)', bgcolor: 'rgba(0,0,0,0.08)' }} />

      <Box sx={{ position: 'fixed', top: 14, right: 14, zIndex: 100 }}>
        {open && (
          <Box sx={{
            position: 'absolute', top: 40, right: 0,
            background: 'rgba(255,253,251,0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
            overflow: 'hidden',
            minWidth: 170,
            animation: 'menu-in 0.14s ease-out',
            '@keyframes menu-in': {
              from: { opacity: 0, transform: 'translateY(-4px)' },
              to:   { opacity: 1, transform: 'translateY(0)' },
            },
          }}>
            <Box sx={{ px: 1.8, py: 1.2 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e3a5f' }}>
                {user?.name}
              </Typography>
            </Box>

            <Divider />

            {[
              { icon: <SettingsIcon sx={{ fontSize: 15 }} />, label: 'Configurações', action: handleSettings, color: '#374151' },
              { icon: <LogoutIcon sx={{ fontSize: 15 }} />, label: 'Sair', action: handleLogout, color: '#e11d48' },
            ].map((item) => (
              <Stack
                key={item.label}
                direction="row" spacing={1.2} alignItems="center"
                onClick={item.action}
                sx={{
                  px: 1.8, py: 1, cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                  transition: 'background 0.1s',
                  color: item.color,
                  '& svg': { color: item.color },
                }}
              >
                {item.icon}
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: item.color }}>
                  {item.label}
                </Typography>
              </Stack>
            ))}
          </Box>
        )}

        <IconButton
          onClick={() => setOpen((v) => !v)}
          sx={{
            width: 34, height: 34,
            borderRadius: '8px',
            bgcolor: open ? 'rgba(29,78,216,0.1)' : 'rgba(255,253,251,0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            color: open ? '#1d4ed8' : '#475569',
            transition: 'all 0.15s',
            '&:hover': { bgcolor: 'rgba(29,78,216,0.08)' },
          }}
        >
          <MoreHorizIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </>
  )
}
