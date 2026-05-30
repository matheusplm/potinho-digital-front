import type { Note, PackOddsResponse, PackReward, StatsResponse } from '../types/note'

interface NoteSeed {
  id: string
  title: string
  message: string
  rarity: string
  typeId: string
}

const rarityWeights: Record<string, number> = {
  comum: 60,
  incomum: 25,
  raro: 10,
  lendario: 1,
  mitico: 4,
}

const noteSeeds: NoteSeed[] = [
  { id: 'note_001', title: 'Bom dia, linda',   message: 'Seu sorriso zerou minha tristeza hoje.',               rarity: 'comum',    typeId: 'alegria'  },
  { id: 'note_002', title: 'Ping de saudade',  message: 'Toda hora lembro de voce e sorrio sozinho.',           rarity: 'comum',    typeId: 'saudade'  },
  { id: 'note_003', title: 'Modo abraco',      message: 'Se eu pudesse, te mandava um abraco por bluetooth.',   rarity: 'comum',    typeId: 'carinho'  },
  { id: 'note_004', title: 'Presente simples', message: 'Te dei meu coracao e ainda veio com garantia vitalicia.', rarity: 'comum', typeId: 'amor'     },
  { id: 'note_005', title: 'Linha de codigo',  message: 'Voce e meu if favorito: se voce sorri, meu dia melhora.', rarity: 'comum', typeId: 'alegria'  },
  { id: 'note_006', title: 'Cafe + voce',      message: 'Meu combo preferido: cafe, risada sua e mais voce.',   rarity: 'incomum',  typeId: 'alegria'  },
  { id: 'note_007', title: 'Confissao nerd',   message: 'Meu amor por voce tem uptime de 99.999%.',             rarity: 'incomum',  typeId: 'amor'     },
  { id: 'note_008', title: 'Romance premium',  message: 'Com voce, ate fila de mercado vira encontro.',         rarity: 'incomum',  typeId: 'amor'     },
  { id: 'note_009', title: 'Sorriso raro',     message: 'Seu sorriso desbloqueia fase secreta no meu coracao.', rarity: 'incomum',  typeId: 'carinho'  },
  { id: 'note_010', title: 'Bilhete dourado',  message: 'Seu nome e minha notificacao favorita.',               rarity: 'raro',     typeId: 'amor'     },
  { id: 'note_011', title: 'Planeta casal',    message: 'No meu universo, gravidade e voce me puxando.',        rarity: 'raro',     typeId: 'parceria' },
  { id: 'note_012', title: 'Tesouro achado',   message: 'Te encontrar foi loot lendario da vida.',              rarity: 'raro',     typeId: 'parceria' },
  { id: 'note_013', title: 'Destino mitico',   message: 'A vida juntou nossos caminhos em missao principal.',   rarity: 'mitico',   typeId: 'sonho'    },
  { id: 'note_014', title: 'Carta secreta',    message: 'Prometo te escolher em todas as timelines.',           rarity: 'mitico',   typeId: 'sonho'    },
  { id: 'note_015', title: 'Unica no mundo',   message: 'Voce e minha carta lendaria de edicao unica.',         rarity: 'lendario', typeId: 'amor'     },
]

const defaultOwned = new Set(['note_001', 'note_006', 'note_010', 'note_015', 'note_013'])

export function createInitialCollection(): Note[] {
  return noteSeeds.map((seed) => ({
    ...seed,
    owned: defaultOwned.has(seed.id),
    favorite: seed.id === 'note_013',
    obtainedAt: defaultOwned.has(seed.id) ? '2026-04-20T10:00:00.000Z' : null,
  }))
}

function weightedRandomRarity(): string {
  const threshold = Math.random() * 100
  let accumulated = 0
  for (const [rarity, weight] of Object.entries(rarityWeights)) {
    accumulated += weight
    if (threshold <= accumulated) return rarity
  }
  return 'comum'
}

export function openPack(collection: Note[]): PackReward[] {
  const rewards: PackReward[] = []
  for (let i = 0; i < 3; i += 1) {
    const rarity = weightedRandomRarity()
    const pool = collection.filter((note) => note.rarity === rarity)
    const fallbackPool = pool.length > 0 ? pool : collection
    const selected = fallbackPool[Math.floor(Math.random() * fallbackPool.length)]
    const isNew = !selected.owned
    if (isNew) { selected.owned = true; selected.obtainedAt = new Date().toISOString() }
    rewards.push({ id: selected.id, rarity: selected.rarity, typeId: selected.typeId, isNew, title: selected.title })
  }
  return rewards
}

const RARITY_DISPLAY_ORDER = ['comum', 'incomum', 'raro', 'mitico', 'lendario']
const rarityLabels: Record<string, string> = {
  comum: 'Comum', incomum: 'Incomum', raro: 'Raro', mitico: 'Mítico', lendario: 'Lendário',
}

export function getPackOdds(): PackOddsResponse {
  return RARITY_DISPLAY_ORDER.map((rarity) => ({
    rarity, label: rarityLabels[rarity] ?? rarity, percent: rarityWeights[rarity] ?? 0,
  }))
}

export function computeStats(collection: Note[]): StatsResponse {
  const total = collection.length
  const owned = collection.filter((note) => note.owned).length
  const byRarity = collection.reduce<StatsResponse['byRarity']>(
    (acc, note) => {
      if (!acc[note.rarity]) acc[note.rarity] = { owned: 0, total: 0 }
      acc[note.rarity].total += 1
      if (note.owned) acc[note.rarity].owned += 1
      return acc
    },
    {},
  )
  return { completion: Math.round((owned / total) * 100), byRarity }
}
