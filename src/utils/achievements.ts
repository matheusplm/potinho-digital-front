import type { CollectionPlayView, RarityConfig, NoteTypeConfig } from '../types/note'

export interface Achievement {
  id: string
  emoji: string
  label: string
  description: string
  unlocked: boolean
  current: number
  target: number
}

export function computeAchievements(
  play: CollectionPlayView | undefined,
  rarities: RarityConfig[],
  types: NoteTypeConfig[],
): Achievement[] {
  const items = play?.items ?? []
  const owned = items.filter((i) => i.owned)
  const ownedCount = owned.length
  const total = play?.total ?? 0
  const favorites = owned.filter((i) => i.favorite).length

  const rarityIdsInCollection = new Set(items.map((i) => i.rarity))
  const ownedRarityIds = new Set(owned.map((i) => i.rarity))
  const presentRarities = rarities.filter((r) => rarityIdsInCollection.has(r.id))
  const topRarity = presentRarities.reduce<RarityConfig | undefined>(
    (best, r) => (!best || r.odds < best.odds ? r : best),
    undefined,
  )
  const ownsTopRarity = topRarity ? owned.some((i) => i.rarity === topRarity.id) : false

  const typeComplete = types.some((t) => {
    const inType = items.filter((i) => (i.typeIds?.length ? i.typeIds : [i.typeId]).includes(t.id))
    return inType.length > 0 && inType.every((i) => i.owned)
  })

  const list: Achievement[] = [
    {
      id: 'first',
      emoji: '🌱',
      label: 'Primeiro bilhete',
      description: 'Coletou seu primeiro bilhetinho.',
      current: Math.min(ownedCount, 1),
      target: 1,
      unlocked: ownedCount >= 1,
    },
  ]

  for (const tier of [5, 15, 30]) {
    if (total >= tier) {
      list.push({
        id: `collector_${tier}`,
        emoji: tier >= 30 ? '🏆' : tier >= 15 ? '📚' : '🎴',
        label: `Colecionador(a) ${tier}`,
        description: `Coletou ${tier} bilhetes.`,
        current: Math.min(ownedCount, tier),
        target: tier,
        unlocked: ownedCount >= tier,
      })
    }
  }

  if (total > 0) {
    const half = Math.ceil(total / 2)
    list.push({
      id: 'half',
      emoji: '🌗',
      label: 'Meio caminho',
      description: 'Coletou metade da coleção.',
      current: Math.min(ownedCount, half),
      target: half,
      unlocked: ownedCount >= half,
    })
    list.push({
      id: 'complete',
      emoji: '👑',
      label: 'Coleção completa',
      description: 'Coletou todos os bilhetes da coleção.',
      current: ownedCount,
      target: total,
      unlocked: ownedCount >= total,
    })
  }

  if (presentRarities.length > 1) {
    list.push({
      id: 'rainbow',
      emoji: '🌈',
      label: 'Arco-íris',
      description: 'Coletou ao menos uma de cada raridade.',
      current: ownedRarityIds.size,
      target: presentRarities.length,
      unlocked: ownedRarityIds.size >= presentRarities.length,
    })
  }

  if (topRarity) {
    list.push({
      id: 'top_rarity',
      emoji: topRarity.emoji || '✨',
      label: `Primeira ${topRarity.label}`,
      description: `Coletou um bilhete ${topRarity.label.toLowerCase()}.`,
      current: ownsTopRarity ? 1 : 0,
      target: 1,
      unlocked: ownsTopRarity,
    })
  }

  const favTarget = Math.min(5, Math.max(1, total))
  list.push({
    id: 'favorites',
    emoji: '❤️',
    label: 'Coração cheio',
    description: `Favoritou ${favTarget} bilhetes.`,
    current: Math.min(favorites, favTarget),
    target: favTarget,
    unlocked: favorites >= favTarget,
  })

  if (types.length > 0) {
    list.push({
      id: 'type_complete',
      emoji: '🎯',
      label: 'Tipo completo',
      description: 'Completou todos os bilhetes de um tipo.',
      current: typeComplete ? 1 : 0,
      target: 1,
      unlocked: typeComplete,
    })
  }

  return list
}
