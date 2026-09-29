import type { TourEventName } from './events'

export type StepId =
  | 'welcome'
  | 'go-collections'
  | 'new-collection'
  | 'collection-form'
  | 'open-collection'
  | 'new-note'
  | 'note-form'
  | 'drafts-toggle'
  | 'drafts-bar'
  | 'release-form'
  | 'tab-packs'
  | 'packs-panel'
  | 'tab-access'
  | 'invite-form'
  | 'done'

export type Advance =
  | { kind: 'next'; label: string }
  | { kind: 'click' }
  | { kind: 'route'; test: (path: string) => boolean }
  | { kind: 'appear'; target: string }
  | { kind: 'event'; name: TourEventName }

export type Place = 'collections' | 'manage'

export interface StepContext {
  path: string
  has: (tourId: string) => boolean
}

export interface TourStep {
  id: StepId
  chapter: number
  title: string
  body: string
  advance: Advance
  target?: string | ((collectionId: string | null) => string)
  inline?: boolean
  block?: boolean
  place?: Place
  requires?: string
  fallback?: StepId
  skipWhen?: (ctx: StepContext) => boolean
  optional?: string
}

export const CHAPTERS = ['Coleção', 'Bilhete', 'Lançar', 'Pacotinhos', 'Convite']

export const isCollectionsPath = (path: string) => path === '/colecoes'
export const isManagePath = (path: string) => /^\/colecoes\/[^/]+\/gerenciar\/?$/.test(path)

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome', chapter: -1,
    title: 'Vamos criar seu primeiro potinho 💙',
    body: 'Em poucos passos você cria uma coleção, escreve um bilhete, lança pro leitor e convida alguém. É só seguir o destaque na tela.',
    advance: { kind: 'next', label: 'Bora começar' },
  },
  {
    id: 'go-collections', chapter: 0,
    title: 'Comece pelas Coleções',
    body: 'É aqui que moram os seus potinhos. Toque em Coleções.',
    target: 'nav-colecoes', block: true,
    advance: { kind: 'route', test: isCollectionsPath },
    skipWhen: ({ path }) => isCollectionsPath(path),
  },
  {
    id: 'new-collection', chapter: 0,
    title: 'Crie uma coleção nova',
    body: 'Cada coleção é um potinho de bilhetes pra uma pessoa especial. Toque em Nova coleção.',
    target: 'new-collection', block: true, place: 'collections',
    advance: { kind: 'appear', target: 'collection-form' },
  },
  {
    id: 'collection-form', chapter: 0,
    title: 'Dê a cara do seu potinho',
    body: 'Escolha um nome, um emoji e uma cor. Quando estiver do seu jeito, toque em Criar.',
    inline: true, place: 'collections',
    advance: { kind: 'event', name: 'collection-created' },
    requires: 'collection-form', fallback: 'new-collection',
  },
  {
    id: 'open-collection', chapter: 0,
    title: 'Seu potinho nasceu! Abre ele',
    body: 'Toque na coleção que você acabou de criar pra começar a encher de bilhetes.',
    target: (collectionId) => `collection-${collectionId ?? ''}`, block: true, place: 'collections',
    advance: { kind: 'route', test: isManagePath },
    skipWhen: ({ path }) => isManagePath(path),
  },
  {
    id: 'new-note', chapter: 1,
    title: 'Escreva o primeiro bilhete',
    body: 'Toque em Novo pra escrever um bilhete.',
    target: 'new-note', block: true, place: 'manage',
    advance: { kind: 'appear', target: 'note-form' },
  },
  {
    id: 'note-form', chapter: 1,
    title: 'Escreva e escolha a raridade',
    body: 'Título e mensagem são o bilhete. A raridade define a chance de ele sair no pacotinho: os comuns aparecem sempre, os lendários quase nunca. Depois toque em Criar.',
    inline: true, place: 'manage',
    advance: { kind: 'event', name: 'note-created' },
    requires: 'note-form', fallback: 'new-note',
  },
  {
    id: 'drafts-toggle', chapter: 2,
    title: 'Seu bilhete está em rascunho',
    body: 'Bilhete novo fica guardadinho até você lançar. Toque em Rascunhos.',
    target: 'drafts-toggle', block: true, place: 'manage',
    advance: { kind: 'click' },
    skipWhen: ({ has }) => has('drafts-bar'),
  },
  {
    id: 'drafts-bar', chapter: 2,
    title: 'Monte o lote e lance',
    body: 'Toque no bilhete pra marcar (ou em Selecionar todos) e depois em Lançar.',
    inline: true, place: 'manage',
    advance: { kind: 'appear', target: 'release-form' },
    requires: 'drafts-bar', fallback: 'drafts-toggle',
  },
  {
    id: 'release-form', chapter: 2,
    title: 'Hora de lançar',
    body: 'Ao lançar, o bilhete entra nos pacotinhos dos seus leitores. Se quiser, avise eles com um recado. Depois toque em Lançar agora.',
    inline: true, place: 'manage',
    advance: { kind: 'event', name: 'notes-released' },
    requires: 'release-form', fallback: 'drafts-bar',
  },
  {
    id: 'tab-packs', chapter: 3,
    title: 'Agora, os pacotinhos',
    body: 'É por eles que os bilhetes chegam. Toque em Pacotinhos.',
    target: 'tab-packs', block: true, place: 'manage',
    advance: { kind: 'click' },
    skipWhen: ({ has }) => has('packs-panel'),
  },
  {
    id: 'packs-panel', chapter: 3,
    title: 'É assim que a surpresa acontece',
    body: 'O pacotinho diário libera um bilhete novo por dia pro leitor. Você também pode criar pacotes bônus e mandar de mimo quando quiser.',
    target: 'packs-panel', block: true, place: 'manage',
    advance: { kind: 'next', label: 'Entendi' },
    requires: 'packs-panel', fallback: 'tab-packs',
  },
  {
    id: 'tab-access', chapter: 4,
    title: 'Falta só convidar',
    body: 'Toque em Acesso pra chamar quem vai abrir os pacotinhos.',
    target: 'tab-access', block: true, place: 'manage',
    advance: { kind: 'click' },
    skipWhen: ({ has }) => has('invite-form'),
  },
  {
    id: 'invite-form', chapter: 4,
    title: 'Convide quem você ama',
    body: 'Coloque o e-mail da pessoa e toque em Convidar. Ela recebe um convite pra começar a abrir os pacotinhos.',
    inline: true, place: 'manage',
    advance: { kind: 'event', name: 'invite-sent' },
    requires: 'invite-form', fallback: 'tab-access',
    optional: 'Convido depois',
  },
  {
    id: 'done', chapter: 5,
    title: 'Prontinho! 🎉',
    body: 'Seu potinho está no ar. No Início você acompanha o que a pessoa abriu e favoritou, e em Simular vê tudo do jeito que o leitor vê.',
    advance: { kind: 'next', label: 'Concluir' },
  },
]

export const EVENT_JUMP: Record<TourEventName, StepId> = {
  'collection-created': 'open-collection',
  'note-created': 'drafts-toggle',
  'notes-released': 'tab-packs',
  'invite-sent': 'done',
}

export function stepIndex(id: StepId) {
  return TOUR_STEPS.findIndex((step) => step.id === id)
}
