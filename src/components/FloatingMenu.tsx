import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { Box, Stack, Typography, Backdrop, IconButton } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'

const menuIn = keyframes`
  from { opacity: 0; transform: scale(0.94) translateY(-6px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
`

const ACTIONS = [
  { icon: SettingsIcon, label: 'Configurações', key: 'config', danger: false },
  { icon: LogoutIcon,   label: 'Sair',           key: 'logout', danger: true  },
]

export function FloatingMenu() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useUser()
  const navigate = useNavigate()

  function handle(key: string) {
    setOpen(false)
    if (key === 'config') navigate('/config')
    if (key === 'logout') logout()
  }

  return (
    <>
      <Backdrop
        open={open}
        onClick={() => setOpen(false)}
        sx={{ zIndex: 90, bgcolor: 'transparent' }}
      />

      <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 100 }}>
        <IconButton
          onClick={() => setOpen((v) => !v)}
          sx={{
            width: 36, height: 36, borderRadius: '10px',
            bgcolor: open ? '#1d4ed8' : 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(12px)',
            boxShadow: open
              ? '0 4px 16px rgba(29,78,216,0.35)'
              : '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
            border: '1px solid rgba(0,0,0,0.07)',
            color: open ? '#fff' : '#334155',
            transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
            '&:hover': { bgcolor: open ? '#1e40af' : 'rgba(255,255,255,1)' },
          }}
        >
          <Stack spacing={0.4} alignItems="center" justifyContent="center">
            {[0, 1, 2].map((i) => (
              <Box key={i} sx={{
                width: open ? (i === 1 ? 12 : 14) : 14,
                height: 1.5, borderRadius: 1,
                bgcolor: open ? '#fff' : '#334155',
                transition: 'all 0.2s',
                opacity: i === 1 ? 0.6 : 1,
              }} />
            ))}
          </Stack>
        </IconButton>

        {open && (
          <Box sx={{
            position: 'absolute', top: 44, right: 0,
            width: 200,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(24px)',
            borderRadius: '12px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255,255,255,0.6)',
            overflow: 'hidden',
            animation: `${menuIn} 0.2s cubic-bezier(0.16,1,0.3,1)`,
            transformOrigin: 'top right',
          }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 1.8, pt: 1.6, pb: 1.4 }}>
              <Box sx={{
                width: 30, height: 30, borderRadius: '8px',
                background: 'linear-gradient(135deg,#1d4ed8,#e11d48)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <FavoriteIcon sx={{ fontSize: 14, color: '#fff' }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                  {user?.name?.split(' ')[0]}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', lineHeight: 1.2 }}>
                  {user?.role === 'writer' ? 'escritor' : 'leitor'}
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ height: '1px', bgcolor: 'rgba(0,0,0,0.06)', mx: 1.5 }} />

            <Box sx={{ py: 0.8 }}>
              {ACTIONS.map((item) => (
                <Stack
                  key={item.key}
                  direction="row" spacing={1.4} alignItems="center"
                  onClick={() => handle(item.key)}
                  sx={{
                    px: 1.8, py: 1,
                    cursor: 'pointer',
                    mx: 0.5, borderRadius: '8px',
                    transition: 'background 0.12s',
                    '&:hover': { bgcolor: item.danger ? 'rgba(225,29,72,0.07)' : 'rgba(0,0,0,0.04)' },
                  }}
                >
                  <item.icon sx={{ fontSize: 16, color: item.danger ? '#e11d48' : '#475569' }} />
                  <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: item.danger ? '#e11d48' : '#1e293b' }}>
                    {item.label}
                  </Typography>
                </Stack>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </>
  )
}
