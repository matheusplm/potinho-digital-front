import FavoriteIcon from '@mui/icons-material/Favorite'
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import InstagramIcon from '@mui/icons-material/Instagram'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'
import { Box, Chip, IconButton, Popover, Stack, Tooltip, Typography, useMediaQuery } from '@mui/material'
import { useEffect, useRef, useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, ScrollHint } from '../components/ui'
import { backgroundThemes, colors, fadeInHero, fadeInRight, font, getBackgroundTheme, gradients, liftOnDark, radius, shadow } from '../design-system'
import { useBackground } from '../context/BackgroundContext'
import { ThemeSwatches } from '../components/ThemeSwatches'
import { FloatingParticles } from '../components/FloatingParticles'
import { AUDIENCES, CUSTOMIZATIONS, DEMO_NOTES, FEATURES, RARITY_COLOR, RARITY_FILTERS, STEPS } from './landing/landingData'
import { SectionTitle } from './landing/SectionTitle'
import { DemoNoteCard } from './landing/DemoNoteCard'
import { HeroCardStack } from './landing/HeroCardStack'

export function LandingPage() {
  const navigate = useNavigate()
  const linkTo = (path: string) => ({
    href: path,
    onClick: (e: React.MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
      e.preventDefault()
      navigate(path)
    },
  })
  const isDesktop = useMediaQuery('(min-width: 900px)', { noSsr: true })
  const [activeRarity, setActiveRarity] = useState('Todos')

  const blobTopRef = useRef<HTMLElement>(null)
  const blobBotRef = useRef<HTMLElement>(null)
  const parallaxTextRef = useRef<HTMLElement>(null)
  const parallaxCardRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!isDesktop) return
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2)
      const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2)
      if (blobTopRef.current)
        blobTopRef.current.style.transform = `translate(${x * -26}px, ${y * -18}px)`
      if (blobBotRef.current)
        blobBotRef.current.style.transform = `translate(${x * -14}px, ${y * -10}px)`
      if (parallaxTextRef.current)
        parallaxTextRef.current.style.transform = `translate(${x * -9}px, ${y * -6}px)`
      if (parallaxCardRef.current)
        parallaxCardRef.current.style.transform = `translate(${x * 10}px, ${y * 7}px)`
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [isDesktop])

  const visibleNotes = activeRarity === 'Todos' ? DEMO_NOTES : DEMO_NOTES.filter((n) => n.rarity === activeRarity)

  return (
    <Box sx={{
      minHeight: '100dvh',
      background: gradients.page,
      overflowX: 'hidden', overflowY: 'auto', position: 'relative',
    }}>
      <Box sx={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <Box ref={blobTopRef} sx={{ position: 'absolute', top: -100, right: -100, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle,rgba(29,78,216,0.09) 0%,transparent 70%)', transition: 'transform 0.12s ease-out', willChange: 'transform' }} />
        <Box ref={blobBotRef} sx={{ position: 'absolute', bottom: 80, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(225,29,72,0.07) 0%,transparent 70%)', transition: 'transform 0.12s ease-out', willChange: 'transform' }} />
      </Box>

      <FloatingParticles fixed />

      {/* Navbar */}
      <Box component="nav" sx={{
        position: 'sticky', top: 0, zIndex: 100,
        background: colors.surface.overlay, backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${colors.border.subtle}`,
        px: isDesktop ? 5 : 2, py: 0,
        height: isDesktop ? 64 : 56,
        '@media (max-width: 359.98px)': { px: 1.5 },
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
          <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1rem', color: colors.text.primary, whiteSpace: 'nowrap', '@media (max-width: 359.98px)': { fontSize: '0.92rem' } }}>
            Potinho Digital
          </Typography>
        </Stack>
        <Stack direction="row" spacing={isDesktop ? 1 : 0.75} alignItems="center">
          <ThemeButton />
          <Button variant="ghost" {...linkTo('/login')} sx={{ py: 0.7, px: isDesktop ? 2 : 1.2, fontSize: '0.84rem', whiteSpace: 'nowrap', '@media (max-width: 399.98px)': { display: 'none' } }}>
            Entrar
          </Button>
          <Button variant="primary" {...linkTo('/register')} sx={{ py: 0.7, px: isDesktop ? 2 : 1.2, fontSize: '0.84rem', whiteSpace: 'nowrap' }}>
            {isDesktop ? 'Criar conta grátis' : 'Criar conta'}
          </Button>
        </Stack>
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1 }}>

        {/* Hero */}
        <Box sx={{ px: isDesktop ? 5 : 2.5, pt: isDesktop ? 8 : 5, pb: isDesktop ? 9 : 6, maxWidth: isDesktop ? 1200 : 480, mx: 'auto' }}>
          {isDesktop ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignItems: 'center' }}>
              <Box ref={parallaxTextRef} sx={{ transition: 'transform 0.14s ease-out', willChange: 'transform' }}>
              <Box className="pd-enter" sx={{ animation: `${fadeInHero} 0.6s ease both` }}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, px: 1.4, py: 0.5, mb: 2.5, borderRadius: radius.full, background: 'rgba(29,78,216,0.08)', border: '1px solid rgba(29,78,216,0.18)' }}>
                  <AutoStoriesOutlinedIcon sx={{ fontSize: 13, color: colors.primary.text }} />
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: colors.primary.text, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Álbum afetivo digital
                  </Typography>
                </Box>
                <Typography component="h1" sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '3.4rem', lineHeight: 1.08, color: colors.text.primary, letterSpacing: '-0.5px', mb: 2 }}>
                  O presente que
                  <Box component="span" sx={{ display: 'block', mt: 1, color: colors.primary.text }}>cresce todo dia.</Box>
                </Typography>
                <Box sx={{ width: 56, height: 3, borderRadius: 2, background: 'linear-gradient(90deg,#1d4ed8,#e11d48)', mb: 3 }} />
                <Typography sx={{ fontSize: '1.05rem', color: colors.text.secondary, lineHeight: 1.75, mb: 4, maxWidth: 440 }}>
                  Escreva bilhetes especiais, monte pacotinhos surpresa e presenteie quem você ama com uma nova descoberta todo dia, como um álbum de figurinhas, só que com mensagens de verdade.
                </Typography>
                <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                  <Button variant="primary" {...linkTo('/register')} sx={{ py: 1.4, px: 3.5, fontSize: '0.97rem' }}>
                    Criar conta grátis
                  </Button>
                  <Button variant="ghost" {...linkTo('/login')} sx={{ py: 1.4, px: 2.5, fontSize: '0.92rem' }}>
                    Já tenho conta
                  </Button>
                </Stack>
                <Typography sx={{ fontSize: '0.76rem', color: colors.text.muted }}>
                  ✓ Gratuito &nbsp;·&nbsp; ✓ Sem cartão de crédito
                </Typography>
              </Box>
              </Box>
              <Box ref={parallaxCardRef} sx={{ transition: 'transform 0.14s ease-out', willChange: 'transform' }}>
              <Box className="pd-enter" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', animation: `${fadeInRight} 0.7s 0.2s ease both` }}>
                <HeroCardStack />
              </Box>
              </Box>
            </Box>
          ) : (
            <Stack className="pd-enter" alignItems="center" sx={{ animation: `${fadeInHero} 0.6s ease both` }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, px: 1.4, py: 0.5, mb: 2.5, borderRadius: radius.full, background: 'rgba(29,78,216,0.08)', border: '1px solid rgba(29,78,216,0.18)' }}>
                <AutoStoriesOutlinedIcon sx={{ fontSize: 13, color: colors.primary.text }} />
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: colors.primary.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Álbum afetivo digital
                </Typography>
              </Box>
              <Typography component="h1" sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '2.8rem', lineHeight: 1.0, color: colors.text.primary, textAlign: 'center', letterSpacing: '-0.5px', mb: 1.5 }}>
                O presente que
                <Box component="span" sx={{ display: 'block', color: colors.primary.text }}>cresce todo dia.</Box>
              </Typography>
              <Box sx={{ width: 44, height: 3, borderRadius: 2, background: 'linear-gradient(90deg,#1d4ed8,#e11d48)', mb: 2.5 }} />
              <Typography sx={{ fontSize: '0.9rem', color: colors.text.secondary, textAlign: 'center', lineHeight: 1.72, mb: 3.5, maxWidth: 310 }}>
                Escreva bilhetes, monte pacotinhos surpresa e presenteie quem você ama com novas descobertas todo dia, como um álbum de figurinhas.
              </Typography>
              <Stack spacing={1.2} sx={{ width: '100%', maxWidth: 320 }}>
                <Button variant="primary" fullWidth {...linkTo('/register')} sx={{ py: 1.35, fontSize: '0.97rem' }}>
                  Criar conta grátis
                </Button>
                <Button variant="ghost" fullWidth {...linkTo('/login')} sx={{ py: 1.1, fontSize: '0.9rem' }}>
                  Já tenho conta · Entrar
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
        <Box sx={{ background: colors.glass.band, backdropFilter: 'blur(20px)', borderTop: `1px solid ${colors.glass.bandBorder}`, borderBottom: `1px solid ${colors.glass.bandBorder}`, py: isDesktop ? 7 : 5, px: isDesktop ? 5 : 2.5 }}>
          <Box className="pd-enter" sx={{ maxWidth: isDesktop ? 760 : 480, mx: 'auto', textAlign: 'center', animation: `${fadeInHero} 0.6s 0.1s ease both` }}>
            <Typography sx={{ fontSize: isDesktop ? '2rem' : '1.5rem', fontFamily: font.serif, fontWeight: 800, color: colors.text.primary, lineHeight: 1.3, mb: 2 }}>
              Pense num álbum de figurinhas.
            </Typography>
            <Typography sx={{ fontSize: isDesktop ? '1.15rem' : '0.92rem', color: colors.text.secondary, lineHeight: 1.8, maxWidth: 580, mx: 'auto' }}>
              Só que em vez de figurinhas, são <strong style={{ color: colors.text.primary }}>bilhetes escritos por você</strong>. Com raridades, tipos e surpresas. A pessoa descobre aos poucos, abrindo um pacotinho por dia, como receber uma carta esperada todo dia.
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              {[
                { icon: <AutoStoriesOutlinedIcon sx={{ fontSize: 16 }} />, label: 'Coleção personalizável' },
                { icon: <Inventory2OutlinedIcon sx={{ fontSize: 16 }} />, label: 'Pacotinhos diários' },
                { icon: <EmojiEventsOutlinedIcon sx={{ fontSize: 16 }} />, label: 'Conquistas' },
              ].map((item) => (
                <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.7, px: 1.4, py: 0.6, borderRadius: radius.full, background: 'rgba(29,78,216,0.06)', border: '1px solid rgba(29,78,216,0.14)', color: colors.primary.text }}>
                  {item.icon}
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: colors.primary.text }}>{item.label}</Typography>
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
              <Box key={f.title} sx={{ background: colors.glass.card, backdropFilter: 'blur(14px)', border: `1.5px solid ${colors.glass.cardBorder}`, borderRadius: radius.xl, p: isDesktop ? 2.5 : 2, transition: 'transform 0.18s', '&:hover': { transform: 'translateY(-3px)' } }}>
                <Box sx={{ fontSize: isDesktop ? '2rem' : '1.6rem', mb: 1 }}>{f.emoji}</Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: liftOnDark(f.color), mb: 0.4 }}>{f.title}</Typography>
                <Typography sx={{ fontSize: '0.74rem', color: colors.text.secondary, lineHeight: 1.6 }}>{f.desc}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Interactive demo */}
        <Box sx={{ background: colors.glass.band, backdropFilter: 'blur(20px)', borderTop: `1px solid ${colors.glass.bandBorder}`, borderBottom: `1px solid ${colors.glass.bandBorder}`, py: isDesktop ? 8 : 5, px: isDesktop ? 5 : 2.5 }}>
          <Box sx={{ maxWidth: isDesktop ? 1200 : 480, mx: 'auto' }}>
            {isDesktop ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 7, alignItems: 'flex-start' }}>
                <Box>
                  <SectionTitle sub="Clique em uma raridade para filtrar. Cada bilhete tem visual único definido pela raridade, do comum ao lendário.">
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
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: activeRarity === r ? 700 : 500, color: activeRarity === r ? liftOnDark(RARITY_COLOR[r]) : colors.text.secondary }}>
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
                        background: activeRarity === r ? `${RARITY_COLOR[r]}14` : colors.glass.card,
                        color: activeRarity === r ? liftOnDark(RARITY_COLOR[r]) : colors.text.secondary,
                        border: `1.5px solid ${activeRarity === r ? `${RARITY_COLOR[r]}40` : colors.border.medium}`,
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
                      <Typography sx={{ fontSize: '0.94rem', fontWeight: 700, color: colors.text.primary, fontFamily: font.serif }}>{s.title}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.78rem', color: colors.text.secondary, lineHeight: 1.65, textAlign: 'center' }}>{s.desc}</Typography>
                  </Stack>
                </Box>
              ))}
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {STEPS.map((s, i) => (
                <Box key={s.n} sx={{ background: colors.glass.card, backdropFilter: 'blur(14px)', border: `1.5px solid ${colors.glass.cardBorder}`, borderRadius: radius.xl, p: 2.2, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
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
                      <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: colors.text.primary, fontFamily: font.serif }}>{s.title}</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.78rem', color: colors.text.secondary, lineHeight: 1.6 }}>{s.desc}</Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        {/* Customization */}
        <Box sx={{ background: colors.glass.band, backdropFilter: 'blur(20px)', borderTop: `1px solid ${colors.glass.bandBorder}`, borderBottom: `1px solid ${colors.glass.bandBorder}`, py: isDesktop ? 8 : 5, px: isDesktop ? 5 : 2.5 }}>
          <Box sx={{ maxWidth: isDesktop ? 1200 : 480, mx: 'auto' }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, px: 1.4, py: 0.5, borderRadius: radius.full, background: 'linear-gradient(90deg,rgba(29,78,216,0.08),rgba(225,29,72,0.06))', border: '1px solid rgba(29,78,216,0.15)', mb: 1.5 }}>
              <PaletteOutlinedIcon sx={{ fontSize: 13, color: colors.primary.text }} />
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: colors.primary.text, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                100% personalizável
              </Typography>
            </Box>
            <SectionTitle sub="Nada é fixo. Raridades, tipos, pacotinhos, conquistas, temas: tudo criado do zero por você.">
              Você controla tudo
            </SectionTitle>
            <Box sx={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(2,1fr)' : '1fr', gap: 1.8, mt: 3 }}>
              {CUSTOMIZATIONS.map((c) => (
                <Box key={c.title} sx={{ background: c.bg, backdropFilter: 'blur(14px)', border: `1.5px solid ${c.color}22`, borderLeft: `3px solid ${c.color}`, borderRadius: radius.xl, p: 2.2, transition: 'transform 0.18s', '&:hover': { transform: 'translateX(3px)' } }}>
                  <Stack direction="row" alignItems="flex-start" spacing={1.4}>
                    <Box sx={{ fontSize: '1.4rem', lineHeight: 1, pt: 0.2, flexShrink: 0 }}>{c.emoji}</Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: liftOnDark(c.color), mb: 0.4, fontFamily: font.serif }}>{c.title}</Typography>
                      <Typography sx={{ fontSize: '0.78rem', color: colors.text.secondary, lineHeight: 1.6, mb: 1.2 }}>{c.desc}</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                        {c.chips.map((chip) => (
                          <Chip key={chip} label={chip} size="small" sx={{ fontSize: '0.68rem', height: 22, background: `${c.color}12`, color: liftOnDark(c.color), border: `1px solid ${c.color}25`, fontWeight: 600, '& .MuiChip-label': { px: 1 } }} />
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
        <ThemesSection isDesktop={isDesktop} />

        {/* For whom */}
        <Box sx={{ background: colors.glass.band, backdropFilter: 'blur(20px)', borderTop: `1px solid ${colors.glass.bandBorder}`, borderBottom: `1px solid ${colors.glass.bandBorder}`, py: isDesktop ? 7 : 5, px: isDesktop ? 5 : 2.5 }}>
          <Box sx={{ maxWidth: isDesktop ? 1200 : 480, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: isDesktop ? 6 : 0, flexDirection: isDesktop ? 'row' : 'column' }}>
              <Box sx={{ flexShrink: 0, minWidth: isDesktop ? 280 : undefined, mb: isDesktop ? 0 : 3 }}>
                <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
                  <GroupOutlinedIcon sx={{ fontSize: 18, color: colors.primary.text }} />
                  <SectionTitle>Para quem é?</SectionTitle>
                </Stack>
              </Box>
              {isDesktop ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1.5, flex: 1 }}>
                  {AUDIENCES.map((a) => (
                    <Box key={a.label} sx={{ background: colors.glass.card, backdropFilter: 'blur(14px)', border: `1.5px solid ${colors.glass.cardBorder}`, borderRadius: radius.xl, p: 2.5, textAlign: 'center' }}>
                      <Box sx={{ fontSize: '2.2rem', mb: 0.8 }}>{a.emoji}</Box>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: colors.text.primary, mb: 0.4 }}>{a.label}</Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: colors.text.secondary, lineHeight: 1.55 }}>{a.desc}</Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Stack spacing={1.2} sx={{ width: '100%' }}>
                  {AUDIENCES.map((a) => (
                    <Box key={a.label} sx={{ background: colors.glass.card, backdropFilter: 'blur(14px)', border: `1.5px solid ${colors.glass.cardBorder}`, borderRadius: radius.xl, p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ fontSize: '2rem', flexShrink: 0 }}>{a.emoji}</Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: colors.text.primary, mb: 0.2 }}>{a.label}</Typography>
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
          <Box sx={{ maxWidth: isDesktop ? 900 : 480, mx: 'auto', background: colors.glass.card, backdropFilter: 'blur(18px)', border: `1.5px solid ${colors.glass.cardBorder}`, borderRadius: radius.xl, p: isDesktop ? 4 : 2.5 }}>
            <Stack direction={isDesktop ? 'row' : 'column'} spacing={isDesktop ? 4 : 2} alignItems={isDesktop ? 'center' : 'flex-start'}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: isDesktop ? 72 : 48, height: isDesktop ? 72 : 48, borderRadius: radius.xl, background: 'linear-gradient(135deg,rgba(29,78,216,0.12),rgba(225,29,72,0.08))', border: '1.5px solid rgba(29,78,216,0.15)', flexShrink: 0 }}>
                <LockOpenOutlinedIcon sx={{ fontSize: isDesktop ? 32 : 22, color: colors.primary.text }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: isDesktop ? '1.3rem' : '1.1rem', color: colors.text.primary, mb: 0.6 }}>
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
          <Box sx={{ maxWidth: isDesktop ? 640 : 480, mx: 'auto', background: colors.glass.card, backdropFilter: 'blur(18px)', border: `1.5px solid ${colors.glass.cardBorder}`, borderRadius: radius.xl, p: isDesktop ? 5 : 3.5, textAlign: 'center' }}>
            <FavoriteIcon sx={{ fontSize: isDesktop ? 44 : 36, color: '#e11d48', mb: 1.5, filter: 'drop-shadow(0 4px 14px rgba(225,29,72,0.4))' }} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: isDesktop ? '1.9rem' : '1.55rem', color: colors.text.primary, mb: 0.8 }}>
              Pronto para começar?
            </Typography>
            <Typography sx={{ fontSize: '0.88rem', color: colors.text.secondary, lineHeight: 1.7, mb: 3.5, maxWidth: 400, mx: 'auto' }}>
              Crie sua conta, monte sua coleção do zero e presenteie quem você ama com algo único, hoje mesmo.
            </Typography>
            {isDesktop ? (
              <Stack direction="row" spacing={1.5} justifyContent="center">
                <Button variant="primary" {...linkTo('/register')} sx={{ py: 1.4, px: 3.5, fontSize: '0.97rem' }}>
                  Criar conta grátis
                </Button>
                <Button variant="ghost" {...linkTo('/login')} sx={{ py: 1.4, px: 2.5, fontSize: '0.9rem' }}>
                  Entrar
                </Button>
              </Stack>
            ) : (
              <Stack spacing={1.2}>
                <Button variant="primary" fullWidth {...linkTo('/register')} sx={{ py: 1.35, fontSize: '0.97rem' }}>
                  Criar conta agora
                </Button>
                <Button variant="ghost" fullWidth {...linkTo('/login')} sx={{ py: 1.1, fontSize: '0.9rem' }}>
                  Já tenho conta · Entrar
                </Button>
              </Stack>
            )}
            <Typography sx={{ mt: 2.5, fontSize: '0.74rem', color: colors.text.muted }}>
              ✓ Gratuito &nbsp;·&nbsp; ✓ Sem cartão de crédito
            </Typography>
          </Box>
          <Box component="footer" sx={{ mt: 4, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.74rem', color: colors.text.muted, fontStyle: 'italic', mb: 1.2 }}>
              Feito com ❤️ para guardar o que importa.
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: colors.text.muted, mb: 1 }}>
              Criado por <strong style={{ fontWeight: 600 }}>Matheus Pereira Lopes de Morais</strong>
            </Typography>
            <Stack direction="row" spacing={0.5} justifyContent="center">
              <Tooltip title="LinkedIn">
                <IconButton
                  component="a"
                  href="https://www.linkedin.com/in/matheus-pereira-lopes/"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{ color: colors.text.muted, transition: 'color 0.18s', '&:hover': { color: '#0a66c2', background: 'rgba(10,102,194,0.08)' } }}
                >
                  <LinkedInIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Instagram">
                <IconButton
                  component="a"
                  href="https://www.instagram.com/matheusplm96/"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{ color: colors.text.muted, transition: 'color 0.18s', '&:hover': { color: '#e1306c', background: 'rgba(225,48,108,0.08)' } }}
                >
                  <InstagramIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="matheusmty@gmail.com">
                <IconButton
                  component="a"
                  href="mailto:matheusmty@gmail.com"
                  size="small"
                  sx={{ color: colors.text.muted, transition: 'color 0.18s', '&:hover': { color: colors.primary.text, background: 'rgba(29,78,216,0.08)' } }}
                >
                  <AlternateEmailIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>

      </Box>
      <ScrollHint />
    </Box>
  )
}

function ThemeButton() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  return (
    <>
      <Tooltip title="Trocar tema">
        <IconButton
          aria-label="Trocar tema"
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{ width: 36, height: 36, color: colors.primary.text, background: colors.glass.card, border: `1.5px solid ${colors.border.medium}`, '&:hover': { background: colors.glass.strong } }}
        >
          <PaletteOutlinedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1, p: 1.8, maxWidth: 260, borderRadius: radius.xl, background: colors.surface.paper, border: `1px solid ${colors.border.subtle}`, boxShadow: shadow.lg } } }}
      >
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.6, color: colors.text.secondary, textTransform: 'uppercase', mb: 1.2 }}>
          Tema de fundo
        </Typography>
        <ThemeSwatches labelColor={colors.text.muted} />
      </Popover>
    </>
  )
}

const ThemesSection: FC<{ isDesktop: boolean }> = ({ isDesktop }) => {
  const { themeKey: activeKey, setThemeKey: setActiveKey } = useBackground()
  const active = getBackgroundTheme(activeKey)

  return (
    <Box sx={{ py: isDesktop ? 8 : 5, px: isDesktop ? 5 : 2.5, maxWidth: isDesktop ? 1200 : 480, mx: 'auto' }}>
      <SectionTitle sub="O leitor escolhe o tema que mais combina com ele, do romântico e suave ao misterioso e sombrio.">
        {`${backgroundThemes.length} temas visuais`}
      </SectionTitle>

      {isDesktop ? (
        <Box sx={{ overflowX: 'auto', pt: 2.5, pb: 1.5, px: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
          <Box sx={{ display: 'flex', gap: 1.5, width: 'max-content' }}>
            {backgroundThemes.map((t) => {
              const sel = t.key === activeKey
              return (
                <Stack key={t.key} spacing={0.8} alignItems="center" onClick={() => setActiveKey(t.key)} sx={{ cursor: 'pointer' }}>
                  <Box sx={{
                    width: 64, height: 84, borderRadius: radius.xl, background: t.gradient,
                    border: sel ? `2.5px solid ${t.accent}` : '1.5px solid rgba(255,255,255,0.65)',
                    boxShadow: sel ? `0 0 0 3px ${t.accent}44, 0 4px 16px rgba(0,0,0,0.12)` : '0 4px 16px rgba(0,0,0,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                    transform: sel ? 'translateY(-4px) scale(1.08)' : 'scale(1)',
                    transition: 'transform 0.18s, box-shadow 0.18s, border 0.18s',
                    '&:hover': { transform: sel ? 'translateY(-4px) scale(1.08)' : 'translateY(-4px) scale(1.05)' },
                  }}>
                    {t.emoji}
                  </Box>
                  <Typography sx={{ fontSize: '0.68rem', color: sel ? t.accent : colors.text.secondary, fontWeight: sel ? 700 : 600, textAlign: 'center', whiteSpace: 'nowrap', transition: 'color 0.18s' }}>
                    {t.label}
                  </Typography>
                </Stack>
              )
            })}
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, justifyContent: 'center', pt: 2 }}>
          {backgroundThemes.map((t) => {
            const sel = t.key === activeKey
            return (
              <Stack key={t.key} spacing={0.6} alignItems="center" sx={{ width: 58, cursor: 'pointer' }} onClick={() => setActiveKey(t.key)}>
                <Box sx={{
                  width: 52, height: 68, borderRadius: radius.xl, background: t.gradient,
                  border: sel ? `2px solid ${t.accent}` : '1.5px solid rgba(255,255,255,0.65)',
                  boxShadow: sel ? `0 0 0 2.5px ${t.accent}44, 0 3px 12px rgba(0,0,0,0.12)` : '0 3px 12px rgba(0,0,0,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                  transform: sel ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                }}>
                  {t.emoji}
                </Box>
                <Typography sx={{ fontSize: '0.62rem', color: sel ? t.accent : colors.text.secondary, fontWeight: sel ? 700 : 600, textAlign: 'center', lineHeight: 1.2, transition: 'color 0.18s' }}>
                  {t.label}
                </Typography>
              </Stack>
            )
          })}
        </Box>
      )}

      <Box sx={{
        mt: 3, borderRadius: radius.xl, overflow: 'hidden',
        background: active.gradient,
        transition: 'background 0.4s ease',
        boxShadow: `0 8px 32px rgba(0,0,0,0.18)`,
      }}>
        <Box sx={{ px: isDesktop ? 4 : 2.5, py: isDesktop ? 3.5 : 3 }}>
          <Typography sx={{ fontSize: '0.78rem', color: active.textOnBgMuted, fontWeight: 500, mb: 0.2 }}>
            Boa tarde,
          </Typography>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.6rem', color: active.textOnBg, lineHeight: 1.1, letterSpacing: '-0.5px', mb: 0.5 }}>
            Maria 💙
          </Typography>
          <Typography sx={{ fontSize: '0.82rem', color: active.textOnBgMuted, fontStyle: 'italic', mb: 2.5 }}>
            suas coleções estão esperando por você
          </Typography>
          <Box sx={{
            background: active.surfaceBg, border: `1px solid ${active.surfaceBorder}`,
            borderRadius: radius.lg, px: 2, py: 1.5,
            display: 'flex', alignItems: 'center', gap: 1.5,
          }}>
            <Box sx={{ width: 36, height: 36, borderRadius: radius.md, background: `linear-gradient(135deg,${active.accent},${active.accent}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1rem' }}>
              📦
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '0.9rem', color: active.isDark ? active.textOnBg : colors.text.primary, lineHeight: 1.2 }}>
                Minhas coleções
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: active.isDark ? active.textOnBgMuted : colors.text.secondary }}>
                3 coleções criadas
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ px: isDesktop ? 4 : 2.5, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: active.accent }} />
          <Typography sx={{ fontSize: '0.7rem', color: active.textOnBgMuted, fontWeight: 600 }}>
            Tema: {active.emoji} {active.label}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
