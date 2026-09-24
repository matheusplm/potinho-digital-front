import CasinoOutlinedIcon from '@mui/icons-material/CasinoOutlined'
import { Box, Dialog, DialogActions, DialogContent, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui'
import { colors, font, ink, radius, shineSweep } from '../../design-system'
import { gradientTextSx } from '../../utils/colorUtils'
import type { RarityConfig, NoteTypeConfig } from '../../types/note'
import type { PackSimulation } from './packData'

const packOpening = keyframes`
  0%{transform:translate3d(0,0,0) rotate(-3deg) scale(0.98);}
  30%{transform:translate3d(0,-7px,0) rotate(4deg) scale(1.035);}
  58%{transform:translate3d(0,1px,0) rotate(-2deg) scale(1);}
  82%{transform:translate3d(0,-4px,0) rotate(2deg) scale(1.055);}
  100%{transform:translate3d(0,0,0) rotate(0deg) scale(1);}
`
const packOpeningCentered = keyframes`
  0%{transform:translate3d(-50%,0,0) rotate(-3deg) scale(0.98);}
  30%{transform:translate3d(-50%,-7px,0) rotate(4deg) scale(1.035);}
  58%{transform:translate3d(-50%,1px,0) rotate(-2deg) scale(1);}
  82%{transform:translate3d(-50%,-4px,0) rotate(2deg) scale(1.055);}
  100%{transform:translate3d(-50%,0,0) rotate(0deg) scale(1);}
`
const rewardReveal = keyframes`from{opacity:0;transform:translate3d(0,16px,0) scale(0.94) rotate(-1deg);}to{opacity:1;transform:translate3d(0,0,0) scale(1) rotate(0deg);}`
const sparkleFloat = keyframes`from{opacity:0;transform:translate3d(0,10px,0) scale(0.7);}45%{opacity:1;}to{opacity:0;transform:translate3d(0,-34px,0) scale(1.25);}`
const packFlap = keyframes`
  0%,38%{transform:translate3d(0,0,0) rotateX(0deg) scaleY(1);}
  64%{transform:translate3d(0,-8px,0) rotateX(46deg) scaleY(0.82);}
  100%{transform:translate3d(0,-11px,0) rotateX(62deg) scaleY(0.7);}
`
const cardEject = keyframes`
  0%,30%{opacity:0;transform:translate3d(-50%,34px,0) rotate(0deg) scale(0.78);}
  66%,100%{opacity:1;transform:translate3d(calc(-50% + var(--x)),calc(-1 * var(--y)),0) rotate(var(--r)) scale(1);}
`
const burstRing = keyframes`from{opacity:0.48;transform:translate3d(-50%,-50%,0) scale(0.54);}to{opacity:0;transform:translate3d(-50%,-50%,0) scale(1.55);}`
const openingSceneFade = keyframes`from{opacity:0;transform:translate3d(0,8px,0) scale(0.98);}to{opacity:1;transform:translate3d(0,0,0) scale(1);}`

export function PackSimulationDialog({ simulation, rarities, types, onClose, onSimulateAgain }: {
  simulation: PackSimulation | null; rarities: RarityConfig[]; types: NoteTypeConfig[]; onClose: () => void; onSimulateAgain: () => void
}) {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (!simulation) return
    setRevealed(false)
    const timeout = window.setTimeout(() => setRevealed(true), 1480)
    return () => window.clearTimeout(timeout)
  }, [simulation])

  return (
    <Dialog open={!!simulation} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: radius.xl, mx: 2, overflow: 'hidden', background: '#fffaf7' } } }}>
      {simulation && (
        <>
          <Box sx={{ p: 2, background: simulation.pack.gradient, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 15% 0%, rgba(255,255,255,0.62), transparent 38%), radial-gradient(circle at 100% 100%, ${simulation.pack.accent}44, transparent 40%)`, pointerEvents: 'none' }} />
            {[0, 1, 2, 3, 4].map((item) => (
              <Box key={item} sx={{ position: 'absolute', left: `${18 + item * 15}%`, bottom: 18 + (item % 2) * 14, width: 7, height: 7, borderRadius: radius.full, background: 'rgba(255,255,255,0.88)', boxShadow: `0 0 18px ${simulation.pack.accent}88`, animation: `${sparkleFloat} ${1.25 + item * 0.12}s ease-in-out infinite`, animationDelay: `${item * 0.15}s` }} />
            ))}
            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ width: 46, height: 46, borderRadius: radius.lg, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.64)', border: '1px solid rgba(255,255,255,0.78)', boxShadow: `0 8px 20px ${simulation.pack.accent}24`, fontSize: '1.45rem', animation: `${packOpening} 0.95s cubic-bezier(.2,.9,.2,1)` }}>
                {simulation.pack.emoji}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.08rem', color: colors.text.primary }}>
                  {revealed ? simulation.pack.name : 'Abrindo pacotinho...'}
                </Typography>
                <Typography sx={{ fontSize: '0.76rem', color: colors.text.secondary }}>
                  {revealed
                    ? `${simulation.eligibleCount} ${simulation.eligibleCount === 1 ? 'bilhete elegível' : 'bilhetes elegíveis'}`
                    : 'Separando as cartinhas desse pacote'}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <DialogContent sx={{ pt: 2, minHeight: 280 }}>
            {!revealed ? (
              <Box sx={{ py: 3.1, textAlign: 'center', position: 'relative', overflow: 'hidden', animation: `${openingSceneFade} 0.22s ease-out both` }}>
                <Box sx={{ position: 'absolute', left: '50%', top: 112, width: 190, height: 190, borderRadius: radius.full, background: `radial-gradient(circle, ${simulation.pack.accent}24 0%, transparent 66%)`, transform: 'translate(-50%,-50%)', animation: `${burstRing} 1.55s ease-out infinite both`, willChange: 'transform, opacity', pointerEvents: 'none' }} />
                <Box sx={{ position: 'relative', width: 210, height: 188, mx: 'auto', perspective: 680, transform: 'translateZ(0)' }}>
                  {[
                    { x: '-46px', y: '78px', r: '-16deg', delay: '0.28s' },
                    { x: '0px', y: '92px', r: '2deg', delay: '0.38s' },
                    { x: '46px', y: '78px', r: '16deg', delay: '0.48s' },
                  ].map((card, index) => (
                    <Box key={index} sx={{
                      '--x': card.x, '--y': card.y, '--r': card.r,
                      position: 'absolute', left: '50%', bottom: 24, width: 54, height: 76, borderRadius: 2.2,
                      background: 'linear-gradient(135deg,#ffffff,#fff7ed)', border: `1.5px solid ${simulation.pack.accent}42`,
                      boxShadow: `0 12px 26px ${simulation.pack.accent}20`, animation: `${cardEject} 1.2s cubic-bezier(.18,.95,.22,1) both`,
                      animationDelay: card.delay, opacity: 0, overflow: 'hidden', willChange: 'transform, opacity',
                      backfaceVisibility: 'hidden', transform: 'translateZ(0)',
                      '&::before': { content: '""', position: 'absolute', inset: 7, borderRadius: 1.5, border: `1px solid ${simulation.pack.accent}24`, background: `radial-gradient(circle at 50% 20%, ${simulation.pack.accent}20, transparent 48%)` },
                      '&::after': { content: '""', position: 'absolute', left: '50%', top: '50%', width: 16, height: 16, borderRadius: radius.full, background: `${simulation.pack.accent}18`, transform: 'translate(-50%,-50%)' },
                    }} />
                  ))}
                  <Box sx={{ position: 'absolute', left: '50%', bottom: 8, width: 132, height: 132, transform: 'translateX(-50%)', animation: `${packOpeningCentered} 1.24s cubic-bezier(.2,.9,.2,1) both`, willChange: 'transform', backfaceVisibility: 'hidden' }}>
                    <Box sx={{ position: 'absolute', left: 7, right: 7, top: 4, height: 44, borderRadius: `${radius.xl} ${radius.xl} ${radius.md} ${radius.md}`, background: simulation.pack.gradient, border: '2px solid rgba(255,255,255,0.86)', transformOrigin: '50% 100%', animation: `${packFlap} 1.2s cubic-bezier(.2,.85,.2,1) both`, boxShadow: `0 10px 22px ${simulation.pack.accent}28`, zIndex: 3, willChange: 'transform', backfaceVisibility: 'hidden' }} />
                    <Box sx={{ position: 'absolute', inset: '24px 0 0', borderRadius: radius.xl, background: simulation.pack.gradient, border: '2px solid rgba(255,255,255,0.86)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.15rem', zIndex: 2, boxShadow: `0 18px 34px ${simulation.pack.accent}28`, willChange: 'transform', backfaceVisibility: 'hidden',
                      '&::before': { content: '""', position: 'absolute', inset: 0, background: `radial-gradient(circle at 20% 0%, rgba(255,255,255,0.72), transparent 38%), radial-gradient(circle at 90% 100%, ${simulation.pack.accent}34, transparent 42%)` },
                      '&::after': { content: '""', position: 'absolute', inset: -42, background: 'linear-gradient(100deg, transparent 28%, rgba(255,255,255,0.88) 48%, transparent 68%)', animation: `${shineSweep} 1.28s ease-in-out infinite both`, animationDelay: '0.12s', willChange: 'transform' },
                    }}>
                      <Box sx={{ position: 'relative', zIndex: 1 }}>{simulation.pack.emoji}</Box>
                    </Box>
                  </Box>
                </Box>
                <Typography sx={{ mt: 1.1, fontFamily: font.serif, fontSize: '1rem', fontWeight: 800, color: colors.text.primary }}>Abrindo o pacotinho</Typography>
                <Typography sx={{ mt: 0.35, fontSize: '0.76rem', color: colors.text.muted }}>As cartinhas estão saindo do potinho...</Typography>
              </Box>
            ) : (
              <Stack spacing={1.1} sx={{ animation: `${openingSceneFade} 0.2s ease-out both` }}>
                {simulation.guaranteedApplied && (
                  <Box sx={{ px: 1.1, py: 0.7, borderRadius: radius.md, background: `${simulation.pack.accent}12`, border: `1px solid ${simulation.pack.accent}24`, color: simulation.pack.accent, fontSize: '0.74rem', fontWeight: 800 }}>
                    Garantia aplicada nesta simulação.
                  </Box>
                )}
                {simulation.rewards.map((note, index) => {
                  const rarity = rarities.find((item) => item.id === note.rarity)
                  const noteTypes = (note.typeIds?.length ? note.typeIds : [note.typeId]).map((id) => types.find((item) => item.id === id)).filter((x): x is NoteTypeConfig => !!x)
                  return (
                    <Box key={`${note.id}-${index}`} sx={{ p: 1.25, borderRadius: radius.lg, background: rarity?.cardBg ?? ink.surface, border: `1.5px solid ${rarity?.borderColor ?? colors.border.subtle}`, boxShadow: rarity?.glowColor ? `${rarity.shadow}, 0 0 22px ${rarity.glowColor}` : rarity?.shadow, opacity: 0, animation: `${rewardReveal} 0.42s cubic-bezier(.2,.85,.2,1) forwards`, animationDelay: `${index * 0.12}s` }}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <Box sx={{ width: 28, height: 28, borderRadius: radius.md, display: 'flex', alignItems: 'center', justifyContent: 'center', background: rarity?.chipBg ?? 'rgba(0,0,0,0.06)', color: rarity ? ink.primary : ink.secondary, fontSize: '0.78rem', fontWeight: 900, flexShrink: 0 }}>
                          {index + 1}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontFamily: font.serif, fontSize: '0.92rem', fontWeight: 800, color: rarity?.textColor ?? ink.primary, mb: 0.2 }}>{note.title}</Typography>
                          <Typography sx={{ fontSize: '0.74rem', color: rarity?.captionColor ?? ink.secondary, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.45, whiteSpace: 'pre-line' }}>{note.message}</Typography>
                          <Stack direction="row" spacing={0.5} sx={{ mt: 0.75, flexWrap: 'wrap', rowGap: 0.45 }}>
                            {rarity && (
                              <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 0.75, py: 0.25, borderRadius: radius.full, background: rarity.chipBg, border: `1px solid ${rarity.borderColor}`, fontSize: '0.70rem', fontWeight: 750 }}>
                                <Box component="span" sx={gradientTextSx(rarity.chipColor)}>{rarity.emoji} {rarity.label}</Box>
                              </Box>
                            )}
                            {noteTypes.map((type) => (
                              <Box key={type.id} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35, px: 0.75, py: 0.25, borderRadius: radius.full, background: type.tagBg, color: type.tagColor, border: `1px solid ${type.accentColor}44`, fontSize: '0.70rem', fontWeight: 750 }}>
                                {type.emoji} {type.label}
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      </Stack>
                    </Box>
                  )
                })}
              </Stack>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button variant="ghost" onClick={onClose} sx={{ flex: 1, minWidth: 0 }}>Fechar</Button>
            <Button variant="primary" onClick={onSimulateAgain} sx={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', px: 1.2 }}>
              <CasinoOutlinedIcon sx={{ fontSize: 16, mr: 0.45 }} /> Outra
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}
