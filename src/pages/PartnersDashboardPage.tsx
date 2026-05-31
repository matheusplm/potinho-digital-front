import FavoriteIcon from '@mui/icons-material/Favorite'
import GroupIcon from '@mui/icons-material/Group'
import { Box, CircularProgress, LinearProgress, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { Card, PageTitle } from '../components/ui'
import { usePartnersQuery } from '../hooks/useNotes'
import { colors, font, gradients, radius } from '../design-system'
import { useBackground } from '../context/BackgroundContext'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`

function ReaderAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <Box sx={{
      width: 44, height: 44, borderRadius: radius.md, flexShrink: 0,
      background: gradients.accent,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
        {initials}
      </Typography>
    </Box>
  )
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
}

export function PartnersDashboardPage() {
  const { theme } = useBackground()
  const { data: partners = [], isLoading } = usePartnersQuery()

  return (
    <Box sx={{
      height: '100%', position: 'relative',
      background: theme.gradient,
    }}>
      <FavoriteIcon sx={{
        position: 'absolute', bottom: -60, right: -60,
        fontSize: 400, color: 'rgba(29,78,216,0.04)', pointerEvents: 'none',
      }} />

      <Box sx={{
        position: 'absolute', inset: 0, zIndex: 1,
        display: 'flex', flexDirection: 'column',
        px: 2.5, py: 2.5, overflowY: 'auto',
        animation: `${fadeIn} 0.35s ease`,
      }}>
        <Box sx={{ mb: 3 }}>
          <PageTitle
            title="Parceiros"
            subtitle={isLoading ? 'Carregando...' : `${partners.length} leitor${partners.length !== 1 ? 'es' : ''} do potinho`}
          />
        </Box>

        {isLoading && (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress size={28} sx={{ color: colors.primary.main }} />
          </Box>
        )}

        {!isLoading && partners.length === 0 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, textAlign: 'center' }}>
            <GroupIcon sx={{ fontSize: 52, color: colors.primary.light, opacity: 0.45 }} />
            <Stack spacing={0.5}>
              <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.1rem', color: colors.text.primary }}>
                Nenhum leitor ainda
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: colors.text.secondary }}>
                Compartilhe seu código de convite para que alguém acesse o potinho
              </Typography>
            </Stack>
          </Box>
        )}

        {!isLoading && partners.length > 0 && (
          <Stack spacing={1.5}>
            {partners.map((partner) => (
              <Card key={partner.id} accent={colors.primary.main} sx={{ p: 2 }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <ReaderAvatar name={partner.name} />
                    <Stack spacing={0.2} sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: colors.text.primary, lineHeight: 1.2 }}>
                        {partner.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.76rem', color: colors.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {partner.email}
                      </Typography>
                      <Typography sx={{ fontSize: '0.68rem', color: colors.text.muted }}>
                        Desde {formatDate(partner.createdAt)}
                      </Typography>
                    </Stack>
                    <Box sx={{
                      textAlign: 'center', flexShrink: 0,
                      background: `linear-gradient(135deg, ${colors.primary.main}18, ${colors.primary.light}18)`,
                      borderRadius: radius.md, px: 1.2, py: 0.8,
                    }}>
                      <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.4rem', color: colors.primary.main, lineHeight: 1 }}>
                        {partner.collection.completion}%
                      </Typography>
                      <Typography sx={{ fontSize: '0.62rem', color: colors.text.muted, fontWeight: 600 }}>
                        completo
                      </Typography>
                    </Box>
                  </Stack>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.6 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: colors.text.secondary, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                        Coleção
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: colors.text.muted }}>
                        {partner.collection.owned}/{partner.collection.total} bilhetes
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={partner.collection.completion}
                      sx={{
                        height: 6, borderRadius: radius.full,
                        bgcolor: 'rgba(0,0,0,0.06)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: radius.full,
                          background: `linear-gradient(90deg, ${colors.primary.main}, ${colors.primary.light})`,
                        },
                      }}
                    />
                  </Box>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  )
}
