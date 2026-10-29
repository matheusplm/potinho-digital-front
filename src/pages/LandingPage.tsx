import LinkedInIcon from '@mui/icons-material/LinkedIn'
import InstagramIcon from '@mui/icons-material/Instagram'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'
import { Box, ButtonBase, IconButton, Stack, Tooltip, Typography, useMediaQuery } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, ScrollHint } from '../components/ui'
import { brandAccent, colors, fadeInHero, fadeInRight, font, gradients, themeInk } from '../design-system'
import { AUDIENCES, DEMO_NOTES, DEMO_RARITIES, DETAILS, RARITY_COLOR, RARITY_FILTERS, STEPS } from './landing/landingData'
import { SectionTitle } from './landing/SectionTitle'
import { DemoNoteCard } from './landing/DemoNoteCard'
import { BrandLogo, BrandName, Copyright } from '../components/Brand'
import { HeroCardStack } from './landing/HeroCardStack'
import { HandArrow, Squiggle } from './landing/Doodles'
import { Door } from '../components/scene/Door'
import { ThemesShowcase } from './landing/ThemesShowcase'
import { WindowScene } from '../components/scene/WindowScene'

const PAGE_X = { xs: 2.5, md: 5 }
const TILTS = ['-0.7deg', '0.5deg', '-0.3deg', '0.8deg', '-0.5deg', '0.3deg']

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

  const visibleNotes = activeRarity === 'Todos' ? DEMO_NOTES : DEMO_NOTES.filter((n) => DEMO_RARITIES.find((r) => r.id === n.rarity)?.label === activeRarity)

  return (
    <Box sx={{ minHeight: '100dvh', background: gradients.page, overflowX: 'hidden', overflowY: 'auto', position: 'relative', color: colors.text.primary }}>
      <Box component="nav" sx={{
        maxWidth: 1180, mx: 'auto', px: PAGE_X, height: { xs: 60, md: 72 },
        '@media (max-width: 359.98px)': { px: 1.5 },
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${colors.border.subtle}`,
      }}>
        <Stack direction="row" spacing={1.1} alignItems="center">
          <BrandLogo size={30} />
          <BrandName size="1.1rem" sx={{ '@media (max-width: 359.98px)': { fontSize: '0.95rem' } }} />
        </Stack>
        <Stack direction="row" spacing={{ xs: 1.5, md: 2.5 }} alignItems="center">
          <Box component="a" {...linkTo('/login')} sx={{ color: colors.text.secondary, fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none', '&:hover': { color: colors.text.primary, textDecoration: 'underline', textUnderlineOffset: 4 } }}>
            Entrar
          </Box>
          <Button variant="primary" {...linkTo('/register')} sx={{ py: 0.65, px: { xs: 1.4, md: 2 }, fontSize: '0.86rem', whiteSpace: 'nowrap' }}>
            Criar conta
          </Button>
        </Stack>
      </Box>

      <Box component="header" sx={{ maxWidth: 1180, mx: 'auto', px: PAGE_X, pt: { xs: 5, md: 9 }, pb: { xs: 7, md: 11 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.15fr 0.85fr' }, gap: { xs: 6, md: 8 }, alignItems: 'center' }}>
          <Box className="pd-enter" sx={{ animation: `${fadeInHero} 0.6s ease both` }}>
            <Typography sx={{ fontFamily: font.hand, fontSize: { xs: '1.45rem', md: '1.7rem' }, color: colors.primary.text, transform: 'rotate(-2deg)', transformOrigin: 'left', mb: 1.5, lineHeight: 1 }}>
              um álbum de bilhetes, escrito por você
            </Typography>
            <Typography component="h1" sx={{ fontFamily: font.serif, fontWeight: 500, fontSize: { xs: '2.7rem', sm: '3.2rem', md: '4.1rem' }, lineHeight: 1.02, letterSpacing: '-0.025em', mb: 3 }}>
              Escreva bilhetes. Entregue{' '}
              <Box component="span" sx={{ position: 'relative', display: 'inline-block', whiteSpace: 'nowrap' }}>
                <Box component="span" sx={brandAccent(true)}>um por dia.</Box>
                <Squiggle color={colors.primary.text} sx={{ position: 'absolute', left: 0, right: 0, bottom: { xs: -6, md: -8 }, opacity: 0.75 }} />
              </Box>
            </Typography>
            <Typography sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, color: colors.text.secondary, lineHeight: 1.7, maxWidth: 480, mb: 4 }}>
              Você escreve as mensagens e separa em pacotinhos. A pessoa abre um por dia, sem saber qual vem, e vai colecionando. Tem raridade, tem álbum e tem aquela vontade de voltar amanhã.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 2.5 }} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ maxWidth: { xs: 340, sm: 'none' } }}>
              <Button variant="primary" {...linkTo('/register')} sx={{ py: 1.3, px: 3.2, fontSize: '0.98rem' }}>
                Começar meu potinho
              </Button>
              <Box component="a" {...linkTo('/login')} sx={{ color: colors.text.primary, fontSize: '0.92rem', fontWeight: 500, textAlign: { xs: 'center', sm: 'left' }, textDecoration: 'underline', textUnderlineOffset: 4, textDecorationColor: colors.border.medium, '&:hover': { textDecorationColor: colors.text.primary } }}>
                já tenho conta
              </Box>
            </Stack>
            <Typography sx={{ mt: 2.5, fontSize: '0.82rem', color: colors.text.muted }}>
              É de graça e não pede cartão.
            </Typography>
          </Box>

          <Box className="pd-enter" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: `${fadeInRight} 0.7s 0.2s ease both` }}>
            <WindowScene width={{ xs: 'min(330px, calc(100vw - 60px))', md: 400 }} height={{ xs: 200, md: 280 }}>
              <Box sx={{ position: 'absolute', left: { xs: '50%', md: '16%' }, top: { xs: 112, md: 176 }, transform: 'translateX(-50%)', zIndex: 4 }}>
                <HeroCardStack />
              </Box>
            </WindowScene>
            <Box sx={{ height: { xs: 258, md: 196 } }} />
            <Box sx={{ alignSelf: 'flex-end', mr: { xs: 1, md: 4 }, display: 'flex', alignItems: 'flex-start', gap: 0.2, pointerEvents: 'none', transform: 'rotate(-3deg)' }}>
              <HandArrow color={colors.text.secondary} sx={{ transform: 'rotate(-150deg)', mt: -1 }} />
              <Typography sx={{ fontFamily: font.hand, fontSize: '1.25rem', color: colors.text.secondary, lineHeight: 1, mt: 1.2 }}>
                arrasta pro lado
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box component="section" sx={{ px: PAGE_X, pb: { xs: 8, md: 12 } }}>
        <Box sx={{
          maxWidth: 660, mx: 'auto', position: 'relative',
          background: '#fffdf7',
          backgroundImage: 'repeating-linear-gradient(transparent 0 37px, rgba(39,64,139,0.13) 37px 38px)',
          backgroundPosition: '0 22px',
          border: '1px solid rgba(60,42,20,0.14)',
          boxShadow: '2px 3px 0 rgba(60,42,20,0.08), 0 18px 30px -20px rgba(60,42,20,0.4)',
          transform: 'rotate(-0.6deg)',
          pl: { xs: 5.5, md: 9 }, pr: { xs: 2.5, md: 6 }, pt: 2.75, pb: 3,
          '&::before': { content: '""', position: 'absolute', top: 0, bottom: 0, left: { xs: 30, md: 52 }, width: '1.5px', background: 'color-mix(in srgb, var(--pd-ink) 40%, transparent)' },
        }}>
          <Box sx={{ position: 'absolute', top: -12, left: '50%', width: 110, height: 24, transform: 'translateX(-50%) rotate(2deg)', background: 'rgba(222,205,170,0.75)', boxShadow: '0 1px 0 rgba(60,42,20,0.08)' }} />
          <Typography component="h2" sx={{ fontFamily: font.hand, fontWeight: 700, fontSize: { xs: '1.75rem', md: '2.1rem' }, lineHeight: '38px', color: colors.text.primary }}>
            Como funciona, em três linhas:
          </Typography>
          <Box component="ol" sx={{ m: 0, p: 0, listStyle: 'none' }}>
            {STEPS.map((step, i) => (
              <Box component="li" key={step} sx={{ fontFamily: font.hand, fontSize: { xs: '1.4rem', md: '1.6rem' }, lineHeight: '38px', color: 'color-mix(in srgb, var(--pd-ink) 40%, #26356a)' }}>
                <Box component="span" sx={{ color: themeInk.ink, mr: 1 }}>{i + 1}.</Box>{step}
              </Box>
            ))}
          </Box>
          <Typography sx={{ fontFamily: font.hand, fontSize: { xs: '1.35rem', md: '1.5rem' }, lineHeight: '38px', color: colors.text.secondary, textAlign: 'right', mt: '38px' }}>
            e o resto é com vocês.
          </Typography>
        </Box>
      </Box>

      <Box component="section" sx={{ maxWidth: 1180, mx: 'auto', px: PAGE_X, pb: { xs: 8, md: 12 } }}>
        <SectionTitle kicker="o mostruário" sub="Cada raridade tem a sua cor. Aqui vão alguns que poderiam estar no seu potinho.">
          Assim ficam os bilhetes
        </SectionTitle>
        <Box role="tablist" aria-label="Filtrar por raridade" sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 2.5, rowGap: 1, mb: 3.5, borderBottom: `1px solid ${colors.border.subtle}` }}>
          {RARITY_FILTERS.map((r) => {
            const sel = activeRarity === r
            return (
              <ButtonBase
                key={r}
                role="tab"
                aria-selected={sel}
                onClick={() => setActiveRarity(r)}
                sx={{
                  pb: 1, mb: '-1px', fontFamily: font.sans, fontSize: '0.9rem', fontWeight: sel ? 600 : 500,
                  color: sel ? RARITY_COLOR[r] : colors.text.muted,
                  borderBottom: `2px solid ${sel ? RARITY_COLOR[r] : 'transparent'}`,
                  transition: 'color 0.15s, border-color 0.15s',
                  '&:hover': { color: RARITY_COLOR[r] },
                }}
              >
                {r}
              </ButtonBase>
            )
          })}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0,1fr))', md: 'repeat(3, minmax(0,1fr))' }, gap: { xs: 2.5, md: 3.5 } }}>
          {visibleNotes.map((note, i) => (
            <Box key={note.id} sx={{ transform: { md: `rotate(${TILTS[i % TILTS.length]})` } }}>
              <DemoNoteCard note={note} fill={isDesktop} />
            </Box>
          ))}
        </Box>
        {visibleNotes.length === 0 && (
          <Typography sx={{ py: 6, textAlign: 'center', color: colors.text.muted, fontFamily: font.hand, fontSize: '1.4rem' }}>
            nenhum bilhete dessa raridade por aqui.
          </Typography>
        )}
      </Box>

      <Box component="section" sx={{ borderTop: `1px solid ${colors.border.subtle}`, borderBottom: `1px solid ${colors.border.subtle}`, background: colors.fill.subtle }}>
        <Box sx={{ maxWidth: 1180, mx: 'auto', px: PAGE_X, py: { xs: 7, md: 10 }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '0.8fr 1.2fr' }, gap: { xs: 3, md: 8 } }}>
          <Box>
            <SectionTitle kicker="nada vem pronto" sub="Tudo no potinho é você quem monta. Começa simples e vai mexendo conforme dá vontade.">
              Dá pra mexer em tudo
            </SectionTitle>
          </Box>
          <Box component="dl" sx={{ m: 0 }}>
            {DETAILS.map((d, i) => (
              <Box key={d.title} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '180px 1fr' }, gap: { xs: 0.4, sm: 3 }, py: 2.2, borderTop: i === 0 ? 'none' : `1px dashed ${colors.border.medium}` }}>
                <Typography component="dt" sx={{ fontFamily: font.serif, fontWeight: 600, fontSize: '1.15rem', lineHeight: 1.35 }}>
                  {d.title}
                </Typography>
                <Typography component="dd" sx={{ m: 0, color: colors.text.secondary, lineHeight: 1.65, fontSize: '0.96rem' }}>
                  {d.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <ThemesShowcase />

      <Box component="section" sx={{ maxWidth: 1180, mx: 'auto', px: PAGE_X, pb: { xs: 8, md: 12 }, pt: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, gap: { xs: 4, md: 8 }, alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 500, fontSize: { xs: '2rem', md: '2.9rem' }, lineHeight: 1.1, letterSpacing: '-0.02em', mb: 2, maxWidth: 680 }}>
              Tem alguém que merece um bilhete{' '}
              <Box component="span" sx={brandAccent(true)}>amanhã de manhã?</Box>
            </Typography>
            <Typography sx={{ color: colors.text.secondary, fontSize: '1rem', lineHeight: 1.7, mb: 3.5, maxWidth: 520 }}>
              Serve pra {AUDIENCES.slice(0, -1).join(', ')} e pro {AUDIENCES[AUDIENCES.length - 1]}. Você cria a conta, escreve o primeiro e manda o convite.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 2.5 }} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ maxWidth: { xs: 340, sm: 'none' } }}>
              <Button variant="rose" {...linkTo('/register')} sx={{ py: 1.3, px: 3.2, fontSize: '0.98rem' }}>
                Escrever o primeiro bilhete
              </Button>
              <Box component="a" {...linkTo('/login')} sx={{ color: colors.text.primary, fontSize: '0.92rem', fontWeight: 500, textAlign: { xs: 'center', sm: 'left' }, textDecoration: 'underline', textUnderlineOffset: 4, textDecorationColor: colors.border.medium }}>
                entrar na minha conta
              </Box>
            </Stack>
          </Box>
          <Door height={isDesktop ? 260 : 200} letter mat="entra aí" sx={{ justifySelf: 'center' }} />
        </Box>
      </Box>

      <Box component="footer" sx={{ borderTop: `1px solid ${colors.border.subtle}` }}>
        <Box sx={{ maxWidth: 1180, mx: 'auto', px: PAGE_X, py: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2.5, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.8 }}>
              <BrandLogo size={24} />
              <BrandName size="1rem" />
            </Stack>
            <Typography sx={{ fontSize: '0.8rem', color: colors.text.muted }}>
              Feito por Matheus Pereira Lopes de Morais.
            </Typography>
          </Box>
          <Stack direction="row" spacing={2.5} alignItems="center" sx={{ flexWrap: 'wrap', rowGap: 1, '& a': { color: colors.text.muted, fontSize: '0.8rem', textDecoration: 'none', '&:hover': { color: colors.text.primary } } }}>
            <Box component="a" {...linkTo('/termos')}>Termos de uso</Box>
            <Box component="a" {...linkTo('/privacidade')}>Privacidade</Box>
            <Stack direction="row" spacing={0.25}>
              <Tooltip title="LinkedIn">
                <IconButton component="a" href="https://www.linkedin.com/in/matheus-pereira-lopes/" target="_blank" rel="noopener noreferrer" size="small" aria-label="LinkedIn" sx={{ color: colors.text.muted }}>
                  <LinkedInIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Instagram">
                <IconButton component="a" href="https://www.instagram.com/matheusplm96/" target="_blank" rel="noopener noreferrer" size="small" aria-label="Instagram" sx={{ color: colors.text.muted }}>
                  <InstagramIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="matheusmty@gmail.com">
                <IconButton component="a" href="mailto:matheusmty@gmail.com" size="small" aria-label="Email" sx={{ color: colors.text.muted }}>
                  <AlternateEmailIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>
        <Box sx={{ pb: 3, px: PAGE_X, maxWidth: 1180, mx: 'auto' }}>
          <Copyright sx={{ textAlign: 'left' }} />
        </Box>
      </Box>
      <ScrollHint />
    </Box>
  )
}
