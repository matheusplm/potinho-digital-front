import FavoriteIcon from '@mui/icons-material/Favorite'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Box, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { useCallback } from 'react'
import { useCollectionsQuery } from '../hooks/useNotes'
import { Card, ScrollablePage } from '../components/ui'
import { OnboardingOverlay } from '../components/ui/OnboardingOverlay'
import { api } from '../services/api'
import { colors, fadeIn, font } from '../design-system'
import { useBackground } from '../context/BackgroundContext'
import { FloatingParticles } from '../components/FloatingParticles'
import { isCollectionOwner } from '../utils/collectionAccess'

export function WriterHomePage() {
  const { user, patchUser } = useUser()
  const { theme } = useBackground()

  const handleOnboardingDismiss = useCallback(async () => {
    patchUser({ onboardingDone: true })
    api.markOnboardingDone().catch(() => {})
  }, [patchUser])
  const navigate = useNavigate()
  const { data: collections = [] } = useCollectionsQuery()

  const firstName = user?.name?.split(' ')[0] ?? ''
  const ownedCount = collections.filter((c) => isCollectionOwner(c, user?.id)).length
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <Box sx={{ height: '100%', position: 'relative', overflow: 'hidden', background: theme.gradient }}>
      <FloatingParticles />
      {user?.onboardingDone === false && <OnboardingOverlay onDismiss={handleOnboardingDismiss} />}
      <FavoriteIcon sx={{
        position: 'absolute', bottom: -80, right: -80,
        fontSize: 500, color: 'rgba(29,78,216,0.05)', pointerEvents: 'none',
      }} />

      <ScrollablePage sx={{ px: 2.5, py: 2.5, gap: 3, animation: `${fadeIn} 0.4s ease` }}>
        <Stack spacing={0.3}>
          <Typography sx={{ fontSize: '0.82rem', color: theme.textOnBgMuted, fontWeight: 500 }}>
            {greeting},
          </Typography>
          <Typography sx={{
            fontFamily: font.serif, fontWeight: 700, fontSize: '2rem',
            color: theme.textOnBg, lineHeight: 1.1, letterSpacing: '-0.5px',
            wordBreak: 'break-word',
          }}>
            {firstName} 💙
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: theme.textOnBgMuted, fontStyle: 'italic', mt: 0.5 }}>
            {ownedCount > 0 ? 'suas coleções estão esperando por você' : 'que tal criar sua primeira coleção?'}
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
                {ownedCount > 0 ? `${ownedCount} ${ownedCount === 1 ? 'coleção criada' : 'coleções criadas'}` : 'Crie sua primeira coleção'}
              </Typography>
            </Box>
            <ChevronRightIcon sx={{ color: colors.text.muted, flexShrink: 0 }} />
          </Stack>
        </Card>

      </ScrollablePage>
    </Box>
  )
}
