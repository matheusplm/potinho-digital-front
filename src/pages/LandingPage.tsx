import FavoriteIcon from '@mui/icons-material/Favorite'
import { Box, Divider, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { colors, font, radius } from '../design-system'

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
  {
    emoji: '🎴',
    title: 'Bilhetes com raridades',
    desc: 'Comum, Incomum, Raro, Épico e Lendário. Cada bilhete tem seu peso e seu brilho.',
    color: colors.primary.main,
  },
  {
    emoji: '📦',
    title: 'Pacotinhos diários',
    desc: 'Um pacotinho por dia para abrir, mais pacotes bônus liberados pelo criador.',
    color: colors.rose.main,
  },
  {
    emoji: '🏆',
    title: 'Conquistas',
    desc: 'Desbloqueie conquistas especiais conforme vai colecionando e explorando.',
    color: '#d97706',
  },
  {
    emoji: '❤️',
    title: 'Favoritos & álbum',
    desc: 'Favorite os bilhetes mais especiais e reveja toda a coleção quando quiser.',
    color: colors.purple.main,
  },
]

const STEPS = [
  {
    emoji: '✍️',
    step: 1,
    title: 'Escreva seus bilhetes',
    desc: 'Crie uma coleção com mensagens especiais, poemas, memórias afetivas — cada um com sua raridade.',
    color: colors.primary.main,
  },
  {
    emoji: '🎁',
    step: 2,
    title: 'Presenteie quem ama',
    desc: 'Libere acesso para a pessoa que vai receber — pode ser seu amor, um amigo ou familiar.',
    color: colors.rose.main,
  },
  {
    emoji: '💌',
    step: 3,
    title: 'Ela descobre aos poucos',
    desc: 'A pessoa abre um pacotinho por dia e vai colecionando seus bilhetes de forma gradual e especial.',
    color: colors.purple.main,
  },
  {
    emoji: '✨',
    step: 4,
    title: 'Conquistas e memórias',
    desc: 'Com raridades para colecionar, favoritos e conquistas, cada abertura é uma surpresa nova.',
    color: '#d97706',
  },
]

const RARITIES = [
  {
    label: 'Comum',
    emoji: '·',
    color: '#64748b',
    bg: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    border: 'rgba(100,116,139,0.2)',
    glow: '',
    desc: 'A base da coleção.',
  },
  {
    label: 'Incomum',
    emoji: '◆',
    color: '#16a34a',
    bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    border: 'rgba(22,163,74,0.25)',
    glow: '0 4px 18px rgba(22,163,74,0.1)',
    desc: 'Um pouco mais especial.',
  },
  {
    label: 'Raro',
    emoji: '◆◆',
    color: '#1d4ed8',
    bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    border: 'rgba(29,78,216,0.25)',
    glow: '0 4px 18px rgba(29,78,216,0.12)',
    desc: 'Difícil de encontrar.',
  },
  {
    label: 'Épico',
    emoji: '◆◆◆',
    color: '#7c3aed',
    bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
    border: 'rgba(124,58,237,0.3)',
    glow: '0 4px 18px rgba(124,58,237,0.15)',
    desc: 'Muito especial mesmo.',
  },
  {
    label: 'Lendário',
    emoji: '★',
    color: '#92400e',
    bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)',
    border: 'rgba(245,158,11,0.4)',
    glow: '0 4px 22px rgba(245,158,11,0.2)',
    desc: 'O mais raro de todos.',
    legendary: true,
  },
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

        {/* ── HERO ── */}
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
            Crie coleções de bilhetes especiais e presenteie quem você ama com novas descobertas a cada dia.
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

        {/* ── O QUE É? ── */}
        <Box sx={{ mb: 5, animation: `${fadeIn} 0.6s 0.1s ease both` }}>
          <SectionTitle>O que é o Potinho Digital?</SectionTitle>
          <Typography sx={{ fontSize: '0.88rem', color: colors.text.secondary, lineHeight: 1.7, mb: 2.5 }}>
            O Potinho Digital é uma plataforma para criar <strong>álbuns afetivos digitais</strong>. O criador escreve bilhetes com mensagens especiais, organiza por raridade e libera acesso para quem vai receber — que abre um pacotinho por dia, como uma carta surpresa.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {FEATURES.map((f) => (
              <Box key={f.title} sx={{
                background: 'rgba(255,255,255,0.68)',
                backdropFilter: 'blur(14px)',
                border: '1.5px solid rgba(255,255,255,0.85)',
                borderRadius: radius.xl,
                p: 2,
              }}>
                <Box sx={{ fontSize: '1.6rem', mb: 0.8 }}>{f.emoji}</Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: f.color, mb: 0.3 }}>
                  {f.title}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: colors.text.secondary, lineHeight: 1.55 }}>
                  {f.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ opacity: 0.2, mb: 5 }} />

        {/* ── COMO FUNCIONA ── */}
        <Box sx={{ mb: 5, animation: `${fadeIn} 0.6s 0.2s ease both` }}>
          <SectionTitle>Como funciona?</SectionTitle>
          <Stack spacing={1.5}>
            {STEPS.map((s, i) => (
              <Box key={s.step} sx={{
                background: 'rgba(255,255,255,0.62)',
                backdropFilter: 'blur(14px)',
                border: '1.5px solid rgba(255,255,255,0.82)',
                borderRadius: radius.xl,
                p: 2.2,
                display: 'flex',
                gap: 2,
                alignItems: 'flex-start',
              }}>
                <Stack alignItems="center" spacing={0.6} sx={{ flexShrink: 0, pt: 0.2 }}>
                  <Box sx={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: s.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 14px ${s.color}55`,
                    fontSize: '1rem',
                  }}>
                    {s.emoji}
                  </Box>
                  {i < STEPS.length - 1 && (
                    <Box sx={{ width: 2, height: 18, background: `linear-gradient(${s.color}88, ${STEPS[i + 1].color}33)`, borderRadius: 1 }} />
                  )}
                </Stack>
                <Box sx={{ pt: 0.3 }}>
                  <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mb: 0.3 }}>
                    <Box sx={{ minWidth: 16, height: 16, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ fontSize: '0.58rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.step}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e3a5f', fontFamily: font.serif }}>
                      {s.title}
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: '0.78rem', color: colors.text.secondary, lineHeight: 1.6 }}>
                    {s.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

        <Divider sx={{ opacity: 0.2, mb: 5 }} />

        {/* ── RARIDADES ── */}
        <Box sx={{ mb: 5, animation: `${fadeIn} 0.6s 0.3s ease both` }}>
          <SectionTitle>Raridades dos bilhetes</SectionTitle>
          <Typography sx={{ fontSize: '0.85rem', color: colors.text.secondary, lineHeight: 1.65, mb: 2.5 }}>
            Cada bilhete tem uma raridade. Quanto mais raro, mais difícil de aparecer num pacotinho — tornando cada descoberta ainda mais especial.
          </Typography>
          <Stack spacing={1.2}>
            {RARITIES.map((r) => (
              <Box key={r.label} sx={{
                background: r.bg,
                border: `1.5px solid ${r.border}`,
                borderRadius: radius.lg,
                px: 2.5, py: 1.6,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: r.glow || 'none',
                position: 'relative', overflow: 'hidden',
              }}>
                {r.legendary && (
                  <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 20%, rgba(253,230,138,0.28) 50%, transparent 80%)', backgroundSize: '200% auto', animation: `${shimmer} 2.5s linear infinite`, pointerEvents: 'none' }} />
                )}
                <Box>
                  <Typography sx={{ fontSize: '0.92rem', fontWeight: 700, color: r.color, fontFamily: font.serif }}>
                    {r.label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: r.color, opacity: 0.65, mt: 0.1 }}>
                    {r.desc}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: r.label === 'Lendário' ? '1.1rem' : '0.85rem', color: r.color, opacity: 0.55 }}>
                  {r.emoji}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <Divider sx={{ opacity: 0.2, mb: 5 }} />

        {/* ── PARA QUEM É? ── */}
        <Box sx={{ mb: 5, animation: `${fadeIn} 0.6s 0.4s ease both` }}>
          <SectionTitle>Para quem é?</SectionTitle>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.2 }}>
            {AUDIENCES.map((a) => (
              <Box key={a.label} sx={{
                background: 'rgba(255,255,255,0.65)',
                backdropFilter: 'blur(14px)',
                border: '1.5px solid rgba(255,255,255,0.85)',
                borderRadius: radius.xl,
                p: 1.8,
                textAlign: 'center',
              }}>
                <Box sx={{ fontSize: '1.8rem', mb: 0.8 }}>{a.emoji}</Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e3a5f', mb: 0.3 }}>
                  {a.label}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: colors.text.secondary, lineHeight: 1.5 }}>
                  {a.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── CTA FINAL ── */}
        <Box sx={{ pb: 8, animation: `${fadeIn} 0.6s 0.5s ease both` }}>
          <Box sx={{
            background: 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(18px)',
            border: '1.5px solid rgba(255,255,255,0.88)',
            borderRadius: radius.xl,
            p: 3.5,
            textAlign: 'center',
          }}>
            <FavoriteIcon sx={{ fontSize: 36, color: '#e11d48', mb: 1.5, filter: 'drop-shadow(0 4px 14px rgba(225,29,72,0.4))' }} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.55rem', color: '#1e3a5f', mb: 0.5 }}>
              Pronto para começar?
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: colors.text.secondary, lineHeight: 1.65, mb: 3 }}>
              Crie sua conta e monte sua primeira coleção afetiva. Feito com muito carinho.
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
