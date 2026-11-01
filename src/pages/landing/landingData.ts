import type { CollectionDailyReward, NoteImageLayout, NoteTypeConfig, RarityConfig } from '../../types/note'

export interface DemoNote {
  id: string
  rarity: string
  typeId: string
  title: string
  message: string
  gif?: { id: string; layout: NoteImageLayout }
}

export const DEMO_RARITIES: RarityConfig[] = [
  {
    id: 'comum', label: 'Comum', emoji: '🩶', odds: 60, order: 1,
    cardBg: '#fffdf7', textColor: '#2a241d', captionColor: '#8a7e6c',
    borderColor: '#8a7e6c', shadow: '', glowColor: '',
    chipBg: '#fffdf7', chipColor: '#5e5446',
  },
  {
    id: 'incomum', label: 'Incomum', emoji: '💚', odds: 25, order: 2,
    cardBg: '#fffdf7', textColor: '#2a241d', captionColor: '#8a7e6c',
    borderColor: '#4f7d52', shadow: '', glowColor: '',
    chipBg: '#fffdf7', chipColor: '#3a6340',
  },
  {
    id: 'raro', label: 'Raro', emoji: '💙', odds: 10, order: 3,
    cardBg: '#fffdf7', textColor: '#2a241d', captionColor: '#8a7e6c',
    borderColor: '#3d5aa8', shadow: '', glowColor: '',
    chipBg: '#fffdf7', chipColor: '#27408b',
  },
  {
    id: 'mitico', label: 'Mítico', emoji: '🔮', odds: 4, order: 4,
    cardBg: '#fffdf7', textColor: '#2a241d', captionColor: '#8a7e6c',
    borderColor: '#7a5ca8', shadow: '', glowColor: '',
    chipBg: '#fffdf7', chipColor: '#5b3f8a',
  },
  {
    id: 'lendario', label: 'Lendário', emoji: '👑', odds: 1, order: 5,
    cardBg: '#fffdf7', textColor: '#2a241d', captionColor: '#8a7e6c',
    borderColor: '#c0392b', shadow: '', glowColor: '',
    chipBg: '#fffdf7', chipColor: '#a32d22',
  },
]

export const DEMO_TYPES: NoteTypeConfig[] = [
  { id: 'declaracao', label: 'Declaração', emoji: '💕', order: 1, accentColor: '#e11d48', tagBg: 'rgba(225,29,72,0.1)', tagColor: '#be123c' },
  { id: 'memoria', label: 'Memória', emoji: '💭', order: 2, accentColor: '#6366f1', tagBg: 'rgba(99,102,241,0.1)', tagColor: '#4f46e5' },
  { id: 'poesia', label: 'Poesia', emoji: '✍️', order: 3, accentColor: '#0ea5e9', tagBg: 'rgba(14,165,233,0.1)', tagColor: '#0284c7' },
  { id: 'humor', label: 'Humor', emoji: '😄', order: 4, accentColor: '#f59e0b', tagBg: 'rgba(245,158,11,0.12)', tagColor: '#d97706' },
  { id: 'carinho', label: 'Carinho', emoji: '🤗', order: 5, accentColor: '#ec4899', tagBg: 'rgba(236,72,153,0.1)', tagColor: '#db2777' },
  { id: 'saudade', label: 'Saudade', emoji: '🌙', order: 6, accentColor: '#8b5cf6', tagBg: 'rgba(139,92,246,0.1)', tagColor: '#7c3aed' },
  { id: 'amizade', label: 'Amizade', emoji: '🫶', order: 7, accentColor: '#10b981', tagBg: 'rgba(16,185,129,0.1)', tagColor: '#059669' },
  { id: 'familia', label: 'Família', emoji: '🏡', order: 8, accentColor: '#d97706', tagBg: 'rgba(217,119,6,0.1)', tagColor: '#b45309' },
]

function note(id: number, rarity: string, typeId: string, title: string, message: string, gif?: DemoNote['gif']): DemoNote {
  return { id: `demo-${id}`, rarity, typeId, title, message, gif }
}

export const gifSrc = (id: string) => `https://media.giphy.com/media/${id}/200w.webp`

export function toReward(demo: DemoNote): CollectionDailyReward {
  return {
    id: demo.id, title: demo.title, message: demo.message, rarity: demo.rarity, typeId: demo.typeId, isNew: false,
    imageUrl: demo.gif ? gifSrc(demo.gif.id) : null, imageLayout: demo.gif?.layout ?? null,
  }
}

export const DEMO_NOTES: DemoNote[] = [
  note(1, 'lendario', 'declaracao', 'Desde você', 'Antes de você, eu achava que casa era um lugar. Hoje é qualquer canto onde você esteja rindo de uma piada que só a gente entende.', { id: '4AsBELtk803LS3dG4g', layout: 'thumb-left' }),
  note(2, 'mitico', 'memoria', 'O carro que quebrou', 'Lembra do carro morrendo no meio da estrada e a gente rindo mais do que chorando? Foi ali que eu soube: contigo até perrengue vira história boa.'),
  note(3, 'raro', 'poesia', 'Cartas de navegação', 'Seus olhos guardam mares que nunca vi, mas já naveguei mil vezes nos meus sonhos. Me deixa ancorar por aqui mais um pouquinho?'),
  note(4, 'incomum', 'humor', 'Empate técnico', 'Você rouba meu cobertor toda noite e meu coração todo dia. Placar: 1 a 1. Mas no cobertor eu estou perdendo feio.', { id: 'H5C8CevNMbpBqNqFjl', layout: 'stripe-left' }),
  note(5, 'comum', 'saudade', 'Daqui, esperando', 'Hoje o dia está devagar e eu aqui, balançando as perninhas, esperando você chegar. Vem logo, que sem você tudo tem menos graça.', { id: '5uDNFrOi6VwrkFKBaj', layout: 'circle-right' }),
  note(6, 'mitico', 'declaracao', 'Quando a gente ficar velhinho', 'Quero ser aquele casal que ainda briga pra decidir qual lado da cama é de quem. Contanto que seja contigo, no mesmo colchão.'),
  note(7, 'raro', 'familia', 'Domingo na sua casa', 'Mãe, hoje entendi que o melhor tempero da sua comida é o domingo inteiro que vem junto. Obrigada por sempre guardar meu lugar na mesa.'),
  note(8, 'comum', 'humor', 'O melhor café do mundo', 'Você faz o melhor café do mundo. Mas desconfio que só elogio pra você nunca me deixar preparar o meu.'),
  note(9, 'incomum', 'carinho', 'Contagem regressiva', 'Faltam 3 dias pra te ver e eu já olhei o relógio umas 40 vezes. O tempo resolveu andar de bicicleta com o pneu furado.', { id: 'QBd2kLB5qDmysEXre9', layout: 'circle-left' }),
  note(10, 'lendario', 'amizade', 'Dez anos depois', 'Dez anos de amizade e eu ainda não descobri como você sabe me fazer rir justo quando mais preciso. Nunca me ensina o truque.'),
  note(11, 'raro', 'carinho', 'Trouxe uma flor', 'Passei o dia pensando no que te dar e cheguei a esta conclusão: um sorriso bobo, uma flor e um abraço sem prazo de validade.', { id: 't8xgPfC5oNIRMrNooe', layout: 'thumb-right' }),
  note(12, 'raro', 'carinho', 'Sem motivo nenhum', 'Pensei em você hoje do nada. Só porque sim, só porque você existe e deixa meus dias bem mais leves.'),
]

export const RARITY_FILTERS = ['Todos', 'Comum', 'Incomum', 'Raro', 'Mítico', 'Lendário']

export const RARITY_COLOR: Record<string, string> = {
  Todos: '#2a241d', Comum: '#5e5446', Incomum: '#3a6340',
  Raro: '#27408b', Mítico: '#5b3f8a', Lendário: '#a32d22',
}

export const STEPS = [
  'Você escreve os bilhetes e escolhe a raridade de cada um.',
  'Junta tudo em pacotinhos e chama a pessoa pelo email.',
  'Ela abre um por dia, sem saber qual vem, e vai montando o álbum.',
]

export const DETAILS = [
  { title: 'Raridades', desc: 'Quantas quiser, com nome, cor e chance de sair. Do comum que aparece sempre ao lendário que sai uma vez na vida.' },
  { title: 'Tipos de bilhete', desc: 'Memória, poesia, piada interna, saudade. As categorias são as da história de vocês.' },
  { title: 'Pacotinhos', desc: 'Um por dia, bônus de fim de semana, pacote especial de aniversário. Você define o intervalo e o que pode sair.' },
  { title: 'Conquistas', desc: 'Metas que aparecem conforme o álbum cresce: juntar dez bilhetes, achar todos os raros, completar a coleção.' },
  { title: 'Quem recebe o quê', desc: 'Cada pessoa tem o próprio álbum. Dá pra liberar um pacote só pra uma, dar um bônus ou tirar o acesso.' },
]

export const AUDIENCES = ['namoro', 'amizade de dez anos', 'mãe que mora longe', 'irmão que nunca responde mensagem']
