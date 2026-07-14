import type { CollectionNoteView } from '../../types/note'

export type SortKey = 'recent' | 'rarity' | 'az'

export const SORT_LABEL: Record<SortKey, string> = { recent: 'Recentes', rarity: 'Raridade', az: 'A-Z' }
export const SORT_CYCLE: SortKey[] = ['recent', 'rarity', 'az']

export function sortNotes(notes: CollectionNoteView[], sort: SortKey, rarityOdds: Record<string, number>) {
  const arr = [...notes]
  if (sort === 'az') return arr.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '', 'pt-BR'))
  if (sort === 'rarity') return arr.sort((a, b) => (rarityOdds[a.rarity] ?? Infinity) - (rarityOdds[b.rarity] ?? Infinity) || (a.title ?? '').localeCompare(b.title ?? '', 'pt-BR'))
  return arr.sort((a, b) => (b.obtainedAt ?? '').localeCompare(a.obtainedAt ?? ''))
}
