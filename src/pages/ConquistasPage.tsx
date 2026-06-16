import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import { Box, LinearProgress, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { Card, LoadingState, ScrollablePage } from '../components/ui'
import { CollectionPanel } from '../components/album/CollectionPanel'
import { useBackground } from '../context/BackgroundContext'
import { useActiveReaderCollection } from '../hooks/useActiveReaderCollection'
import { useCollectionPlayQuery, useCollectionRaritiesQuery, useReaderAchievementsQuery } from '../hooks/useNotes'
import { colors, font, radius } from '../design-system'

const fadeIn = keyframes`from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); }`

function formatDate(iso: string | null) {
  if (!iso) return ''
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(iso))
}

export function ConquistasPage() {
  const { theme } = useBackground()
  const { collection, isLoading: collectionsLoading } = useActiveReaderCollection()
  const cid = collection?.id ?? ''
  const { data: play, isLoading: playLoading } = useCollectionPlayQuery(cid, { enabled: !!cid })
  const { data: rarities = [] } = useCollectionRaritiesQuery(cid)
  const { data: achData, isLoading: achLoading } = useReaderAchievementsQuery(cid)

  const achievements = achData?.achievements ?? []
  const unlocked = achievements.filter((a) => a.unlocked).length
  const isLoading = collectionsLoading || (!!cid && (playLoading || achLoading))

  return (
    <Box sx={{ height: '100%', position: 'relative', overflow: 'hidden', background: theme.gradient }}>
      <EmojiEventsOutlinedIcon sx={{ position: 'absolute', bottom: -70, right: -60, fontSize: 420, color: 'rgba(225,29,72,0.05)', pointerEvents: 'none' }} />
      <ScrollablePage sx={{ px: 2.5, py: 2.5, animation: `${fadeIn} 0.35s ease` }}>
        <Stack spacing={0.3} sx={{ mb: 2.2 }}>
          <Typography sx={{ fontSize: '0.78rem', color: theme.textOnBgMuted, fontWeight: 700 }}>
            🏅 Conquistas
          </Typography>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.6rem', color: theme.textOnBg, lineHeight: 1.1 }}>
            Suas conquistas
          </Typography>
          {collection && (
            <Typography sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.4,
              fontSize: '0.74rem', fontWeight: 700, color: theme.textOnBgMuted,
              bgcolor: `${theme.accent}14`, border: `1px solid ${theme.accent}28`,
              borderRadius: '20px', px: 1, py: 0.25, alignSelf: 'flex-start',
            }}>
              {collection.emoji} {collection.name}
            </Typography>
          )}
          {achData && (
            <Typography sx={{ fontSize: '0.82rem', color: theme.textOnBgMuted, fontStyle: 'italic', mt: 0.3 }}>
              {unlocked} de {achievements.length} desbloqueadas
            </Typography>
          )}
        </Stack>

        {isLoading && (
          <LoadingState label="Carregando conquistas" accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} sx={{ minHeight: 320 }} />
        )}

        {!isLoading && !collection && (
          <Stack spacing={1.2} alignItems="center" justifyContent="center" sx={{ minHeight: 320, textAlign: 'center' }}>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.2rem', color: theme.textOnBg }}>
              Nenhum potinho ativo
            </Typography>
            <Typography sx={{ fontSize: '0.84rem', color: theme.textOnBgMuted, maxWidth: 260 }}>
              Abra um potinho pra começar a colecionar conquistas.
            </Typography>
          </Stack>
        )}

        {!isLoading && collection && (
          <Stack spacing={2}>
            {play && <CollectionPanel play={play} rarities={rarities} />}

            {achData && achievements.length === 0 && (
              <Card sx={{ p: 2.5, textAlign: 'center' }}>
                <Typography sx={{ fontSize: '2rem', mb: 0.5 }}>🏅</Typography>
                <Typography sx={{ fontFamily: font.serif, fontWeight: 800, color: colors.text.primary, mb: 0.3 }}>
                  Sem conquistas por aqui
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: colors.text.secondary }}>
                  Esta coleção ainda não tem conquistas definidas.
                </Typography>
              </Card>
            )}

            <Stack spacing={1}>
              {achievements.map((a) => {
                const pct = a.target > 0 ? Math.min(100, Math.round((a.current / a.target) * 100)) : 0
                return (
                  <Card key={a.id} sx={{
                    p: 1.4, display: 'flex', alignItems: 'center', gap: 1.3,
                    border: `1px solid ${a.unlocked ? `${theme.accent}33` : colors.border.subtle}`,
                    background: a.unlocked ? `${theme.accent}0c` : undefined,
                  }}>
                    <Box sx={{
                      width: 48, height: 48, borderRadius: radius.full, flexShrink: 0, fontSize: '1.5rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: a.unlocked ? `linear-gradient(135deg, ${theme.accent}22, ${theme.accent}44)` : 'rgba(0,0,0,0.05)',
                      border: `1.5px solid ${a.unlocked ? `${theme.accent}88` : 'rgba(0,0,0,0.08)'}`,
                      filter: a.unlocked ? 'none' : 'grayscale(1)', opacity: a.unlocked ? 1 : 0.45,
                    }}>
                      {a.emoji}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '0.94rem', color: colors.text.primary }}>
                          {a.label}
                        </Typography>
                        {a.unlocked && <Typography sx={{ fontSize: '0.8rem', fontWeight: 900, color: colors.success.main }}>✓</Typography>}
                      </Stack>
                      <Typography sx={{ fontSize: '0.76rem', color: colors.text.secondary, mb: a.unlocked ? 0 : 0.5 }}>
                        {a.description}
                      </Typography>
                      {a.unlocked && a.unlockedAt && (
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: theme.accent }}>
                          🏆 desbloqueada em {formatDate(a.unlockedAt)}
                        </Typography>
                      )}
                      {!a.unlocked && (
                        <Stack direction="row" alignItems="center" spacing={0.8}>
                          <LinearProgress variant="determinate" value={pct} sx={{
                            flex: 1, height: 5, borderRadius: radius.full, bgcolor: 'rgba(0,0,0,0.06)',
                            '& .MuiLinearProgress-bar': { borderRadius: radius.full, background: theme.accent },
                          }} />
                          <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: colors.text.muted }}>
                            {a.current}/{a.target}
                          </Typography>
                        </Stack>
                      )}
                    </Box>
                  </Card>
                )
              })}
            </Stack>
          </Stack>
        )}
      </ScrollablePage>
    </Box>
  )
}
