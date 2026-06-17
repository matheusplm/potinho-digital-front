import FavoriteIcon from '@mui/icons-material/Favorite'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import LockRoundedIcon from '@mui/icons-material/LockRounded'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, LoadingState, ScrollablePage, toast } from '../components/ui'
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
  useReaderAchievementsQuery,
} from '../hooks/useNotes'
import { colors, font, radius } from '../design-system'
import { isCollectionReader } from '../utils/collectionAccess'
import { ApiRequestError } from '../services/api'
import { simulatePackOpen } from '../utils/simulationPlay'

const PACK_COOLDOWN_KEY = 'potinho-pack-cooldowns'

function readPackCooldownStore(): Record<string, Record<string, string>> {
  try {
    return JSON.parse(localStorage.getItem(PACK_COOLDOWN_KEY) ?? '{}') as Record<string, Record<string, string>>
  } catch {
    return {}
  }
}

function loadPackCooldowns(cid: string): Record<string, string> {
  if (!cid) return {}
  const stored = readPackCooldownStore()[cid] ?? {}
  const now = Date.now()
  return Object.fromEntries(
    Object.entries(stored).filter(([, availableAt]) => Date.parse(availableAt) > now),
  )
}

function savePackCooldowns(cid: string, cooldowns: Record<string, string>) {
  if (!cid) return
  const store = readPackCooldownStore()
  const now = Date.now()
  const active = Object.fromEntries(
    Object.entries(cooldowns).filter(([, availableAt]) => Date.parse(availableAt) > now),
  )
  if (Object.keys(active).length > 0) store[cid] = active
  else delete store[cid]
  try {
    localStorage.setItem(PACK_COOLDOWN_KEY, JSON.stringify(store))
  } catch {
    void 0
  }
}

const PACK_EXHAUSTED_KEY = 'potinho-pack-exhausted'

function readExhaustedStore(): Record<string, string[]> {
  try {
    return JSON.parse(localStorage.getItem(PACK_EXHAUSTED_KEY) ?? '{}') as Record<string, string[]>
  } catch {
    return {}
  }
}

function loadExhaustedPacks(cid: string): string[] {
  if (!cid) return []
  return readExhaustedStore()[cid] ?? []
}

function saveExhaustedPacks(cid: string, ids: string[]) {
  if (!cid) return
  const store = readExhaustedStore()
  if (ids.length > 0) store[cid] = [...new Set(ids)]
  else delete store[cid]
  try {
    localStorage.setItem(PACK_EXHAUSTED_KEY, JSON.stringify(store))
  } catch {
    void 0
  }
}

const PACK_STATUS_ENDPOINT_KEY = 'potinho-pack-status-missing'

function loadPackStatusEndpointMissing(cid: string): boolean {
  if (!cid) return false
  try {
    const store = JSON.parse(localStorage.getItem(PACK_STATUS_ENDPOINT_KEY) ?? '{}') as Record<string, boolean>
    return store[cid] === true
  } catch {
    return false
  }
}

function savePackStatusEndpointMissing(cid: string) {
  if (!cid) return
  try {
    const store = JSON.parse(localStorage.getItem(PACK_STATUS_ENDPOINT_KEY) ?? '{}') as Record<string, boolean>
    store[cid] = true
    localStorage.setItem(PACK_STATUS_ENDPOINT_KEY, JSON.stringify(store))
  } catch {
    void 0
  }
}

import { computeAchievements } from '../utils/achievements'
import { NoteDetailDialog, PACK_OPEN_ANIMATION_MS, PackOpeningDialog, RewardCard, type ReadableNote, wait } from './CollectionPlayPage'
import type { CollectionDailyReward, CollectionPack } from '../types/note'
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

function formatCooldownBadge(ms: number) {
  if (ms <= 0) return 'já'
  const totalMinutes = Math.ceil(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours >= 1) return `${hours}h`
  return `${minutes}m`
}

export function SimulatedReaderHomePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { theme } = useBackground()
  const { user, persona } = useUser()
  const simulation = useSimulation()
  const { session } = simulation
  const { activeCollectionId, setActiveCollectionId, addUnread } = useReader()
  const { data: collections = [], isLoading: collectionsLoading } = useCollectionsQuery()
  const isRealReader = !simulation.isActive && persona === 'reader'
  const readerCollections = useMemo(
    () => isRealReader ? collections.filter((c) => isCollectionReader(c, user?.id)) : [],
    [collections, isRealReader],
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

  const activeSession = session ?? (readerCollection ? {
    collectionId: readerCollection.id,
    collectionSlug: slugify(readerCollection.name),
    collectionName: readerCollection.name,
    collectionEmoji: readerCollection.emoji,
    preset: 'new_reader' as const,
  } : null)
  const cid = activeSession?.collectionId ?? ''

  useEffect(() => {
    setPackCooldowns(isRealReader ? loadPackCooldowns(cid) : {})
    setExhaustedPackIds(isRealReader ? loadExhaustedPacks(cid) : [])
    setOpenedBonusPackIds([])
    setPackStatusEndpointMissing(isRealReader ? loadPackStatusEndpointMissing(cid) : false)
  }, [cid, isRealReader])

  const { data: notes = [], isLoading: notesLoading } = useCollectionNotesQuery(cid, { enabled: !!session })
  const { data: playFromApi, isLoading: playLoading } = useCollectionPlayQuery(cid, { enabled: isRealReader && !!cid })
  const { data: rarities = [] } = useCollectionRaritiesQuery(cid)
  const { data: types = [] } = useCollectionTypesQuery(cid)
  const { data: packs = [] } = useCollectionPacksQuery(cid)
  const activePacks = useMemo(() => packs.filter((pack) => pack.status === 'active'), [packs])
  const activePackIds = useMemo(() => activePacks.map((pack) => pack.id), [activePacks])
  const packsEmbedStatus = useMemo(() => packs.some((pack) => pack.readerStatus != null), [packs])
  const [packStatusEndpointMissing, setPackStatusEndpointMissing] = useState(
    () => (cid ? loadPackStatusEndpointMissing(cid) : false),
  )
  const { data: packStatuses } = useCollectionPackStatusesQuery(
    cid,
    activePackIds,
    isRealReader && !!cid && !packsEmbedStatus && !packStatusEndpointMissing,
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
  }, [playFromApi?.daily.canOpen])

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
  const [confirmOpenAll, setConfirmOpenAll] = useState(false)
  const [openedBonusPackIds, setOpenedBonusPackIds] = useState<string[]>([])
  const [packCooldowns, setPackCooldowns] = useState<Record<string, string>>(
    () => (cid ? loadPackCooldowns(cid) : {}),
  )
  const [exhaustedPackIds, setExhaustedPackIds] = useState<string[]>(
    () => (cid ? loadExhaustedPacks(cid) : []),
  )
  const [packAvailableCounts, setPackAvailableCounts] = useState<Record<string, number>>({})
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!isRealReader || !cid || activePacks.length === 0) return

    const cooldowns: Record<string, string> = { ...loadPackCooldowns(cid) }
    const exhausted = new Set(loadExhaustedPacks(cid))
    const counts: Record<string, number> = {}
    const ts = Date.now()

    const apply = (packId: string, canOpen?: boolean, availableAt?: string, isExhausted?: boolean, availableCount?: number) => {
      if (isExhausted) {
        exhausted.add(packId)
        delete cooldowns[packId]
        return
      }
      if (canOpen === false) {
        if (availableAt && Date.parse(availableAt) > ts) {
          cooldowns[packId] = availableAt
        } else {
          const p = activePacks.find((ap) => ap.id === packId)
          cooldowns[packId] = new Date(ts + Math.max(1, p?.cooldownHours ?? 24) * 3_600_000).toISOString()
        }
        return
      }
      if (canOpen === true) {
        if (!cooldowns[packId]) {
          exhausted.delete(packId)
        }
        if (availableCount !== undefined && availableCount > 1) counts[packId] = availableCount
      }
    }

    for (const pack of activePacks) {
      if (pack.readerStatus) {
        apply(
          pack.id,
          pack.readerStatus.canOpen,
          pack.readerStatus.availableAt ?? pack.readerStatus.nextAvailableAt,
          pack.readerStatus.exhausted,
        )
      }
    }

    if (packStatuses) {
      for (const [packId, status] of Object.entries(packStatuses)) {
        if (!status) continue
        apply(packId, status.canOpen, status.nextAvailableAt, status.exhausted, status.availableCount)
      }
    }

    const dailyPack = activePacks.find((pack) => pack.category === 'daily') ?? activePacks[0]
    if (play && dailyPack && !play.daily.canOpen) {
      apply(dailyPack.id, false, play.daily.availableAt)
    }

    const nextCooldowns = Object.fromEntries(
      Object.entries(cooldowns).filter(([, availableAt]) => Date.parse(availableAt) > ts),
    )
    const nextExhausted = [...exhausted]
    setPackCooldowns(nextCooldowns)
    setExhaustedPackIds(nextExhausted)
    setPackAvailableCounts(counts)
    savePackCooldowns(cid, nextCooldowns)
    saveExhaustedPacks(cid, nextExhausted)
  }, [
    isRealReader,
    cid,
    activePacks,
    packStatuses,
    play?.daily.canOpen,
    play?.daily.availableAt,
  ])

  useEffect(() => {
    if (packStatuses && Object.values(packStatuses).every((s) => s === null)) {
      setPackStatusEndpointMissing(true)
      savePackStatusEndpointMissing(cid)
    }
  }, [cid, packStatuses])

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

  function isPackExhausted(packId: string) {
    return exhaustedPackIds.includes(packId)
  }

  function bonusPackBlock(pack: CollectionPack): 'exhausted' | 'cooldown' | null {
    if (pack.distribution !== 'all_with_access') {
      const opens = play?.packOpens?.[pack.id] ?? 0
      if (opens <= 0) return 'exhausted'
      if (getBonusPackCooldownMs(pack.id) > 0) return 'cooldown'
      return null
    }
    if (isPackExhausted(pack.id)) return 'exhausted'
    if (getBonusPackCooldownMs(pack.id) > 0) return 'cooldown'
    return null
  }

  function canOpenBonusPack(pack: CollectionPack) {
    return bonusPackBlock(pack) === null
  }

  const mainCanOpen = Boolean(play?.daily.canOpen) && (mainPack ? bonusPackBlock(mainPack) === null : true)

  function markPackExhausted(packId: string) {
    setExhaustedPackIds((current) => {
      if (current.includes(packId)) return current
      const next = [...current, packId]
      saveExhaustedPacks(cid, next)
      return next
    })
  }
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

  useEffect(() => {
    const mainOnCooldown = !mainCanOpen
    const bonusOnCooldown = bonusPacks.some((pack) => bonusPackBlock(pack) === 'cooldown')
    if (!mainOnCooldown && !bonusOnCooldown) return
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [mainCanOpen, bonusPacks, packCooldowns, exhaustedPackIds])

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
        let rewards: CollectionDailyReward[]
        if (isMain) {
          if (!mainPack) {
            toast.error('Nenhum pacotinho diário configurado.')
            return
          }
          const result = await openPackMutation.mutateAsync({ packId: mainPack.id, count })
          await queryClient.invalidateQueries({ queryKey: ['col-play', cid] })
          const mainAvailableAt = result.status.availableAt
            || new Date(Date.now() + Math.max(1, mainPack.cooldownHours ?? 24) * 3_600_000).toISOString()
          setPackCooldowns((current) => {
            const next = result.status.canOpen
              ? current
              : { ...current, [mainPack.id]: mainAvailableAt }
            savePackCooldowns(cid, next)
            return next
          })
          if ((result.status.availableCount ?? 0) > 1) {
            setPackAvailableCounts((c) => ({ ...c, [mainPack.id]: result.status.availableCount! }))
          } else {
            setPackAvailableCounts((c) => { const n = { ...c }; delete n[mainPack.id]; return n })
          }
          rewards = result.rewards
        } else {
          const result = await openPackMutation.mutateAsync({ packId: pack.id, count })
          await queryClient.invalidateQueries({ queryKey: ['col-play', cid] })
          const bonusAvailableAt = result.status.availableAt
            || new Date(Date.now() + Math.max(1, pack.cooldownHours ?? 24) * 3_600_000).toISOString()
          setPackCooldowns((current) => {
            const next = result.status.canOpen
              ? current
              : { ...current, [pack.id]: bonusAvailableAt }
            savePackCooldowns(cid, next)
            return next
          })
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
        if (error instanceof ApiRequestError && (error.code === 'PACK_LIMIT_REACHED' || error.code === 'PACK_COUNT_EXCEEDED')) {
          if (!isMain) markPackExhausted(pack.id)
          await queryClient.invalidateQueries({ queryKey: ['col-play', cid] })
          setNow(Date.now())
          toast.info(error.message)
        } else if (error instanceof ApiRequestError && (error.status === 429 || error.code === 'PACK_ON_COOLDOWN')) {
          const cooldownAvailableAt = error.availableAt
            || new Date(Date.now() + Math.max(1, pack.cooldownHours ?? 24) * 3_600_000).toISOString()
          setPackCooldowns((current) => {
            const next = { ...current, [pack.id]: cooldownAvailableAt }
            savePackCooldowns(cid, next)
            return next
          })
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
            <Stack spacing={1.2} alignItems="center" justifyContent="center" sx={{ minHeight: 360, textAlign: 'center' }}>
              <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.3rem', color: theme.textOnBg }}>
                Nenhum potinho por aqui ainda
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: theme.textOnBgMuted, maxWidth: 260 }}>
                Peça para liberarem seu email em uma coleção.
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
          <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '1.7rem', lineHeight: 1, flexShrink: 0, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.16))' }}>
              {activeSession.collectionEmoji}
            </Typography>
            <Typography sx={{
              fontFamily: font.serif, fontWeight: 850, fontSize: '1.55rem', color: theme.textOnBg, lineHeight: 1.05,
              minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {activeSession.collectionName}
            </Typography>
          </Stack>
          <Typography sx={{ fontSize: '0.82rem', color: theme.textOnBgMuted, fontStyle: 'italic' }}>
            seu potinho chegou 💌
          </Typography>
        </Stack>

        <Stack direction="row" spacing={0.8} sx={{ mb: 1.35 }}>
          {[
            { emoji: '🎴', value: play.owned, label: 'coletados' },
            { emoji: '❤️', value: favCount, label: 'favoritas' },
            { emoji: '🏅', value: achievementsUnlocked, label: 'conquistas' },
          ].map((s) => (
            <Box key={s.label} sx={{
              flex: 1, px: 1, py: 0.85, borderRadius: radius.lg, textAlign: 'center',
              background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)',
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
                  <Typography sx={{ fontSize: '0.72rem', color: colors.text.secondary }}>
                    {play.owned} de {play.total} bilhetes coletados
                  </Typography>
                </>
              )}
            </Stack>
          </Card>

          {relerNote && ownedItems.length > 0 && (
            <Card
              sx={{ p: 1.15, background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)' }}
            >
              <Stack direction="row" alignItems="center" spacing={1.1}>
                <Box sx={{
                  width: 38, height: 38, borderRadius: radius.lg, flexShrink: 0, fontSize: '1.15rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${theme.accent}16`, border: `1px solid ${theme.accent}26`,
                }}>
                  💭
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setSelectedNote(relerNote)}>
                  <Typography sx={{ fontSize: '0.70rem', fontWeight: 900, letterSpacing: 0.6, color: theme.accent, textTransform: 'uppercase' }}>
                    Pra reler agora
                  </Typography>
                  <Typography sx={{
                    fontFamily: font.serif, fontWeight: 800, fontSize: '0.92rem', color: colors.text.primary, lineHeight: 1.25,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {relerNote.title}
                  </Typography>
                </Box>
                {ownedItems.length > 1 && (
                  <Box
                    onClick={(e) => { e.stopPropagation(); setRelerIndex((i) => (i + 1 + Math.floor(Math.random() * (ownedItems.length - 1))) % ownedItems.length) }}
                    sx={{
                      width: 30, height: 30, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: colors.text.muted, transition: 'all 0.16s',
                      '&:hover': { color: theme.accent, bgcolor: `${theme.accent}12` },
                      '&:active': { transform: 'rotate(180deg)' },
                    }}
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
              tabIndex={mainCanOpen ? 0 : -1}
              onClick={!isLoading && mainCanOpen && !isOpeningPack ? () => handleOpenPack(mainPack, true) : undefined}
              onKeyDown={(event) => {
                if (!isLoading && mainCanOpen && !isOpeningPack && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault()
                  void handleOpenPack(mainPack, true)
                }
              }}
              onMouseDown={(event) => event.preventDefault()}
              sx={{
                width: mainCanOpen ? 214 : 196,
                height: mainCanOpen ? 194 : 184,
                borderRadius: radius.full,
                cursor: mainCanOpen ? 'pointer' : 'default',
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
                animation: mainCanOpen ? `${packCtaFloat} 3.2s ease-in-out infinite` : undefined,
                '&:hover': mainCanOpen ? {
                  transform: 'translateY(-3px) scale(1.025)',
                } : {},
                '&:active': mainCanOpen ? { transform: 'scale(0.98)' } : {},
              }}
            >
              {mainCanOpen ? (
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
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, color: theme.textOnBgMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                      restante
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Box>
            {mainCanOpen && (
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
                <Typography sx={{ color: colors.text.primary, fontFamily: font.serif, fontSize: '1rem', fontWeight: 850, lineHeight: 1.1 }}>
                  Pacotinho disponível
                </Typography>
                <Typography sx={{ color: colors.text.secondary, fontSize: '0.72rem', fontWeight: 750, lineHeight: 1.2 }}>
                  toque no coração
                </Typography>
              </Stack>
            )}
            {!mainCanOpen && (
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
                  color: colors.text.primary,
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
                <Typography sx={{ fontSize: '0.78rem', color: colors.text.secondary, textAlign: 'center', maxWidth: 280, lineHeight: 1.45 }}>
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
                      color: colors.text.primary,
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
          {bonusPacks.slice(0, 5).map((pack) => {
            const block = isRealReader ? bonusPackBlock(pack) : null
            const onCooldown = block !== null
            return (
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
                opacity: onCooldown ? 0.72 : 1,
                transition: 'transform 0.16s ease, box-shadow 0.16s ease, opacity 0.16s ease',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                pointerEvents: 'auto',
                '&:hover': { transform: 'translateY(-2px) scale(1.05)', boxShadow: `0 12px 32px ${pack.accent}52` },
                '&:active': { transform: 'scale(0.96)' },
                ...(!onCooldown ? {
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
                } : {}),
              }}
            >
              {pack.emoji}
              {block && (
                <Box sx={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: radius.full,
                  background: 'rgba(15,23,42,0.46)',
                  backdropFilter: 'blur(1px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.1,
                  color: '#fff',
                }}>
                  {block === 'exhausted'
                    ? <LockRoundedIcon sx={{ fontSize: 18, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }} />
                    : <AccessTimeRoundedIcon sx={{ fontSize: 17, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }} />}
                  <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, lineHeight: 1, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                    {block === 'exhausted' ? 'esgotado' : formatCooldownBadge(getBonusPackCooldownMs(pack.id))}
                  </Typography>
                </Box>
              )}
              {isRealReader && pack.distribution !== 'all_with_access' && (
                <Box sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  minWidth: 17,
                  height: 17,
                  borderRadius: radius.full,
                  background: '#fff',
                  border: `1.5px solid ${pack.accent}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: 0.4,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                }}>
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, color: pack.accent, lineHeight: 1 }}>
                    {play?.packOpens?.[pack.id] ?? 0}
                  </Typography>
                </Box>
              )}
              {isRealReader && pack.cumulative && (packAvailableCounts[pack.id] ?? 0) > 1 && !block && (
                <Box sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  minWidth: 17,
                  height: 17,
                  borderRadius: radius.full,
                  background: pack.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: 0.4,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                }}>
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                    {packAvailableCounts[pack.id]}x
                  </Typography>
                </Box>
              )}
            </Box>
          )})}
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
        onClose={() => { setSelectedBonusPack(null); setConfirmOpenAll(false) }}
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
                {isRealReader && bonusPackBlock(selectedBonusPack) === 'exhausted'
                  ? 'Você já abriu o máximo deste pacotinho'
                  : isRealReader && bonusPackBlock(selectedBonusPack) === 'cooldown'
                    ? `Disponível em ${formatRemainingTime(getBonusPackCooldownMs(selectedBonusPack.id))}`
                    : isRealReader && selectedBonusPack.cumulative && (packAvailableCounts[selectedBonusPack.id] ?? 0) > 1
                      ? `${packAvailableCounts[selectedBonusPack.id]} aberturas acumuladas`
                      : 'Pacotinho bônus disponível'}
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
                  {selectedBonusPack.cooldownHours != null && (
                    <Box sx={{ px: 0.85, py: 0.35, borderRadius: radius.full, background: 'rgba(255,255,255,0.72)', color: colors.text.secondary, fontSize: '0.68rem', fontWeight: 800 }}>
                      {selectedBonusPack.cooldownHours}h cooldown
                    </Box>
                  )}
                  {selectedBonusPack.guaranteedRarityId && (
                    <Box sx={{ px: 0.85, py: 0.35, borderRadius: radius.full, background: 'rgba(255,247,237,0.9)', color: '#c2410c', fontSize: '0.68rem', fontWeight: 850 }}>
                      garantia especial
                    </Box>
                  )}
                </Stack>
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 2, pb: 2, gap: 0.8, flexDirection: 'column' }}>
              {(() => {
                const opens = isRealReader && selectedBonusPack.distribution !== 'all_with_access'
                  ? (play?.packOpens?.[selectedBonusPack.id] ?? 0)
                  : 0
                const canOpen = isRealReader ? canOpenBonusPack(selectedBonusPack) : true
                const block = isRealReader ? bonusPackBlock(selectedBonusPack) : null
                return (
                  <>
                    {opens > 1 && canOpen && !confirmOpenAll && (
                      <Button
                        variant="primary"
                        disabled={isOpeningPack}
                        onClick={() => setConfirmOpenAll(true)}
                        sx={{ width: '100%', whiteSpace: 'nowrap' }}
                      >
                        Abrir todos ({opens}x)
                      </Button>
                    )}
                    {opens > 1 && canOpen && confirmOpenAll && (
                      <Stack direction="row" spacing={0.8} sx={{ width: '100%' }}>
                        <Button variant="ghost" onClick={() => setConfirmOpenAll(false)} sx={{ flex: 1 }}>
                          Cancelar
                        </Button>
                        <Button
                          variant="primary"
                          disabled={isOpeningPack}
                          onClick={() => { setConfirmOpenAll(false); handleOpenPack(selectedBonusPack, false, opens) }}
                          sx={{ flex: 1, whiteSpace: 'nowrap' }}
                        >
                          Confirmar ({opens}x)
                        </Button>
                      </Stack>
                    )}
                    <Stack direction="row" spacing={0.8} sx={{ width: '100%' }}>
                      <Button variant="ghost" onClick={() => { setSelectedBonusPack(null); setConfirmOpenAll(false) }} sx={{ flex: 1 }}>
                        Agora não
                      </Button>
                      <Button
                        variant="primary"
                        disabled={isOpeningPack || (isRealReader && !canOpen)}
                        onClick={() => handleOpenPack(selectedBonusPack, false)}
                        sx={{ flex: 1, whiteSpace: 'nowrap' }}
                      >
                        {block === 'exhausted' ? 'Esgotado' : block === 'cooldown' ? 'Em cooldown' : opens > 1 ? 'Abrir 1' : 'Abrir bônus'}
                      </Button>
                    </Stack>
                  </>
                )
              })()}
            </DialogActions>
          </>
        )}
      </Dialog>
      <NoteDetailDialog note={selectedNote} rarities={rarities} types={types} onClose={() => setSelectedNote(null)} />
    </Box>
  )
}
