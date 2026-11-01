import ShuffleIcon from '@mui/icons-material/Shuffle'
import { Box, LinearProgress, Stack, Typography, useMediaQuery } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, LoadingState, ScrollablePage, toast } from '../components/ui'
import { PendingInviteCard } from '../components/PendingInviteCard'
import { useBackground } from '../context/BackgroundContext'
import { useSimulation } from '../context/SimulationContext'
import { useUser } from '../context/UserContext'
import { useReader } from '../context/ReaderContext'
import {
  useCollectionNotesQuery,
  useCollectionPackStatusesQuery,
  useCollectionPacksQuery,
  useCollectionPlayQuery,
  useCollectionRaritiesQuery,
  useCollectionsQuery,
  useCollectionTypesQuery,
  useMyNotificationsQuery,
  useOpenCollectionPackMutation,
  usePendingInvitesQuery,
  useReaderAchievementsQuery,
  queryKeys,
} from '../hooks/useNotes'
import { colors, fadeIn, font, radius } from '../design-system'
import { RoomGutters } from '../components/scene/RoomGutters'
import { SillScene } from '../components/scene/WindowScene'
import { isCollectionReader } from '../utils/collectionAccess'
import { ApiRequestError } from '../services/api'
import { simulatePackOpen } from '../utils/simulationPlay'
import { formatRemainingTime } from '../utils/packCooldowns'
import { isNotificationOptedOut, showLocalNotification } from '../utils/notifications'
import { computeAchievements } from '../utils/achievements'
import { NoteDetailDialog, type ReadableNote } from '../components/collection/NoteDetailDialog'
import { PackOpeningStage } from '../components/pack-opening/PackOpeningStage'
import type { CollectionDailyReward, CollectionPack } from '../types/note'
import { collectionSlug } from '../utils/slug'
import { MainPackButton } from './home/MainPackButton'
import { BonusPackRow } from './home/BonusPackRow'
import { OpenBonusDialog } from './home/OpenBonusDialog'

export function SimulatedReaderHomePage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { theme } = useBackground()
  const { user, persona } = useUser()
  const simulation = useSimulation()
  const { session } = simulation
  const { activeCollectionId, setActiveCollectionId, addUnread } = useReader()
  const { data: collections = [], isLoading: collectionsLoading } = useCollectionsQuery()
  const isRealReader = !simulation.isActive && persona === 'reader'
  const readerCollections = useMemo(
    () => isRealReader ? collections.filter((c) => isCollectionReader(c, user?.id)) : [],
    [collections, isRealReader, user?.id],
  )
  const readerCollection = useMemo(
    () => {
      if (!isRealReader) return undefined
      return readerCollections.find((c) => c.id === activeCollectionId)
        ?? readerCollections[0]
        ?? collections[0]
    },
    [activeCollectionId, collections, isRealReader, readerCollections],
  )

  useEffect(() => {
    if (isRealReader && readerCollection && readerCollection.id !== activeCollectionId) {
      setActiveCollectionId(readerCollection.id)
    }
  }, [isRealReader, readerCollection, activeCollectionId, setActiveCollectionId])

  const { data: pendingInvites = [] } = usePendingInvitesQuery({ enabled: isRealReader })
  const { data: myNotifications = [] } = useMyNotificationsQuery({ enabled: isRealReader })
  const unreadNewsCids = useMemo(
    () => new Set(myNotifications.filter((n) => !n.readAt).map((n) => n.collectionId)),
    [myNotifications],
  )

  const activeSession = session ?? (readerCollection ? {
    collectionId: readerCollection.id,
    collectionSlug: collectionSlug(readerCollection, collections),
    collectionName: readerCollection.name,
    collectionEmoji: readerCollection.emoji,
    preset: 'new_reader' as const,
  } : null)
  const cid = activeSession?.collectionId ?? ''

  useEffect(() => {
    setPackCooldowns({})
    setOpenedBonusPackIds([])
  }, [cid, isRealReader])

  const { data: notes = [], isLoading: notesLoading } = useCollectionNotesQuery(cid, { enabled: !!session })
  const { data: playFromApi, isLoading: playLoading } = useCollectionPlayQuery(cid, { enabled: isRealReader && !!cid })
  const { data: rarities = [] } = useCollectionRaritiesQuery(cid)
  const { data: types = [] } = useCollectionTypesQuery(cid)
  const { data: packs = [] } = useCollectionPacksQuery(cid)
  const activePacks = useMemo(() => packs.filter((pack) => pack.status === 'active'), [packs])
  const activePackIds = useMemo(() => activePacks.map((pack) => pack.id), [activePacks])
  const packsEmbedStatus = useMemo(() => packs.some((pack) => pack.readerStatus != null), [packs])
  const { data: packStatuses } = useCollectionPackStatusesQuery(
    cid,
    activePackIds,
    isRealReader && !!cid && !packsEmbedStatus,
  )
  const openPackMutation = useOpenCollectionPackMutation(cid)

  const prevCanOpen = useRef<boolean | null>(null)
  useEffect(() => {
    if (!playFromApi) return
    const canOpen = playFromApi.daily.canOpen
    if (
      prevCanOpen.current === false &&
      canOpen &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted' &&
      !isNotificationOptedOut()
    ) {
      void showLocalNotification('Potinho Digital 🎁', 'Existem pacotes disponíveis para você!')
    }
    prevCanOpen.current = canOpen
  }, [playFromApi])

  const play = isRealReader ? playFromApi : simulation.getPlayView(notes)
  const isLoading = isRealReader ? collectionsLoading || (!!cid && playLoading) : notesLoading
  const completion = play && play.total > 0 ? Math.round((play.owned / play.total) * 100) : 0

  const { data: readerAch } = useReaderAchievementsQuery(cid, { enabled: isRealReader && !!cid })
  const ownedItems = useMemo(() => (play?.items ?? []).filter((i) => i.owned), [play])
  const favCount = ownedItems.filter((i) => i.favorite).length
  const achievementsUnlocked = useMemo(
    () => isRealReader
      ? (readerAch?.achievements.filter((a) => a.unlocked).length ?? 0)
      : (play ? computeAchievements(play, rarities, types).filter((a) => a.unlocked).length : 0),
    [isRealReader, readerAch, play, rarities, types],
  )
  const [relerIndex, setRelerIndex] = useState(0)
  const relerNote = useMemo(
    () => (ownedItems.length > 0 ? ownedItems[relerIndex % ownedItems.length] : undefined),
    [relerIndex, ownedItems],
  )
  const [isOpeningPack, setIsOpeningPack] = useState(false)
  const [stage, setStage] = useState<{ pack: CollectionPack; rewards: CollectionDailyReward[] | null } | null>(null)
  const [stageOpen, setStageOpen] = useState(false)
  const achievementsPending = useRef(false)
  const [selectedNote, setSelectedNote] = useState<ReadableNote | null>(null)
  const [selectedBonusPack, setSelectedBonusPack] = useState<CollectionPack | null>(null)
  const [openedBonusPackIds, setOpenedBonusPackIds] = useState<string[]>([])
  const [packCooldowns, setPackCooldowns] = useState<Record<string, string>>({})
  const [packAvailableCounts, setPackAvailableCounts] = useState<Record<string, number>>({})
  const [now, setNow] = useState(() => Date.now())
  const shortScreen = useMediaQuery('(max-height: 720px)', { noSsr: true })

  useEffect(() => {
    if (!isRealReader || !cid || activePacks.length === 0) return

    const cooldowns: Record<string, string> = {}
    const counts: Record<string, number> = {}
    const ts = Date.now()

    const apply = (packId: string, canOpen?: boolean, availableAt?: string, availableCount?: number) => {
      if (canOpen === false) {
        if (availableAt && Date.parse(availableAt) > ts) {
          cooldowns[packId] = availableAt
        } else {
          const p = activePacks.find((ap) => ap.id === packId)
          cooldowns[packId] = new Date(ts + Math.max(1, p?.cooldownHours ?? 24) * 3_600_000).toISOString()
        }
        return
      }
      if (canOpen === true && availableCount !== undefined && availableCount > 1) {
        counts[packId] = availableCount
      }
    }

    for (const pack of activePacks) {
      if (pack.readerStatus) {
        apply(
          pack.id,
          pack.readerStatus.canOpen,
          pack.readerStatus.availableAt ?? pack.readerStatus.nextAvailableAt,
        )
      }
    }

    if (packStatuses) {
      for (const [packId, status] of Object.entries(packStatuses)) {
        if (!status) continue
        apply(packId, status.canOpen, status.nextAvailableAt, status.availableCount)
      }
    }

    const dailyPack = activePacks.find((pack) => pack.category === 'daily') ?? activePacks[0]
    if (play && dailyPack && !play.daily.canOpen) {
      apply(dailyPack.id, false, play.daily.availableAt)
    }

    const nextCooldowns = Object.fromEntries(
      Object.entries(cooldowns).filter(([, availableAt]) => Date.parse(availableAt) > ts),
    )
    setPackCooldowns(nextCooldowns)
    setPackAvailableCounts(counts)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só os campos primitivos de play: o objeto muda a cada poll e recomputaria à toa
  }, [
    isRealReader,
    cid,
    activePacks,
    packStatuses,
    play?.daily.canOpen,
    play?.daily.availableAt,
  ])

  const mainPack = useMemo(
    () => activePacks.find((pack) => pack.category === 'daily') ?? activePacks[0],
    [activePacks],
  )
  const bonusPacks = useMemo(
    () => {
      const source = isRealReader
        ? packs.filter((pack) => {
            if (pack.category === 'daily') return false
            if (pack.distribution !== 'all_with_access') {
              if (playLoading) return false
              return (play?.packOpens?.[pack.id] ?? 0) > 0
            }
            return pack.status === 'active'
          })
        : session?.preset === 'new_reader_with_bonus'
          ? packs.filter((pack) => pack.id !== mainPack?.id && pack.category !== 'daily')
          : activePacks.filter((pack) => pack.id !== mainPack?.id)
      if (isRealReader) return source
      return source.filter((pack) => !openedBonusPackIds.includes(pack.id))
    },
    [activePacks, isRealReader, mainPack?.id, openedBonusPackIds, packs, play?.packOpens, playLoading, session?.preset],
  )

  function getBonusPackCooldownMs(packId: string) {
    const availableAt = packCooldowns[packId]
    if (!availableAt) return 0
    return Math.max(0, Date.parse(availableAt) - now)
  }

  function bonusPackBlock(pack: CollectionPack): 'cooldown' | null {
    if (getBonusPackCooldownMs(pack.id) > 0) return 'cooldown'
    return null
  }

  function canOpenBonusPack(pack: CollectionPack) {
    return bonusPackBlock(pack) === null
  }

  const mainCanOpen = Boolean(play?.daily.canOpen) && (mainPack ? bonusPackBlock(mainPack) === null : true)
  const nextMainPackAt = Date.parse(play?.daily.availableAt ?? '')
  const mainCooldownMs = Math.max(1, mainPack?.cooldownHours ?? 24) * 60 * 60 * 1000
  const dailyRemainingMs = !play || play.daily.canOpen || !Number.isFinite(nextMainPackAt)
    ? 0
    : Math.max(0, nextMainPackAt - now)
  const remainingMainPackMs = mainPack
    ? (getBonusPackCooldownMs(mainPack.id) || dailyRemainingMs)
    : dailyRemainingMs
  const cooldownProgress = mainCanOpen
    ? 1
    : Math.min(1, Math.max(0, 1 - remainingMainPackMs / mainCooldownMs))
  const remainingLabel = formatRemainingTime(remainingMainPackMs)

  const anyOnCooldown = !mainCanOpen || bonusPacks.some((pack) => bonusPackBlock(pack) === 'cooldown')
  useEffect(() => {
    if (!anyOnCooldown) return
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [anyOnCooldown])

  const selectedBonusPackBlock = selectedBonusPack ? bonusPackBlock(selectedBonusPack) : null
  const selectedBonusPackCanOpen = selectedBonusPack ? (isRealReader ? canOpenBonusPack(selectedBonusPack) : true) : false
  const selectedBonusPackOpens = selectedBonusPack && isRealReader && selectedBonusPack.distribution !== 'all_with_access'
    ? (play?.packOpens?.[selectedBonusPack.id] ?? 0)
    : 0
  const selectedBonusPackAccrued = selectedBonusPack ? (packAvailableCounts[selectedBonusPack.id] ?? 0) : 0
  const selectedBonusPackCooldownMs = selectedBonusPack ? getBonusPackCooldownMs(selectedBonusPack.id) : 0

  async function handleOpenPack(pack: CollectionPack | undefined, isMain: boolean, count = 1) {
    if (!activeSession || !play || isOpeningPack || !pack) return
    if (!isRealReader && notes.length === 0) {
      toast.info('Essa coleção ainda não tem bilhetes para abrir.')
      return
    }

    if (isRealReader) {
      if (isMain && !mainPack) {
        toast.error('Nenhum pacotinho diário configurado.')
        return
      }
      setSelectedBonusPack(null)
      setStage({ pack, rewards: null })
      setStageOpen(true)
      setIsOpeningPack(true)
      try {
        let rewards: CollectionDailyReward[]
        {
          const result = await openPackMutation.mutateAsync({ packId: pack.id, count })
          await queryClient.invalidateQueries({ queryKey: ['col-play', cid] })
          await queryClient.invalidateQueries({ queryKey: ['col-pack-statuses', cid] })
          const availableAt = result.status.availableAt
            || new Date(Date.now() + Math.max(1, pack.cooldownHours ?? 24) * 3_600_000).toISOString()
          setPackCooldowns((current) => result.status.canOpen
            ? current
            : { ...current, [pack.id]: availableAt })
          if ((result.status.availableCount ?? 0) > 1) {
            setPackAvailableCounts((c) => ({ ...c, [pack.id]: result.status.availableCount! }))
          } else {
            setPackAvailableCounts((c) => { const n = { ...c }; delete n[pack.id]; return n })
          }
          rewards = result.rewards
        }
        setNow(Date.now())
        addUnread(cid, rewards.map((r) => r.id))
        achievementsPending.current = true
        setStage((current) => (current ? { ...current, rewards } : current))
      } catch (error) {
        setStageOpen(false)
        if (error instanceof ApiRequestError && ['PACK_COUNT_EXCEEDED', 'PACK_ALREADY_OPENING', 'PACK_EXHAUSTED'].includes(error.code ?? '')) {
          await queryClient.invalidateQueries({ queryKey: ['col-play', cid] })
          await queryClient.invalidateQueries({ queryKey: ['col-pack-statuses', cid] })
          setNow(Date.now())
          toast.info(error.message)
        } else if (error instanceof ApiRequestError && (error.status === 429 || error.code === 'PACK_ON_COOLDOWN')) {
          const cooldownAvailableAt = error.availableAt
            || new Date(Date.now() + Math.max(1, pack.cooldownHours ?? 24) * 3_600_000).toISOString()
          setPackCooldowns((current) => ({ ...current, [pack.id]: cooldownAvailableAt }))
          await queryClient.invalidateQueries({ queryKey: ['col-play', cid] })
          setNow(Date.now())
          toast.info(error.message ?? 'Pacotinho ainda em cooldown.')
        } else {
          await queryClient.invalidateQueries({ queryKey: queryKeys.play(cid) })
          await queryClient.invalidateQueries({ queryKey: ['col-pack-statuses', cid] })
          setNow(Date.now())
          if (error instanceof ApiRequestError && error.code === 'NETWORK_ERROR') {
            toast.error('Não deu pra confirmar a abertura', { description: 'Confere sua conexão. Se o pacotinho chegou a abrir, os bilhetes já estão no seu álbum.' })
          } else {
            toast.error((error as Error).message ?? 'Erro ao abrir pacotinho.')
          }
        }
      } finally {
        setIsOpeningPack(false)
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
    const revealedRewards = isMain
      ? simulation.commitDailyOpen(pendingRewards, pack.cooldownHours)
      : simulation.commitRewards(pendingRewards)
    setNow(Date.now())
    if (!isMain) {
      setOpenedBonusPackIds((current) => [...new Set([...current, pack.id])])
    }
    setStage({ pack, rewards: revealedRewards })
    setStageOpen(true)
  }

  function closeStage() {
    setStageOpen(false)
    if (achievementsPending.current) {
      achievementsPending.current = false
      void queryClient.invalidateQueries({ queryKey: ['reader-achievements', cid] })
    }
  }

  if (!activeSession) {
    return (
      <Box sx={{ height: '100%', background: theme.gradient }}>
        <ScrollablePage sx={{ px: 2.5, py: 2.5 }}>
          {isRealReader && !collectionsLoading ? (
            <Stack spacing={1.6} alignItems="center" justifyContent="center" sx={{ minHeight: 360, textAlign: 'center' }}>
              <SillScene emoji="🫙" />
              <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.3rem', color: theme.textOnBg }}>
                Nenhum potinho por aqui ainda
              </Typography>
              {pendingInvites.length > 0 ? (
                <Stack spacing={1.2} sx={{ width: '100%', maxWidth: 420, textAlign: 'left' }}>
                  {pendingInvites.map((invite) => (
                    <PendingInviteCard key={invite.token} invite={invite} onOpen={() => navigate(`/convite/${invite.token}`)} />
                  ))}
                </Stack>
              ) : (
                <Typography variant="lg" sx={{ color: theme.textOnBgMuted, maxWidth: 260 }}>
                  Peça para liberarem seu email em uma coleção.
                </Typography>
              )}
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
    <Box sx={{ height: '100%', position: 'relative', background: theme.gradient }}>
      <RoomGutters />
      <ScrollablePage sx={{ px: 2.5, py: 2.2 }}>
        <Box sx={{ animation: `${fadeIn} 0.35s ease`, maxWidth: 720, mx: 'auto' }}>
          <Box sx={{ mb: 1.6 }}>
            <Typography sx={{ fontFamily: font.hand, fontSize: '1.3rem', color: theme.accent, lineHeight: 1, mb: 0.4, transform: 'rotate(-1.5deg)', transformOrigin: 'left' }}>
              {isRealReader ? `pra você${user?.name ? `, ${user.name.split(' ')[0]}` : ''}` : 'prévia do leitor'}
            </Typography>
            <Typography component="h1" sx={{ fontFamily: font.serif, fontWeight: 500, fontSize: '1.9rem', letterSpacing: '-0.02em', color: theme.textOnBg, lineHeight: 1.05, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeSession.collectionName}
            </Typography>
          </Box>

          {isRealReader && readerCollections.length > 1 && (
            <Box role="tablist" aria-label="Seus potinhos" sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 2.2, rowGap: 0.6, mb: 1.8, borderBottom: `1px solid ${theme.surfaceBorder}` }}>
              {readerCollections.map((c) => {
                const active = c.id === readerCollection?.id
                const hasNews = unreadNewsCids.has(c.id)
                const hasPack = c.dailyCanOpen || (c.pendingBonusOpens ?? 0) > 0
                return (
                  <Box key={c.id} role="tab" aria-selected={active} onClick={() => setActiveCollectionId(c.id)} sx={{
                    pb: 0.8, mb: '-1px', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', gap: 0.6,
                    borderBottom: `2px solid ${active ? theme.textOnBg : 'transparent'}`,
                    color: active ? theme.textOnBg : theme.textOnBgMuted,
                    transition: 'color 0.15s, border-color 0.15s',
                    '&:hover': { color: theme.textOnBg },
                  }}>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: active ? 600 : 500, color: 'inherit', maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.emoji} {c.name}
                    </Typography>
                    {(hasNews || hasPack) && (
                      <Box aria-label={hasPack ? 'pacotinho disponível' : 'novidades'} sx={{ width: 7, height: 7, borderRadius: '50%', background: colors.rose.main, flexShrink: 0 }} />
                    )}
                  </Box>
                )
              })}
            </Box>
          )}

          <Stack direction="row" sx={{ mb: 1.6, display: shortScreen ? 'none' : 'flex', borderTop: `1px solid ${theme.surfaceBorder}`, borderBottom: `1px solid ${theme.surfaceBorder}` }}>
            {[
              { value: play.owned, label: 'coletados', to: `/colecoes/${activeSession.collectionSlug}` },
              { value: favCount, label: favCount === 1 ? 'favorito' : 'favoritos', to: '/favoritas' },
              { value: achievementsUnlocked, label: achievementsUnlocked === 1 ? 'conquista' : 'conquistas', to: '/conquistas' },
            ].map((stat, i) => (
              <Box key={stat.to} role="link" onClick={() => navigate(stat.to)} sx={{
                flex: 1, py: 1.2, px: 1, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.4, minHeight: 64,
                borderLeft: i === 0 ? 'none' : `1px solid ${theme.surfaceBorder}`,
                '&:hover .pd-stat-label': { textDecoration: 'underline', textUnderlineOffset: 3 },
              }}>
                <Typography sx={{ fontFamily: font.serif, fontWeight: 500, fontSize: '1.7rem', color: theme.textOnBg, lineHeight: 1 }}>
                  {stat.value}
                </Typography>
                <Typography className="pd-stat-label" sx={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: theme.textOnBgMuted }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Stack spacing={1.15} sx={{ minHeight: shortScreen ? undefined : 'calc(100dvh - 214px)' }}>
            <Card sx={{ p: 1.4 }}>
              <Stack spacing={0.65}>
                {isLoading ? (
                  <LoadingState compact label="Carregando coleção" accent={theme.accent} />
                ) : (
                  <>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontFamily: font.serif, fontWeight: 600, fontSize: '1rem', color: colors.text.primary }}>
                        Álbum
                      </Typography>
                      <Typography sx={{ fontFamily: font.serif, fontWeight: 500, fontSize: '1.05rem', color: colors.text.secondary }}>
                        {completion}%
                      </Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={completion} sx={{
                      height: 8,
                      borderRadius: radius.sm,
                      bgcolor: colors.fill.medium,
                      '& .MuiLinearProgress-bar': { borderRadius: radius.sm, background: theme.accent },
                    }} />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="sm" sx={{ color: colors.text.secondary }}>
                        {play.owned} de {play.total} bilhetes coletados
                      </Typography>
                      <Typography
                        variant="sm"
                        onClick={() => navigate(`/colecoes/${activeSession.collectionSlug}`)}
                        sx={{ fontWeight: 600, color: colors.text.primary, cursor: 'pointer', flexShrink: 0, textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: colors.border.medium, '&:hover': { textDecorationColor: colors.text.primary } }}
                      >
                        ver álbum →
                      </Typography>
                    </Stack>
                  </>
                )}
              </Stack>
            </Card>

            {relerNote && ownedItems.length > 0 && (
              <Card sx={{ p: 1.4 }}>
                <Stack direction="row" alignItems="center" spacing={1.1}>
                  <Box sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setSelectedNote(relerNote)}>
                    <Typography sx={{ fontFamily: font.hand, fontSize: '1.15rem', color: theme.accent, lineHeight: 1 }}>
                      pra reler agora
                    </Typography>
                    <Typography sx={{ fontFamily: font.serif, fontWeight: 500, fontSize: '1.15rem', color: colors.text.primary, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {relerNote.title}
                    </Typography>
                  </Box>
                  {ownedItems.length > 1 && (
                    <Box
                      onClick={(e) => { e.stopPropagation(); setRelerIndex((i) => (i + 1 + Math.floor(Math.random() * (ownedItems.length - 1))) % ownedItems.length) }}
                      sx={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.text.muted, transition: 'all 0.16s', '&:hover': { color: theme.accent, bgcolor: `${theme.accent}12` }, '&:active': { transform: 'rotate(180deg)' } }}
                    >
                      <ShuffleIcon sx={{ fontSize: 16 }} />
                    </Box>
                  )}
                  <Box onClick={() => setSelectedNote(relerNote)} sx={{ cursor: 'pointer', flexShrink: 0 }}>
                    <Typography sx={{ fontSize: '1.1rem', color: colors.text.muted }}>›</Typography>
                  </Box>
                </Stack>
              </Card>
            )}

            <MainPackButton
              pack={mainPack}
              collectionEmoji={activeSession.collectionEmoji}
              mainCanOpen={mainCanOpen}
              remainingLabel={remainingLabel}
              cooldownProgress={cooldownProgress}
              isLoading={isLoading}
              isOpeningPack={isOpeningPack}
              onOpen={() => void handleOpenPack(mainPack, true)}
              onOpenAll={() => void handleOpenPack(mainPack, true, packAvailableCounts[mainPack?.id ?? ''] ?? 1)}
              isRealReader={isRealReader}
              onResetCooldown={() => {
                simulation.resetDailyCooldown()
                setNow(Date.now())
                toast.info('Cooldown resetado na prévia.')
              }}
              accentMuted={theme.textOnBgMuted}
              accruedCount={mainPack ? (packAvailableCounts[mainPack.id] ?? 0) : 0}
              compact={shortScreen}
            />
            {shortScreen && bonusPacks.length > 0 && (
              <BonusPackRow
                inline
                bonusPacks={bonusPacks}
                isRealReader={isRealReader}
                packOpens={play.packOpens}
                packAvailableCounts={packAvailableCounts}
                getCooldownMs={getBonusPackCooldownMs}
                onSelect={setSelectedBonusPack}
              />
            )}
          </Stack>
        </Box>
      </ScrollablePage>

      {!shortScreen && bonusPacks.length > 0 && (
        <BonusPackRow
          bonusPacks={bonusPacks}
          isRealReader={isRealReader}
          packOpens={play.packOpens}
          packAvailableCounts={packAvailableCounts}
          getCooldownMs={getBonusPackCooldownMs}
          onSelect={setSelectedBonusPack}
        />
      )}

      <PackOpeningStage
        open={stageOpen}
        pack={stage ? { ...stage.pack, emoji: stage.pack.emoji || activeSession.collectionEmoji, accent: stage.pack.accent || theme.accent } : null}
        rewards={stage?.rewards ?? null}
        rarities={rarities}
        types={types}
        onClose={closeStage}
        onViewCollection={() => { closeStage(); navigate(`/colecoes/${activeSession.collectionSlug}`) }}
        onOpenReward={(reward) => {
          simulation.markNoteViewed(reward.id)
          setSelectedNote(reward)
        }}
      />

      <OpenBonusDialog
        pack={selectedBonusPack}
        isRealReader={isRealReader}
        canOpen={selectedBonusPackCanOpen}
        block={selectedBonusPackBlock}
        opens={selectedBonusPackOpens}
        accrued={selectedBonusPackAccrued}
        cooldownMs={selectedBonusPackCooldownMs}
        isOpeningPack={isOpeningPack}
        accent={theme.accent}
        onClose={() => setSelectedBonusPack(null)}
        onOpen={(count) => void handleOpenPack(selectedBonusPack ?? undefined, false, count)}
      />

      <NoteDetailDialog note={selectedNote} rarities={rarities} types={types} onClose={() => setSelectedNote(null)} />
    </Box>
  )
}
