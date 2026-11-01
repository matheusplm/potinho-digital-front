import type {
  CollectionPack,
  Note,
  NoteRecord,
  NoteTypeConfig,
  PackReward,
  RarityConfig,
} from '../types/note'

export const defaultRarities: RarityConfig[] = [
  {
    id: 'comum', label: 'Comum', emoji: '🩶', odds: 60, order: 1,
    cardBg: '#fffdf7', textColor: '#2a241d', captionColor: '#8a7e6c',
    borderColor: '#8a7e6c', shadow: '', glowColor: '',
    chipBg: '#fffdf7', chipColor: '#5e5446',
  },
  {
    id: 'incomum', label: 'Incomum', emoji: '💚', odds: 25, order: 2,
    cardBg: '#fffdf7', textColor: '#2a241d', captionColor: '#8a7e6c',
    borderColor: '#4f7d52', shadow: '', glowColor: '',
    chipBg: '#fffdf7', chipColor: '#3a6340',
  },
  {
    id: 'raro', label: 'Raro', emoji: '💙', odds: 10, order: 3,
    cardBg: '#fffdf7', textColor: '#2a241d', captionColor: '#8a7e6c',
    borderColor: '#3d5aa8', shadow: '', glowColor: '',
    chipBg: '#fffdf7', chipColor: '#27408b',
  },
  {
    id: 'mitico', label: 'Mítico', emoji: '🔮', odds: 4, order: 4,
    cardBg: '#fffdf7', textColor: '#2a241d', captionColor: '#8a7e6c',
    borderColor: '#7a5ca8', shadow: '', glowColor: '',
    chipBg: '#fffdf7', chipColor: '#5b3f8a',
  },
  {
    id: 'lendario', label: 'Lendário', emoji: '👑', odds: 1, order: 5,
    cardBg: '#fffdf7', textColor: '#2a241d', captionColor: '#8a7e6c',
    borderColor: '#c0392b', shadow: '', glowColor: '',
    chipBg: '#fffdf7', chipColor: '#a32d22', revealEffect: 'burst', revealMedia: '👑',
    revealStyle: { tier: 'legendary', color: 'gold' },
  },
]

export const defaultTypes: NoteTypeConfig[] = [
  { id: 'amor', label: 'Amor', emoji: '❤️', order: 1, accentColor: '#e11d48', tagBg: 'rgba(225,29,72,0.1)', tagColor: '#be123c' },
  { id: 'saudade', label: 'Saudade', emoji: '🌙', order: 2, accentColor: '#6366f1', tagBg: 'rgba(99,102,241,0.1)', tagColor: '#4f46e5' },
  { id: 'carinho', label: 'Carinho', emoji: '🤗', order: 3, accentColor: '#ec4899', tagBg: 'rgba(236,72,153,0.1)', tagColor: '#db2777' },
  { id: 'alegria', label: 'Alegria', emoji: '☀️', order: 4, accentColor: '#f59e0b', tagBg: 'rgba(245,158,11,0.12)', tagColor: '#d97706' },
  { id: 'parceria', label: 'Parceria', emoji: '🤝', order: 5, accentColor: '#0ea5e9', tagBg: 'rgba(14,165,233,0.1)', tagColor: '#0284c7' },
  { id: 'sonho', label: 'Sonho', emoji: '✨', order: 6, accentColor: '#8b5cf6', tagBg: 'rgba(139,92,246,0.1)', tagColor: '#7c3aed' },
]

export const defaultPacks: CollectionPack[] = [
  {
    id: 'daily',
    collectionId: '',
    name: 'Pacotinho diário',
    emoji: '💌',
    description: 'O pacote padrão da coleção, liberado automaticamente por tempo.',
    category: 'daily',
    status: 'active',
    distribution: 'all_with_access',
    cardsPerOpen: 1,
    cooldownHours: 24,
    allowedTypeIds: [],
    allowedRarityIds: [],
    guaranteedRarityId: null,
    gradient: 'linear-gradient(135deg,#fff1f2,#ffe4e6,#fbcfe8)',
    accent: '#e11d48',
    scheduleMode: 'cooldown',
    scheduleTime: null,
    scheduleTimezone: 'America/Sao_Paulo',
    cumulative: false,
    maxAccumulated: 3,
    createdAt: '2026-04-20T10:00:00.000Z',
    updatedAt: '2026-04-20T10:00:00.000Z',
  },
]

export const bonusPacks: CollectionPack[] = [
  {
    id: 'bonus_carinho',
    collectionId: '',
    name: 'Mimo de Carinho',
    emoji: '🤗',
    description: 'Um pacotinho extra cheio de carinho, liberado a cada 6 horas.',
    category: 'bonus',
    status: 'active',
    distribution: 'manual_bonus',
    cardsPerOpen: 2,
    cooldownHours: 6,
    allowedTypeIds: [],
    allowedRarityIds: [],
    guaranteedRarityId: null,
    gradient: 'linear-gradient(135deg,#eef2ff,#e0e7ff,#c7d2fe)',
    accent: '#6366f1',
    scheduleMode: 'cooldown',
    scheduleTime: null,
    scheduleTimezone: 'America/Sao_Paulo',
    cumulative: false,
    maxAccumulated: 3,
    createdAt: '2026-04-20T10:00:00.000Z',
    updatedAt: '2026-04-20T10:00:00.000Z',
  },
  {
    id: 'bonus_lendario',
    collectionId: '',
    name: 'Cofre Lendário',
    emoji: '👑',
    description: 'Pacote especial com 1 bilhete garantido de raridade rara ou acima.',
    category: 'guaranteed',
    status: 'active',
    distribution: 'manual_bonus',
    cardsPerOpen: 1,
    cooldownHours: 24,
    allowedTypeIds: [],
    allowedRarityIds: [],
    guaranteedRarityId: 'raro',
    gradient: 'linear-gradient(135deg,#fff7ed,#ffe4e6,#fbcfe8)',
    accent: '#e11d48',
    scheduleMode: 'cooldown',
    scheduleTime: null,
    scheduleTimezone: 'America/Sao_Paulo',
    cumulative: false,
    maxAccumulated: 3,
    createdAt: '2026-04-20T10:00:00.000Z',
    updatedAt: '2026-04-20T10:00:00.000Z',
  },
]

const seedTimestamp = '2026-04-20T10:00:00.000Z'

export const noteSeeds: NoteRecord[] = [
  { id: 'note_001', title: 'Bom dia, linda',   message: 'Seu sorriso zerou minha tristeza hoje.',                  rarity: 'comum',    typeId: 'alegria',  createdAt: seedTimestamp },
  { id: 'note_002', title: 'Ping de saudade',  message: 'Toda hora lembro de você e sorrio sozinho.',              rarity: 'comum',    typeId: 'saudade',  createdAt: seedTimestamp },
  { id: 'note_003', title: 'Modo abraço',      message: 'Se eu pudesse, te mandava um abraço por bluetooth.',      rarity: 'comum',    typeId: 'carinho',  createdAt: seedTimestamp },
  { id: 'note_004', title: 'Presente simples', message: 'Te dei meu coração e ainda veio com garantia vitalícia.', rarity: 'comum',    typeId: 'amor',     createdAt: seedTimestamp },
  { id: 'note_005', title: 'Linha de código',  message: 'Você é meu if favorito: se você sorri, meu dia melhora.', rarity: 'comum',    typeId: 'alegria',  createdAt: seedTimestamp },
  { id: 'note_006', title: 'Café + você',      message: 'Meu combo preferido: café, risada sua e mais você.',      rarity: 'incomum',  typeId: 'alegria',  createdAt: seedTimestamp },
  { id: 'note_007', title: 'Confissão nerd',   message: 'Meu amor por você tem uptime de 99.999%.',                rarity: 'incomum',  typeId: 'amor',     createdAt: seedTimestamp },
  { id: 'note_008', title: 'Romance premium',  message: 'Com você, até fila de mercado vira encontro.',            rarity: 'incomum',  typeId: 'amor',     createdAt: seedTimestamp },
  { id: 'note_009', title: 'Sorriso raro',     message: 'Seu sorriso desbloqueia fase secreta no meu coração.',    rarity: 'incomum',  typeId: 'carinho',  createdAt: seedTimestamp },
  { id: 'note_010', title: 'Bilhete dourado',  message: 'Seu nome é minha notificação favorita.',                  rarity: 'raro',     typeId: 'amor',     createdAt: seedTimestamp },
  { id: 'note_011', title: 'Planeta casal',    message: 'No meu universo, gravidade é você me puxando.',           rarity: 'raro',     typeId: 'parceria', createdAt: seedTimestamp },
  { id: 'note_012', title: 'Tesouro achado',   message: 'Te encontrar foi loot lendário da vida.',                 rarity: 'raro',     typeId: 'parceria', createdAt: seedTimestamp },
  { id: 'note_013', title: 'Destino mítico',   message: 'A vida juntou nossos caminhos em missão principal.',      rarity: 'mitico',   typeId: 'sonho',    createdAt: seedTimestamp },
  { id: 'note_014', title: 'Carta secreta',    message: 'Prometo te escolher em todas as timelines.',              rarity: 'mitico',   typeId: 'sonho',    createdAt: seedTimestamp },
  { id: 'note_015', title: 'Única no mundo',   message: 'Você é minha carta lendária de edição única.',            rarity: 'lendario', typeId: 'amor',     createdAt: seedTimestamp },
]

export const defaultOwnedIds = ['note_001', 'note_006', 'note_010', 'note_013', 'note_015']
export const defaultFavoriteIds = ['note_013']

export function cloneRarities(): RarityConfig[] {
  return defaultRarities.map((rarity) => ({ ...rarity }))
}

export function cloneTypes(): NoteTypeConfig[] {
  return defaultTypes.map((type) => ({ ...type }))
}

export function cloneStarterRarities(): RarityConfig[] {
  return [{ ...defaultRarities[0] }]
}

export function cloneStarterTypes(): NoteTypeConfig[] {
  return [{ ...defaultTypes[0] }]
}

export function cloneStarterPacks(collectionId: string): CollectionPack[] {
  return defaultPacks.map((pack) => ({ ...pack, collectionId }))
}

export function cloneBonusPacks(collectionId: string): CollectionPack[] {
  return bonusPacks.map((pack) => ({ ...pack, collectionId }))
}

export function cloneNotes(): NoteRecord[] {
  return noteSeeds.map((note) => ({ ...note }))
}

export function buildNoteView(
  record: NoteRecord,
  owned: Set<string>,
  favorites: Set<string>,
  obtainedAt: Record<string, string>,
): Note {
  const isOwned = owned.has(record.id)
  return {
    id: record.id,
    title: record.title,
    message: record.message,
    rarity: record.rarity,
    typeId: record.typeId,
    typeIds: record.typeIds,
    owned: isOwned,
    favorite: favorites.has(record.id),
    obtainedAt: isOwned ? obtainedAt[record.id] ?? seedTimestamp : null,
  }
}

export function weightedRandomRarity(rarities: RarityConfig[]): string {
  const total = rarities.reduce((sum, rarity) => sum + Math.max(rarity.odds, 0), 0)
  if (total <= 0) return rarities[0]?.id ?? 'comum'
  let threshold = Math.random() * total
  for (const rarity of rarities) {
    threshold -= Math.max(rarity.odds, 0)
    if (threshold <= 0) return rarity.id
  }
  return rarities[rarities.length - 1].id
}

export function drawReward(
  notes: NoteRecord[],
  rarities: RarityConfig[],
  owned: Set<string>,
  obtainedAt: Record<string, string>,
): PackReward {
  const liveNotes = notes.filter((note) => !note.disabledAt && note.status !== 'preview')
  const drawable = liveNotes.length > 0 ? liveNotes : notes
  const rarity = weightedRandomRarity(rarities)
  const pool = drawable.filter((note) => note.rarity === rarity)
  const source = pool.length > 0 ? pool : drawable
  const selected = source[Math.floor(Math.random() * source.length)]
  const isNew = !owned.has(selected.id)
  if (isNew) {
    owned.add(selected.id)
    obtainedAt[selected.id] = new Date().toISOString()
  }
  return { id: selected.id, rarity: selected.rarity, typeId: selected.typeId, isNew, title: selected.title }
}
