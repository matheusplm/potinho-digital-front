import FavoriteIcon from '@mui/icons-material/Favorite'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import { Box, LinearProgress, Stack, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, LoadingState, ScrollablePage, toast } from '../components/ui'
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
  useOpenCollectionPackMutation,
  usePendingInvitesQuery,
  useReaderAchievementsQuery,
} from '../hooks/useNotes'
import { colors, fadeIn, font, radius } from '../design-system'
import { isCollectionReader } from '../utils/collectionAccess'
import { ApiRequestError } from '../services/api'
import { simulatePackOpen } from '../utils/simulationPlay'
import { formatRemainingTime } from '../utils/packCooldowns'
import { computeAchievements } from '../utils/achievements'
import { NoteDetailDialog, type ReadableNote } from '../components/collection/NoteDetailDialog'
import { PACK_OPEN_ANIMATION_MS, PackOpeningDialog, wait } from '../components/collection/PackOpeningDialog'
import type { CollectionDailyReward, CollectionPack } from '../types/note'
import { slugify } from '../utils/slug'
import { MainPackButton } from './home/MainPackButton'
import { BonusPackRow } from './home/BonusPackRow'
import { RewardHighlightDialog } from './home/RewardHighlightDialog'
import { BonusPackDialog } from './home/BonusPackDialog'

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

  const activeSession = session ?? (readerCollection ? {
    collectionId: readerCollection.id,
    collectionSlug: slugify(readerCollection.name),
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
      localStorage.getItem('potinho-notif') === 'true'
    ) {
      new Notification('Potinho Digital 🎁', { body: 'Existem pacotes disponíveis para você!' })
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
  const [rewards, setRewards] = useState<CollectionDailyReward[]>([])
  const [highlightOpen, setHighlightOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<ReadableNote | null>(null)
  const [openingPack, setOpeningPack] = useState<CollectionPack | null>(null)
  const [selectedBonusPack, setSelectedBonusPack] = useState<CollectionPack | null>(null)
  const [openedBonusPackIds, setOpenedBonusPackIds] = useState<string[]>([])
  const [packCooldowns, setPackCooldowns] = useState<Record<string, string>>({})
  const [packAvailableCounts, setPackAvailableCounts] = useState<Record<string, number>>({})
  const [now, setNow] = useState(() => Date.now())

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
      setSelectedBonusPack(null)
      setOpeningPack(pack)
      setIsOpeningPack(true)
      const startedAt = Date.now()
      try {
        if (isMain && !mainPack) {
          toast.error('Nenhum pacotinho diário configurado.')
          return
        }
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
        await wait(Math.max(0, PACK_OPEN_ANIMATION_MS - (Date.now() - startedAt)))
        await queryClient.invalidateQueries({ queryKey: ['reader-achievements', cid] })
        setNow(Date.now())
        setRewards(rewards)
        addUnread(cid, rewards.map((r) => r.id))
        setHighlightOpen(true)
        const newCount = rewards.filter((r) => r.isNew).length
        toast.love(`${rewards.length} bilhete${rewards.length !== 1 ? 's' : ''}!`, {
          description: newCount > 0 ? `${newCount} novo${newCount !== 1 ? 's' : ''} na coleção ✨` : `${pack.name} aberto!`,
        })
      } catch (error) {
        if (error instanceof ApiRequestError && error.code === 'PACK_COUNT_EXCEEDED') {
          await queryClient.invalidateQueries({ queryKey: ['col-play', cid] })
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
          toast.error((error as Error).message ?? 'Erro ao abrir pacotinho.')
        }
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

  if (!activeSession) {
    return (
      <Box sx={{ height: '100%', background: theme.gradient }}>
        <ScrollablePage sx={{ px: 2.5, py: 2.5 }}>
          {isRealReader && !collectionsLoading ? (
            <Stack spacing={1.6} alignItems="center" justifyContent="center" sx={{ minHeight: 360, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '2.6rem', lineHeight: 1 }}>🫙</Typography>
              <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.3rem', color: theme.textOnBg }}>
                Nenhum potinho por aqui ainda
              </Typography>
              {pendingInvites.length > 0 ? (
                <Stack spacing={0.9} sx={{ width: '100%', maxWidth: 340 }}>
                  {pendingInvites.map((invite) => (
                    <Card key={invite.token} onClick={() => navigate(`/convite/${invite.token}`)} sx={{ p: 1.6, cursor: 'pointer', textAlign: 'left', transition: 'transform 0.16s', '&:hover': { transform: 'translateY(-2px)' } }}>
                      <Stack direction="row" alignItems="center" spacing={1.2}>
                        <Box sx={{ width: 40, height: 40, borderRadius: radius.lg, flexShrink: 0, background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <MailOutlineIcon sx={{ fontSize: 20, color: '#fff' }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Convite esperando você
                          </Typography>
                          <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '0.95rem', color: colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {invite.collectionName || 'Coleção'}
                          </Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: colors.text.secondary }}>
                            {invite.inviterName ? `de ${invite.inviterName}` : 'toque para abrir'}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '1rem', color: '#1d4ed8', fontWeight: 900, flexShrink: 0 }}>→</Typography>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Typography sx={{ fontSize: '0.85rem', color: theme.textOnBgMuted, maxWidth: 260 }}>
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
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <FavoriteIcon sx={{ position: 'absolute', bottom: -80, right: -80, fontSize: 480, color: 'rgba(225,29,72,0.05)' }} />
      </Box>

      <ScrollablePage sx={{ px: 2.5, py: 2.2 }}>
        <Box sx={{ animation: `${fadeIn} 0.35s ease` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.35 }}>
            <Stack spacing={0.35} sx={{ flex: 1, minWidth: 0, mr: 1 }}>
              <Typography sx={{ fontSize: '0.78rem', color: theme.textOnBgMuted, fontWeight: 700 }}>
                {isRealReader ? 'Para você' : 'Prévia do leitor'}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: '1.7rem', lineHeight: 1, flexShrink: 0, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.16))' }}>
                  {activeSession.collectionEmoji}
                </Typography>
                <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.55rem', color: theme.textOnBg, lineHeight: 1.05, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activeSession.collectionName}
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: '0.82rem', color: theme.textOnBgMuted, fontStyle: 'italic' }}>
                seu potinho chegou 💌
              </Typography>
            </Stack>
          </Stack>

          {isRealReader && readerCollections.length > 1 && (
            <Stack direction="row" spacing={0.6} sx={{ mb: 1.35, flexWrap: 'wrap', rowGap: 0.6 }}>
              {readerCollections.map((c) => {
                const active = c.id === readerCollection?.id
                return (
                  <Box key={c.id} onClick={() => setActiveCollectionId(c.id)} sx={{
                    px: 1.1, py: 0.45, borderRadius: radius.full, cursor: 'pointer',
                    background: active ? theme.accent : 'rgba(255,255,255,0.5)',
                    border: `1.5px solid ${active ? theme.accent : 'rgba(255,255,255,0.6)'}`,
                    backdropFilter: 'blur(10px)', transition: 'all 0.16s',
                    '&:hover': active ? {} : { background: 'rgba(255,255,255,0.72)' },
                  }}>
                    <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: active ? '#fff' : colors.text.secondary, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.emoji} {c.name}
                    </Typography>
                  </Box>
                )
              })}
            </Stack>
          )}

          {isRealReader && pendingInvites.length > 0 && (
            <Card onClick={() => navigate(`/convite/${pendingInvites[0].token}`)} sx={{ p: 1.15, mb: 1.35, cursor: 'pointer', border: '1.5px solid #dbeafe', background: 'linear-gradient(135deg,#eff6ff,#fce7f3)', transition: 'transform 0.16s', '&:hover': { transform: 'translateY(-1px)' } }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <MailOutlineIcon sx={{ fontSize: 18, color: '#1d4ed8', flexShrink: 0 }} />
                <Typography sx={{ flex: 1, minWidth: 0, fontSize: '0.78rem', fontWeight: 700, color: colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Convite pendente: {pendingInvites[0].collectionName || 'Coleção'}
                </Typography>
                <Typography sx={{ fontSize: '0.9rem', color: '#1d4ed8', fontWeight: 900, flexShrink: 0 }}>→</Typography>
              </Stack>
            </Card>
          )}

          <Stack direction="row" spacing={0.8} sx={{ mb: 1.35 }}>
            {[
              { emoji: '🎴', value: play.owned, label: 'coletados', to: `/colecoes/${activeSession.collectionSlug}` },
              { emoji: '❤️', value: favCount, label: 'favoritas', to: '/favoritas' },
              { emoji: '🏅', value: achievementsUnlocked, label: 'conquistas', to: '/conquistas' },
            ].map((s) => (
              <Box key={s.label} onClick={() => navigate(s.to)} sx={{
                flex: 1, px: 1, py: 0.85, borderRadius: radius.lg, textAlign: 'center', cursor: 'pointer',
                background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)',
                transition: 'transform 0.16s ease, background 0.16s ease',
                '&:hover': { transform: 'translateY(-1px)', background: 'rgba(255,255,255,0.68)' },
              }}>
                <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>{s.emoji}</Typography>
                <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.05rem', color: colors.text.primary, lineHeight: 1.2, mt: 0.25 }}>
                  {s.value}
                </Typography>
                <Typography sx={{ fontSize: '0.70rem', fontWeight: 700, color: colors.text.secondary }}>
                  {s.label}
                </Typography>
              </Box>
            ))}
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
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontSize: '0.72rem', color: colors.text.secondary }}>
                        {play.owned} de {play.total} bilhetes coletados
                      </Typography>
                      <Typography
                        onClick={() => navigate(`/colecoes/${activeSession.collectionSlug}`)}
                        sx={{ fontSize: '0.72rem', fontWeight: 800, color: theme.accent, cursor: 'pointer', flexShrink: 0, '&:hover': { textDecoration: 'underline' } }}
                      >
                        ver álbum →
                      </Typography>
                    </Stack>
                  </>
                )}
              </Stack>
            </Card>

            {relerNote && ownedItems.length > 0 && (
              <Card sx={{ p: 1.15, background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)' }}>
                <Stack direction="row" alignItems="center" spacing={1.1}>
                  <Box sx={{ width: 38, height: 38, borderRadius: radius.lg, flexShrink: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${theme.accent}16`, border: `1px solid ${theme.accent}26` }}>
                    💭
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setSelectedNote(relerNote)}>
                    <Typography sx={{ fontSize: '0.70rem', fontWeight: 900, letterSpacing: 0.6, color: theme.accent, textTransform: 'uppercase' }}>
                      Pra reler agora
                    </Typography>
                    <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '0.92rem', color: colors.text.primary, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
              isRealReader={isRealReader}
              onResetCooldown={() => {
                simulation.resetDailyCooldown()
                setNow(Date.now())
                toast.info('Cooldown resetado na prévia.')
              }}
              accent={theme.accent}
              accentMuted={theme.textOnBgMuted}
            />
          </Stack>
        </Box>
      </ScrollablePage>

      {bonusPacks.length > 0 && (
        <BonusPackRow
          bonusPacks={bonusPacks}
          isRealReader={isRealReader}
          packOpens={play.packOpens}
          packAvailableCounts={packAvailableCounts}
          getCooldownMs={getBonusPackCooldownMs}
          onSelect={setSelectedBonusPack}
        />
      )}

      <PackOpeningDialog open={isOpeningPack} emoji={openingPack?.emoji ?? activeSession.collectionEmoji} accent={openingPack?.accent ?? theme.accent} />

      <RewardHighlightDialog
        open={highlightOpen}
        rewards={rewards}
        rarities={rarities}
        types={types}
        collectionSlug={activeSession.collectionSlug}
        accent={theme.accent}
        onClose={() => setHighlightOpen(false)}
        onRewardClick={(reward) => {
          simulation.markNoteViewed(reward.id)
          setSelectedNote(reward)
        }}
      />

      <BonusPackDialog
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
