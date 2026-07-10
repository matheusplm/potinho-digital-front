import type {
  Collection,
  CollectionAccess,
  CollectionAchievement,
  CollectionAchievementFormData,
  CollectionDailyReward,
  CollectionDailyStatus,
  CollectionFormData,
  CollectionInvite,
  CollectionNoteView,
  CollectionPack,
  CollectionPackFormData,
  CollectionPlayView,
  InviteDetails,
  NoteFormData,
  NoteRecord,
  NoteTypeConfig,
  PackStatusResponse,
  RarityConfig,
  ReaderAchievementsResponse,
  UpdateCollectionPackResponse,
} from '../types/note'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''
const API_SECRET = import.meta.env.VITE_API_SECRET ?? ''
const ACCESS_PACKS_KEY = 'potinho-access-packs'
const AUTH_STORAGE_KEY = 'potinho-auth'

let authToken = ''
let redirectingToLogin = false
let refreshPromise: Promise<string | null> | null = null

export class ApiRequestError extends Error {
  constructor(message: string, public status: number, public availableAt?: string, public code?: string, public retryAfterSec?: number) {
    super(message)
  }
}

const FRIENDLY_ERROR_MESSAGES: Record<string, string> = {
  ODDS_MUST_SUM_100: 'A soma das chances das raridades não pode passar de 100%.',
  RARITY_ALREADY_EXISTS: 'Já existe uma raridade com esse identificador.',
  RARITY_ALREADY_EXISTS_IN_COLLECTION: 'Já existe uma raridade com esse identificador nesta coleção.',
  VALIDATION_ERROR: 'Dados inválidos. Verifique os campos e tente novamente.',
  INVALID_JSON: 'JSON inválido. Revise o formato e tente novamente.',
  INVALID_NOTE_CONFIG: 'Algum bilhete usa raridade ou tipo que não existe nessa coleção.',
  PACK_ON_COOLDOWN: 'Pacotinho ainda em cooldown.',
  DAILY_ALREADY_OPENED: 'O pacotinho do dia já foi aberto. Volte amanhã!',
  NO_ELIGIBLE_NOTES: 'Esse pacotinho não tem bilhetes compatíveis agora.',
  PACK_NOT_ACTIVE: 'Este pacotinho não está disponível.',
  PACK_NOT_ALLOWED: 'Este pacotinho não está liberado para você.',
  CAPTCHA_FAILED: 'Verificação de segurança falhou. Tente novamente.',
  EMAIL_NOT_VERIFIED: 'Email não verificado. Verifique sua caixa de entrada.',
  INVALID_TOKEN: 'Link inválido ou expirado.',
  USERNAME_ALREADY_EXISTS: 'Este nome de usuário já está em uso.',
  INVALID_CREDENTIALS: 'Email ou senha incorretos.',
  EMAIL_ALREADY_EXISTS: 'Este email já está cadastrado.',
  UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
  FORBIDDEN: 'Você não tem permissão para esta ação.',
  NOT_FOUND: 'Recurso não encontrado.',
  TOO_MANY_REQUESTS: 'Muitas tentativas seguidas. Aguarde um momento.',
  PACK_NOT_ASSIGNED: 'Este pacotinho não foi atribuído a você.',
  PACK_EXHAUSTED: 'Você já usou todas as aberturas deste pacotinho.',
  PACK_COUNT_EXCEEDED: 'Quantidade superior ao número de aberturas disponíveis.',
  PACK_ALREADY_EXISTS: 'Já existe um pacotinho com esse identificador.',
  ALREADY_HAS_ACCESS: 'Esta pessoa já tem acesso à coleção.',
  INVITE_NOT_FOUND: 'Convite não encontrado ou expirado.',
  INVITE_EXPIRED: 'Este convite expirou. Peça um novo convite ao criador da coleção.',
  INVITE_ALREADY_ACCEPTED: 'Você já aceitou este convite.',
  INVITE_ALREADY_HANDLED: 'Este convite já foi respondido.',
  INVITE_EMAIL_MISMATCH: 'Este convite foi enviado para outro email.',
  PACK_TYPE_NOT_FOUND: 'Tipo de bilhete não encontrado nesta coleção.',
  PACK_RARITY_NOT_FOUND: 'Raridade não encontrada nesta coleção.',
  PACK_GUARANTEED_RARITY_NOT_FOUND: 'Raridade garantida não encontrada nesta coleção.',
  PACK_GUARANTEED_RARITY_OUTSIDE_POOL: 'A raridade garantida precisa estar entre as raridades permitidas.',
  NO_NOTES: 'Nenhum bilhete disponível nesta coleção.',
  ALL_NOTES_COLLECTED: 'Todos os bilhetes já foram coletados!',
  NOTE_NOT_OWNED: 'Você ainda não coletou este bilhete.',
  INVALID_COUNT: 'Quantidade inválida.',
  ACHIEVEMENT_ALREADY_EXISTS: 'Já existe uma conquista com esse identificador.',
  ACHIEVEMENT_INVALID_CONDITION: 'Condição inválida para esta conquista.',
  RARITY_IN_USE: 'Essa raridade ainda está em uso por bilhetes desta coleção.',
  NOTE_ALREADY_COLLECTED: 'Este bilhete já foi coletado por leitores. Raridade e tipo não podem mudar.',
  PACK_HAS_PENDING_OPENS: 'Este pacotinho tem aberturas pendentes de leitores.',
  ACHIEVEMENT_ALREADY_UNLOCKED: 'Esta conquista já foi desbloqueada por leitores.',
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
  localStorage.removeItem(AUTH_STORAGE_KEY)
  window.location.href = '/login'
}

async function tryRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY)
      if (!raw) return null
      const session = JSON.parse(raw) as { refreshToken?: string }
      if (!session.refreshToken) return null
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(API_SECRET ? { 'x-api-key': API_SECRET } : {}),
        },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      })
      if (!res.ok) return null
      const json = await res.json()
      const data = (json?.data ?? json) as { token?: string; refreshToken?: string }
      if (!data.token) return null
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...session, token: data.token, refreshToken: data.refreshToken }))
      setAuthToken(data.token)
      return data.token
    } catch {
      return null
    } finally {
      refreshPromise = null
    }
  })()
  return refreshPromise
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
    const newToken = await tryRefresh()
    if (newToken) {
      const retryHeaders: Record<string, string> = {
        Authorization: `Bearer ${newToken}`,
        ...(API_SECRET ? { 'x-api-key': API_SECRET } : {}),
      }
      if (init?.body) retryHeaders['Content-Type'] = 'application/json'
      const retryRes = await fetch(`${BASE_URL}${url}`, { ...init, headers: retryHeaders })
      if (retryRes.ok) {
        const retryJson = await retryRes.json()
        if (retryJson !== null && typeof retryJson === 'object' && 'data' in retryJson) return (retryJson as { data: T }).data
        return retryJson as T
      }
    }
    handleUnauthorized()
    throw new Error('Sessão expirada. Faça login novamente.')
  }

  if (!response.ok) {
    const payload = (await response.json()) as { message?: string; error?: string; details?: unknown; availableAt?: string; retryAfterSec?: number }
    const code = payload.error
    const message = (code && FRIENDLY_ERROR_MESSAGES[code]) ?? payload.message ?? code ?? 'Erro inesperado na API.'
    throw new ApiRequestError(message, response.status, payload.availableAt, code, payload.retryAfterSec)
  }

  const json = await response.json()
  if (json !== null && typeof json === 'object' && 'success' in json && 'data' in json) {
    return (json as { success: boolean; data: T }).data
  }
  return json as T
}

async function requestRaw(url: string): Promise<string> {
  const headers: Record<string, string> = {
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(API_SECRET ? { 'x-api-key': API_SECRET } : {}),
  }
  const response = await fetch(`${BASE_URL}${url}`, { headers })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.text()
}

export const api = {
  login: (email: string, password: string, captchaToken: string) =>
    request<{ token: string; refreshToken: string; user: { id: string; name: string; role: string; email: string; onboardingDone: boolean | null } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, captchaToken }),
    }),
  logout: (refreshToken: string) =>
    request<{ ok: boolean }>('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }).catch(() => {}),
  register: (name: string, email: string, password: string, captchaToken: string, username?: string) =>
    request<{ id: string; name: string; role: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, captchaToken, ...(username ? { username } : {}) }),
    }),
  me: () => request<{ id: string; name: string; role: string; email: string; username?: string; emailVerified?: boolean; onboardingDone: boolean | null }>('/auth/me'),
  markOnboardingDone: () => request<{ ok: boolean }>('/auth/onboarding-done', { method: 'PATCH' }),
  updateMe: (data: { name?: string; username?: string }) =>
    request<{ id: string; name: string; email: string; username?: string }>('/auth/me', { method: 'PATCH', body: JSON.stringify(data) }),
  verifyEmail: (token: string) =>
    request<{ token: string; refreshToken: string; user: { id: string; name: string; role: string; email: string; username?: string; onboardingDone: boolean | null } }>('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) }),
  resendVerification: (email: string) =>
    request<{ ok: boolean }>('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) }),
  forgotPassword: (email: string, captchaToken: string) =>
    request<{ ok: boolean }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email, captchaToken }) }),
  resetPassword: (token: string, newPassword: string) =>
    request<{ ok: boolean }>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ ok: boolean }>('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),
  changeEmail: (newEmail: string, password: string) =>
    request<{ ok: boolean }>('/auth/change-email', { method: 'POST', body: JSON.stringify({ newEmail, password }) }),
  confirmEmailChange: (token: string) =>
    request<{ ok: boolean; email?: string }>('/auth/confirm-email-change', { method: 'POST', body: JSON.stringify({ token }) }),
  checkUsername: (username: string) =>
    request<{ available: boolean }>(`/auth/check-username?username=${encodeURIComponent(username)}`),

  listCollections: () => request<Collection[]>('/api/collections'),
  createCollection: (data: CollectionFormData) =>
    request<Collection>('/api/collections', { method: 'POST', body: JSON.stringify(data) }),
  createCollectionFromTemplate: (templateId: string, inviteEmail?: string) =>
    request<{ collection: Collection; inviteSent: boolean }>('/api/collections/from-template', {
      method: 'POST',
      body: JSON.stringify({ templateId, ...(inviteEmail ? { inviteEmail } : {}) }),
    }),
  updateCollection: (id: string, data: Partial<CollectionFormData>) =>
    request<Collection>(`/api/collections/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCollection: (id: string, options?: { force?: boolean; confirmName?: string }) => {
    const params = new URLSearchParams()
    if (options?.force) params.set('force', 'true')
    if (options?.confirmName) params.set('confirmName', options.confirmName)
    const query = params.toString()
    return request<{ deleted: boolean; trashed: { id: string; name: string }; purged: { id: string; name: string } | null }>(
      `/api/collections/${id}${query ? `?${query}` : ''}`,
      { method: 'DELETE' },
    )
  },
  getCollectionTrash: () => request<{ item: Collection | null }>('/api/collections/trash'),
  restoreCollection: (id: string) =>
    request<Collection>(`/api/collections/${id}/restore`, { method: 'POST', body: JSON.stringify({}) }),

  listCollectionAccess: async (cid: string) =>
    mergeLocalAccessPacks(cid, await request<CollectionAccess[]>(`/api/collections/${cid}/access`)),
  grantAccess: (cid: string, email: string) =>
    request<CollectionAccess>(`/api/collections/${cid}/access`, { method: 'POST', body: JSON.stringify({ email }) }),
  revokeAccess: (cid: string, email: string) =>
    request<{ revoked: boolean }>(`/api/collections/${cid}/access/${encodeURIComponent(email)}`, { method: 'DELETE' }),
  sendInvite: (cid: string, email: string) =>
    request<{ ok: boolean }>(`/api/collections/${cid}/access/${encodeURIComponent(email)}/invite`, { method: 'POST' }),
  listInvites: (cid: string) =>
    request<CollectionInvite[]>(`/api/collections/${cid}/invites`),
  cancelInvite: (cid: string, email: string) =>
    request<{ cancelled: boolean }>(`/api/collections/${cid}/invites/${encodeURIComponent(email)}`, { method: 'DELETE' }),
  getMyPendingInvites: () =>
    request<{ token: string; collectionId: string; collectionName: string; inviterName: string; expiresAt: string }[]>('/api/invites/pending'),
  getInviteDetails: (token: string) =>
    request<InviteDetails>(`/api/invite/${token}`),
  acceptInvite: (token: string) =>
    request<{ ok: boolean; collectionId: string }>(`/api/invite/${token}/accept`, { method: 'POST', body: JSON.stringify({}) }),
  rejectInvite: (token: string) =>
    request<{ ok: boolean }>(`/api/invite/${token}/reject`, { method: 'POST', body: JSON.stringify({}) }),
  getEmailPreview: (type: string) =>
    requestRaw(`/api/mail/preview?type=${encodeURIComponent(type)}`),
  getReaderView: (cid: string, email: string) =>
    request<CollectionPlayView>(`/api/collections/${cid}/access/${encodeURIComponent(email)}/view`),
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
    request<{ created: number; skipped: number; items: NoteRecord[] }>(`/api/collections/${cid}/notes/import`, {
      method: 'POST',
      body: JSON.stringify({ json }),
    }),
  updateCollectionNote: (cid: string, id: string, data: Partial<NoteFormData>) =>
    request<NoteRecord>(`/api/collections/${cid}/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCollectionNote: (cid: string, id: string) =>
    request<{ deleted: boolean }>(`/api/collections/${cid}/notes/${id}`, { method: 'DELETE' }),

  getCollectionRarities: (cid: string) => request<RarityConfig[]>(`/api/collections/${cid}/rarities`),
  importCollectionRarities: (cid: string, json: string) =>
    request<{ created: number; skipped: number; items: RarityConfig[] }>(`/api/collections/${cid}/rarities/import`, {
      method: 'POST', body: JSON.stringify({ json }),
    }),
  createCollectionRarity: (cid: string, data: Omit<RarityConfig, 'createdAt' | 'updatedAt'>) =>
    request<RarityConfig>(`/api/collections/${cid}/rarities`, { method: 'POST', body: JSON.stringify(data) }),
  updateCollectionRarity: (cid: string, id: string, data: Partial<RarityConfig>) =>
    request<RarityConfig>(`/api/collections/${cid}/rarities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCollectionRarity: (cid: string, id: string) =>
    request<{ deleted: boolean }>(`/api/collections/${cid}/rarities/${id}`, { method: 'DELETE' }),

  getCollectionTypes: (cid: string) => request<NoteTypeConfig[]>(`/api/collections/${cid}/types`),
  importCollectionTypes: (cid: string, json: string) =>
    request<{ created: number; skipped: number; items: NoteTypeConfig[] }>(`/api/collections/${cid}/types/import`, {
      method: 'POST', body: JSON.stringify({ json }),
    }),
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
    request<UpdateCollectionPackResponse>(`/api/collections/${cid}/packs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCollectionPack: (cid: string, id: string) =>
    request<{ deleted: boolean }>(`/api/collections/${cid}/packs/${id}`, { method: 'DELETE' }),

  getCollectionPlay: (cid: string) => request<CollectionPlayView>(`/api/collections/${cid}/play`),
  openCollectionPack: (cid: string, packId: string, count = 1) =>
    request<{ rewards: CollectionDailyReward[]; status: CollectionDailyStatus }>(
      `/api/collections/${cid}/packs/${packId}/open`, { method: 'POST', body: JSON.stringify({ count }) }
    ),
  setCollectionFavorite: (cid: string, id: string, favorite: boolean) =>
    request<CollectionNoteView>(`/api/collections/${cid}/notes/${id}/favorite`, {
      method: 'PATCH',
      body: JSON.stringify({ favorite }),
    }),

  subscribePush: (data: { endpoint: string; keys: { p256dh: string; auth: string } }) =>
    request<{ success: boolean }>('/api/push/subscribe', { method: 'POST', body: JSON.stringify(data) }),
  unsubscribePush: (endpoint: string) =>
    request<{ success: boolean }>('/api/push/unsubscribe', { method: 'DELETE', body: JSON.stringify({ endpoint }) }),

  getCollectionAchievements: (cid: string) => request<CollectionAchievement[]>(`/api/collections/${cid}/achievements`),
  getReaderAchievements: (cid: string) => request<ReaderAchievementsResponse>(`/api/collections/${cid}/achievements/me`),
  createCollectionAchievement: (cid: string, data: CollectionAchievementFormData) =>
    request<CollectionAchievement>(`/api/collections/${cid}/achievements`, { method: 'POST', body: JSON.stringify(data) }),
  updateCollectionAchievement: (cid: string, id: string, data: Partial<CollectionAchievementFormData>) =>
    request<CollectionAchievement>(`/api/collections/${cid}/achievements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCollectionAchievement: (cid: string, id: string) =>
    request<{ deleted: boolean }>(`/api/collections/${cid}/achievements/${id}`, { method: 'DELETE' }),
}
