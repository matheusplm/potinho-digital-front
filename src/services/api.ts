import type {
  CollectionResponse,
  DailyNoteOpenResponse,
  DailyNoteStatusResponse,
  Note,
  OpenPackResponse,
  PackOddsResponse,
  PackStatusResponse,
  StatsResponse,
} from '../types/note'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  })

  if (!response.ok) {
    const payload = (await response.json()) as { message?: string }
    throw new Error(payload.message ?? 'Erro inesperado na API mockada.')
  }

  return (await response.json()) as T
}

export const api = {
  getCollection: () => request<CollectionResponse>('/api/collection'),
  getStats: () => request<StatsResponse>('/api/stats'),
  getPackStatus: () => request<PackStatusResponse>('/api/packs/status'),
  getPackOdds: () => request<PackOddsResponse>('/api/packs/odds'),
  getDailyNoteStatus: () => request<DailyNoteStatusResponse>('/api/daily-note/status'),
  getNoteById: (id: string) => request<Note>(`/api/notes/${id}`),
  openPack: () =>
    request<OpenPackResponse>('/api/packs/open', {
      method: 'POST',
      body: JSON.stringify({ packType: 'daily' }),
    }),
  openDailyNote: () =>
    request<DailyNoteOpenResponse>('/api/daily-note/open', {
      method: 'POST',
      body: JSON.stringify({ source: 'home' }),
    }),
  setFavorite: (id: string, favorite: boolean) =>
    request<{ ok: boolean; note: Note }>(`/api/notes/${id}/favorite`, {
      method: 'PATCH',
      body: JSON.stringify({ favorite }),
    }),
}
