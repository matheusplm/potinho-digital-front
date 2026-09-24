import { api } from './api'
import type { Collection } from '../types/note'

export interface TemplatePreviewNote {
  title: string
  rarity: string
}

export interface CollectionTemplate {
  id: string
  emoji: string
  title: string
  tagline: string
  gradient: string
  accent: string
  collection: { name: string; emoji: string }
  notes: TemplatePreviewNote[]
  raritiesCount: number
  typesCount: number
  packsCount: number
}

export const COLLECTION_TEMPLATES: CollectionTemplate[] = [
  {
    id: 'amor',
    emoji: '💑',
    title: 'Para meu amor',
    tagline: 'Bilhetes românticos, saudade e memórias a dois.',
    gradient: 'linear-gradient(135deg,#fff1f2,#ffe4e6,#fbcfe8)',
    accent: '#e11d48',
    collection: { name: 'Nosso Potinho', emoji: '💙' },
    notes: [
      { title: 'Bom dia, meu amor', rarity: 'comum' },
      { title: 'Saudade boba', rarity: 'raro' },
      { title: 'Nosso primeiro encontro', rarity: 'epico' },
      { title: 'Para sempre', rarity: 'lendario' },
    ],
    raritiesCount: 4,
    typesCount: 4,
    packsCount: 2,
  },
  {
    id: 'amizade',
    emoji: '🫶',
    title: 'Para uma amizade',
    tagline: 'Gratidão, piadas internas e memórias de quem é família que a gente escolhe.',
    gradient: 'linear-gradient(135deg,#fff7ed,#ffedd5,#fde68a)',
    accent: '#d97706',
    collection: { name: 'Potinho da Amizade', emoji: '🌻' },
    notes: [
      { title: 'Que bom que você existe', rarity: 'comum' },
      { title: 'Nossa piada interna', rarity: 'raro' },
      { title: 'Aquela viagem', rarity: 'epico' },
      { title: 'Amizade rara', rarity: 'lendario' },
    ],
    raritiesCount: 4,
    typesCount: 4,
    packsCount: 2,
  },
  {
    id: 'familia',
    emoji: '🏡',
    title: 'Para a família',
    tagline: 'Um cantinho de amor, gratidão e lembranças de casa.',
    gradient: 'linear-gradient(135deg,#fff7ed,#fed7aa,#fecdd3)',
    accent: '#ea580c',
    collection: { name: 'Potinho da Família', emoji: '🏡' },
    notes: [
      { title: 'Só pra lembrar', rarity: 'comum' },
      { title: 'Obrigado por tudo', rarity: 'raro' },
      { title: 'Cheiro de infância', rarity: 'epico' },
      { title: 'Meu porto seguro', rarity: 'lendario' },
    ],
    raritiesCount: 4,
    typesCount: 4,
    packsCount: 2,
  },
]

interface TemplateCreationResult {
  collection: Collection
  inviteSent: boolean
}

export function createCollectionFromTemplate(template: CollectionTemplate, inviteEmail?: string): Promise<TemplateCreationResult> {
  return api.createCollectionFromTemplate(template.id, inviteEmail)
}
