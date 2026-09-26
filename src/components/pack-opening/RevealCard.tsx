import { Box, Typography } from '@mui/material'
import { font } from '../../design-system'
import type { NoteTypeConfig, RarityConfig } from '../../types/note'
import { RewardCard } from '../collection/RewardCard'
import { badgePop, edgeGlow, haloPulse, hueSpin, ringBurst, tremble } from './motion'
import { CARD_WIDTH, rainbowConic, withAlpha, type RevealItem, type Tier } from './tiers'

const GLOW_STRENGTH: Record<Tier, number> = { common: 18, rare: 45, epic: 70, legendary: 90 }
const RING_MASK = 'radial-gradient(circle, transparent 63%, black 65%, black 69%, transparent 71%)'

export function RevealCard({ item, flipped, backFill, accent, emoji, rarities, types, reducedMotion, onActivate, label }: {
  item: RevealItem
  flipped: boolean
  backFill: string
  accent: string
  emoji: string
  rarities: RarityConfig[]
  types: NoteTypeConfig[]
  reducedMotion: boolean
  onActivate: () => void
  label: string
}) {
  const { style } = item
  const special = style.tier === 'epic' || style.tier === 'legendary'
  const strength = GLOW_STRENGTH[style.tier]
  const glow = style.rainbow ? '#ffffff' : style.color
  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onActivate}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate() } }}
      sx={{
        position: 'relative', width: CARD_WIDTH, perspective: '1400px', cursor: 'pointer', outline: 'none',
        animation: !flipped && style.tremble && !reducedMotion ? `${tremble} ${style.tier === 'legendary' ? 0.12 : 0.2}s linear infinite` : 'none',
        borderRadius: '22px', '&:focus-visible': { outline: `3px solid ${accent}`, outlineOffset: 4 },
      }}
    >
      {style.rainbow && (
        <Box aria-hidden sx={{
          position: 'absolute', inset: special ? -22 : -12, borderRadius: '34px', pointerEvents: 'none',
          background: rainbowConic(), '--blur': special ? '24px' : '16px',
          '--halo-min': (strength * 0.6) / 100, '--halo-max': strength / 100,
          filter: 'blur(var(--blur))', opacity: strength / 100,
          animation: reducedMotion ? 'none' : `${hueSpin} 4s linear infinite, ${haloPulse} ${special ? 1.1 : 2.2}s ease-in-out infinite`,
        }} />
      )}

      <Box sx={{
        position: 'relative', display: 'grid', transformStyle: 'preserve-3d', borderRadius: '22px',
        transition: reducedMotion ? 'none' : 'transform 0.8s cubic-bezier(.2,.85,.25,1.15)',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>
        <Box sx={{
          gridArea: '1 / 1', position: 'relative', minHeight: 260, borderRadius: '22px', overflow: 'hidden',
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', background: backFill,
          border: '2px solid rgba(255,255,255,0.75)',
          boxShadow: `0 20px 44px rgba(15,23,42,0.22), 0 0 ${special ? 46 : 26}px ${withAlpha(glow, style.rainbow ? 50 : strength)}`,
        }}>
          <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(rgba(255,255,255,0.45) 1.2px, transparent 1.7px) 0 0 / 16px 16px', opacity: 0.6 }} />
          <Box sx={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 30% 15%, rgba(255,255,255,0.7), transparent 50%), linear-gradient(160deg, transparent 40%, ${withAlpha(accent, 35)})` }} />
          <Box sx={{ position: 'absolute', inset: 12, borderRadius: '16px', border: '1.5px dashed rgba(255,255,255,0.7)' }} />
          <Box sx={{
            position: 'absolute', inset: 0, borderRadius: '22px', pointerEvents: 'none',
            boxShadow: `inset 0 0 ${special ? 40 : 22}px ${withAlpha(glow, strength)}`,
            animation: reducedMotion || style.tier === 'common' ? 'none' : `${edgeGlow} ${special ? 0.9 : 2}s ease-in-out infinite`,
          }} />
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.4 }}>
            <Box sx={{
              width: 92, height: 92, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.8rem',
              background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95), rgba(255,255,255,0.5))',
              boxShadow: `0 10px 24px ${withAlpha(accent, 28)}`,
            }}>
              {emoji}
            </Box>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '0.95rem', color: 'rgba(30,41,59,0.75)' }}>Potinho Digital</Typography>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(30,41,59,0.55)' }}>toque pra virar</Typography>
          </Box>
        </Box>

        <Box sx={{
          gridArea: '1 / 1', alignSelf: 'center', position: 'relative', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)', maxHeight: '58vh', overflowY: 'auto', borderRadius: '18px',
          boxShadow: `0 24px 50px rgba(15,23,42,0.25), 0 0 ${special ? 60 : 30}px ${withAlpha(glow, style.rainbow ? 50 : strength)}`,
        }}>
          <RewardCard reward={{ ...item.reward, isNew: false }} rarities={rarities} types={types} expanded />
        </Box>
      </Box>

      {flipped && !reducedMotion && style.tier !== 'common' && (
        <Box aria-hidden sx={{
          position: 'absolute', left: '50%', top: '50%', width: '120%', aspectRatio: '1', borderRadius: '50%', pointerEvents: 'none',
          animation: `${ringBurst} 0.9s ease-out 0.35s both`,
          ...(style.rainbow
            ? { background: rainbowConic(), maskImage: RING_MASK, WebkitMaskImage: RING_MASK }
            : { border: `3px solid ${withAlpha(glow, 80)}`, boxShadow: `0 0 40px ${withAlpha(glow, 60)}` }),
        }} />
      )}

      {flipped && item.reward.isNew && (
        <Box sx={{
          position: 'absolute', top: -12, right: -6, px: 1.2, py: 0.4, borderRadius: 99, zIndex: 2,
          background: 'linear-gradient(135deg, #f472b6, #fb7185)', color: '#fff', fontSize: '0.74rem', fontWeight: 900, letterSpacing: 0.6,
          boxShadow: '0 6px 16px rgba(244,114,182,0.45)', animation: reducedMotion ? 'none' : `${badgePop} 0.5s cubic-bezier(.2,.9,.3,1.4) 0.55s both`,
        }}>
          NOVO ✨
        </Box>
      )}
    </Box>
  )
}
