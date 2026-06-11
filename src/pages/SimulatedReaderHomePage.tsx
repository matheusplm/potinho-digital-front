import FavoriteIcon from '@mui/icons-material/Favorite'
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, LoadingState, ScrollablePage, toast } from '../components/ui'
import { useBackground } from '../context/BackgroundContext'
import { useSimulation } from '../context/SimulationContext'
import { useUser } from '../context/UserContext'
import {
  useCollectionNotesQuery,
  useCollectionPacksQuery,
  useCollectionPlayQuery,
  useCollectionRaritiesQuery,
  useCollectionsQuery,
  useCollectionTypesQuery,
  useOpenCollectionDailyMutation,
  useOpenCollectionPackMutation,
} from '../hooks/useNotes'
import { backgroundThemes, colors, font, radius } from '../design-system'
import { simulatePackOpen } from '../utils/simulationPlay'
import { NoteDetailDialog, PACK_OPEN_ANIMATION_MS, PackOpeningDialog, RewardCard, type ReadableNote, wait } from './CollectionPlayPage'
import type { Collection, CollectionDailyReward, CollectionPack } from '../types/note'
import { slugify } from '../utils/slug'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`
const packCtaFloat = keyframes`
  0%,100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-4px) scale(1.055); }
`
const heartPulseAura = keyframes`
  from { opacity: 0.42; transform: scale(0.88); }
  to { opacity: 0; transform: scale(1.3); }
`

function formatRemainingTime(ms: number) {
  if (ms <= 0) return 'disponível agora'
  const totalMinutes = Math.ceil(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours <= 0) return `${minutes}min`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}min`
}

const readyPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(244,63,94,0.45); }
  60% { box-shadow: 0 0 0 7px rgba(244,63,94,0); }
`

function ReaderCollectionCard({ collection }: { collection: Collection }) {
  const navigate = useNavigate()
  const { data: play } = useCollectionPlayQuery(collection.id)
  const { data: packs = [] } = useCollectionPacksQuery(collection.id)
  const bg = backgroundThemes.find((t) => t.key === collection.theme) ?? backgroundThemes[0]
  const completion = play && play.total > 0 ? Math.round((play.owned / play.total) * 100) : 0
  const canOpen = play?.daily.canOpen ?? false
  const remainingMs = !canOpen && play ? Math.max(0, Date.parse(play.daily.availableAt) - Date.now()) : 0
  const favoritesCount = play?.items.filter((item) => item.favorite).length ?? 0
  const hasBonus = packs.some((pack) => pack.status === 'active' && pack.category !== 'daily')
  const isComplete = play ? play.total > 0 && play.owned === play.total : false

  function fmt(ms: number) {
    const h = Math.floor(ms / 3_600_000)
    const m = Math.ceil((ms % 3_600_000) / 60_000)
    return h > 0 ? (m === 0 ? `${h}h` : `${h}h ${m}min`) : `${m}min`
  }

  return (
    <Box
      onClick={() => navigate(`/colecoes/${slugify(collection.name)}`)}
      sx={{
        borderRadius: radius.xl, overflow: 'hidden', cursor: 'pointer',
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(14px)',
        border: `1px solid ${canOpen ? `${bg.accent}3a` : 'rgba(255,255,255,0.62)'}`,
        boxShadow: '0 2px 12px rgba(15,23,42,0.08)',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 28px ${bg.accent}28` },
        '&:active': { transform: 'scale(0.985)' },
      }}
    >
      <Box sx={{
        height: 58, background: bg.gradient, display: 'flex', alignItems: 'center',
        px: 2, gap: 1.2, position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.22), transparent 65%)', pointerEvents: 'none' }} />
        <Typography sx={{ fontSize: '1.6rem', lineHeight: 1, zIndex: 1, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.18))' }}>
          {collection.emoji}
        </Typography>
        <Typography sx={{
          flex: 1, minWidth: 0, zIndex: 1,
          fontFamily: font.serif, fontWeight: 700, fontSize: '1rem',
          color: bg.isDark ? 'rgba(255,255,255,0.95)' : colors.text.primary,
          lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {collection.name}
        </Typography>
        {canOpen && (
          <Box sx={{
            zIndex: 1, px: 1.1, py: 0.45, borderRadius: radius.full,
            background: 'rgba(255,255,255,0.92)', border: `1px solid ${bg.accent}44`, flexShrink: 0,
            animation: `${readyPulse} 2.2s ease-in-out infinite`,
          }}>
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: bg.accent, whiteSpace: 'nowrap' }}>
              💌 Abrir
            </Typography>
          </Box>
        )}
      </Box>
      <Box sx={{ px: 2, py: 1.3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.6 }}>
          <Typography sx={{ fontSize: '0.68rem', color: colors.text.muted }}>
            {play ? `${play.owned} de ${play.total} bilhetes` : '···'}
          </Typography>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: isComplete ? colors.success.main : bg.accent }}>
            {isComplete ? '✓ Completo' : `${completion}%`}
          </Typography>
        </Stack>
        <LinearProgress variant="determinate" value={completion} sx={{
          height: 4, borderRadius: radius.full, bgcolor: 'rgba(0,0,0,0.06)',
          '& .MuiLinearProgress-bar': { borderRadius: radius.full, background: `linear-gradient(90deg, ${bg.accent}bb, ${bg.accent})` },
        }} />
        <Stack direction="row" spacing={0.7} sx={{ mt: 0.85, flexWrap: 'wrap', rowGap: 0.5, alignItems: 'center' }}>
          {hasBonus && (
            <Box sx={{ px: 0.85, py: 0.28, borderRadius: radius.full, background: 'rgba(99,102,241,0.12)', color: '#4f46e5', fontSize: '0.62rem', fontWeight: 800 }}>
              🎁 Bônus
            </Box>
          )}
          {favoritesCount > 0 && (
            <Box sx={{ px: 0.85, py: 0.28, borderRadius: radius.full, background: 'rgba(244,63,94,0.1)', color: colors.rose.main, fontSize: '0.62rem', fontWeight: 800 }}>
              ♥ {favoritesCount}
            </Box>
          )}
          {!canOpen && remainingMs > 0 && (
            <Typography sx={{ fontSize: '0.66rem', color: colors.text.muted, ml: 'auto' }}>
              ⏳ {fmt(remainingMs)}
            </Typography>
          )}
        </Stack>
      </Box>
    </Box>
  )
}

function ReaderCollectionsHome({ collections }: { collections: Collection[] }) {
  const { theme } = useBackground()
  const { user } = useUser()
  const firstName = user?.name?.split(' ')[0] ?? ''
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <Box sx={{ height: '100%', position: 'relative', overflow: 'hidden', background: theme.gradient }}>
      <FavoriteIcon sx={{ position: 'absolute', bottom: -80, right: -80, fontSize: 480, color: 'rgba(225,29,72,0.05)', pointerEvents: 'none' }} />
      <ScrollablePage sx={{ px: 2.5, py: 2.5, animation: `${fadeIn} 0.4s ease` }}>
        <Stack spacing={0.3} sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: '0.82rem', color: theme.textOnBgMuted, fontWeight: 500 }}>
            {greeting},
          </Typography>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '2rem', color: theme.textOnBg, lineHeight: 1.1, letterSpacing: '-0.5px' }}>
            {firstName} 💙
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: theme.textOnBgMuted, fontStyle: 'italic', mt: 0.5 }}>
            {collections.length} potinho{collections.length !== 1 ? 's' : ''} esperando por você 💌
          </Typography>
        </Stack>
        <Stack spacing={1.4}>
          {collections.map((col) => (
            <ReaderCollectionCard key={col.id} collection={col} />
          ))}
        </Stack>
      </ScrollablePage>
    </Box>
  )
}

export function SimulatedReaderHomePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { theme } = useBackground()
  const { user } = useUser()
  const simulation = useSimulation()
  const { session } = simulation
  const { data: collections = [], isLoading: collectionsLoading } = useCollectionsQuery()
  const isRealReader = !simulation.isActive && user?.role === 'reader'
  const readerCollections = useMemo(
    () => isRealReader ? collections.filter((c) => c.access === 'reader') : [],
    [collections, isRealReader],
  )
  const readerCollection = useMemo(
    () => isRealReader ? (readerCollections[0] ?? collections[0]) : undefined,
    [collections, isRealReader, readerCollections],
  )
  const activeSession = session ?? (readerCollection ? {
    collectionId: readerCollection.id,
    collectionSlug: slugify(readerCollection.name),
    collectionName: readerCollection.name,
    collectionEmoji: readerCollection.emoji,
    preset: 'new_reader' as const,
  } : null)
  const cid = activeSession?.collectionId ?? ''
  const { data: notes = [], isLoading: notesLoading } = useCollectionNotesQuery(cid, { enabled: !!session })
  const { data: playFromApi, isLoading: playLoading } = useCollectionPlayQuery(cid, { enabled: isRealReader && !!cid })
  const { data: rarities = [] } = useCollectionRaritiesQuery(cid)
  const { data: types = [] } = useCollectionTypesQuery(cid)
  const { data: packs = [] } = useCollectionPacksQuery(cid)
  const openDailyMutation = useOpenCollectionDailyMutation(cid)
  const openPackMutation = useOpenCollectionPackMutation(cid)
  const play = isRealReader ? playFromApi : simulation.getPlayView(notes)
  const isLoading = isRealReader ? collectionsLoading || (!!cid && playLoading) : notesLoading
  const completion = play && play.total > 0 ? Math.round((play.owned / play.total) * 100) : 0
  const [isOpeningPack, setIsOpeningPack] = useState(false)
  const [rewards, setRewards] = useState<CollectionDailyReward[]>([])
  const [highlightOpen, setHighlightOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<ReadableNote | null>(null)
  const [openingPack, setOpeningPack] = useState<CollectionPack | null>(null)
  const [selectedBonusPack, setSelectedBonusPack] = useState<CollectionPack | null>(null)
  const [openedBonusPackIds, setOpenedBonusPackIds] = useState<string[]>([])
  const [now, setNow] = useState(() => Date.now())

  const activePacks = useMemo(() => packs.filter((pack) => pack.status === 'active'), [packs])
  const mainPack = useMemo(
    () => activePacks.find((pack) => pack.category === 'daily') ?? activePacks[0],
    [activePacks],
  )
  const bonusPacks = useMemo(
    () => {
      const source = isRealReader
        ? activePacks.filter((pack) => pack.id !== mainPack?.id)
        : session?.preset === 'new_reader_with_bonus'
          ? packs.filter((pack) => pack.id !== mainPack?.id && pack.category !== 'daily')
          : activePacks.filter((pack) => pack.id !== mainPack?.id)
      return source.filter((pack) => !openedBonusPackIds.includes(pack.id))
    },
    [activePacks, isRealReader, mainPack?.id, openedBonusPackIds, packs, session?.preset],
  )
  const nextMainPackAt = Date.parse(play?.daily.availableAt ?? '')
  const mainCooldownMs = Math.max(1, mainPack?.cooldownHours ?? 24) * 60 * 60 * 1000
  const remainingMainPackMs = !play || play.daily.canOpen || !Number.isFinite(nextMainPackAt)
    ? 0
    : Math.max(0, nextMainPackAt - now)
  const cooldownProgress = !play || play.daily.canOpen
    ? 1
    : Math.min(1, Math.max(0, 1 - remainingMainPackMs / mainCooldownMs))
  const remainingLabel = formatRemainingTime(remainingMainPackMs)

  useEffect(() => {
    if (!play || play.daily.canOpen) return
    const interval = window.setInterval(() => setNow(Date.now()), 30000)
    return () => window.clearInterval(interval)
  }, [play])

  async function handleOpenPack(pack: CollectionPack | undefined, isMain: boolean) {
    if (!activeSession || !play || isOpeningPack || !pack) return
    if (!isRealReader && notes.length === 0) {
      toast.info('Essa coleção ainda não tem bilhetes para abrir.')
      return
    }

    if (isRealReader) {
      setSelectedBonusPack(null)
      setOpeningPack(pack)
      setIsOpeningPack(true)
      const startedAt = Date.now()
      try {
        let rewards: CollectionDailyReward[]
        if (isMain) {
          const result = await openDailyMutation.mutateAsync()
          await queryClient.invalidateQueries({ queryKey: ['col-play', cid] })
          rewards = result.rewards
        } else {
          const result = await openPackMutation.mutateAsync(pack.id)
          setOpenedBonusPackIds((ids) => [...new Set([...ids, pack.id])])
          rewards = result.rewards
        }
        await wait(Math.max(0, PACK_OPEN_ANIMATION_MS - (Date.now() - startedAt)))
        setNow(Date.now())
        setRewards(rewards)
        setHighlightOpen(true)
        const newCount = rewards.filter((r) => r.isNew).length
        toast.love(`${rewards.length} bilhete${rewards.length !== 1 ? 's' : ''}!`, {
          description: newCount > 0 ? `${newCount} novo${newCount !== 1 ? 's' : ''} na coleção ✨` : `${pack.name} aberto!`,
        })
      } catch (error) {
        toast.error((error as Error).message ?? 'Erro ao abrir pacotinho.')
      } finally {
        setIsOpeningPack(false)
        setOpeningPack(null)
      }
      return
    }

    const ownedIds = play.items.filter((item) => item.owned).map((item) => item.id)
    const pendingRewards = simulatePackOpen(pack, notes, rarities, ownedIds)
    if (pendingRewards.length === 0) {
      toast.info('Esse pacotinho não tem bilhetes novos compatíveis agora.')
      return
    }

    setSelectedBonusPack(null)
    setOpeningPack(pack)
    setIsOpeningPack(true)
    await wait(PACK_OPEN_ANIMATION_MS)
    const revealedRewards = isMain
      ? simulation.commitDailyOpen(pendingRewards, pack.cooldownHours)
      : simulation.commitRewards(pendingRewards)
    setNow(Date.now())
    setRewards(revealedRewards)
    setIsOpeningPack(false)
    setOpeningPack(null)
    if (!isMain) {
      setOpenedBonusPackIds((current) => [...new Set([...current, pack.id])])
    }
    setHighlightOpen(true)
    toast.love(`${revealedRewards.length} bilhete${revealedRewards.length !== 1 ? 's' : ''}!`, {
      description: `${pack.name} aberto na prévia ✨`,
    })
  }

  if (isRealReader && !collectionsLoading && readerCollections.length > 1) {
    return <ReaderCollectionsHome collections={readerCollections} />
  }

  if (!activeSession) {
    return (
      <Box sx={{ height: '100%', background: theme.gradient }}>
        <ScrollablePage sx={{ px: 2.5, py: 2.5 }}>
          {isRealReader && !collectionsLoading ? (
            <Stack spacing={1.2} alignItems="center" justifyContent="center" sx={{ minHeight: 360, textAlign: 'center' }}>
              <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.3rem', color: theme.textOnBg }}>
                Nenhum potinho por aqui ainda
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: theme.textOnBgMuted, maxWidth: 260 }}>
                Peça o código de convite ou peça para liberarem seu email em uma coleção.
              </Typography>
            </Stack>
          ) : (
            <LoadingState label="Preparando potinho" accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} sx={{ minHeight: 360 }} />
          )}
        </ScrollablePage>
      </Box>
    )
  }

  if (!play) {
    return (
      <Box sx={{ height: '100%', background: theme.gradient }}>
        <ScrollablePage sx={{ px: 2.5, py: 2.5 }}>
          <LoadingState label="Carregando potinho" accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} sx={{ minHeight: 360 }} />
        </ScrollablePage>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100%', position: 'relative', overflow: 'hidden', background: theme.gradient }}>
      <FavoriteIcon sx={{ position: 'absolute', bottom: -80, right: -80, fontSize: 480, color: 'rgba(225,29,72,0.05)', pointerEvents: 'none' }} />

      <ScrollablePage sx={{ px: 2.5, py: 2.2, animation: `${fadeIn} 0.35s ease` }}>
        <Stack spacing={0.35} sx={{ mb: 1.35 }}>
          <Typography sx={{ fontSize: '0.78rem', color: theme.textOnBgMuted, fontWeight: 700 }}>
            {isRealReader ? 'Para você' : 'Prévia do leitor'}
          </Typography>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.72rem', color: theme.textOnBg, lineHeight: 1.08 }}>
            Seu potinho chegou 💌
          </Typography>
        </Stack>

        <Stack spacing={1.15} sx={{ minHeight: 'calc(100dvh - 214px)' }}>
          <Card sx={{ p: 1.05, background: 'rgba(255,255,255,0.62)', backdropFilter: 'blur(14px)' }}>
            <Stack spacing={0.65}>
              {isLoading ? (
                <LoadingState compact label="Carregando coleção" accent={theme.accent} />
              ) : (
                <>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: colors.text.secondary }}>
                      Coleção
                    </Typography>
                    <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.05rem', color: theme.accent }}>
                      {completion}%
                    </Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={completion} sx={{
                    height: 7,
                    borderRadius: radius.full,
                    bgcolor: 'rgba(0,0,0,0.06)',
                    '& .MuiLinearProgress-bar': { borderRadius: radius.full, background: `linear-gradient(90deg, ${colors.rose.main}, ${theme.accent})` },
                  }} />
                  <Typography sx={{ fontSize: '0.72rem', color: colors.text.muted }}>
                    {play.owned} de {play.total} bilhetes coletados
                  </Typography>
                </>
              )}
            </Stack>
          </Card>

          <Stack spacing={1.2} alignItems="center" justifyContent="center" sx={{
            flex: 1,
            minHeight: 390,
            py: 1.2,
            borderRadius: radius.xl,
            background: 'radial-gradient(circle at 50% 42%, rgba(255,255,255,0.18), transparent 44%)',
          }}>
            <Box
              role="button"
              aria-label={`Abrir ${mainPack?.name ?? 'pacote principal'}`}
              tabIndex={play.daily.canOpen ? 0 : -1}
              onClick={!isLoading && play.daily.canOpen && !isOpeningPack ? () => handleOpenPack(mainPack, true) : undefined}
              onKeyDown={(event) => {
                if (!isLoading && play.daily.canOpen && !isOpeningPack && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault()
                  void handleOpenPack(mainPack, true)
                }
              }}
              onMouseDown={(event) => event.preventDefault()}
              sx={{
                width: play.daily.canOpen ? 214 : 196,
                height: play.daily.canOpen ? 194 : 184,
                borderRadius: radius.full,
                cursor: play.daily.canOpen ? 'pointer' : 'default',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'visible',
                boxShadow: 'none',
                transition: 'transform 0.22s ease, box-shadow 0.22s ease',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                animation: play.daily.canOpen ? `${packCtaFloat} 3.2s ease-in-out infinite` : undefined,
                '&:hover': play.daily.canOpen ? {
                  transform: 'translateY(-3px) scale(1.025)',
                } : {},
                '&:active': play.daily.canOpen ? { transform: 'scale(0.98)' } : {},
              }}
            >
              {play.daily.canOpen ? (
                <Box sx={{
                  width: 184,
                  height: 184,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 1,
                  pointerEvents: 'none',
                }}>
                  <Box
                    component="svg"
                    viewBox="0 0 24 24"
                    sx={{
                      position: 'absolute',
                      inset: -12,
                      width: 'calc(100% + 24px)',
                      height: 'calc(100% + 24px)',
                      color: 'rgba(244,63,94,0.34)',
                      transformOrigin: '50% 50%',
                      animation: `${heartPulseAura} 1.85s ease-out infinite`,
                      pointerEvents: 'none',
                    }}
                  >
                    <path
                      fill="currentColor"
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"
                    />
                  </Box>
                  <Box
                    component="svg"
                    viewBox="0 0 24 24"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      color: '#dc2626',
                      filter: 'drop-shadow(0 24px 34px rgba(225,29,72,0.42))',
                    }}
                  >
                    <defs>
                      <linearGradient id="main-pack-heart" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#fb7185" />
                        <stop offset="42%" stopColor="#ef4444" />
                        <stop offset="74%" stopColor="#dc2626" />
                        <stop offset="100%" stopColor="#be123c" />
                      </linearGradient>
                    </defs>
                    <path
                      fill="url(#main-pack-heart)"
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"
                    />
                    <path
                      fill="rgba(255,255,255,0.42)"
                      d="M7.4 5.25c-1.9 0-3.2 1.42-3.2 3.28 0 .68.14 1.34.43 1.98.16.36.67.32.78-.06.55-1.91 1.72-3.35 3.46-4.23.42-.21.27-.97-.2-.97H7.4z"
                    />
                  </Box>
                  <Typography sx={{
                    position: 'relative',
                    zIndex: 1,
                    fontSize: '4.1rem',
                    lineHeight: 1,
                    transform: 'translateY(-3px)',
                    filter: 'drop-shadow(0 5px 12px rgba(0,0,0,0.18))',
                  }}>
                    {mainPack?.emoji ?? activeSession.collectionEmoji}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{
                  width: 176,
                  height: 176,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  pointerEvents: 'none',
                }}>
                  <Box
                    component="svg"
                    viewBox="0 0 24 24"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      color: 'rgba(255,255,255,0.54)',
                      filter: `drop-shadow(0 16px 28px ${theme.accent}24)`,
                    }}
                  >
                    <path
                      fill="currentColor"
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"
                    />
                    <path
                      fill={theme.accent}
                      opacity="0.22"
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"
                      style={{ transformOrigin: 'center', transform: `scale(${0.72 + cooldownProgress * 0.28})` }}
                    />
                  </Box>
                  <Stack spacing={0.1} alignItems="center" sx={{ position: 'relative', zIndex: 1, transform: 'translateY(-4px)' }}>
                    <Typography sx={{ fontSize: '1.9rem', lineHeight: 1 }}>
                      ⏳
                    </Typography>
                    <Typography sx={{ fontFamily: font.serif, fontWeight: 900, fontSize: '1.02rem', color: theme.accent, lineHeight: 1.1 }}>
                      {remainingLabel}
                    </Typography>
                    <Typography sx={{ fontSize: '0.58rem', fontWeight: 900, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                      restante
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Box>
            {play.daily.canOpen && (
              <Stack spacing={0.2} alignItems="center" sx={{
                mt: -0.35,
                px: 1.6,
                py: 0.7,
                borderRadius: radius.xl,
                background: 'rgba(255,255,255,0.42)',
                border: '1px solid rgba(255,255,255,0.5)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 20px rgba(15,23,42,0.08)',
              }}>
                <Typography sx={{ color: theme.textOnBg, fontFamily: font.serif, fontSize: '1rem', fontWeight: 850, lineHeight: 1.1 }}>
                  Pacotinho disponível
                </Typography>
                <Typography sx={{ color: theme.textOnBgMuted, fontSize: '0.72rem', fontWeight: 750, lineHeight: 1.2 }}>
                  toque no coração
                </Typography>
              </Stack>
            )}
            {!play.daily.canOpen && (
              <Stack spacing={0.45} alignItems="center" sx={{
                px: 1.6,
                py: 0.9,
                borderRadius: radius.xl,
                background: 'rgba(255,255,255,0.34)',
                border: '1px solid rgba(255,255,255,0.44)',
                backdropFilter: 'blur(12px)',
              }}>
                <Typography sx={{
                  fontFamily: font.serif,
                  fontWeight: 850,
                  fontSize: '1rem',
                  color: theme.textOnBg,
                  textAlign: 'center',
                  maxWidth: 280,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                }}>
                  Novo pacotinho em
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: theme.textOnBgMuted, textAlign: 'center', maxWidth: 280, lineHeight: 1.45 }}>
                  {remainingLabel}
                </Typography>
                {!isRealReader && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      simulation.resetDailyCooldown()
                      setNow(Date.now())
                      toast.info('Cooldown resetado na prévia.')
                    }}
                    sx={{
                      mt: 0.45,
                      py: 0.58,
                      px: 1.25,
                      fontSize: '0.72rem',
                      background: 'rgba(255,255,255,0.42)',
                      color: theme.textOnBg,
                      border: '1px solid rgba(255,255,255,0.48)',
                      '&:hover': { background: 'rgba(255,255,255,0.56)' },
                    }}
                  >
                    Resetar cooldown
                  </Button>
                )}
              </Stack>
            )}
          </Stack>

        </Stack>
      </ScrollablePage>
      {bonusPacks.length > 0 && (
        <Box sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 18,
          zIndex: 6,
          display: 'flex',
          flexDirection: 'column-reverse',
          alignItems: 'flex-start',
          gap: 1,
          pl: 1.75,
          boxSizing: 'border-box',
          pointerEvents: 'none',
        }}>
          {bonusPacks.slice(0, 5).map((pack) => (
            <Box
              key={pack.id}
              role="button"
              aria-label={`Ver ${pack.name}`}
              tabIndex={0}
              onClick={() => setSelectedBonusPack(pack)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setSelectedBonusPack(pack)
                }
              }}
              onMouseDown={(event) => event.preventDefault()}
              sx={{
                width: 54,
                height: 54,
                borderRadius: radius.full,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: pack.gradient,
                border: '2px solid rgba(255,255,255,0.86)',
                boxShadow: `0 10px 28px ${pack.accent}42`,
                fontSize: '1.42rem',
                position: 'relative',
                transition: 'transform 0.16s ease, box-shadow 0.16s ease',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                pointerEvents: 'auto',
                '&:hover': { transform: 'translateY(-2px) scale(1.05)', boxShadow: `0 12px 32px ${pack.accent}52` },
                '&:active': { transform: 'scale(0.96)' },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 3,
                  right: 3,
                  width: 9,
                  height: 9,
                  borderRadius: radius.full,
                  background: colors.rose.main,
                  boxShadow: `0 0 0 3px rgba(255,255,255,0.86), 0 0 14px ${colors.rose.glow}`,
                },
              }}
            >
              {pack.emoji}
            </Box>
          ))}
        </Box>
      )}
      <PackOpeningDialog open={isOpeningPack} emoji={openingPack?.emoji ?? activeSession.collectionEmoji} accent={openingPack?.accent ?? theme.accent} />
      <Dialog
        open={highlightOpen}
        onClose={() => setHighlightOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              mx: 2,
              borderRadius: radius.xl,
              overflow: 'hidden',
              background: 'rgba(255,250,247,0.98)',
              boxShadow: '0 24px 70px rgba(15,23,42,0.18)',
            },
          },
          backdrop: {
            sx: {
              background: 'rgba(15,23,42,0.18)',
              backdropFilter: 'blur(8px)',
            },
          },
        }}
      >
        <Box sx={{
          p: 2,
          background: `radial-gradient(circle at 18% 0%, rgba(255,255,255,0.76), transparent 38%), linear-gradient(135deg, ${colors.rose.main}14, ${theme.accent}18)`,
          position: 'relative',
        }}>
          <DialogTitle sx={{ p: 0, fontFamily: font.serif, fontWeight: 850, fontSize: '1.18rem', color: colors.text.primary }}>
            Você recebeu 💌
          </DialogTitle>
          <Typography sx={{ mt: 0.35, fontSize: '0.78rem', color: colors.text.secondary }}>
            Leia seus novos bilhetinhos antes de guardar na coleção.
          </Typography>
        </Box>

        <DialogContent sx={{ pt: 2, px: 2, pb: 1.5 }}>
          <Stack spacing={1.2}>
            {rewards.map((reward, index) => (
              <RewardCard
                key={`${reward.id}-${index}`}
                reward={reward}
                rarities={rarities}
                types={types}
                onClick={() => {
                  simulation.markNoteViewed(reward.id)
                  setSelectedNote(reward)
                }}
              />
            ))}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <Button variant="ghost" onClick={() => setHighlightOpen(false)} sx={{ flex: 1 }}>
            Fechar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setHighlightOpen(false)
              navigate(`/colecoes/${activeSession.collectionSlug}`)
            }}
            sx={{ flex: 1, whiteSpace: 'nowrap' }}
          >
            Ver coleção
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={!!selectedBonusPack}
        onClose={() => setSelectedBonusPack(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              mx: 2,
              borderRadius: radius.xl,
              overflow: 'hidden',
              background: selectedBonusPack?.gradient ?? 'rgba(255,250,247,0.98)',
              boxShadow: `0 24px 70px ${selectedBonusPack?.accent ?? theme.accent}28`,
            },
          },
          backdrop: {
            sx: {
              background: 'rgba(15,23,42,0.18)',
              backdropFilter: 'blur(8px)',
            },
          },
        }}
      >
        {selectedBonusPack && (
          <>
            <Box sx={{
              p: 2,
              position: 'relative',
              background: 'radial-gradient(circle at 18% 0%, rgba(255,255,255,0.64), transparent 40%)',
            }}>
              <DialogTitle sx={{
                p: 0,
                fontFamily: font.serif,
                fontWeight: 850,
                fontSize: '1.18rem',
                color: colors.text.primary,
                lineHeight: 1.2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
              }}>
                {selectedBonusPack.emoji} {selectedBonusPack.name}
              </DialogTitle>
              <Typography sx={{ mt: 0.45, fontSize: '0.78rem', color: colors.text.secondary, fontWeight: 700 }}>
                Pacotinho bônus disponível
              </Typography>
            </Box>

            <DialogContent sx={{ px: 2, pt: 1.5, pb: 1 }}>
              <Box sx={{
                p: 1.25,
                borderRadius: radius.lg,
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(255,255,255,0.62)',
                backdropFilter: 'blur(8px)',
              }}>
                <Typography sx={{
                  fontSize: '0.83rem',
                  color: colors.text.secondary,
                  lineHeight: 1.55,
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                }}>
                  {selectedBonusPack.description || 'Abra este pacote especial para tentar descobrir novos bilhetinhos da coleção.'}
                </Typography>
                <Stack direction="row" spacing={0.7} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 0.6 }}>
                  <Box sx={{ px: 0.85, py: 0.35, borderRadius: radius.full, background: `${selectedBonusPack.accent}18`, color: selectedBonusPack.accent, fontSize: '0.68rem', fontWeight: 850 }}>
                    {selectedBonusPack.cardsPerOpen} bilhete{selectedBonusPack.cardsPerOpen !== 1 ? 's' : ''}
                  </Box>
                  <Box sx={{ px: 0.85, py: 0.35, borderRadius: radius.full, background: 'rgba(255,255,255,0.72)', color: colors.text.secondary, fontSize: '0.68rem', fontWeight: 800 }}>
                    {selectedBonusPack.cooldownHours}h cooldown
                  </Box>
                  {selectedBonusPack.guaranteedRarityId && (
                    <Box sx={{ px: 0.85, py: 0.35, borderRadius: radius.full, background: 'rgba(255,247,237,0.9)', color: '#c2410c', fontSize: '0.68rem', fontWeight: 850 }}>
                      garantia especial
                    </Box>
                  )}
                </Stack>
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
              <Button variant="ghost" onClick={() => setSelectedBonusPack(null)} sx={{ flex: 1 }}>
                Agora não
              </Button>
              <Button
                variant="primary"
                disabled={isOpeningPack}
                onClick={() => handleOpenPack(selectedBonusPack, false)}
                sx={{ flex: 1, whiteSpace: 'nowrap' }}
              >
                Abrir bônus
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      <NoteDetailDialog note={selectedNote} rarities={rarities} types={types} onClose={() => setSelectedNote(null)} />
    </Box>
  )
}
