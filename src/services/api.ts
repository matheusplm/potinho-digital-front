import type {
  Collection,
  CollectionAccess,
  CollectionAchievement,
  CollectionAchievementFormData,
  CollectionDailyReward,
  CollectionDailyStatus,
  CollectionFormData,
  CollectionNoteView,
  CollectionPack,
  CollectionPackFormData,
  CollectionPlayView,
  NoteFormData,
  NoteRecord,
  NoteTypeConfig,
  PackStatusResponse,
  RarityConfig,
  ReaderAchievementsResponse,
} from '../types/note'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''
const API_SECRET = import.meta.env.VITE_API_SECRET ?? ''
const ACCESS_PACKS_KEY = 'potinho-access-packs'

let authToken = ''
let redirectingToLogin = false

export class ApiRequestError extends Error {
  constructor(message: string, public status: number, public availableAt?: string, public code?: string) {
    super(message)
  }
}

const FRIENDLY_ERROR_MESSAGES: Record<string, string> = {
  ODDS_MUST_SUM_100: 'A soma das chances das raridades não pode passar de 100%.',
  RARITY_ALREADY_EXISTS: 'Já existe uma raridade com esse identificador.',
  VALIDATION_ERROR: 'Dados inválidos. Verifique os campos e tente novamente.',
  INVALID_JSON: 'JSON inválido. Revise o formato e tente novamente.',
  INVALID_NOTE_CONFIG: 'Algum bilhete usa raridade ou tipo que não existe nessa coleção.',
  PACK_LIMIT_REACHED: 'Você já abriu este pacotinho o máximo de vezes permitido.',
  PACK_ON_COOLDOWN: 'Pacotinho ainda em cooldown.',
  DAILY_ALREADY_OPENED: 'O pacotinho do dia já foi aberto. Volte amanhã!',
  NO_ELIGIBLE_NOTES: 'Esse pacotinho não tem bilhetes compatíveis agora.',
  PACK_NOT_ACTIVE: 'Este pacotinho não está disponível.',
  PACK_NOT_ALLOWED: 'Este pacotinho não está liberado para você.',
}

function normalizeEmail(email: string) {
  return email.toLowerCase().trim()
}

function readAccessPackStore(): Record<string, Record<string, string[]>> {
  try {
    return JSON.parse(localStorage.getItem(ACCESS_PACKS_KEY) ?? '{}') as Record<string, Record<string, string[]>>
  } catch {
    return {}
  }
}

function saveAccessPacksLocally(cid: string, email: string, packIds: string[]) {
  const store = readAccessPackStore()
  const collection = store[cid] ?? {}
  collection[normalizeEmail(email)] = [...new Set(packIds)]
  store[cid] = collection
  localStorage.setItem(ACCESS_PACKS_KEY, JSON.stringify(store))
}

function mergeLocalAccessPacks(cid: string, accesses: CollectionAccess[]) {
  const collection = readAccessPackStore()[cid] ?? {}
  return accesses.map((access) => {
    const localPackIds = collection[normalizeEmail(access.email)] ?? []
    return {
      ...access,
      packIds: [...new Set([...(access.packIds ?? []), ...localPackIds])],
    }
  })
}

export function setAuthToken(token: string) {
  authToken = token
  redirectingToLogin = false
}

function handleUnauthorized() {
  if (redirectingToLogin) return
  redirectingToLogin = true
  authToken = ''
  localStorage.removeItem('potinho-auth')
  window.location.href = '/login'
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(API_SECRET ? { 'x-api-key': API_SECRET } : {}),
  }
  if (init?.body) headers['Content-Type'] = 'application/json'

  const response = await fetch(`${BASE_URL}${url}`, {
    headers,
    ...init,
  })

  if (response.status === 401 && !url.startsWith('/auth/')) {
    handleUnauthorized()
    throw new Error('Sessão expirada. Faça login novamente.')
  }

  if (!response.ok) {
    const payload = (await response.json()) as { message?: string; error?: string; details?: unknown; availableAt?: string }
    const code = payload.error
    const message = (code && FRIENDLY_ERROR_MESSAGES[code]) ?? payload.message ?? code ?? 'Erro inesperado na API.'
    throw new ApiRequestError(message, response.status, payload.availableAt, code)
  }

  const json = await response.json()
  if (json !== null && typeof json === 'object' && 'success' in json && 'data' in json) {
    return (json as { success: boolean; data: T }).data
  }
  return json as T
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: string; name: string; role: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    request<{ id: string; name: string; role: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  me: () => request<{ id: string; name: string; role: string }>('/auth/me'),

  listCollections: () => request<Collection[]>('/api/collections'),
  createCollection: (data: CollectionFormData) =>
    request<Collection>('/api/collections', { method: 'POST', body: JSON.stringify(data) }),
  updateCollection: (id: string, data: Partial<CollectionFormData>) =>
    request<Collection>(`/api/collections/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCollection: (id: string) =>
    request<{ deleted: boolean }>(`/api/collections/${id}`, { method: 'DELETE' }),

  listCollectionAccess: async (cid: string) =>
    mergeLocalAccessPacks(cid, await request<CollectionAccess[]>(`/api/collections/${cid}/access`)),
  grantAccess: (cid: string, email: string) =>
    request<CollectionAccess>(`/api/collections/${cid}/access`, { method: 'POST', body: JSON.stringify({ email }) }),
  revokeAccess: (cid: string, email: string) =>
    request<{ revoked: boolean }>(`/api/collections/${cid}/access/${encodeURIComponent(email)}`, { method: 'DELETE' }),
  addPackOpens: (cid: string, email: string, packId: string, opens: number) =>
    request<CollectionAccess>(`/api/collections/${cid}/access/${encodeURIComponent(email)}/packs`, {
      method: 'PATCH',
      body: JSON.stringify({ packId, opens }),
    }),
  setAccessPacks: async (cid: string, email: string, packIds: string[]) => {
    try {
      const access = await request<CollectionAccess>(`/api/collections/${cid}/access/${encodeURIComponent(email)}/packs`, {
        method: 'PUT',
        body: JSON.stringify({ packIds }),
      })
      saveAccessPacksLocally(cid, email, access.packIds ?? packIds)
      return access
    } catch (error) {
      if (!(error instanceof ApiRequestError) || ![404, 405].includes(error.status)) throw error
      saveAccessPacksLocally(cid, email, packIds)
      return { collectionId: cid, email, packIds, createdAt: new Date().toISOString() }
    }
  },

  getCollectionNotes: (cid: string) => request<NoteRecord[]>(`/api/collections/${cid}/notes`),
  createCollectionNote: (cid: string, data: NoteFormData) =>
    request<NoteRecord>(`/api/collections/${cid}/notes`, { method: 'POST', body: JSON.stringify(data) }),
  importCollectionNotes: (cid: string, json: string) =>
    request<{ created: number; items: NoteRecord[] }>(`/api/collections/${cid}/notes/import`, {
      method: 'POST',
      body: JSON.stringify({ json }),
    }),
  updateCollectionNote: (cid: string, id: string, data: Partial<NoteFormData>) =>
    request<NoteRecord>(`/api/collections/${cid}/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCollectionNote: (cid: string, id: string) =>
    request<{ deleted: boolean }>(`/api/collections/${cid}/notes/${id}`, { method: 'DELETE' }),

  getCollectionRarities: (cid: string) => request<RarityConfig[]>(`/api/collections/${cid}/rarities`),
  createCollectionRarity: (cid: string, data: Omit<RarityConfig, 'createdAt' | 'updatedAt'>) =>
    request<RarityConfig>(`/api/collections/${cid}/rarities`, { method: 'POST', body: JSON.stringify(data) }),
  updateCollectionRarity: (cid: string, id: string, data: Partial<RarityConfig>) =>
    request<RarityConfig>(`/api/collections/${cid}/rarities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCollectionRarity: (cid: string, id: string) =>
    request<{ deleted: boolean }>(`/api/collections/${cid}/rarities/${id}`, { method: 'DELETE' }),

  getCollectionTypes: (cid: string) => request<NoteTypeConfig[]>(`/api/collections/${cid}/types`),
  createCollectionType: (cid: string, data: Omit<NoteTypeConfig, 'createdAt' | 'updatedAt'>) =>
    request<NoteTypeConfig>(`/api/collections/${cid}/types`, { method: 'POST', body: JSON.stringify(data) }),
  updateCollectionType: (cid: string, id: string, data: Partial<NoteTypeConfig>) =>
    request<NoteTypeConfig>(`/api/collections/${cid}/types/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCollectionType: (cid: string, id: string) =>
    request<{ deleted: boolean }>(`/api/collections/${cid}/types/${id}`, { method: 'DELETE' }),

  getCollectionPacks: (cid: string) => request<CollectionPack[]>(`/api/collections/${cid}/packs`),
  getCollectionPackStatus: (cid: string, packId: string) =>
    request<PackStatusResponse>(`/api/collections/${cid}/packs/${packId}/status`),
  createCollectionPack: (cid: string, data: CollectionPackFormData) =>
    request<CollectionPack>(`/api/collections/${cid}/packs`, { method: 'POST', body: JSON.stringify(data) }),
  updateCollectionPack: (cid: string, id: string, data: Partial<CollectionPackFormData>) =>
    request<CollectionPack>(`/api/collections/${cid}/packs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCollectionPack: (cid: string, id: string) =>
    request<{ deleted: boolean }>(`/api/collections/${cid}/packs/${id}`, { method: 'DELETE' }),

  getCollectionPlay: (cid: string) => request<CollectionPlayView>(`/api/collections/${cid}/play`),
  openCollectionDaily: (cid: string) =>
    request<{ rewards: CollectionDailyReward[]; status: CollectionDailyStatus }>(
      `/api/collections/${cid}/daily/open`, { method: 'POST', body: JSON.stringify({}) }
    ),
  openCollectionPack: (cid: string, packId: string, count = 1) =>
    request<{ rewards: CollectionDailyReward[]; status: CollectionDailyStatus }>(
      `/api/collections/${cid}/packs/${packId}/open`, { method: 'POST', body: JSON.stringify({ count }) }
    ),
  setCollectionFavorite: (cid: string, id: string, favorite: boolean) =>
    request<CollectionNoteView>(`/api/collections/${cid}/notes/${id}/favorite`, {
      method: 'PATCH',
      body: JSON.stringify({ favorite }),
    }),

  getCollectionAchievements: (cid: string) => request<CollectionAchievement[]>(`/api/collections/${cid}/achievements`),
  getReaderAchievements: (cid: string) => request<ReaderAchievementsResponse>(`/api/collections/${cid}/achievements/me`),
  createCollectionAchievement: (cid: string, data: CollectionAchievementFormData) =>
    request<CollectionAchievement>(`/api/collections/${cid}/achievements`, { method: 'POST', body: JSON.stringify(data) }),
  updateCollectionAchievement: (cid: string, id: string, data: Partial<CollectionAchievementFormData>) =>
    request<CollectionAchievement>(`/api/collections/${cid}/achievements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCollectionAchievement: (cid: string, id: string) =>
    request<{ deleted: boolean }>(`/api/collections/${cid}/achievements/${id}`, { method: 'DELETE' }),
}
