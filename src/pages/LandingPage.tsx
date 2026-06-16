import FavoriteIcon from '@mui/icons-material/Favorite'
import { Box, Chip, Divider, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useNavigate } from 'react-router-dom'
import { Button, ScrollHint } from '../components/ui'
import { backgroundThemes, colors, font, radius } from '../design-system'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`

const floatHeart = (i: number) => keyframes`
  0%   { transform: translateY(0) rotate(${i % 2 === 0 ? -6 : 5}deg); opacity: 0; }
  10%  { opacity: ${0.05 + (i % 3) * 0.015}; }
  85%  { opacity: ${0.03 + (i % 3) * 0.01}; }
  100% { transform: translateY(-100vh) rotate(${i % 2 === 0 ? 10 : -8}deg); opacity: 0; }
`

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`

const HEARTS = [
  { size: 18, left: '8%',  delay: '0s',   dur: '14s' },
  { size: 14, left: '25%', delay: '4s',   dur: '12s' },
  { size: 22, left: '55%', delay: '1.8s', dur: '16s' },
  { size: 16, left: '75%', delay: '6.5s', dur: '13s' },
  { size: 11, left: '91%', delay: '9.5s', dur: '15s' },
]

const FEATURES = [
  { emoji: '🎴', title: 'Bilhetes com raridades', desc: 'Coleção de bilhetes especiais, cada um com sua raridade e história.', color: colors.primary.main },
  { emoji: '📦', title: 'Pacotinhos para abrir', desc: 'Um pacotinho por dia mais bônus liberados por você.', color: colors.rose.main },
  { emoji: '🏆', title: 'Conquistas', desc: 'Metas e conquistas desbloqueáveis conforme a coleção cresce.', color: '#d97706' },
  { emoji: '❤️', title: 'Favoritos & álbum', desc: 'Favorite os bilhetes mais especiais e reveja tudo quando quiser.', color: colors.purple.main },
]

const STEPS = [
  { emoji: '✍️', step: 1, title: 'Escreva seus bilhetes', desc: 'Crie mensagens especiais, poemas, memórias afetivas — cada um com raridade e tipo definidos por você.', color: colors.primary.main },
  { emoji: '🎁', step: 2, title: 'Presenteie quem ama', desc: 'Libere acesso para quem vai receber — amor, amigo ou familiar. Você controla quais pacotinhos cada um pode abrir.', color: colors.rose.main },
  { emoji: '💌', step: 3, title: 'Ela descobre aos poucos', desc: 'A pessoa abre um pacotinho por dia e vai colecionando seus bilhetes de forma gradual e especial.', color: colors.purple.main },
  { emoji: '✨', step: 4, title: 'Conquistas e memórias', desc: 'Com raridades, favoritos e conquistas personalizadas, cada abertura é uma surpresa nova.', color: '#d97706' },
]

const CUSTOMIZATIONS = [
  {
    emoji: '🎨',
    title: 'Raridades 100% suas',
    desc: 'Você define quantas raridades existem, o nome de cada uma, a cor, o gradiente, o brilho e a probabilidade de aparecer nos pacotinhos.',
    color: colors.rose.main,
    bg: 'rgba(225,29,72,0.05)',
    chips: ['💎 Mítico', '🌟 Divino', '🌸 Poético', '🔥 Lendário'],
  },
  {
    emoji: '🏷️',
    title: 'Tipos de bilhete criados por você',
    desc: 'Crie categorias que façam sentido para a sua história: memórias, poesias, declarações, humor, reflexões — com emoji e cor próprios.',
    color: colors.primary.main,
    bg: 'rgba(29,78,216,0.05)',
    chips: ['💭 Memória', '✍️ Poesia', '💕 Declaração', '😄 Humor'],
  },
  {
    emoji: '📦',
    title: 'Pacotinhos com regras únicas',
    desc: 'Cada pacotinho tem categoria (diário, bônus, temático ou garantido), cooldown em horas, limite de aberturas por leitor, quais raridades e tipos podem sair — e uma raridade garantida, se quiser.',
    color: colors.purple.main,
    bg: 'rgba(124,58,237,0.05)',
    chips: ['🌙 Pack Noturno', '👑 Pack Épico', '🎯 Garantido', '💫 Surpresa'],
  },
  {
    emoji: '🏆',
    title: 'Conquistas personalizadas',
    desc: 'Defina metas com condições únicas: coletar N bilhetes, ter todos os de certa raridade, completar a coleção, favoritar X bilhetes, colecionar todos os tipos...',
    color: '#d97706',
    bg: 'rgba(217,119,6,0.05)',
    chips: ['🎯 50 bilhetes', '👑 Todos os épicos', '🌈 Rainbow', '⭐ Completo'],
  },
  {
    emoji: '🔐',
    title: 'Controle de acesso por leitor',
    desc: 'Libere pacotinhos específicos por pessoa, adicione aberturas extras individualmente e revogue o acesso quando quiser. Cada leitor pode ter uma experiência diferente.',
    color: '#0891b2',
    bg: 'rgba(8,145,178,0.05)',
    chips: ['👤 Acesso individual', '🎁 Bônus por leitor', '🔒 Revogar acesso'],
  },
]

const RARITIES = [
  { label: 'Comum',    emoji: '·',    color: '#64748b', bg: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', border: 'rgba(100,116,139,0.2)', glow: '',                              desc: 'A base da coleção.',    legendary: false },
  { label: 'Incomum',  emoji: '◆',    color: '#16a34a', bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: 'rgba(22,163,74,0.25)',  glow: '0 4px 18px rgba(22,163,74,0.1)',    desc: 'Um pouco mais especial.', legendary: false },
  { label: 'Raro',     emoji: '◆◆',   color: '#1d4ed8', bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: 'rgba(29,78,216,0.25)',  glow: '0 4px 18px rgba(29,78,216,0.12)',   desc: 'Difícil de encontrar.',   legendary: false },
  { label: 'Épico',    emoji: '◆◆◆',  color: '#7c3aed', bg: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: 'rgba(124,58,237,0.3)',  glow: '0 4px 18px rgba(124,58,237,0.15)',  desc: 'Muito especial mesmo.',   legendary: false },
  { label: 'Lendário', emoji: '★',    color: '#92400e', bg: 'linear-gradient(135deg, #fffbeb, #fef3c7, #fde68a)', border: 'rgba(245,158,11,0.4)', glow: '0 4px 22px rgba(245,158,11,0.2)', desc: 'O mais raro de todos.', legendary: true },
]

const AUDIENCES = [
  { emoji: '💑', label: 'Casais', desc: 'Bilhetes de amor e memórias do relacionamento' },
  { emoji: '👯', label: 'Amigos', desc: 'Homenagens e melhores momentos juntos' },
  { emoji: '👨‍👩‍👧', label: 'Família', desc: 'Mensagens carinhosas para datas especiais' },
]

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <Box sx={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #dbeafe 0%, #fce7f3 55%, #ede9fe 100%)',
      position: 'relative',
      overflowX: 'hidden',
      overflowY: 'auto',
    }}>
      <Box sx={{ position: 'fixed', top: -100, right: -100, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,78,216,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <Box sx={{ position: 'fixed', bottom: 100, left: -80, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(225,29,72,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      {HEARTS.map((h, i) => (
        <FavoriteIcon key={i} sx={{
          position: 'fixed', bottom: -8, left: h.left,
          fontSize: h.size, zIndex: 0,
          color: i % 2 === 0 ? '#1d4ed8' : '#e11d48',
          filter: 'blur(0.5px)',
          animation: `${floatHeart(i)} ${h.dur} ${h.delay} ease-in infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 480, mx: 'auto', px: 2.5 }}>
        <Stack alignItems="center" sx={{ pt: 8, pb: 6, animation: `${fadeIn} 0.6s ease both` }}>
          <FavoriteIcon sx={{ fontSize: 60, color: '#e11d48', filter: 'drop-shadow(0 6px 24px rgba(225,29,72,0.45))', mb: 3 }} />
          <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '3.2rem', lineHeight: 0.9, color: '#1e3a5f', textAlign: 'center', letterSpacing: '-0.5px' }}>
            Potinho
          </Typography>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '3.2rem', lineHeight: 0.9, color: '#1d4ed8', textAlign: 'center', letterSpacing: '-0.5px', mb: 1.5 }}>
            Digital
          </Typography>
          <Box sx={{ width: 52, height: 3, borderRadius: 2, background: 'linear-gradient(90deg, #1d4ed8, #e11d48)', mb: 2 }} />
          <Typography sx={{ fontFamily: font.serif, fontStyle: 'italic', fontSize: '1.05rem', color: '#1e3a5f', textAlign: 'center', mb: 0.8 }}>
            Sua memória afetiva, um bilhete por vez.
          </Typography>
          <Typography sx={{ fontSize: '0.88rem', color: colors.text.secondary, textAlign: 'center', lineHeight: 1.65, mb: 4 }}>
            Crie álbuns afetivos digitais totalmente personalizados e presenteie quem você ama com novas descobertas a cada dia.
          </Typography>
          <Stack spacing={1.2} sx={{ width: '100%', maxWidth: 300 }}>
            <Button variant="primary" fullWidth onClick={() => navigate('/register')} sx={{ py: 1.3, fontSize: '0.96rem' }}>
              Criar conta gratuita
            </Button>
            <Button variant="ghost" fullWidth onClick={() => navigate('/login')} sx={{ py: 1.1, fontSize: '0.92rem' }}>
              Já tenho conta — Entrar
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ opacity: 0.2, mb: 5 }} />
        <Box sx={{ mb: 5, animation: `${fadeIn} 0.6s 0.1s ease both` }}>
          <SectionTitle>O que é o Potinho Digital?</SectionTitle>
          <Typography sx={{ fontSize: '0.88rem', color: colors.text.secondary, lineHeight: 1.7, mb: 2.5 }}>
            Uma plataforma para criar <strong>álbuns afetivos digitais</strong> completamente personalizados. Você escreve os bilhetes, define as raridades, cria os pacotinhos e libera para quem vai receber — que abre um pacotinho por dia, como uma carta surpresa.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {FEATURES.map((f) => (
              <Box key={f.title} sx={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(14px)', border: '1.5px solid rgba(255,255,255,0.85)', borderRadius: radius.xl, p: 2 }}>
                <Box sx={{ fontSize: '1.6rem', mb: 0.8 }}>{f.emoji}</Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: f.color, mb: 0.3 }}>{f.title}</Typography>
                <Typography sx={{ fontSize: '0.72rem', color: colors.text.secondary, lineHeight: 1.55 }}>{f.desc}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ opacity: 0.2, mb: 5 }} />
        <Box sx={{ mb: 5, animation: `${fadeIn} 0.6s 0.15s ease both` }}>
          <SectionTitle>Como funciona?</SectionTitle>
          <Stack spacing={1.5}>
            {STEPS.map((s, i) => (
              <Box key={s.step} sx={{ background: 'rgba(255,255,255,0.62)', backdropFilter: 'blur(14px)', border: '1.5px solid rgba(255,255,255,0.82)', borderRadius: radius.xl, p: 2.2, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Stack alignItems="center" spacing={0.6} sx={{ flexShrink: 0, pt: 0.2 }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${s.color}55`, fontSize: '1rem' }}>
                    {s.emoji}
                  </Box>
                  {i < STEPS.length - 1 && (
                    <Box sx={{ width: 2, height: 18, background: `linear-gradient(${s.color}88, ${STEPS[i + 1].color}33)`, borderRadius: 1 }} />
                  )}
                </Stack>
                <Box sx={{ pt: 0.3 }}>
                  <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mb: 0.3 }}>
                    <Box sx={{ minWidth: 16, height: 16, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.step}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e3a5f', fontFamily: font.serif }}>{s.title}</Typography>
                  </Stack>
                  <Typography sx={{ fontSize: '0.78rem', color: colors.text.secondary, lineHeight: 1.6 }}>{s.desc}</Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

        <Divider sx={{ opacity: 0.2, mb: 5 }} />
        <Box sx={{ mb: 5, animation: `${fadeIn} 0.6s 0.2s ease both` }}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, borderRadius: radius.full, background: 'linear-gradient(90deg, rgba(29,78,216,0.1), rgba(225,29,72,0.08))', border: '1px solid rgba(29,78,216,0.15)', mb: 1.5 }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: colors.primary.main, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                100% personalizável
              </Typography>
            </Box>
            <SectionTitle>Você controla tudo</SectionTitle>
            <Typography sx={{ fontSize: '0.86rem', color: colors.text.secondary, lineHeight: 1.65 }}>
              Nada é fixo. Raridades, tipos de bilhete, pacotinhos, conquistas, temas visuais — tudo criado e configurado por você do zero.
            </Typography>
          </Box>

          <Stack spacing={2}>
            {CUSTOMIZATIONS.map((c) => (
              <Box key={c.title} sx={{ background: c.bg, backdropFilter: 'blur(14px)', border: `1.5px solid ${c.color}22`, borderLeft: `3px solid ${c.color}`, borderRadius: radius.xl, p: 2.2 }}>
                <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                  <Box sx={{ fontSize: '1.4rem', lineHeight: 1, pt: 0.2, flexShrink: 0 }}>{c.emoji}</Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: c.color, mb: 0.4, fontFamily: font.serif }}>
                      {c.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: colors.text.secondary, lineHeight: 1.6, mb: c.chips.length > 0 ? 1.2 : 0 }}>
                      {c.desc}
                    </Typography>
                    {c.chips.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                        {c.chips.map((chip) => (
                          <Chip key={chip} label={chip} size="small" sx={{ fontSize: '0.68rem', height: 22, background: `${c.color}14`, color: c.color, border: `1px solid ${c.color}28`, fontWeight: 600, '& .MuiChip-label': { px: 1 } }} />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>

        <Divider sx={{ opacity: 0.2, mb: 5 }} />
        <Box sx={{ mb: 5, animation: `${fadeIn} 0.6s 0.25s ease both` }}>
          <SectionTitle>11 temas visuais</SectionTitle>
          <Typography sx={{ fontSize: '0.85rem', color: colors.text.secondary, lineHeight: 1.65, mb: 2 }}>
            O leitor escolhe o tema que mais combina com ele — do romántico e suave ao misterioso e sombrio. A experiência visual é personalizada por quem recebe.
          </Typography>
          <Box sx={{ overflowX: 'auto', pb: 1, mx: -2.5, px: 2.5, '&::-webkit-scrollbar': { display: 'none' } }}>
            <Box sx={{ display: 'flex', gap: 1.2, width: 'max-content' }}>
              {backgroundThemes.map((t) => (
                <Box key={t.key} sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.6 }}>
                  <Box sx={{
                    width: 52, height: 70, borderRadius: radius.lg,
                    background: t.gradient,
                    border: '1.5px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 3px 12px rgba(0,0,0,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.3rem',
                  }}>
                    {t.emoji}
                  </Box>
                  <Typography sx={{ fontSize: '0.70rem', color: colors.text.secondary, fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {t.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ opacity: 0.2, mb: 5 }} />
        <Box sx={{ mb: 5, animation: `${fadeIn} 0.6s 0.3s ease both` }}>
          <SectionTitle>Raridades dos bilhetes</SectionTitle>
          <Typography sx={{ fontSize: '0.85rem', color: colors.text.secondary, lineHeight: 1.65, mb: 2.5 }}>
            Por padrão a plataforma usa 5 raridades — mas você cria as suas do zero com qualquer nome, cor e probabilidade. Abaixo, um exemplo de como ficam:
          </Typography>
          <Stack spacing={1.2}>
            {RARITIES.map((r) => (
              <Box key={r.label} sx={{ background: r.bg, border: `1.5px solid ${r.border}`, borderRadius: radius.lg, px: 2.5, py: 1.6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: r.glow || 'none', position: 'relative', overflow: 'hidden' }}>
                {r.legendary && (
                  <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 20%, rgba(253,230,138,0.28) 50%, transparent 80%)', backgroundSize: '200% auto', animation: `${shimmer} 2.5s linear infinite`, pointerEvents: 'none' }} />
                )}
                <Box>
                  <Typography sx={{ fontSize: '0.92rem', fontWeight: 700, color: r.color, fontFamily: font.serif }}>{r.label}</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: r.color, opacity: 0.65, mt: 0.1 }}>{r.desc}</Typography>
                </Box>
                <Typography sx={{ fontSize: r.label === 'Lendário' ? '1.1rem' : '0.85rem', color: r.color, opacity: 0.55 }}>{r.emoji}</Typography>
              </Box>
            ))}
          </Stack>
          <Box sx={{ mt: 1.5, px: 1.5, py: 1, borderRadius: radius.md, background: 'rgba(29,78,216,0.06)', border: '1px solid rgba(29,78,216,0.12)' }}>
            <Typography sx={{ fontSize: '0.75rem', color: colors.primary.main, fontStyle: 'italic' }}>
              ✦ Você pode renomear, recolorir, reordenar e criar quantas raridades quiser.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ opacity: 0.2, mb: 5 }} />
        <Box sx={{ mb: 5, animation: `${fadeIn} 0.6s 0.35s ease both` }}>
          <SectionTitle>Para quem é?</SectionTitle>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.2 }}>
            {AUDIENCES.map((a) => (
              <Box key={a.label} sx={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(14px)', border: '1.5px solid rgba(255,255,255,0.85)', borderRadius: radius.xl, p: 1.8, textAlign: 'center' }}>
                <Box sx={{ fontSize: '1.8rem', mb: 0.8 }}>{a.emoji}</Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e3a5f', mb: 0.3 }}>{a.label}</Typography>
                <Typography sx={{ fontSize: '0.68rem', color: colors.text.secondary, lineHeight: 1.5 }}>{a.desc}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <Box sx={{ pb: 8, animation: `${fadeIn} 0.6s 0.4s ease both` }}>
          <Box sx={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(18px)', border: '1.5px solid rgba(255,255,255,0.88)', borderRadius: radius.xl, p: 3.5, textAlign: 'center' }}>
            <FavoriteIcon sx={{ fontSize: 36, color: '#e11d48', mb: 1.5, filter: 'drop-shadow(0 4px 14px rgba(225,29,72,0.4))' }} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.55rem', color: '#1e3a5f', mb: 0.5 }}>
              Pronto para começar?
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: colors.text.secondary, lineHeight: 1.65, mb: 3 }}>
              Crie sua conta, monte sua coleção do zero e presenteie quem você ama com algo único.
            </Typography>
            <Stack spacing={1.2}>
              <Button variant="primary" fullWidth onClick={() => navigate('/register')} sx={{ py: 1.35, fontSize: '0.97rem' }}>
                Criar conta agora
              </Button>
              <Button variant="ghost" fullWidth onClick={() => navigate('/login')} sx={{ py: 1.1, fontSize: '0.9rem' }}>
                Já tenho conta — Entrar
              </Button>
            </Stack>
          </Box>
          <Typography sx={{ mt: 3, textAlign: 'center', fontSize: '0.75rem', color: 'rgba(30,58,95,0.35)', fontStyle: 'italic' }}>
            Feito com ❤️ para guardar o que importa.
          </Typography>
        </Box>

      </Box>
      <ScrollHint />
    </Box>
  )
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.3rem', color: '#1e3a5f' }}>
        {children}
      </Typography>
      <Box sx={{ mt: 0.5, width: 36, height: 2.5, borderRadius: 2, background: 'linear-gradient(90deg, #1d4ed8, #e11d48)' }} />
    </Box>
  )
}
