import type { Note, PackOddsResponse, PackReward, Rarity, StatsResponse } from '../types/note'

interface NoteSeed {
  id: string
  title: string
  message: string
  rarity: Rarity
}

const rarityWeights: Record<Rarity, number> = {
  comum: 60,
  incomum: 25,
  raro: 10,
  lendario: 1,
  mitico: 4,
}

const noteSeeds: NoteSeed[] = [
  { id: 'note_001', title: 'Bom dia, linda', message: 'Seu sorriso zerou minha tristeza hoje.', rarity: 'comum' },
  { id: 'note_002', title: 'Ping de saudade', message: 'Toda hora lembro de voce e sorrio sozinho.', rarity: 'comum' },
  { id: 'note_003', title: 'Modo abraco', message: 'Se eu pudesse, te mandava um abraco por bluetooth.', rarity: 'comum' },
  { id: 'note_004', title: 'Presente simples', message: 'Te dei meu coracao e ainda veio com garantia vitalicia.', rarity: 'comum' },
  { id: 'note_005', title: 'Linha de codigo', message: 'Voce e meu if favorito: se voce sorri, meu dia melhora.', rarity: 'comum' },
  { id: 'note_006', title: 'Cafe + voce', message: 'Meu combo preferido: cafe, risada sua e mais voce.', rarity: 'incomum' },
  { id: 'note_007', title: 'Confissao nerd', message: 'Meu amor por voce tem uptime de 99.999%.', rarity: 'incomum' },
  { id: 'note_008', title: 'Romance premium', message: 'Com voce, ate fila de mercado vira encontro.', rarity: 'incomum' },
  { id: 'note_009', title: 'Sorriso raro', message: 'Seu sorriso desbloqueia fase secreta no meu coracao.', rarity: 'incomum' },
  { id: 'note_010', title: 'Bilhete dourado', message: 'Seu nome e minha notificacao favorita.', rarity: 'raro' },
  { id: 'note_011', title: 'Planeta casal', message: 'No meu universo, gravidade e voce me puxando.', rarity: 'raro' },
  { id: 'note_012', title: 'Tesouro achado', message: 'Te encontrar foi loot lendario da vida.', rarity: 'raro' },
  { id: 'note_013', title: 'Destino mitico', message: 'A vida juntou nossos caminhos em missao principal.', rarity: 'mitico' },
  { id: 'note_014', title: 'Carta secreta', message: 'Prometo te escolher em todas as timelines.', rarity: 'mitico' },
  { id: 'note_015', title: 'Unica no mundo', message: 'Voce e minha carta lendaria de edicao unica.', rarity: 'lendario' },
]

const defaultOwned = new Set([
  'note_001', // comum (branco)
  'note_006', // incomum (azul claro)
  'note_010', // raro (azul escuro)
  'note_015', // lendario (dourado)
  'note_013', // mitico (arco-iris)
])

export function createInitialCollection(): Note[] {
  return noteSeeds.map((seed) => ({
    ...seed,
    owned: defaultOwned.has(seed.id),
    favorite: seed.id === 'note_013',
    obtainedAt: defaultOwned.has(seed.id) ? '2026-04-20T10:00:00.000Z' : null,
  }))
}

function weightedRandomRarity(): Rarity {
  const threshold = Math.random() * 100
  let accumulated = 0

  for (const [rarity, weight] of Object.entries(rarityWeights) as Array<[Rarity, number]>) {
    accumulated += weight
    if (threshold <= accumulated) {
      return rarity
    }
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

    if (isNew) {
      selected.owned = true
      selected.obtainedAt = new Date().toISOString()
    }

    rewards.push({
      id: selected.id,
      rarity: selected.rarity,
      isNew,
      title: selected.title,
    })
  }

  return rewards
}

// Exibe as odds na mesma ordem e com os mesmos pesos usados em openPack(),
// garantindo que UI e lógica nunca fiquem fora de sincronia.
const RARITY_DISPLAY_ORDER: Rarity[] = ['comum', 'incomum', 'raro', 'mitico', 'lendario']

const rarityLabels: Record<Rarity, string> = {
  comum: 'Comum',
  incomum: 'Incomum',
  raro: 'Raro',
  mitico: 'Mítico',
  lendario: 'Lendário',
}

export function getPackOdds(): PackOddsResponse {
  return RARITY_DISPLAY_ORDER.map((rarity) => ({
    rarity,
    label: rarityLabels[rarity],
    percent: rarityWeights[rarity],
  }))
}

export function computeStats(collection: Note[]): StatsResponse {
  const total = collection.length
  const owned = collection.filter((note) => note.owned).length

  const byRarity = collection.reduce<StatsResponse['byRarity']>(
    (acc, note) => {
      acc[note.rarity].total += 1
      if (note.owned) {
        acc[note.rarity].owned += 1
      }
      return acc
    },
    {
      comum: { owned: 0, total: 0 },
      incomum: { owned: 0, total: 0 },
      raro: { owned: 0, total: 0 },
      lendario: { owned: 0, total: 0 },
      mitico: { owned: 0, total: 0 },
    },
  )

  return {
    completion: Math.round((owned / total) * 100),
    byRarity,
  }
}
