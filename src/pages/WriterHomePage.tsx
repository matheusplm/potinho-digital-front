import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import FavoriteIcon from '@mui/icons-material/Favorite'
import SettingsIcon from '@mui/icons-material/Settings'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { useCollectionQuery, useRaritiesQuery, useTypesQuery } from '../hooks/useNotes'
import { Card, Button } from '../components/ui'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`

const FLOATING = [
  { size: 14, left: '7%',  delay: '0s',   dur: '10s', opacity: 0.12 },
  { size: 10, left: '22%', delay: '3s',   dur: '13s', opacity: 0.09 },
  { size: 18, left: '70%', delay: '1.5s', dur: '11s', opacity: 0.11 },
  { size: 11, left: '86%', delay: '5s',   dur: '12s', opacity: 0.08 },
]

export function WriterHomePage() {
  const { user } = useUser()
  const navigate = useNavigate()
  const { data: collection } = useCollectionQuery()
  const { data: rarities = [] } = useRaritiesQuery()
  const { data: types = [] } = useTypesQuery()

  const firstName = user?.name?.split(' ')[0] ?? ''
  const totalNotes = collection?.total ?? 0
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <Box sx={{
      height: '100%', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(160deg, #dbeafe 0%, #ede9fe 50%, #fce7f3 100%)',
    }}>
      <FavoriteIcon sx={{
        position: 'absolute', bottom: -80, right: -80,
        fontSize: 500, color: 'rgba(29,78,216,0.05)',
        pointerEvents: 'none',
      }} />

      {FLOATING.map((h, i) => (
        <FavoriteIcon key={i} sx={{
          position: 'absolute', bottom: '-4px', left: h.left,
          fontSize: h.size, color: '#1d4ed8', opacity: h.opacity, pointerEvents: 'none',
          animation: `float-w-${i} ${h.dur} ${h.delay} ease-in infinite`,
          [`@keyframes float-w-${i}`]: {
            '0%':   { transform: 'translateY(0) rotate(-6deg)', opacity: 0 },
            '8%':   { opacity: h.opacity },
            '92%':  { opacity: h.opacity * 0.5 },
            '100%': { transform: 'translateY(-105vh) rotate(10deg)', opacity: 0 },
          },
        }} />
      ))}

      <Box sx={{
        position: 'absolute', inset: 0, zIndex: 1,
        display: 'flex', flexDirection: 'column',
        px: 2.5, py: 2.5, overflowY: 'auto',
        animation: `${fadeIn} 0.4s ease`,
      }}>
        <Stack spacing={0.3} sx={{ mb: 3.5 }}>
          <Typography sx={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>
            {greeting},
          </Typography>
          <Typography sx={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700, fontSize: '2rem',
            color: '#1e3a5f', lineHeight: 1.1, letterSpacing: '-0.5px',
          }}>
            {firstName} 💙
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', mt: 0.5 }}>
            o potinho está esperando por você
          </Typography>
        </Stack>

        <Stack spacing={1.5} sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: 1.2, color: '#94a3b8', textTransform: 'uppercase' }}>
            Seu potinho
          </Typography>
          <Stack direction="row" spacing={1.5}>
            {[
              { label: 'Bilhetes', value: totalNotes, icon: <AutoAwesomeIcon sx={{ fontSize: 18, color: '#1d4ed8' }} />, color: '#1d4ed8' },
              { label: 'Raridades', value: rarities.length, icon: <FavoriteIcon sx={{ fontSize: 18, color: '#e11d48' }} />, color: '#e11d48' },
              { label: 'Tipos', value: types.length, icon: <Inventory2Icon sx={{ fontSize: 18, color: '#7c3aed' }} />, color: '#7c3aed' },
            ].map((stat) => (
              <Card key={stat.label} sx={{ flex: 1, p: 1.5, textAlign: 'center' }}>
                <Box sx={{ mb: 0.8 }}>{stat.icon}</Box>
                <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: stat.color, lineHeight: 1, fontFamily: '"Playfair Display",serif' }}>
                  {stat.value}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, mt: 0.3 }}>
                  {stat.label}
                </Typography>
              </Card>
            ))}
          </Stack>
        </Stack>

        <Stack spacing={1.5}>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: 1.2, color: '#94a3b8', textTransform: 'uppercase' }}>
            Ações rápidas
          </Typography>
          <Card sx={{ p: 2 }} onClick={() => navigate('/config')} style={{ cursor: 'pointer' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{
                width: 40, height: 40, borderRadius: '10px',
                background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <SettingsIcon sx={{ fontSize: 20, color: '#fff' }} />
              </Box>
              <Stack spacing={0.2}>
                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e3a5f' }}>Configurações</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>Raridades, tipos e código de convite</Typography>
              </Stack>
            </Stack>
          </Card>

          <Card sx={{ p: 2 }} onClick={() => navigate('/colecao')} style={{ cursor: 'pointer' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{
                width: 40, height: 40, borderRadius: '10px',
                background: 'linear-gradient(135deg,#e11d48,#fb7185)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Inventory2Icon sx={{ fontSize: 20, color: '#fff' }} />
              </Box>
              <Stack spacing={0.2}>
                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e3a5f' }}>Ver coleção</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>Todos os bilhetes do potinho</Typography>
              </Stack>
            </Stack>
          </Card>

          {user?.coupleCode && (
            <Card sx={{ p: 2, background: 'linear-gradient(135deg,rgba(29,78,216,0.05),rgba(225,29,72,0.05))' }}>
              <Stack spacing={0.5}>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: 1, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Código de convite
                </Typography>
                <Typography sx={{
                  fontFamily: '"Playfair Display",serif',
                  fontWeight: 700, fontSize: '1.8rem',
                  color: '#1e3a5f', letterSpacing: '0.2em',
                }}>
                  {user.coupleCode}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>
                  Compartilhe com quem você ama 💙
                </Typography>
              </Stack>
            </Card>
          )}
        </Stack>
      </Box>
    </Box>
  )
}
