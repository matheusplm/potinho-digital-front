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
  content: string
}

export const DEMO_NOTES: DemoNote[] = [
  { id: 1, rarity: 'Lendário', legendary: true,  rarityColor: '#92400e', rarityBg: 'linear-gradient(135deg,#fffbeb,#fef3c7,#fde68a)', border: 'rgba(245,158,11,0.5)', glow: '0 8px 28px rgba(245,158,11,0.22)', type: '💕 Declaração', content: 'Você é o motivo de eu acordar feliz todo dia. Não precisaria de mais nada além de você.' },
  { id: 2, rarity: 'Épico',    legendary: false, rarityColor: '#7c3aed', rarityBg: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', border: 'rgba(124,58,237,0.35)', glow: '0 6px 22px rgba(124,58,237,0.18)', type: '💭 Memória', content: 'Lembra da nossa primeira viagem juntos? Cada detalhe ainda está guardado aqui dentro.' },
  { id: 3, rarity: 'Raro',     legendary: false, rarityColor: '#1d4ed8', rarityBg: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: 'rgba(29,78,216,0.28)',  glow: '0 6px 20px rgba(29,78,216,0.15)',  type: '✍️ Poesia', content: 'Seus olhos guardam mares que nunca vi, mas já naveguei mil vezes nos meus sonhos.' },
  { id: 4, rarity: 'Incomum',  legendary: false, rarityColor: '#16a34a', rarityBg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: 'rgba(22,163,74,0.28)',   glow: '0 5px 18px rgba(22,163,74,0.12)',  type: '😄 Humor', content: 'Você rouba meu cobertor toda noite. E meu coração todo dia. Empate técnico.' },
  { id: 5, rarity: 'Comum',    legendary: false, rarityColor: '#64748b', rarityBg: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', border: 'rgba(100,116,139,0.22)', glow: '',                                 type: '🤍 Carinho', content: 'Pensei em você hoje sem motivo nenhum. Só porque sim. Só porque você existe.' },
  { id: 6, rarity: 'Épico',    legendary: false, rarityColor: '#7c3aed', rarityBg: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', border: 'rgba(124,58,237,0.35)', glow: '0 6px 22px rgba(124,58,237,0.18)', type: '💕 Declaração', content: 'Cada momento contigo é o tipo de coisa que quero lembrar quando for velhinho.' },
  { id: 7, rarity: 'Raro',     legendary: false, rarityColor: '#1d4ed8', rarityBg: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: 'rgba(29,78,216,0.28)',  glow: '0 6px 20px rgba(29,78,216,0.15)',  type: '💭 Memória', content: 'Aquela tarde de chuva assistindo série foi uma das melhores da minha vida inteira.' },
  { id: 8, rarity: 'Comum',    legendary: false, rarityColor: '#64748b', rarityBg: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', border: 'rgba(100,116,139,0.22)', glow: '',                                 type: '😄 Humor', content: 'Você faz o melhor café do mundo. Mas talvez eu só diga isso pra não preparar o meu.' },
  { id: 9, rarity: 'Incomum',  legendary: false, rarityColor: '#16a34a', rarityBg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: 'rgba(22,163,74,0.28)',   glow: '0 5px 18px rgba(22,163,74,0.12)',  type: '🤍 Carinho', content: 'Obrigado por existir na minha vida. Isso muda tudo, sabe?' },
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
