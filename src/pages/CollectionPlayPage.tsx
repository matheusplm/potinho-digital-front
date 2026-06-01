import FavoriteIcon from '@mui/icons-material/Favorite'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import SettingsIcon from '@mui/icons-material/Settings'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Box, Chip, CircularProgress, IconButton, LinearProgress, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, ScrollablePage, toast } from '../components/ui'
import { useCollectionPlayQuery, useOpenCollectionDailyMutation, useCollectionRaritiesQuery, useCollectionTypesQuery } from '../hooks/useNotes'
import { useBackground } from '../context/BackgroundContext'
import { useUser } from '../context/UserContext'
import { getBackgroundTheme } from '../design-system/backgrounds'
import { colors, font, radius } from '../design-system'
import type { CollectionDailyReward, RarityConfig, NoteTypeConfig } from '../types/note'

const fadeIn = keyframes`from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); }`
const cardIn = keyframes`from { opacity:0; transform:translateY(20px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); }`
const pulse = keyframes`0%,100%{box-shadow:0 0 0 0 rgba(244,63,94,0.5)} 65%{box-shadow:0 0 0 24px rgba(244,63,94,0)}`

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

function Countdown({ availableAt }: { availableAt: string }) {
  const target = new Date(availableAt).getTime()
  const now = Date.now()
  const diffMs = Math.max(target - now, 0)
  const h = Math.floor(diffMs / 3600000)
  const m = Math.floor((diffMs % 3600000) / 60000)
  return <>{h > 0 ? `${h}h ${m}m` : `${m}m`}</>
}

function RewardCard({ reward, rarities, types }: { reward: CollectionDailyReward; rarities: RarityConfig[]; types: NoteTypeConfig[] }) {
  const r = rarities.find((x) => x.id === reward.rarity)
  const t = types.find((x) => x.id === reward.typeId)

  return (
    <Box sx={{
      p: 2.5, borderRadius: radius.xl,
      background: r?.cardBg ?? colors.surface.base,
      border: `1.5px solid ${r?.borderColor ?? colors.border.subtle}`,
      boxShadow: r?.shadow ?? '0 4px 20px rgba(0,0,0,0.08)',
      animation: `${cardIn} 0.55s cubic-bezier(0.16,1,0.3,1)`,
    }}>
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          {r && (
            <Chip size="small" label={`${r.emoji} ${r.label}`} sx={{
              fontSize: '0.7rem', fontWeight: 800, height: 22,
              background: r.chipBg, color: r.chipColor,
              border: `1px solid ${r.borderColor}`,
              '& .MuiChip-label': { px: 1 },
            }} />
          )}
          {reward.isNew && (
            <Chip size="small" label="✨ Novo!" sx={{
              fontSize: '0.68rem', fontWeight: 800, height: 22,
              bgcolor: '#dcfce7', color: '#15803d',
              '& .MuiChip-label': { px: 1 },
            }} />
          )}
        </Stack>

        <Typography sx={{
          fontFamily: font.serif, fontWeight: 700, fontSize: '1.2rem',
          color: r?.textColor ?? colors.text.primary, lineHeight: 1.3,
        }}>
          {reward.title}
        </Typography>

        <Typography sx={{
          fontSize: '0.9rem', color: r?.captionColor ?? colors.text.secondary,
          lineHeight: 1.65, fontStyle: 'italic',
        }}>
          &ldquo;{reward.message}&rdquo;
        </Typography>

        {t && (
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.5,
            px: 1, py: 0.3, borderRadius: radius.full,
            background: t.tagBg, color: t.tagColor,
            fontSize: '0.68rem', fontWeight: 700, alignSelf: 'flex-start',
          }}>
            {t.emoji} {t.label}
          </Box>
        )}
      </Stack>
    </Box>
  )
}

export function CollectionPlayPage() {
  const { cid } = useParams<{ cid: string }>()
  const navigate = useNavigate()
  const { user } = useUser()
  const { theme } = useBackground()

  const { data: play, isLoading } = useCollectionPlayQuery(cid ?? '')
  const { data: rarities = [] } = useCollectionRaritiesQuery(cid ?? '')
  const { data: types = [] } = useCollectionTypesQuery(cid ?? '')
  const openMutation = useOpenCollectionDailyMutation(cid ?? '')
  const [reward, setReward] = useState<CollectionDailyReward | null>(null)

  const colTheme = play ? getBackgroundTheme(play.daily ? theme.key : theme.key) : null
  const canOpen = play?.daily.canOpen ?? false
  const completion = play && play.total > 0 ? Math.round((play.owned / play.total) * 100) : 0

  async function handleOpen() {
    if (!cid) return
    try {
      const result = await openMutation.mutateAsync()
      setReward(result.reward)
      toast.love(`"${result.reward.title}"`, { description: 'Bilhete do dia aberto!' })
    } catch (e) {
      toast.error((e as Error).message ?? 'Erro ao abrir bilhete.')
    }
  }

  const isWriter = user?.role === 'writer'

  return (
    <Box sx={{ height: '100%', position: 'relative', background: theme.gradient }}>
      <FavoriteIcon sx={{ position: 'absolute', bottom: -60, right: -60, fontSize: 400, color: 'rgba(225,29,72,0.04)', pointerEvents: 'none' }} />

      <ScrollablePage sx={{ px: 2.5, py: 2.5, animation: `${fadeIn} 0.35s ease` }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <IconButton size="small" onClick={() => navigate('/colecoes')} sx={{ color: colors.text.secondary, mr: 0.5 }}>
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            {isLoading ? (
              <CircularProgress size={16} sx={{ color: colors.text.muted }} />
            ) : (
              <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.15rem', color: colors.text.primary }}>
                {play ? 'Coleção' : '—'}
              </Typography>
            )}
          </Box>
          {isWriter && cid && (
            <IconButton size="small" onClick={() => navigate(`/colecoes/${cid}/gerenciar`)} sx={{ color: colors.text.secondary }}>
              <SettingsIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
        </Stack>

        {isLoading && (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress size={28} sx={{ color: colors.primary.main }} />
          </Box>
        )}

        {!isLoading && play && (
          <Stack spacing={2.5}>
            <Card sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: 0.8, color: colors.text.muted, textTransform: 'uppercase' }}>
                    Sua coleção
                  </Typography>
                  <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.1rem', color: colors.primary.main }}>
                    {completion}%
                  </Typography>
                </Stack>
                <LinearProgress variant="determinate" value={completion} sx={{
                  height: 6, borderRadius: radius.full, bgcolor: 'rgba(0,0,0,0.06)',
                  '& .MuiLinearProgress-bar': { borderRadius: radius.full, background: `linear-gradient(90deg, ${colors.primary.main}, ${colors.purple.main})` },
                }} />
                <Typography sx={{ fontSize: '0.72rem', color: colors.text.muted }}>
                  {play.owned} de {play.total} bilhetes coletados
                </Typography>
              </Stack>
            </Card>

            <Stack spacing={1.5} alignItems="center">
              <Box
                onClick={canOpen && !openMutation.isPending ? handleOpen : undefined}
                sx={{
                  width: 120, height: 120, borderRadius: '50%', cursor: canOpen ? 'pointer' : 'default',
                  background: canOpen
                    ? 'linear-gradient(135deg, #f43f5e, #e11d48)'
                    : `linear-gradient(135deg, ${colors.primary.main}, ${colors.purple.main})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: canOpen ? '0 8px 32px rgba(244,63,94,0.4)' : `0 8px 32px ${colors.primary.glow}`,
                  transition: 'all 0.3s',
                  animation: canOpen ? `${pulse} 2.2s ease-in-out infinite` : 'none',
                  '&:hover': canOpen ? { transform: 'scale(1.06)' } : {},
                }}
              >
                {openMutation.isPending ? (
                  <CircularProgress size={32} sx={{ color: '#fff' }} />
                ) : (
                  <FavoriteIcon sx={{ fontSize: 44, color: '#fff', opacity: 0.9 }} />
                )}
              </Box>

              {canOpen ? (
                <Stack spacing={0.3} alignItems="center">
                  <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1rem', color: colors.text.primary }}>
                    Seu bilhete está pronto!
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: colors.text.secondary }}>
                    Toque no coração para abrir ✨
                  </Typography>
                </Stack>
              ) : (
                <Stack spacing={0.3} alignItems="center">
                  <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1rem', color: colors.text.primary }}>
                    Próximo bilhete
                  </Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: colors.text.secondary }}>
                    às {formatTime(play.daily.availableAt)} · <Countdown availableAt={play.daily.availableAt} />
                  </Typography>
                </Stack>
              )}
            </Stack>

            {reward && (
              <RewardCard reward={reward} rarities={rarities} types={types} />
            )}

            {play.items.filter((n) => n.owned).length > 0 && (
              <Stack spacing={1}>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: 1.2, color: colors.text.muted, textTransform: 'uppercase' }}>
                  Bilhetes coletados
                </Typography>
                {play.items.filter((n) => n.owned).map((note) => {
                  const r = rarities.find((x) => x.id === note.rarity)
                  return (
                    <Card key={note.id} accent={r?.borderColor} sx={{ p: 0, overflow: 'hidden' }}>
                      <Box sx={{ height: '3px', background: r ? `linear-gradient(90deg, ${r.borderColor}, ${r.borderColor}88)` : colors.border.subtle }} />
                      <Box sx={{ p: 1.8 }}>
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '0.93rem', color: colors.text.primary, mb: 0.3 }}>
                              {note.title}
                            </Typography>
                            <Typography sx={{
                              fontSize: '0.78rem', color: colors.text.secondary, lineHeight: 1.5,
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>
                              {note.message}
                            </Typography>
                          </Box>
                          {r && (
                            <Box sx={{
                              px: 0.9, py: 0.35, borderRadius: radius.full, flexShrink: 0,
                              background: r.chipBg, color: r.chipColor, fontSize: '0.65rem', fontWeight: 700,
                            }}>
                              {r.emoji}
                            </Box>
                          )}
                        </Stack>
                      </Box>
                    </Card>
                  )
                })}
              </Stack>
            )}

            {play.total > 0 && play.items.filter((n) => !n.owned).length > 0 && (
              <Stack spacing={1}>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: 1.2, color: colors.text.muted, textTransform: 'uppercase' }}>
                  Ainda por descobrir — {play.items.filter((n) => !n.owned).length}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {play.items.filter((n) => !n.owned).map((note) => {
                    const r = rarities.find((x) => x.id === note.rarity)
                    return (
                      <Box key={note.id} sx={{
                        px: 1, py: 0.5, borderRadius: radius.full,
                        background: 'rgba(0,0,0,0.06)', fontSize: '0.68rem', fontWeight: 700,
                        color: colors.text.muted, display: 'flex', alignItems: 'center', gap: 0.4,
                      }}>
                        {r?.emoji ?? '📝'} ???
                      </Box>
                    )
                  })}
                </Box>
              </Stack>
            )}
          </Stack>
        )}
      </ScrollablePage>
    </Box>
  )
}
