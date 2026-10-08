import { colors } from '../../design-system'

export interface DemoNote {
  id: number
  rarity: string
  legendary: boolean
  rarityColor: string
  rarityBg: string
  border: string
  glow: string
  type: string
  title: string
  content: string
  from: string
  gif?: { id: string; alt: string; bg?: string }
}

const RARITY_STYLE = {
  Lendário: { legendary: true, rarityColor: '#92400e', rarityBg: 'linear-gradient(135deg,#fffbeb,#fef3c7,#fde68a)', border: 'rgba(245,158,11,0.5)', glow: '0 8px 28px rgba(245,158,11,0.22)' },
  Épico: { legendary: false, rarityColor: '#7c3aed', rarityBg: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', border: 'rgba(124,58,237,0.35)', glow: '0 6px 22px rgba(124,58,237,0.18)' },
  Raro: { legendary: false, rarityColor: '#1d4ed8', rarityBg: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: 'rgba(29,78,216,0.28)', glow: '0 6px 20px rgba(29,78,216,0.15)' },
  Incomum: { legendary: false, rarityColor: '#16a34a', rarityBg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: 'rgba(22,163,74,0.28)', glow: '0 5px 18px rgba(22,163,74,0.12)' },
  Comum: { legendary: false, rarityColor: '#64748b', rarityBg: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', border: 'rgba(100,116,139,0.22)', glow: '' },
} as const

type DemoRarity = keyof typeof RARITY_STYLE

function note(id: number, rarity: DemoRarity, type: string, title: string, content: string, from: string, gif?: DemoNote['gif']): DemoNote {
  return { id, rarity, type, title, content, from, gif, ...RARITY_STYLE[rarity] }
}

export const gifSrc = (id: string) => `https://media.giphy.com/media/${id}/200w.webp`

export const DEMO_NOTES: DemoNote[] = [
  note(1, 'Lendário', '💕 Declaração', 'Desde você', 'Antes de você, eu achava que casa era um lugar. Hoje é qualquer canto onde você esteja rindo de uma piada que só a gente entende.', 'Davi, pra Lari', { id: '4AsBELtk803LS3dG4g', alt: 'Um coração sendo desenhado', bg: '#000' }),
  note(2, 'Épico', '💭 Memória', 'O carro que quebrou', 'Lembra do carro morrendo no meio da estrada e a gente rindo mais do que chorando? Foi ali que eu soube: contigo até perrengue vira história boa.', 'Tito, pra Nanda'),
  note(3, 'Raro', '✍️ Poesia', 'Cartas de navegação', 'Seus olhos guardam mares que nunca vi, mas já naveguei mil vezes nos meus sonhos. Me deixa ancorar por aqui mais um pouquinho?', 'Léo, pra Bia'),
  note(4, 'Incomum', '😄 Humor', 'Empate técnico', 'Você rouba meu cobertor toda noite e meu coração todo dia. Placar: 1 a 1. Mas no cobertor eu estou perdendo feio.', 'Rafa, pra Gabi', { id: 'H5C8CevNMbpBqNqFjl', alt: 'Macaquinho olhando de lado, desconfiado' }),
  note(5, 'Comum', '🌙 Saudade', 'Daqui, esperando', 'Hoje o dia está devagar e eu aqui, balançando as perninhas, esperando você chegar. Vem logo, que sem você tudo tem menos graça.', 'Nina, pra Vini', { id: '5uDNFrOi6VwrkFKBaj', alt: 'Batman sentado, balançando as pernas, com cara de tédio' }),
  note(6, 'Épico', '💕 Declaração', 'Quando a gente ficar velhinho', 'Quero ser aquele casal que ainda briga pra decidir qual lado da cama é de quem. Contanto que seja contigo, no mesmo colchão.', 'Teo, pra Clara'),
  note(7, 'Raro', '🏡 Família', 'Domingo na sua casa', 'Mãe, hoje entendi que o melhor tempero da sua comida é o domingo inteiro que vem junto. Obrigada por sempre guardar meu lugar na mesa.', 'Ju, pra mamãe'),
  note(8, 'Comum', '😄 Humor', 'O melhor café do mundo', 'Você faz o melhor café do mundo. Mas desconfio que só elogio pra você nunca me deixar preparar o meu.', 'Pedro, pra Lu'),
  note(9, 'Incomum', '🤍 Carinho', 'Contagem regressiva', 'Faltam 3 dias pra te ver e eu já olhei o relógio umas 40 vezes. O tempo resolveu andar de bicicleta com o pneu furado.', 'Gui, pra Mel', { id: 'QBd2kLB5qDmysEXre9', alt: 'Mr. Bean olhando o relógio, esperando' }),
  note(10, 'Lendário', '🫶 Amizade', 'Dez anos depois', 'Dez anos de amizade e eu ainda não descobri como você sabe me fazer rir justo quando mais preciso. Nunca me ensina o truque.', 'Bia, pra Duda'),
  note(11, 'Raro', '🤍 Carinho', 'Trouxe uma flor', 'Passei o dia pensando no que te dar e cheguei a esta conclusão: um sorriso bobo, uma flor e um abraço sem prazo de validade.', 'Caio, pra Lê', { id: 't8xgPfC5oNIRMrNooe', alt: 'Cachorro segurando uma flor' }),
]

export const RARITY_FILTERS = ['Todos', 'Comum', 'Incomum', 'Raro', 'Épico', 'Lendário']

export const RARITY_COLOR: Record<string, string> = {
  Todos: colors.primary.main, Comum: '#64748b', Incomum: '#16a34a',
  Raro: '#1d4ed8', Épico: '#7c3aed', Lendário: '#92400e',
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
