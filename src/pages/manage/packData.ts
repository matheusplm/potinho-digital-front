import type { CollectionPack, CollectionPackCategory, CollectionPackDistribution, CollectionPackFormData, CollectionPackStatus, NoteRecord, RarityConfig } from '../../types/note'

export type PackFilter = 'all' | 'active' | 'draft' | 'daily' | 'bonus' | 'guaranteed' | 'thematic'
export type PackView = 'cards' | 'list'
export type PackSimulation = { pack: CollectionPack; rewards: NoteRecord[]; eligibleCount: number; guaranteedApplied: boolean }

const PACK_DEFAULT_SCHEDULE: Pick<CollectionPackFormData, 'scheduleMode' | 'scheduleTime' | 'scheduleTimezone' | 'cumulative' | 'maxAccumulated'> = {
  scheduleMode: 'cooldown', scheduleTime: null, scheduleTimezone: 'America/Sao_Paulo', cumulative: false, maxAccumulated: 3,
}

export const PACK_TEMPLATES: CollectionPackFormData[] = [
  { id: 'daily', name: 'Pacotinho diário', emoji: '💌', description: 'O pacote padrão da coleção, liberado automaticamente por tempo.', cardsPerOpen: 1, cooldownHours: 24, distribution: 'all_with_access', status: 'active', category: 'daily', allowedTypeIds: [], allowedRarityIds: [], guaranteedRarityId: null, gradient: 'linear-gradient(135deg,#fff1f2,#ffe4e6,#fbcfe8)', accent: '#e11d48', ...PACK_DEFAULT_SCHEDULE },
  { id: 'daily_fixed', name: 'Diário hora fixa', emoji: '⏰', description: 'Liberado todo dia no mesmo horário. Slots acumulam se não forem abertos.', cardsPerOpen: 1, cooldownHours: null, distribution: 'all_with_access', status: 'active', category: 'daily', allowedTypeIds: [], allowedRarityIds: [], guaranteedRarityId: null, gradient: 'linear-gradient(135deg,#fff1f2,#ffe4e6,#fbcfe8)', accent: '#e11d48', scheduleMode: 'fixed_time', scheduleTime: '06:00', scheduleTimezone: 'America/Sao_Paulo', cumulative: true, maxAccumulated: 3 },
  { id: 'sentimental', name: 'Pacote sentimental', emoji: '🥹', description: 'Exemplo de pacote temático filtrando apenas um tipo de bilhete.', cardsPerOpen: 4, cooldownHours: 168, distribution: 'manual_bonus', status: 'draft', category: 'thematic', allowedTypeIds: [], allowedRarityIds: [], guaranteedRarityId: null, gradient: 'linear-gradient(135deg,#eef2ff,#e0e7ff,#f5d0fe)', accent: '#6366f1', ...PACK_DEFAULT_SCHEDULE },
  { id: 'legendary', name: 'Lendário garantido', emoji: '👑', description: 'Exemplo de pacote especial para eventos, datas e recompensas raras.', cardsPerOpen: 3, cooldownHours: null, distribution: 'selected_readers', status: 'draft', category: 'guaranteed', allowedTypeIds: [], allowedRarityIds: [], guaranteedRarityId: null, gradient: 'linear-gradient(135deg,#fff7ed,#fed7aa,#fde68a)', accent: '#f97316', ...PACK_DEFAULT_SCHEDULE },
  { id: 'saudade', name: 'Dose de saudade', emoji: '🌙', description: 'Pacotinho emocional para bilhetes de saudade e carinho.', cardsPerOpen: 2, cooldownHours: 12, distribution: 'all_with_access', status: 'draft', category: 'thematic', allowedTypeIds: [], allowedRarityIds: [], guaranteedRarityId: null, gradient: 'linear-gradient(135deg,#eef2ff,#c7d2fe,#e0e7ff)', accent: '#4f46e5', ...PACK_DEFAULT_SCHEDULE },
  { id: 'surpresa', name: 'Surpresa relâmpago', emoji: '⚡', description: 'Um bônus rápido liberado manualmente pelo criador.', cardsPerOpen: 1, cooldownHours: null, distribution: 'manual_bonus', status: 'active', category: 'bonus', allowedTypeIds: [], allowedRarityIds: [], guaranteedRarityId: null, gradient: 'linear-gradient(135deg,#fefce8,#fef3c7,#fde68a)', accent: '#eab308', ...PACK_DEFAULT_SCHEDULE },
  { id: 'evento', name: 'Evento especial', emoji: '🎉', description: 'Template para aniversário, datas especiais ou coleções sazonais.', cardsPerOpen: 5, cooldownHours: null, distribution: 'all_with_access', status: 'draft', category: 'bonus', allowedTypeIds: [], allowedRarityIds: [], guaranteedRarityId: null, gradient: 'linear-gradient(135deg,#ecfeff,#cffafe,#f0abfc)', accent: '#06b6d4', ...PACK_DEFAULT_SCHEDULE },
]

export const PACK_FILTERS: { id: PackFilter; label: string }[] = [
  { id: 'all', label: 'Todos' }, { id: 'active', label: 'Ativos' }, { id: 'draft', label: 'Rascunhos' },
  { id: 'daily', label: 'Diários' }, { id: 'bonus', label: 'Bônus' }, { id: 'guaranteed', label: 'Garantidos' }, { id: 'thematic', label: 'Temáticos' },
]

export const PACK_CATEGORY_LABELS: Record<CollectionPackCategory, string> = {
  daily: 'Diário', bonus: 'Bônus', guaranteed: 'Garantido', thematic: 'Temático',
}
export const PACK_STATUS_LABELS: Record<CollectionPackStatus, string> = {
  active: 'Ativo', draft: 'Rascunho', disabled: 'Pausado',
}
export const PACK_DISTRIBUTION_LABELS: Record<CollectionPackDistribution, string> = {
  all_with_access: 'Todos com acesso', manual_bonus: 'Brinde manual', selected_readers: 'Selecionar leitores',
}
export const PACK_CATEGORY_OPTIONS = Object.entries(PACK_CATEGORY_LABELS).map(([id, label]) => ({ id: id as CollectionPackCategory, label }))
export const PACK_STATUS_OPTIONS = Object.entries(PACK_STATUS_LABELS).map(([id, label]) => ({ id: id as CollectionPackStatus, label }))
export const PACK_DISTRIBUTION_OPTIONS = Object.entries(PACK_DISTRIBUTION_LABELS).map(([id, label]) => ({ id: id as CollectionPackDistribution, label }))

export const PACK_CATEGORY_HINTS: Record<CollectionPackCategory, string> = {
  daily: 'O pacote principal, em destaque para o leitor. Só um por coleção.',
  bonus: 'Extra fora da rotina, ótimo para surpresas e presentes.',
  guaranteed: 'Pacote de evento especial, com raridade garantida.',
  thematic: 'Agrupa um tema: saudade, memórias, poemas...',
}

export const PACK_STATUS_HINTS: Record<CollectionPackStatus, string> = {
  active: 'No ar: quem tem acesso já pode abrir.',
  draft: 'Rascunho: só você vê por enquanto.',
  disabled: 'Pausado: some para os leitores até você reativar.',
}

export const PACK_DISTRIBUTION_HINTS: Record<CollectionPackDistribution, string> = {
  all_with_access: 'Libera sozinho para todo mundo que você convidou.',
  manual_bonus: 'Você aperta um botão e presenteia na hora que quiser.',
  selected_readers: 'Só para leitores específicos que você escolher.',
}

type PackRhythmId = 'daily' | 'twice' | 'weekly' | 'fixed_time' | 'once' | 'manual'

export const PACK_RHYTHMS: { id: PackRhythmId; emoji: string; label: string; hint: string }[] = [
  { id: 'daily',      emoji: '☀️', label: '1x por dia',        hint: 'Libera sozinho a cada 24 horas, o clássico.' },
  { id: 'twice',      emoji: '🌗', label: '2x por dia',        hint: 'Libera sozinho a cada 12 horas.' },
  { id: 'weekly',     emoji: '📅', label: '1x por semana',     hint: 'Libera sozinho a cada 7 dias.' },
  { id: 'fixed_time', emoji: '⏰', label: 'Hora marcada',      hint: 'Todo dia no mesmo horário, tipo café da manhã.' },
  { id: 'once',       emoji: '🎈', label: 'Uma vez só',        hint: 'Cada leitor abre uma única vez.' },
  { id: 'manual',     emoji: '🎁', label: 'Quando eu liberar', hint: 'Você envia na hora que quiser, como um presente.' },
]

export const PACK_RHYTHM_CUSTOM_HINT = 'Configuração personalizada. Ajuste fino nas Opções avançadas.'

export function detectRhythm(form: Pick<CollectionPackFormData, 'distribution' | 'scheduleMode' | 'cooldownHours'>): PackRhythmId | 'custom' {
  if (form.distribution === 'manual_bonus') return 'manual'
  if (form.scheduleMode === 'fixed_time') return 'fixed_time'
  if (form.cooldownHours === 24) return 'daily'
  if (form.cooldownHours === 12) return 'twice'
  if (form.cooldownHours === 168) return 'weekly'
  if (form.cooldownHours === null) return 'once'
  return 'custom'
}

export function rhythmPatch(rhythm: PackRhythmId, current: Pick<CollectionPackFormData, 'distribution' | 'scheduleTime'>): Partial<CollectionPackFormData> {
  const autoDistribution = current.distribution === 'manual_bonus' ? 'all_with_access' as const : current.distribution
  switch (rhythm) {
    case 'daily':      return { scheduleMode: 'cooldown', cooldownHours: 24, distribution: autoDistribution }
    case 'twice':      return { scheduleMode: 'cooldown', cooldownHours: 12, distribution: autoDistribution }
    case 'weekly':     return { scheduleMode: 'cooldown', cooldownHours: 168, distribution: autoDistribution }
    case 'once':       return { scheduleMode: 'cooldown', cooldownHours: null, distribution: autoDistribution }
    case 'fixed_time': return { scheduleMode: 'fixed_time', cooldownHours: null, scheduleTime: current.scheduleTime ?? '06:00', distribution: autoDistribution }
    case 'manual':     return { scheduleMode: 'cooldown', cooldownHours: null, distribution: 'manual_bonus' }
  }
}

function formatCooldown(hours: number | null) {
  if (!hours) return 'Uso único'
  if (hours < 24) return `${hours}h`
  if (hours % 24 === 0) return `${hours / 24} dia${hours / 24 === 1 ? '' : 's'}`
  return `${hours}h`
}

export function formatPackSchedule(pack: { scheduleMode?: string; scheduleTime?: string | null; cooldownHours?: number | null; cumulative?: boolean }) {
  if (pack.scheduleMode === 'fixed_time') return `⏰ ${pack.scheduleTime ?? '06:00'}${pack.cumulative ? ' (acum.)' : ''}`
  return formatCooldown(pack.cooldownHours ?? null)
}

export function buildPackRules(pack: CollectionPack) {
  return [
    pack.allowedTypeIds.length > 0 ? `${pack.allowedTypeIds.length} tipo${pack.allowedTypeIds.length === 1 ? '' : 's'} permitido${pack.allowedTypeIds.length === 1 ? '' : 's'}` : 'Todos os tipos',
    pack.allowedRarityIds.length > 0 ? `${pack.allowedRarityIds.length} raridade${pack.allowedRarityIds.length === 1 ? '' : 's'} permitida${pack.allowedRarityIds.length === 1 ? '' : 's'}` : 'Todas as raridades',
    pack.guaranteedRarityId ? `Garante ${pack.guaranteedRarityId}` : 'Sem garantia fixa',
  ]
}

function pickRandomNote(notes: NoteRecord[]) {
  return notes[Math.floor(Math.random() * notes.length)]
}

function pickWeightedNote(notes: NoteRecord[], rarities: RarityConfig[]) {
  const availableRarities = rarities
    .filter((r) => r.odds > 0 && notes.some((n) => n.rarity === r.id))
    .map((r) => ({ ...r, weight: r.odds * 10 }))
  const totalWeight = availableRarities.reduce((sum, r) => sum + r.weight, 0)
  if (availableRarities.length === 0 || totalWeight <= 0) return pickRandomNote(notes)
  let cursor = Math.random() * totalWeight
  const selectedRarity = availableRarities.find((r) => { cursor -= r.weight; return cursor <= 0 }) ?? availableRarities[availableRarities.length - 1]
  const rarityNotes = notes.filter((n) => n.rarity === selectedRarity.id)
  return pickRandomNote(rarityNotes.length > 0 ? rarityNotes : notes)
}

export function simulatePackOpening(pack: CollectionPack, notes: NoteRecord[], rarities: RarityConfig[]): PackSimulation | null {
  const eligibleNotes = notes.filter((n) =>
    !n.disabledAt &&
    n.status !== 'preview' &&
    (pack.allowedTypeIds.length === 0 || (n.typeIds?.length ? n.typeIds : [n.typeId]).some((id) => pack.allowedTypeIds.includes(id))) &&
    (pack.allowedRarityIds.length === 0 || pack.allowedRarityIds.includes(n.rarity)),
  )
  if (eligibleNotes.length === 0) return null
  const rewards: NoteRecord[] = []
  const guaranteedPool = pack.guaranteedRarityId ? eligibleNotes.filter((n) => n.rarity === pack.guaranteedRarityId) : []
  if (pack.guaranteedRarityId && guaranteedPool.length > 0) rewards.push(pickRandomNote(guaranteedPool))
  while (rewards.length < pack.cardsPerOpen) rewards.push(pickWeightedNote(eligibleNotes, rarities))
  return { pack, rewards, eligibleCount: eligibleNotes.length, guaranteedApplied: Boolean(pack.guaranteedRarityId && guaranteedPool.length > 0) }
}
