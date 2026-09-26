import type { AdminOverview } from '../types/admin'
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
  CollectionNotification,
  CollectionPack,
  CollectionPackFormData,
  CollectionPlayView,
  InviteDetails,
  NoteFormData,
  NoteRecord,
  NoteTypeConfig,
  NotifyConfig,
  PackStatusResponse,
  RarityConfig,
  ReaderAchievementsResponse,
  ReleaseNotesResponse,
  UpdateCollectionPackResponse,
  UserNotification,
} from '../types/note'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''
const API_SECRET = import.meta.env.VITE_API_SECRET ?? ''
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
  PACK_ALREADY_OPENING: 'Esse pacotinho acabou de ser aberto em outro lugar.',
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
  NOTE_NOT_DISABLED: 'Desative o bilhete antes de excluí-lo permanentemente.',
  ADMIN_REAUTH_REQUIRED: 'Confirme sua identidade para continuar no modo admin.',
  ADMIN_REAUTH_FAILED: 'Não deu pra confirmar que é você. Confira a senha e tente de novo.',
  ADMIN_USE_GOOGLE: 'Essa conta entra com o Google. Confirme pelo botão do Google.',
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
      let session: { refreshToken?: string }
      try {
        session = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? '{}') as { refreshToken?: string }
      } catch {
        return null
      }
      if (!session.refreshToken) return null
      const res = await send('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken: session.refreshToken }) }, '')
      if (res.status >= 500) throw new ApiRequestError('O servidor não respondeu direito. Tente novamente em instantes.', res.status)
      if (!res.ok) return null
      const json = (await readJson(res)) as { data?: { token?: string; refreshToken?: string } } | null
      const data = json?.data ?? (json as { token?: string; refreshToken?: string } | null)
      if (!data?.token) return null
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...session, token: data.token, refreshToken: data.refreshToken }))
      setAuthToken(data.token)
      return data.token
    } finally {
      refreshPromise = null
    }
  })()
  return refreshPromise
}

async function send(url: string, init: RequestInit | undefined, token: string): Promise<Response> {
  const headers: Record<string, string> = {
    ...((init?.headers ?? {}) as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(API_SECRET ? { 'x-api-key': API_SECRET } : {}),
  }
  if (init?.body) headers['Content-Type'] = 'application/json'
  try {
    return await fetch(`${BASE_URL}${url}`, { ...init, headers })
  } catch {
    throw new ApiRequestError('Não foi possível conectar. Verifique sua internet e tente novamente.', 0, undefined, 'NETWORK_ERROR')
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response = await send(url, init, authToken)

  if (response.status === 401 && !url.startsWith('/auth/')) {
    const newToken = await tryRefresh()
    if (newToken) response = await send(url, init, newToken)
    if (!newToken || response.status === 401) {
      handleUnauthorized()
      throw new ApiRequestError('Sessão expirada. Faça login novamente.', 401, undefined, 'UNAUTHORIZED')
    }
  }

  if (!response.ok) {
    const payload = ((await readJson(response)) ?? {}) as { message?: string; error?: string; availableAt?: string; retryAfterSec?: number }
    const code = payload.error
    const fallback = response.status >= 500 ? 'O servidor não respondeu direito. Tente novamente em instantes.' : 'Erro inesperado na API.'
    const mockMissed = import.meta.env.DEV && !BASE_URL && response.status === 404 && !code && !payload.message
    const message = mockMissed
      ? 'O modo local não respondeu. Recarregue a página com F5 normal (sem Ctrl+Shift).'
      : (code && FRIENDLY_ERROR_MESSAGES[code]) ?? payload.message ?? code ?? fallback
    throw new ApiRequestError(message, response.status, payload.availableAt, code, payload.retryAfterSec)
  }

  const json = await readJson(response)
  if (json === null) {
    throw new ApiRequestError('O servidor respondeu algo inesperado. Tente novamente em instantes.', response.status, undefined, 'INVALID_RESPONSE')
  }
  if (typeof json === 'object' && 'success' in json && 'data' in json) {
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
  googleLogin: (idToken: string) =>
    request<{ token: string; refreshToken: string; user: { id: string; name: string; role: string; email: string; onboardingDone: boolean | null } }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    }),
  logout: (refreshToken: string) =>
    request<{ ok: boolean }>('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }).catch(() => {}),
  register: (name: string, email: string, password: string, captchaToken: string, username?: string) =>
    request<{ id: string; name: string; role: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, captchaToken, ...(username ? { username } : {}) }),
    }),
  me: () => request<{ id: string; name: string; role: string; email: string; username?: string; emailVerified?: boolean; onboardingDone: boolean | null; isAdmin?: boolean }>('/auth/me'),
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
    request<CollectionAccess[]>(`/api/collections/${cid}/access`),
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
  addPackOpens: (cid: string, email: string, packId: string, opens: number, notify?: NotifyConfig) =>
    request<CollectionAccess>(`/api/collections/${cid}/access/${encodeURIComponent(email)}/packs`, {
      method: 'PATCH',
      body: JSON.stringify({ packId, opens, ...(notify ? { notify } : {}) }),
    }),

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
  disableCollectionNote: (cid: string, id: string) =>
    request<NoteRecord>(`/api/collections/${cid}/notes/${id}`, { method: 'DELETE' }),
  releaseCollectionNotes: (cid: string, noteIds: string[], notify?: NotifyConfig) =>
    request<ReleaseNotesResponse>(`/api/collections/${cid}/notes/release`, {
      method: 'POST',
      body: JSON.stringify({ noteIds, ...(notify ? { notify } : {}) }),
    }),
  getCollectionNotifications: (cid: string) =>
    request<CollectionNotification[]>(`/api/collections/${cid}/notifications`),
  getMyNotifications: () => request<UserNotification[]>('/api/notifications'),
  markNotificationRead: (cid: string, notificationId: string) =>
    request<{ read: boolean }>(`/api/notifications/${cid}/${notificationId}/read`, { method: 'PATCH' }),
  restoreCollectionNote: (cid: string, id: string) =>
    request<NoteRecord>(`/api/collections/${cid}/notes/${id}/restore`, { method: 'POST' }),
  permanentlyDeleteCollectionNote: (cid: string, id: string) =>
    request<{ deleted: boolean }>(`/api/collections/${cid}/notes/${id}/permanent`, { method: 'DELETE' }),

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

  startAdminSession: (proof: { password: string } | { googleIdToken: string }) =>
    request<{ adminToken: string; expiresAt: string }>('/api/admin/session', { method: 'POST', body: JSON.stringify(proof) }),
  revokeAdminSession: (adminToken: string) =>
    send('/api/admin/session', { method: 'DELETE', headers: { 'X-Admin-Token': adminToken } }, authToken).then(() => undefined, () => undefined),
  adminOverview: (adminToken: string) =>
    request<AdminOverview>('/api/admin/overview', { headers: { 'X-Admin-Token': adminToken } }),
}
