import type { CollectionDailyReward, CollectionDailyStatus, CollectionPack, CollectionPlayView, CollectionNoteView, NoteRecord, RarityConfig } from '../types/note'

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

function pickWeightedNote(notes: NoteRecord[], rarities: RarityConfig[]) {
  const availableRarities = rarities
    .filter((rarity) => notes.some((note) => note.rarity === rarity.id))
    .map((rarity) => ({ ...rarity, weight: rarity.odds > 0 ? rarity.odds * 10 : 1 }))

  const totalWeight = availableRarities.reduce((sum, rarity) => sum + rarity.weight, 0)
  if (availableRarities.length === 0 || totalWeight <= 0) return pickRandom(notes)

  let cursor = Math.random() * totalWeight
  const selectedRarity = availableRarities.find((rarity) => {
    cursor -= rarity.weight
    return cursor <= 0
  }) ?? availableRarities[availableRarities.length - 1]

  const rarityNotes = notes.filter((note) => note.rarity === selectedRarity.id)
  return pickRandom(rarityNotes.length > 0 ? rarityNotes : notes)
}

export function buildSimulatedPlayView(
  notes: NoteRecord[],
  ownedIds: string[],
  favorites: Record<string, boolean>,
  daily: CollectionDailyStatus,
): CollectionPlayView {
  const ownedSet = new Set(ownedIds)
  const availableAt = Date.parse(daily.availableAt)
  const effectiveDaily = !daily.canOpen && Number.isFinite(availableAt) && availableAt <= Date.now()
    ? { ...daily, canOpen: true, serverTime: new Date().toISOString() }
    : daily
  const items: CollectionNoteView[] = notes.map((note) => ({
    id: note.id,
    title: note.title,
    message: note.message,
    rarity: note.rarity,
    typeId: note.typeId,
    owned: ownedSet.has(note.id),
    favorite: favorites[note.id] ?? false,
    obtainedAt: ownedSet.has(note.id) ? new Date().toISOString() : null,
  }))

  return {
    total: items.length,
    owned: items.filter((item) => item.owned).length,
    items,
    daily: effectiveDaily,
  }
}

export function simulatePackOpen(pack: CollectionPack, notes: NoteRecord[], rarities: RarityConfig[], excludedIds: string[] = []): CollectionDailyReward[] {
  const excluded = new Set(excludedIds)
  const eligibleNotes = notes.filter((note) =>
    !excluded.has(note.id) &&
    (pack.allowedTypeIds.length === 0 || pack.allowedTypeIds.includes(note.typeId)) &&
    (pack.allowedRarityIds.length === 0 || pack.allowedRarityIds.includes(note.rarity)),
  )

  if (eligibleNotes.length === 0) return []

  const rewards: CollectionDailyReward[] = []
  const used = new Set<string>()

  function pushNote(note: NoteRecord) {
    used.add(note.id)
    rewards.push({
      id: note.id,
      title: note.title,
      message: note.message,
      rarity: note.rarity,
      typeId: note.typeId,
      isNew: true,
    })
  }

  if (pack.guaranteedRarityId) {
    const guaranteedPool = eligibleNotes.filter((note) => note.rarity === pack.guaranteedRarityId)
    if (guaranteedPool.length > 0) pushNote(pickRandom(guaranteedPool))
  }

  const count = Math.max(1, pack.cardsPerOpen)
  while (rewards.length < count) {
    const pool = eligibleNotes.filter((note) => !used.has(note.id))
    if (pool.length === 0) break
    pushNote(pickWeightedNote(pool, rarities))
  }

  return rewards
}
