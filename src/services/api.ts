import type {
  Collection, CollectionAccess, CollectionDailyReward, CollectionDailyStatus,
  CollectionFormData, CollectionPlayView,
  CollectionResponse,
  DailyNoteOpenResponse,
  DailyNoteStatusResponse,
  Note,
  NoteFormData,
  NoteRecord,
  OpenPackResponse,
  PackOddsResponse,
  PackStatusResponse,
  PartnerReader,
  RarityConfig,
  NoteTypeConfig,
  StatsResponse,
} from '../types/note'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''
const API_SECRET = import.meta.env.VITE_API_SECRET ?? ''

let authToken = ''
let redirectingToLogin = false

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
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(API_SECRET ? { 'x-api-key': API_SECRET } : {}),
    },
    ...init,
  })

  if (response.status === 401 && !url.startsWith('/auth/')) {
    handleUnauthorized()
    throw new Error('Sessão expirada. Faça login novamente.')
  }

  if (!response.ok) {
    const payload = (await response.json()) as { message?: string; error?: string }
    throw new Error(payload.message ?? payload.error ?? 'Erro inesperado na API.')
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
  register: (name: string, email: string, password: string, inviteCode?: string) =>
    request<{ id: string; name: string; role: string; coupleCode?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, ...(inviteCode ? { inviteCode } : {}) }),
    }),
  me: () => request<{ id: string; name: string; role: string; coupleCode?: string; inviteEmail?: string }>('/auth/me'),
  setInviteEmail: (email: string) =>
    request<{ inviteEmail: string }>('/auth/invite-email', {
      method: 'PUT',
      body: JSON.stringify({ email }),
    }),

  getNotes: () => request<NoteRecord[]>('/api/notes'),
  createNote: (data: NoteFormData) =>
    request<NoteRecord>('/api/notes', { method: 'POST', body: JSON.stringify(data) }),
  updateNote: (id: string, data: Partial<NoteFormData>) =>
    request<NoteRecord>(`/api/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNote: (id: string) =>
    request<{ deleted: boolean }>(`/api/notes/${id}`, { method: 'DELETE' }),

  getPartners: () => request<PartnerReader[]>('/api/partner'),

  listCollections: () => request<Collection[]>('/api/collections'),
  createCollection: (data: CollectionFormData) =>
    request<Collection>('/api/collections', { method: 'POST', body: JSON.stringify(data) }),
  updateCollection: (id: string, data: Partial<CollectionFormData>) =>
    request<Collection>(`/api/collections/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCollection: (id: string) =>
    request<{ deleted: boolean }>(`/api/collections/${id}`, { method: 'DELETE' }),

  listCollectionAccess: (cid: string) =>
    request<CollectionAccess[]>(`/api/collections/${cid}/access`),
  grantAccess: (cid: string, email: string) =>
    request<CollectionAccess>(`/api/collections/${cid}/access`, { method: 'POST', body: JSON.stringify({ email }) }),
  revokeAccess: (cid: string, email: string) =>
    request<{ revoked: boolean }>(`/api/collections/${cid}/access/${encodeURIComponent(email)}`, { method: 'DELETE' }),

  getCollectionNotes: (cid: string) => request<NoteRecord[]>(`/api/collections/${cid}/notes`),
  createCollectionNote: (cid: string, data: NoteFormData) =>
    request<NoteRecord>(`/api/collections/${cid}/notes`, { method: 'POST', body: JSON.stringify(data) }),
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

  getCollectionPlay: (cid: string) => request<CollectionPlayView>(`/api/collections/${cid}/play`),
  getCollectionDailyStatus: (cid: string) =>
    request<CollectionDailyStatus>(`/api/collections/${cid}/daily/status`),
  openCollectionDaily: (cid: string) =>
    request<{ reward: CollectionDailyReward; status: CollectionDailyStatus }>(
      `/api/collections/${cid}/daily/open`, { method: 'POST', body: JSON.stringify({}) }
    ),

  getCollection: () => request<CollectionResponse>('/api/collection'),
  getStats: () => request<StatsResponse>('/api/stats'),
  getPackStatus: () => request<PackStatusResponse>('/api/packs/status'),
  getPackOdds: () => request<PackOddsResponse>('/api/packs/odds'),
  getDailyNoteStatus: () => request<DailyNoteStatusResponse>('/api/daily-note/status'),
  getNoteById: (id: string) => request<Note>(`/api/notes/${id}`),
  openPack: () =>
    request<OpenPackResponse>('/api/packs/open', { method: 'POST', body: JSON.stringify({}) }),
  openDailyNote: () =>
    request<DailyNoteOpenResponse>('/api/daily-note/open', { method: 'POST', body: JSON.stringify({}) }),
  setFavorite: (id: string, favorite: boolean) =>
    request<Note>(`/api/notes/${id}/favorite`, {
      method: 'PATCH',
      body: JSON.stringify({ favorite }),
    }),

  getRarities: () => request<RarityConfig[]>('/api/rarities'),
  createRarity: (data: Omit<RarityConfig, 'createdAt' | 'updatedAt'>) =>
    request<RarityConfig>('/api/rarities', { method: 'POST', body: JSON.stringify(data) }),
  updateRarity: (id: string, data: Partial<RarityConfig>) =>
    request<RarityConfig>(`/api/rarities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRarity: (id: string) =>
    request<{ deleted: boolean }>(`/api/rarities/${id}`, { method: 'DELETE' }),

  getTypes: () => request<NoteTypeConfig[]>('/api/types'),
  createType: (data: Omit<NoteTypeConfig, 'createdAt' | 'updatedAt'>) =>
    request<NoteTypeConfig>('/api/types', { method: 'POST', body: JSON.stringify(data) }),
  updateType: (id: string, data: Partial<NoteTypeConfig>) =>
    request<NoteTypeConfig>(`/api/types/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteType: (id: string) =>
    request<{ deleted: boolean }>(`/api/types/${id}`, { method: 'DELETE' }),
}
