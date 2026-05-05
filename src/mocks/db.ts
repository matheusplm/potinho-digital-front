import type { Note } from '../types/note'
import { createInitialCollection } from './data'

// Estado in-memory da API mockada.
// Tudo que o "backend" precisa persistir entre requests fica aqui.
export const db: {
  collection: Note[]
  packOpensByDate: Record<string, number>
  lastDailyNoteOpenDate: string | null
} = {
  collection: createInitialCollection(),
  packOpensByDate: {},
  lastDailyNoteOpenDate: null,
}
