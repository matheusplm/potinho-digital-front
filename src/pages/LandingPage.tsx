import FavoriteIcon from '@mui/icons-material/Favorite'
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined'
import { Box, Chip, Stack, Typography, useMediaQuery } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, ScrollHint } from '../components/ui'
import { backgroundThemes, colors, font, radius, shadow } from '../design-system'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
`
const fadeInRight = keyframes`
  from { opacity: 0; transform: translateX(28px); }
  to   { opacity: 1; transform: translateX(0); }
`
const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(4deg); }
  50%       { transform: translateY(-10px) rotate(4deg); }
`
const floatMid = keyframes`
  0%, 100% { transform: translateY(0px) rotate(-4deg); }
  50%       { transform: translateY(-7px) rotate(-4deg); }
`
const floatBack = keyframes`
  0%, 100% { transform: translateY(0px) rotate(-10deg); }
  50%       { transform: translateY(-5px) rotate(-10deg); }
`

interface DemoNote {
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

const DEMO_NOTES: DemoNote[] = [
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

const RARITY_FILTERS = ['Todos', 'Comum', 'Incomum', 'Raro', 'Épico', 'Lendário']
const RARITY_COLOR: Record<string, string> = {
  Todos: colors.primary.main, Comum: '#64748b', Incomum: '#16a34a',
  Raro: '#1d4ed8', Épico: '#7c3aed', Lendário: '#92400e',
}

const FEATURES = [
  { emoji: '🎴', title: 'Bilhetes com raridades', desc: 'Do comum ao lendário — cada bilhete tem brilho, cor e peso únicos.', color: colors.primary.main },
  { emoji: '📦', title: 'Um pacotinho por dia', desc: 'Abertura diária com antecipação e surpresa, como cartas esperadas.', color: colors.rose.main },
  { emoji: '🏆', title: 'Conquistas desbloqueáveis', desc: 'Metas personalizadas que se revelam à medida que a coleção cresce.', color: '#d97706' },
  { emoji: '❤️', title: 'Favoritos e álbum', desc: 'Favorite os mais especiais e reveja toda a coleção quando quiser.', color: colors.purple.main },
]

const STEPS = [
  { emoji: '✍️', n: 1, title: 'Você escreve', desc: 'Crie bilhetes — memórias, poemas, declarações. Defina a raridade de cada um do seu jeito.', color: colors.primary.main },
  { emoji: '🎁', n: 2, title: 'Monta os pacotinhos', desc: 'Configure pacotinhos diários, bônus e especiais com cooldown, raridades e regras únicas.', color: colors.rose.main },
  { emoji: '💌', n: 3, title: 'Libera o acesso', desc: 'Adiciona quem vai receber pelo email. Ela começa a abrir os pacotinhos e colecionar.', color: colors.purple.main },
  { emoji: '✨', n: 4, title: 'Ela se apaixona', desc: 'Conquistas, álbum completo, favoritos — cada abertura é uma surpresa nova e especial.', color: '#d97706' },
]

const CUSTOMIZATIONS = [
  { emoji: '🎨', title: 'Raridades 100% suas', desc: 'Você define quantas existem, o nome, a cor, o gradiente e a probabilidade de sair nos pacotinhos.', color: colors.rose.main,    bg: 'rgba(225,29,72,0.05)',    chips: ['💎 Mítico', '🌟 Divino', '🌸 Poético', '🔥 Lendário'] },
  { emoji: '🏷️', title: 'Tipos criados por você', desc: 'Categorias que façam sentido para a sua história: memórias, poesias, declarações, humor, reflexões.', color: colors.primary.main, bg: 'rgba(29,78,216,0.05)',    chips: ['💭 Memória', '✍️ Poesia', '💕 Declaração', '😄 Humor'] },
  { emoji: '📦', title: 'Pacotinhos com regras únicas', desc: 'Cooldown em horas, limite de aberturas, quais raridades podem sair, raridade garantida — você controla tudo.', color: colors.purple.main,  bg: 'rgba(124,58,237,0.05)',   chips: ['🌙 Pack Noturno', '👑 Pack Épico', '🎯 Garantido', '💫 Surpresa'] },
  { emoji: '🏆', title: 'Conquistas personalizadas', desc: 'Metas únicas: coletar N bilhetes, ter todos de uma raridade, completar a coleção, favoritar X...', color: '#d97706',            bg: 'rgba(217,119,6,0.05)',    chips: ['🎯 50 bilhetes', '👑 Todos os épicos', '🌈 Rainbow', '⭐ Completo'] },
  { emoji: '🔐', title: 'Controle por leitor', desc: 'Libere pacotinhos específicos por pessoa, adicione bônus individualmente e revogue quando quiser.', color: '#0891b2',            bg: 'rgba(8,145,178,0.05)',    chips: ['👤 Acesso individual', '🎁 Bônus extra', '🔒 Revogar'] },
]

const AUDIENCES = [
  { emoji: '💑', label: 'Casais', desc: 'Bilhetes de amor, memórias do relacionamento e declarações que ficam para sempre.' },
  { emoji: '👯', label: 'Amigos', desc: 'Homenagens, piadas internas e os melhores momentos vividos juntos.' },
  { emoji: '👨‍👩‍👧', label: 'Família', desc: 'Mensagens carinhosas para datas especiais, aniversários e dias comuns.' },
]

function SectionTitle({ children, sub }: { children: string; sub?: string }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.45rem', color: '#1e3a5f', lineHeight: 1.2 }}>
        {children}
      </Typography>
      <Box sx={{ mt: 0.6, width: 36, height: 2.5, borderRadius: 2, background: 'linear-gradient(90deg,#1d4ed8,#e11d48)' }} />
      {sub && (
        <Typography sx={{ mt: 1.2, fontSize: '0.86rem', color: colors.text.secondary, lineHeight: 1.65 }}>
          {sub}
        </Typography>
      )}
    </Box>
  )
}

function DemoNoteCard({ note }: { note: DemoNote }) {
  return (
    <Box sx={{
      background: note.rarityBg, borderRadius: radius.xl,
      border: `1.5px solid ${note.border}`, boxShadow: note.glow || shadow.sm,
      p: 2, position: 'relative', overflow: 'hidden',
      transition: 'transform 0.18s, box-shadow 0.18s',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: note.glow ? note.glow.replace(')', ', 0.36)').replace('0.', '0.3') : shadow.md },
    }}>
      {note.legendary && (
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg,transparent 20%,rgba(253,230,138,0.35) 50%,transparent 80%)',
          backgroundSize: '200% auto', animation: `${shimmer} 2.8s linear infinite`,
          pointerEvents: 'none', borderRadius: radius.xl,
        }} />
      )}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: note.rarityColor }}>
          {note.rarity}
        </Typography>
        <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: note.rarityColor, opacity: 0.65 }}>
          {note.legendary ? '★' : '◆'}
        </Typography>
      </Stack>
      <Typography sx={{ fontFamily: font.serif, fontSize: '0.84rem', color: note.rarityColor, lineHeight: 1.6, mb: 1.2 }}>
        {note.content}
      </Typography>
      <Box sx={{
        display: 'inline-flex', alignItems: 'center', px: 0.9, py: 0.25,
        borderRadius: radius.full, background: `${note.rarityColor}12`, border: `1px solid ${note.rarityColor}20`,
      }}>
        <Typography sx={{ fontSize: '0.64rem', fontWeight: 700, color: note.rarityColor }}>
          {note.type}
        </Typography>
      </Box>
    </Box>
  )
}

function HeroCardStack() {
  return (
    <Box sx={{ position: 'relative', width: 300, height: 380, flexShrink: 0 }}>
      <Box sx={{
        position: 'absolute', top: 40, left: 40, right: 0, bottom: 0,
        background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)',
        borderRadius: radius.xl, border: '1.5px solid rgba(100,116,139,0.22)',
        boxShadow: shadow.md, p: 2.5,
        animation: `${floatBack} 4.5s ease-in-out infinite`,
      }}>
        <Typography sx={{ fontSize: '0.58rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>· Comum</Typography>
        <Typography sx={{ fontFamily: font.serif, fontSize: '0.84rem', color: '#475569', lineHeight: 1.65 }}>
          Pensei em você hoje sem motivo nenhum. Só porque sim.
        </Typography>
        <Box sx={{ mt: 1.5, display: 'inline-flex', px: 0.9, py: 0.25, borderRadius: radius.full, background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.2)' }}>
          <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b' }}>🤍 Carinho</Typography>
        </Box>
      </Box>

      <Box sx={{
        position: 'absolute', top: 20, left: 20, right: 0, bottom: 0,
        background: 'linear-gradient(135deg,#eff6ff,#dbeafe)',
        borderRadius: radius.xl, border: '1.5px solid rgba(29,78,216,0.28)',
        boxShadow: '0 8px 32px rgba(29,78,216,0.15)', p: 2.5,
        animation: `${floatMid} 4s ease-in-out infinite`,
      }}>
        <Typography sx={{ fontSize: '0.58rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>◆◆ Raro</Typography>
        <Typography sx={{ fontFamily: font.serif, fontSize: '0.84rem', color: '#1e40af', lineHeight: 1.65 }}>
          Seus olhos guardam mares que nunca vi, mas já naveguei mil vezes.
        </Typography>
        <Box sx={{ mt: 1.5, display: 'inline-flex', px: 0.9, py: 0.25, borderRadius: radius.full, background: 'rgba(29,78,216,0.1)', border: '1px solid rgba(29,78,216,0.2)' }}>
          <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#1d4ed8' }}>✍️ Poesia</Typography>
        </Box>
      </Box>

      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(135deg,#fffbeb,#fef3c7,#fde68a)',
        borderRadius: radius.xl, border: '2px solid rgba(245,158,11,0.5)',
        boxShadow: '0 12px 40px rgba(245,158,11,0.25)', p: 2.5, overflow: 'hidden',
        animation: `${float} 3.5s ease-in-out infinite`,
      }}>
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg,transparent 20%,rgba(253,230,138,0.38) 50%,transparent 80%)',
          backgroundSize: '200% auto', animation: `${shimmer} 2.5s linear infinite`,
          pointerEvents: 'none',
        }} />
        <Typography sx={{ fontSize: '0.58rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>★ Lendário</Typography>
        <Typography sx={{ fontFamily: font.serif, fontSize: '0.84rem', color: '#78350f', lineHeight: 1.65 }}>
          Você é o motivo de eu acordar feliz todo dia. Não precisaria de mais nada.
        </Typography>
        <Box sx={{ mt: 1.5, display: 'inline-flex', px: 0.9, py: 0.25, borderRadius: radius.full, background: 'rgba(146,64,14,0.12)', border: '1px solid rgba(146,64,14,0.2)' }}>
          <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#92400e' }}>💕 Declaração</Typography>
        </Box>
      </Box>
    </Box>
  )
}

export function LandingPage() {
  const navigate = useNavigate()
  const isDesktop = useMediaQuery('(min-width: 900px)', { noSsr: true })
  const [activeRarity, setActiveRarity] = useState('Todos')

  const visibleNotes = activeRarity === 'Todos' ? DEMO_NOTES : DEMO_NOTES.filter((n) => n.rarity === activeRarity)

  return (
    <Box sx={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg,#dbeafe 0%,#fce7f3 55%,#ede9fe 100%)',
      overflowX: 'hidden', overflowY: 'auto', position: 'relative',
    }}>
      <Box sx={{ position: 'fixed', top: -100, right: -100, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle,rgba(29,78,216,0.09) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <Box sx={{ position: 'fixed', bottom: 80, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(225,29,72,0.07) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <Box sx={{ position: 'fixed', top: '40%', right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.06) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Navbar */}
      <Box component="nav" sx={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,253,251,0.88)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        px: isDesktop ? 5 : 2.5, py: 0,
        height: isDesktop ? 64 : 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Box sx={{
            width: 32, height: 32, borderRadius: radius.md, flexShrink: 0,
            background: 'linear-gradient(135deg,#1d4ed8,#e11d48)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FavoriteIcon sx={{ fontSize: 15, color: '#fff' }} />
          </Box>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1rem', color: '#1e3a5f' }}>
            Potinho Digital
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button variant="ghost" onClick={() => navigate('/login')} sx={{ py: 0.7, px: isDesktop ? 2 : 1.2, fontSize: '0.84rem' }}>
            Entrar
          </Button>
          <Button variant="primary" onClick={() => navigate('/register')} sx={{ py: 0.7, px: isDesktop ? 2 : 1.2, fontSize: '0.84rem' }}>
            {isDesktop ? 'Criar conta grátis' : 'Criar conta'}
          </Button>
        </Stack>
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1 }}>

        {/* Hero */}
        <Box sx={{ px: isDesktop ? 5 : 2.5, pt: isDesktop ? 8 : 5, pb: isDesktop ? 9 : 6, maxWidth: isDesktop ? 1200 : 480, mx: 'auto' }}>
          {isDesktop ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignItems: 'center' }}>
              <Box sx={{ animation: `${fadeIn} 0.6s ease both` }}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, px: 1.4, py: 0.5, mb: 2.5, borderRadius: radius.full, background: 'rgba(29,78,216,0.08)', border: '1px solid rgba(29,78,216,0.18)' }}>
                  <AutoStoriesOutlinedIcon sx={{ fontSize: 13, color: colors.primary.main }} />
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: colors.primary.main, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Álbum afetivo digital
                  </Typography>
                </Box>
                <Typography component="h1" sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '3.4rem', lineHeight: 1.08, color: '#1e3a5f', letterSpacing: '-0.5px', mb: 1 }}>
                  O presente que
                </Typography>
                <Typography component="h1" sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '3.4rem', lineHeight: 1.08, color: '#1d4ed8', letterSpacing: '-0.5px', mb: 2 }}>
                  cresce todo dia.
                </Typography>
                <Box sx={{ width: 56, height: 3, borderRadius: 2, background: 'linear-gradient(90deg,#1d4ed8,#e11d48)', mb: 3 }} />
                <Typography sx={{ fontSize: '1.05rem', color: colors.text.secondary, lineHeight: 1.75, mb: 4, maxWidth: 440 }}>
                  Escreva bilhetes especiais, monte pacotinhos surpresa e presenteie quem você ama com uma nova descoberta todo dia — como um álbum de figurinhas, só que com mensagens de verdade.
                </Typography>
                <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                  <Button variant="primary" onClick={() => navigate('/register')} sx={{ py: 1.4, px: 3.5, fontSize: '0.97rem' }}>
                    Criar conta grátis
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/login')} sx={{ py: 1.4, px: 2.5, fontSize: '0.92rem' }}>
                    Já tenho conta
                  </Button>
                </Stack>
                <Typography sx={{ fontSize: '0.76rem', color: colors.text.muted }}>
                  ✓ Gratuito &nbsp;·&nbsp; ✓ Sem cartão de crédito
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', animation: `${fadeInRight} 0.7s 0.2s ease both` }}>
                <HeroCardStack />
              </Box>
            </Box>
          ) : (
            <Stack alignItems="center" sx={{ animation: `${fadeIn} 0.6s ease both` }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, px: 1.4, py: 0.5, mb: 2.5, borderRadius: radius.full, background: 'rgba(29,78,216,0.08)', border: '1px solid rgba(29,78,216,0.18)' }}>
                <AutoStoriesOutlinedIcon sx={{ fontSize: 13, color: colors.primary.main }} />
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: colors.primary.main, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Álbum afetivo digital
                </Typography>
              </Box>
              <Typography component="h1" sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '2.8rem', lineHeight: 1.0, color: '#1e3a5f', textAlign: 'center', letterSpacing: '-0.5px' }}>
                O presente que
              </Typography>
              <Typography component="h1" sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '2.8rem', lineHeight: 1.0, color: '#1d4ed8', textAlign: 'center', letterSpacing: '-0.5px', mb: 1.5 }}>
                cresce todo dia.
              </Typography>
              <Box sx={{ width: 44, height: 3, borderRadius: 2, background: 'linear-gradient(90deg,#1d4ed8,#e11d48)', mb: 2.5 }} />
              <Typography sx={{ fontSize: '0.9rem', color: colors.text.secondary, textAlign: 'center', lineHeight: 1.72, mb: 3.5, maxWidth: 310 }}>
                Escreva bilhetes, monte pacotinhos surpresa e presenteie quem você ama com novas descobertas todo dia — como um álbum de figurinhas.
              </Typography>
              <Stack spacing={1.2} sx={{ width: '100%', maxWidth: 320 }}>
                <Button variant="primary" fullWidth onClick={() => navigate('/register')} sx={{ py: 1.35, fontSize: '0.97rem' }}>
                  Criar conta grátis
                </Button>
                <Button variant="ghost" fullWidth onClick={() => navigate('/login')} sx={{ py: 1.1, fontSize: '0.9rem' }}>
                  Já tenho conta — Entrar
                </Button>
              </Stack>
              <Typography sx={{ mt: 2, fontSize: '0.74rem', color: colors.text.muted }}>
                ✓ Gratuito &nbsp;·&nbsp; ✓ Sem cartão de crédito
              </Typography>
              <Box sx={{ mt: 4, width: '100%', maxWidth: 320, position: 'relative' }}>
                <Box sx={{ position: 'absolute', top: 10, left: 10, right: 10, bottom: -10, background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', borderRadius: radius.xl, border: '1.5px solid rgba(29,78,216,0.22)' }} />
                <Box sx={{ position: 'relative' }}>
                  <DemoNoteCard note={DEMO_NOTES[0]} />
                </Box>
              </Box>
            </Stack>
          )}
        </Box>

        {/* Concept pitch */}
        <Box sx={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.8)', borderBottom: '1px solid rgba(255,255,255,0.8)', py: isDesktop ? 7 : 5, px: isDesktop ? 5 : 2.5 }}>
          <Box sx={{ maxWidth: isDesktop ? 760 : 480, mx: 'auto', textAlign: 'center', animation: `${fadeIn} 0.6s 0.1s ease both` }}>
            <Typography sx={{ fontSize: isDesktop ? '2rem' : '1.5rem', fontFamily: font.serif, fontWeight: 800, color: '#1e3a5f', lineHeight: 1.3, mb: 2 }}>
              Pense num álbum de figurinhas.
            </Typography>
            <Typography sx={{ fontSize: isDesktop ? '1.15rem' : '0.92rem', color: colors.text.secondary, lineHeight: 1.8, maxWidth: 580, mx: 'auto' }}>
              Só que em vez de figurinhas, são <strong style={{ color: '#1e3a5f' }}>bilhetes escritos por você</strong>. Com raridades, tipos e surpresas. A pessoa descobre aos poucos, abrindo um pacotinho por dia — como receber uma carta esperada todo dia.
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              {[
                { icon: <AutoStoriesOutlinedIcon sx={{ fontSize: 16 }} />, label: 'Coleção personalizável' },
                { icon: <Inventory2OutlinedIcon sx={{ fontSize: 16 }} />, label: 'Pacotinhos diários' },
                { icon: <EmojiEventsOutlinedIcon sx={{ fontSize: 16 }} />, label: 'Conquistas' },
              ].map((item) => (
                <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.7, px: 1.4, py: 0.6, borderRadius: radius.full, background: 'rgba(29,78,216,0.06)', border: '1px solid rgba(29,78,216,0.14)', color: colors.primary.main }}>
                  {item.icon}
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: colors.primary.main }}>{item.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Features */}
        <Box sx={{ py: isDesktop ? 8 : 5, px: isDesktop ? 5 : 2.5, maxWidth: isDesktop ? 1200 : 480, mx: 'auto' }}>
          <Box sx={{ textAlign: isDesktop ? 'center' : 'left', mb: 4 }}>
            <SectionTitle>O que você ganha</SectionTitle>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4,1fr)' : '1fr 1fr', gap: isDesktop ? 2 : 1.5 }}>
            {FEATURES.map((f) => (
              <Box key={f.title} sx={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(14px)', border: '1.5px solid rgba(255,255,255,0.88)', borderRadius: radius.xl, p: isDesktop ? 2.5 : 2, transition: 'transform 0.18s', '&:hover': { transform: 'translateY(-3px)' } }}>
                <Box sx={{ fontSize: isDesktop ? '2rem' : '1.6rem', mb: 1 }}>{f.emoji}</Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: f.color, mb: 0.4 }}>{f.title}</Typography>
                <Typography sx={{ fontSize: '0.74rem', color: colors.text.secondary, lineHeight: 1.6 }}>{f.desc}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Interactive demo */}
        <Box sx={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.75)', borderBottom: '1px solid rgba(255,255,255,0.75)', py: isDesktop ? 8 : 5, px: isDesktop ? 5 : 2.5 }}>
          <Box sx={{ maxWidth: isDesktop ? 1200 : 480, mx: 'auto' }}>
            {isDesktop ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 7, alignItems: 'flex-start' }}>
                <Box>
                  <SectionTitle
                    sub="Clique em uma raridade para filtrar. Cada bilhete tem visual único definido pela raridade — do comum ao lendário."
                  >
                    Veja como ficam os bilhetes
                  </SectionTitle>
                  <Stack spacing={1} sx={{ mt: 2.5 }}>
                    {RARITY_FILTERS.map((r) => (
                      <Box
                        key={r}
                        onClick={() => setActiveRarity(r)}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 1.2,
                          px: 1.6, py: 1, borderRadius: radius.lg, cursor: 'pointer',
                          background: activeRarity === r ? `${RARITY_COLOR[r]}10` : 'transparent',
                          border: `1.5px solid ${activeRarity === r ? `${RARITY_COLOR[r]}44` : 'transparent'}`,
                          transition: 'all 0.16s',
                          '&:hover': { background: `${RARITY_COLOR[r]}08` },
                        }}
                      >
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: RARITY_COLOR[r], flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: activeRarity === r ? 700 : 500, color: activeRarity === r ? RARITY_COLOR[r] : colors.text.secondary }}>
                          {r}
                        </Typography>
                        {activeRarity === r && (
                          <Box sx={{ ml: 'auto', width: 6, height: 6, borderRadius: '50%', background: RARITY_COLOR[r] }} />
                        )}
                      </Box>
                    ))}
                  </Stack>
                </Box>
                <Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 1.5 }}>
                    {visibleNotes.map((note) => (
                      <DemoNoteCard key={note.id} note={note} />
                    ))}
                  </Box>
                  {visibleNotes.length === 0 && (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                      <Typography sx={{ color: colors.text.muted, fontSize: '0.86rem' }}>Nenhum bilhete com esta raridade.</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            ) : (
              <Box>
                <SectionTitle sub="Toque em uma raridade para filtrar e veja como cada bilhete tem sua identidade visual única.">
                  Veja como ficam os bilhetes
                </SectionTitle>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 2.5 }}>
                  {RARITY_FILTERS.map((r) => (
                    <Chip
                      key={r}
                      label={r}
                      onClick={() => setActiveRarity(r)}
                      size="small"
                      sx={{
                        fontSize: '0.74rem', fontWeight: activeRarity === r ? 700 : 500,
                        background: activeRarity === r ? `${RARITY_COLOR[r]}14` : 'rgba(255,255,255,0.65)',
                        color: activeRarity === r ? RARITY_COLOR[r] : colors.text.secondary,
                        border: `1.5px solid ${activeRarity === r ? `${RARITY_COLOR[r]}40` : 'rgba(0,0,0,0.08)'}`,
                        '& .MuiChip-label': { px: 1.2 },
                      }}
                    />
                  ))}
                </Box>
                <Stack spacing={1.4}>
                  {visibleNotes.map((note) => (
                    <DemoNoteCard key={note.id} note={note} />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </Box>

        {/* How it works */}
        <Box sx={{ py: isDesktop ? 8 : 5, px: isDesktop ? 5 : 2.5, maxWidth: isDesktop ? 1200 : 480, mx: 'auto' }}>
          <Box sx={{ textAlign: isDesktop ? 'center' : 'left', mb: isDesktop ? 5 : 3 }}>
            <SectionTitle>Como funciona?</SectionTitle>
          </Box>
          {isDesktop ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 2, position: 'relative' }}>
              {STEPS.map((s, i) => (
                <Box key={s.n} sx={{ position: 'relative' }}>
                  {i < STEPS.length - 1 && (
                    <Box sx={{ position: 'absolute', top: 26, left: '50%', width: '100%', height: 2, background: `linear-gradient(90deg,${s.color}55,${STEPS[i+1].color}33)`, zIndex: 0 }} />
                  )}
                  <Stack alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ width: 52, height: 52, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 20px ${s.color}44`, fontSize: '1.4rem', mb: 2 }}>
                      {s.emoji}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 1 }}>
                      <Box sx={{ width: 18, height: 18, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff' }}>{s.n}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.94rem', fontWeight: 700, color: '#1e3a5f', fontFamily: font.serif }}>{s.title}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.78rem', color: colors.text.secondary, lineHeight: 1.65, textAlign: 'center' }}>{s.desc}</Typography>
                  </Stack>
                </Box>
              ))}
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {STEPS.map((s, i) => (
                <Box key={s.n} sx={{ background: 'rgba(255,255,255,0.62)', backdropFilter: 'blur(14px)', border: '1.5px solid rgba(255,255,255,0.82)', borderRadius: radius.xl, p: 2.2, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Stack alignItems="center" spacing={0.6} sx={{ flexShrink: 0 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${s.color}50`, fontSize: '1rem' }}>
                      {s.emoji}
                    </Box>
                    {i < STEPS.length - 1 && <Box sx={{ width: 2, height: 16, background: `linear-gradient(${s.color}88,${STEPS[i+1].color}33)`, borderRadius: 1 }} />}
                  </Stack>
                  <Box sx={{ pt: 0.3 }}>
                    <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mb: 0.4 }}>
                      <Box sx={{ minWidth: 16, height: 16, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.n}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e3a5f', fontFamily: font.serif }}>{s.title}</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.78rem', color: colors.text.secondary, lineHeight: 1.6 }}>{s.desc}</Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        {/* Customization */}
        <Box sx={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.75)', borderBottom: '1px solid rgba(255,255,255,0.75)', py: isDesktop ? 8 : 5, px: isDesktop ? 5 : 2.5 }}>
          <Box sx={{ maxWidth: isDesktop ? 1200 : 480, mx: 'auto' }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, px: 1.4, py: 0.5, borderRadius: radius.full, background: 'linear-gradient(90deg,rgba(29,78,216,0.08),rgba(225,29,72,0.06))', border: '1px solid rgba(29,78,216,0.15)', mb: 1.5 }}>
              <PaletteOutlinedIcon sx={{ fontSize: 13, color: colors.primary.main }} />
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: colors.primary.main, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                100% personalizável
              </Typography>
            </Box>
            <SectionTitle sub="Nada é fixo. Raridades, tipos, pacotinhos, conquistas, temas — tudo criado do zero por você.">
              Você controla tudo
            </SectionTitle>
            <Box sx={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(2,1fr)' : '1fr', gap: 1.8, mt: 3 }}>
              {CUSTOMIZATIONS.map((c) => (
                <Box key={c.title} sx={{ background: c.bg, backdropFilter: 'blur(14px)', border: `1.5px solid ${c.color}22`, borderLeft: `3px solid ${c.color}`, borderRadius: radius.xl, p: 2.2, transition: 'transform 0.18s', '&:hover': { transform: 'translateX(3px)' } }}>
                  <Stack direction="row" alignItems="flex-start" spacing={1.4}>
                    <Box sx={{ fontSize: '1.4rem', lineHeight: 1, pt: 0.2, flexShrink: 0 }}>{c.emoji}</Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: c.color, mb: 0.4, fontFamily: font.serif }}>{c.title}</Typography>
                      <Typography sx={{ fontSize: '0.78rem', color: colors.text.secondary, lineHeight: 1.6, mb: 1.2 }}>{c.desc}</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                        {c.chips.map((chip) => (
                          <Chip key={chip} label={chip} size="small" sx={{ fontSize: '0.68rem', height: 22, background: `${c.color}12`, color: c.color, border: `1px solid ${c.color}25`, fontWeight: 600, '& .MuiChip-label': { px: 1 } }} />
                        ))}
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Themes */}
        <Box sx={{ py: isDesktop ? 8 : 5, px: isDesktop ? 5 : 2.5, maxWidth: isDesktop ? 1200 : 480, mx: 'auto' }}>
          <SectionTitle sub="O leitor escolhe o tema que mais combina com ele — do romântico e suave ao misterioso e sombrio.">
            {`${backgroundThemes.length} temas visuais`}
          </SectionTitle>
          {isDesktop ? (
            <Box sx={{ overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
              <Box sx={{ display: 'flex', gap: 1.5, width: 'max-content' }}>
                {backgroundThemes.map((t) => (
                  <Stack key={t.key} spacing={0.8} alignItems="center">
                    <Box sx={{
                      width: 64, height: 84, borderRadius: radius.xl, background: t.gradient,
                      border: '1.5px solid rgba(255,255,255,0.65)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                      transition: 'transform 0.18s', '&:hover': { transform: 'translateY(-4px) scale(1.05)' }, cursor: 'default',
                    }}>
                      {t.emoji}
                    </Box>
                    <Typography sx={{ fontSize: '0.68rem', color: colors.text.secondary, fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {t.label}
                    </Typography>
                  </Stack>
                ))}
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, justifyContent: 'center' }}>
              {backgroundThemes.map((t) => (
                <Stack key={t.key} spacing={0.6} alignItems="center" sx={{ width: 58 }}>
                  <Box sx={{
                    width: 52, height: 68, borderRadius: radius.xl, background: t.gradient,
                    border: '1.5px solid rgba(255,255,255,0.65)', boxShadow: '0 3px 12px rgba(0,0,0,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                  }}>
                    {t.emoji}
                  </Box>
                  <Typography sx={{ fontSize: '0.62rem', color: colors.text.secondary, fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                    {t.label}
                  </Typography>
                </Stack>
              ))}
            </Box>
          )}
        </Box>

        {/* For whom */}
        <Box sx={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.75)', borderBottom: '1px solid rgba(255,255,255,0.75)', py: isDesktop ? 7 : 5, px: isDesktop ? 5 : 2.5 }}>
          <Box sx={{ maxWidth: isDesktop ? 1200 : 480, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: isDesktop ? 6 : 0, flexDirection: isDesktop ? 'row' : 'column' }}>
              <Box sx={{ flexShrink: 0, minWidth: isDesktop ? 280 : undefined, mb: isDesktop ? 0 : 3 }}>
                <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
                  <GroupOutlinedIcon sx={{ fontSize: 18, color: colors.primary.main }} />
                  <SectionTitle>Para quem é?</SectionTitle>
                </Stack>
              </Box>
              {isDesktop ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1.5, flex: 1 }}>
                  {AUDIENCES.map((a) => (
                    <Box key={a.label} sx={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(14px)', border: '1.5px solid rgba(255,255,255,0.88)', borderRadius: radius.xl, p: 2.5, textAlign: 'center' }}>
                      <Box sx={{ fontSize: '2.2rem', mb: 0.8 }}>{a.emoji}</Box>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e3a5f', mb: 0.4 }}>{a.label}</Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: colors.text.secondary, lineHeight: 1.55 }}>{a.desc}</Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Stack spacing={1.2} sx={{ width: '100%' }}>
                  {AUDIENCES.map((a) => (
                    <Box key={a.label} sx={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(14px)', border: '1.5px solid rgba(255,255,255,0.88)', borderRadius: radius.xl, p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ fontSize: '2rem', flexShrink: 0 }}>{a.emoji}</Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e3a5f', mb: 0.2 }}>{a.label}</Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: colors.text.secondary, lineHeight: 1.55 }}>{a.desc}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Box>
        </Box>

        {/* Access control highlight */}
        <Box sx={{ py: isDesktop ? 7 : 5, px: isDesktop ? 5 : 2.5 }}>
          <Box sx={{ maxWidth: isDesktop ? 900 : 480, mx: 'auto', background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(18px)', border: '1.5px solid rgba(255,255,255,0.88)', borderRadius: radius.xl, p: isDesktop ? 4 : 2.5 }}>
            <Stack direction={isDesktop ? 'row' : 'column'} spacing={isDesktop ? 4 : 2} alignItems={isDesktop ? 'center' : 'flex-start'}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: isDesktop ? 72 : 48, height: isDesktop ? 72 : 48, borderRadius: radius.xl, background: 'linear-gradient(135deg,rgba(29,78,216,0.12),rgba(225,29,72,0.08))', border: '1.5px solid rgba(29,78,216,0.15)', flexShrink: 0 }}>
                <LockOpenOutlinedIcon sx={{ fontSize: isDesktop ? 32 : 22, color: colors.primary.main }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: isDesktop ? '1.3rem' : '1.1rem', color: '#1e3a5f', mb: 0.6 }}>
                  Você decide quem recebe o quê
                </Typography>
                <Typography sx={{ fontSize: '0.84rem', color: colors.text.secondary, lineHeight: 1.7 }}>
                  Cada leitor tem sua própria experiência. Você libera pacotinhos específicos por pessoa, adiciona bônus individualmente e revoga o acesso quando quiser. Crie uma experiência diferente para cada um.
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>

        {/* CTA */}
        <Box sx={{ pb: isDesktop ? 10 : 8, px: isDesktop ? 5 : 2.5 }}>
          <Box sx={{ maxWidth: isDesktop ? 640 : 480, mx: 'auto', background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(18px)', border: '1.5px solid rgba(255,255,255,0.9)', borderRadius: radius.xl, p: isDesktop ? 5 : 3.5, textAlign: 'center' }}>
            <FavoriteIcon sx={{ fontSize: isDesktop ? 44 : 36, color: '#e11d48', mb: 1.5, filter: 'drop-shadow(0 4px 14px rgba(225,29,72,0.4))' }} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: isDesktop ? '1.9rem' : '1.55rem', color: '#1e3a5f', mb: 0.8 }}>
              Pronto para começar?
            </Typography>
            <Typography sx={{ fontSize: '0.88rem', color: colors.text.secondary, lineHeight: 1.7, mb: 3.5, maxWidth: 400, mx: 'auto' }}>
              Crie sua conta, monte sua coleção do zero e presenteie quem você ama com algo único — hoje mesmo.
            </Typography>
            {isDesktop ? (
              <Stack direction="row" spacing={1.5} justifyContent="center">
                <Button variant="primary" onClick={() => navigate('/register')} sx={{ py: 1.4, px: 3.5, fontSize: '0.97rem' }}>
                  Criar conta grátis
                </Button>
                <Button variant="ghost" onClick={() => navigate('/login')} sx={{ py: 1.4, px: 2.5, fontSize: '0.9rem' }}>
                  Entrar
                </Button>
              </Stack>
            ) : (
              <Stack spacing={1.2}>
                <Button variant="primary" fullWidth onClick={() => navigate('/register')} sx={{ py: 1.35, fontSize: '0.97rem' }}>
                  Criar conta agora
                </Button>
                <Button variant="ghost" fullWidth onClick={() => navigate('/login')} sx={{ py: 1.1, fontSize: '0.9rem' }}>
                  Já tenho conta — Entrar
                </Button>
              </Stack>
            )}
            <Typography sx={{ mt: 2.5, fontSize: '0.74rem', color: colors.text.muted }}>
              ✓ Gratuito &nbsp;·&nbsp; ✓ Sem cartão de crédito
            </Typography>
          </Box>
          <Typography sx={{ mt: 3.5, textAlign: 'center', fontSize: '0.75rem', color: 'rgba(30,58,95,0.32)', fontStyle: 'italic' }}>
            Feito com ❤️ para guardar o que importa.
          </Typography>
        </Box>

      </Box>
      <ScrollHint />
    </Box>
  )
}
