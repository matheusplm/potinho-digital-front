import FavoriteIcon from '@mui/icons-material/Favorite'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Box, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { useCollectionsQuery } from '../hooks/useNotes'
import { Card, ScrollablePage } from '../components/ui'
import { colors, font } from '../design-system'
import { useBackground } from '../context/BackgroundContext'

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
  const { theme } = useBackground()
  const navigate = useNavigate()
  const { data: collections = [] } = useCollectionsQuery()

  const firstName = user?.name?.split(' ')[0] ?? ''
  const ownedCount = collections.filter((c) => c.access === 'owner').length
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <Box sx={{ height: '100%', position: 'relative', overflow: 'hidden', background: theme.gradient }}>
      <FavoriteIcon sx={{
        position: 'absolute', bottom: -80, right: -80,
        fontSize: 500, color: 'rgba(29,78,216,0.05)', pointerEvents: 'none',
      }} />

      {FLOATING.map((h, i) => (
        <FavoriteIcon key={i} sx={{
          position: 'absolute', bottom: '-4px', left: h.left,
          fontSize: h.size, color: theme.accent, opacity: h.opacity, pointerEvents: 'none',
          animation: `float-w-${i} ${h.dur} ${h.delay} ease-in infinite`,
          [`@keyframes float-w-${i}`]: {
            '0%':   { transform: 'translateY(0) rotate(-6deg)', opacity: 0 },
            '8%':   { opacity: h.opacity },
            '92%':  { opacity: h.opacity * 0.5 },
            '100%': { transform: 'translateY(-105vh) rotate(10deg)', opacity: 0 },
          },
        }} />
      ))}

      <ScrollablePage sx={{ px: 2.5, py: 2.5, gap: 3, animation: `${fadeIn} 0.4s ease` }}>
        <Stack spacing={0.3}>
          <Typography sx={{ fontSize: '0.82rem', color: theme.textOnBgMuted, fontWeight: 500 }}>
            {greeting},
          </Typography>
          <Typography sx={{
            fontFamily: font.serif, fontWeight: 700, fontSize: '2rem',
            color: theme.textOnBg, lineHeight: 1.1, letterSpacing: '-0.5px',
          }}>
            {firstName} 💙
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: theme.textOnBgMuted, fontStyle: 'italic', mt: 0.5 }}>
            suas coleções estão esperando por você
          </Typography>
        </Stack>

        <Card onClick={() => navigate('/colecoes')} sx={{ p: 2, cursor: 'pointer', transition: 'transform 0.18s, box-shadow 0.18s', '&:hover': { transform: 'translateY(-2px)' } }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 46, height: 46, borderRadius: 2.5, background: `linear-gradient(135deg,${colors.primary.main},${colors.purple.main})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Inventory2Icon sx={{ fontSize: 24, color: '#fff' }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.05rem', color: colors.text.primary, lineHeight: 1.2 }}>
                Minhas coleções
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: colors.text.secondary }}>
                {ownedCount > 0 ? `${ownedCount} coleção${ownedCount !== 1 ? 'ões' : ''} criada${ownedCount !== 1 ? 's' : ''}` : 'Crie sua primeira coleção'}
              </Typography>
            </Box>
            <ChevronRightIcon sx={{ color: colors.text.muted, flexShrink: 0 }} />
          </Stack>
        </Card>
      </ScrollablePage>
    </Box>
  )
}
