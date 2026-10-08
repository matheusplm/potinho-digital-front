import { colors } from '../../design-system'
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
    cardBg: 'linear-gradient(135deg,#ffffff,#f8fafc)', textColor: '#334155', captionColor: '#94a3b8',
    borderColor: 'rgba(148,163,184,0.25)', shadow: '0 4px 16px rgba(15,23,42,0.06)', glowColor: '',
    chipBg: '#f1f5f9', chipColor: '#64748b',
  },
  {
    id: 'incomum', label: 'Incomum', emoji: '💚', odds: 25, order: 2,
    cardBg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', textColor: '#14532d', captionColor: '#4d7c5a',
    borderColor: 'rgba(34,197,94,0.3)', shadow: '0 4px 18px rgba(34,197,94,0.12)', glowColor: '',
    chipBg: '#dcfce7', chipColor: '#15803d',
  },
  {
    id: 'raro', label: 'Raro', emoji: '💙', odds: 10, order: 3,
    cardBg: 'linear-gradient(135deg,#eff6ff,#dbeafe)', textColor: '#1e3a8a', captionColor: '#3b6fb5',
    borderColor: 'rgba(59,130,246,0.35)', shadow: '0 6px 20px rgba(59,130,246,0.16)', glowColor: 'rgba(59,130,246,0.25)',
    chipBg: '#dbeafe', chipColor: '#1d4ed8',
  },
  {
    id: 'mitico', label: 'Mítico', emoji: '🔮', odds: 4, order: 4,
    cardBg: 'linear-gradient(135deg,#faf5ff,#f3e8ff)', textColor: '#581c87', captionColor: '#7e3aa8',
    borderColor: 'rgba(168,85,247,0.4)', shadow: '0 8px 24px rgba(168,85,247,0.2)', glowColor: 'rgba(168,85,247,0.32)',
    chipBg: '#f3e8ff', chipColor: '#7c3aed',
  },
  {
    id: 'lendario', label: 'Lendário', emoji: '👑', odds: 1, order: 5,
    cardBg: 'linear-gradient(135deg,#fff7ed,#ffe4e6)', textColor: '#9f1239', captionColor: '#be5a6f',
    borderColor: 'rgba(244,63,94,0.45)', shadow: '0 10px 28px rgba(244,63,94,0.22)', glowColor: 'rgba(251,113,133,0.4)',
    chipBg: 'linear-gradient(135deg,#fde68a,#fbcfe8)', chipColor: '#9f1239',
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
  note(9, 'incomum', 'carinho', 'Contagem regressiva', 'Faltam 3 dias pra te ver e eu já olhei o relógio umas 40 vezes. O tempo resolveu andar de bicicleta com o pneu furado.', { id: 'QBd2kLB5qDmysEXre9', layout: 'banner' }),
  note(10, 'lendario', 'amizade', 'Dez anos depois', 'Dez anos de amizade e eu ainda não descobri como você sabe me fazer rir justo quando mais preciso. Nunca me ensina o truque.'),
  note(11, 'raro', 'carinho', 'Trouxe uma flor', 'Passei o dia pensando no que te dar e cheguei a esta conclusão: um sorriso bobo, uma flor e um abraço sem prazo de validade.', { id: 't8xgPfC5oNIRMrNooe', layout: 'thumb-right' }),
]

export const RARITY_FILTERS = ['Todos', 'Comum', 'Incomum', 'Raro', 'Mítico', 'Lendário']

export const RARITY_COLOR: Record<string, string> = {
  Todos: colors.primary.main, Comum: '#64748b', Incomum: '#16a34a',
  Raro: '#1d4ed8', Mítico: '#7c3aed', Lendário: '#be123c',
}

export const FEATURES = [
  { emoji: '🎴', title: 'Bilhetes com raridades', desc: 'Do comum ao lendário: cada bilhete tem brilho, cor e peso únicos.', color: colors.primary.main },
  { emoji: '📦', title: 'Um pacotinho por dia', desc: 'Abertura diária com antecipação e surpresa, como cartas esperadas.', color: colors.rose.main },
  { emoji: '🏆', title: 'Conquistas desbloqueáveis', desc: 'Metas personalizadas que se revelam à medida que a coleção cresce.', color: '#d97706' },
  { emoji: '❤️', title: 'Favoritos e álbum', desc: 'Favorite os mais especiais e reveja toda a coleção quando quiser.', color: colors.purple.main },
]

export const STEPS = [
  { emoji: '✍️', n: 1, title: 'Você escreve', desc: 'Crie bilhetes: memórias, poemas, declarações. Defina a raridade de cada um do seu jeito.', color: colors.primary.main },
  { emoji: '🎁', n: 2, title: 'Monta os pacotinhos', desc: 'Configure pacotinhos diários, bônus e especiais com cooldown, raridades e regras únicas.', color: colors.rose.main },
  { emoji: '💌', n: 3, title: 'Libera o acesso', desc: 'Adiciona quem vai receber pelo email. Aí é só abrir os pacotinhos e começar a colecionar.', color: colors.purple.main },
  { emoji: '✨', n: 4, title: 'A magia acontece', desc: 'Conquistas, álbum completo, favoritos: cada abertura é uma surpresa nova e especial.', color: '#d97706' },
]

export const CUSTOMIZATIONS = [
  { emoji: '🎨', title: 'Raridades 100% suas', desc: 'Você define quantas existem, o nome, a cor, o gradiente e a probabilidade de sair nos pacotinhos.', color: colors.rose.main,    bg: 'rgba(225,29,72,0.05)',    chips: ['💎 Mítico', '🌟 Divino', '🌸 Poético', '🔥 Lendário'] },
  { emoji: '🏷️', title: 'Tipos criados por você', desc: 'Categorias que façam sentido para a sua história: memórias, poesias, declarações, humor, reflexões.', color: colors.primary.main, bg: 'rgba(29,78,216,0.05)',    chips: ['💭 Memória', '✍️ Poesia', '💕 Declaração', '😄 Humor'] },
  { emoji: '📦', title: 'Pacotinhos com regras únicas', desc: 'Cooldown em horas, limite de aberturas, quais raridades podem sair, raridade garantida: você controla tudo.', color: colors.purple.main,  bg: 'rgba(124,58,237,0.05)',   chips: ['🌙 Pack Noturno', '👑 Pack Épico', '🎯 Garantido', '💫 Surpresa'] },
  { emoji: '🏆', title: 'Conquistas personalizadas', desc: 'Metas únicas: coletar N bilhetes, ter todos de uma raridade, completar a coleção, favoritar X...', color: '#d97706',            bg: 'rgba(217,119,6,0.05)',    chips: ['🎯 50 bilhetes', '👑 Todos os épicos', '🌈 Rainbow', '⭐ Completo'] },
  { emoji: '🔐', title: 'Controle por leitor', desc: 'Libere pacotinhos específicos por pessoa, adicione bônus individualmente e revogue quando quiser.', color: '#0891b2',            bg: 'rgba(8,145,178,0.05)',    chips: ['👤 Acesso individual', '🎁 Bônus extra', '🔒 Revogar'] },
]

export const AUDIENCES = [
  { emoji: '💑', label: 'Casais', desc: 'Bilhetes de amor, memórias do relacionamento e declarações que ficam para sempre.' },
  { emoji: '👯', label: 'Amigos', desc: 'Homenagens, piadas internas e os melhores momentos vividos juntos.' },
  { emoji: '👨‍👩‍👧', label: 'Família', desc: 'Mensagens carinhosas para datas especiais, aniversários e dias comuns.' },
]
