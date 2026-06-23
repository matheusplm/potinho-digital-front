import { Box, Dialog, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { colors, font, radius, shineSweep } from '../../design-system'

export const PACK_OPEN_ANIMATION_MS = 2200

const packOpening = keyframes`
  0%{transform:translate3d(-50%,18px,0) rotate(-8deg) scale(0.86);filter:drop-shadow(0 18px 26px rgba(15,23,42,0.1));}
  20%{transform:translate3d(-50%,0,0) rotate(3deg) scale(1.02);}
  34%{transform:translate3d(-50%,-4px,0) rotate(-2deg) scale(1.04);}
  47%{transform:translate3d(-50%,2px,0) rotate(1deg) scale(1);}
  60%{transform:translate3d(-50%,-12px,0) rotate(0deg) scale(1.07);}
  100%{transform:translate3d(-50%,8px,0) rotate(0deg) scale(0.92);opacity:0.34;}
`
const packFlap = keyframes`
  0%,42%{transform:translate3d(0,0,0) rotateX(0deg) scaleY(1);}
  58%{transform:translate3d(0,-13px,0) rotateX(58deg) scaleY(0.78);}
  78%,100%{transform:translate3d(0,-25px,0) rotateX(76deg) scaleY(0.62);}
`
const cardEject = keyframes`
  0%,43%{opacity:0;transform:translate3d(-50%,48px,0) rotate(0deg) scale(0.72);}
  58%{opacity:1;transform:translate3d(-50%,-18px,0) rotate(0deg) scale(0.9);}
  88%,100%{opacity:1;transform:translate3d(calc(-50% + var(--x)),calc(-1 * var(--y)),0) rotate(var(--r)) scale(1);}
`
const burstRing = keyframes`
  0%,46%{opacity:0;transform:translate3d(-50%,-50%,0) scale(0.42);}
  62%{opacity:0.58;transform:translate3d(-50%,-50%,0) scale(0.82);}
  100%{opacity:0;transform:translate3d(-50%,-50%,0) scale(1.72);}
`
const sparkleFloat = keyframes`
  0%,34%{opacity:0;transform:translate3d(var(--sx),18px,0) scale(0.58);}
  56%{opacity:1;}
  100%{opacity:0;transform:translate3d(var(--ex),-58px,0) scale(1.18);}
`
const stageDot = keyframes`
  0%,100%{opacity:0.38;transform:scale(0.92);}
  45%{opacity:1;transform:scale(1.08);}
`
const revealFlash = keyframes`
  0%,52%{opacity:0;transform:scale(0.78);}
  66%{opacity:0.72;transform:scale(1);}
  100%{opacity:0;transform:scale(1.32);}
`

export function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export function PackOpeningDialog({ open, emoji, accent }: { open: boolean; emoji: string; accent: string }) {
  const steps = ['Preparando', 'Abrindo', 'Revelando']

  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: { sx: { background: 'rgba(15,23,42,0.26)', backdropFilter: 'blur(12px)' } },
        paper: { sx: { mx: 2, borderRadius: '28px', overflow: 'hidden', background: 'rgba(255,250,247,0.98)', boxShadow: '0 28px 90px rgba(15,23,42,0.24)' } },
      }}
    >
      <Box sx={{
        py: 3.2, px: 2.5, textAlign: 'center', position: 'relative', overflow: 'hidden', isolation: 'isolate',
        background: `radial-gradient(circle at 50% 18%, ${accent}2a, transparent 34%), radial-gradient(circle at 12% 8%, rgba(255,255,255,0.9), transparent 34%), linear-gradient(160deg,#fff7ed,#fff1f2,#eef2ff)`,
      }}>
        <Box sx={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.7, zIndex: 0,
          background: `linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.46) 42%, transparent 68%), radial-gradient(circle at 80% 88%, ${accent}18, transparent 38%)`,
        }} />

        {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => (
          <Box key={item} sx={{
            '--sx': `${item % 2 === 0 ? '-' : ''}${10 + item * 2}px`,
            '--ex': `${item % 2 === 0 ? '' : '-'}${14 + item * 3}px`,
            position: 'absolute', left: `${10 + item * 11}%`, bottom: 58 + (item % 4) * 16,
            width: item % 3 === 0 ? 8 : 6, height: item % 3 === 0 ? 8 : 6,
            borderRadius: radius.full, background: 'rgba(255,255,255,0.95)', boxShadow: `0 0 18px ${accent}88`,
            animation: `${sparkleFloat} 2.05s ease-in-out infinite`, animationDelay: `${0.16 + item * 0.09}s`, zIndex: 1,
          }} />
        ))}

        <Box sx={{ position: 'absolute', left: '50%', top: 134, width: 245, height: 245, borderRadius: radius.full, transform: 'translate3d(-50%,-50%,0)', background: `radial-gradient(circle, ${accent}34 0%, ${accent}18 38%, transparent 68%)`, animation: `${burstRing} 2.2s ease-out infinite both`, willChange: 'transform, opacity', zIndex: 1 }} />
        <Box sx={{ position: 'absolute', left: '50%', top: 140, width: 178, height: 178, borderRadius: radius.full, background: 'rgba(255,255,255,0.46)', transform: 'translate3d(-50%,-50%,0)', animation: `${revealFlash} 2.2s ease-out infinite both`, filter: 'blur(2px)', zIndex: 1 }} />

        <Stack direction="row" spacing={0.65} justifyContent="center" sx={{ position: 'relative', zIndex: 2, mb: 1.8 }}>
          {steps.map((step, index) => (
            <Box key={step} sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.45, px: 0.8, py: 0.35,
              borderRadius: radius.full, background: 'rgba(255,255,255,0.64)', border: '1px solid rgba(255,255,255,0.66)',
              color: colors.text.secondary, fontSize: '0.70rem', fontWeight: 850, boxShadow: '0 6px 18px rgba(15,23,42,0.06)',
            }}>
              <Box sx={{ width: 6, height: 6, borderRadius: radius.full, background: accent, animation: `${stageDot} 0.72s ease-in-out infinite`, animationDelay: `${index * 0.52}s` }} />
              {step}
            </Box>
          ))}
        </Stack>

        <Box sx={{ position: 'relative', width: 248, height: 214, mx: 'auto', perspective: 840, transform: 'translateZ(0)', zIndex: 2 }}>
          {[
            { x: '-68px', y: '92px', r: '-18deg', delay: '0.2s' },
            { x: '-22px', y: '112px', r: '-5deg', delay: '0.28s' },
            { x: '24px', y: '112px', r: '6deg', delay: '0.36s' },
            { x: '68px', y: '92px', r: '18deg', delay: '0.44s' },
          ].map((card, index) => (
            <Box key={index} sx={{
              '--x': card.x, '--y': card.y, '--r': card.r,
              position: 'absolute', left: '50%', bottom: 24, width: 55, height: 82,
              borderRadius: 2.2,
              background: index % 2 === 0 ? 'linear-gradient(135deg,#ffffff,#fff7ed)' : 'linear-gradient(135deg,#ffffff,#eef2ff)',
              border: `1.5px solid ${accent}42`, boxShadow: `0 16px 34px ${accent}24`,
              animation: `${cardEject} 2.12s cubic-bezier(.16,.92,.18,1) both`, animationDelay: card.delay,
              opacity: 0, overflow: 'hidden', willChange: 'transform, opacity', backfaceVisibility: 'hidden',
              '&::before': { content: '""', position: 'absolute', inset: 7, borderRadius: 1.6, border: `1px solid ${accent}24`, background: `radial-gradient(circle at 50% 20%, ${accent}24, transparent 48%), linear-gradient(180deg, rgba(255,255,255,0.9), transparent)` },
              '&::after': { content: '""', position: 'absolute', left: '50%', top: '50%', width: 17, height: 17, borderRadius: radius.full, background: `${accent}1f`, transform: 'translate(-50%,-50%)' },
            }} />
          ))}

          <Box sx={{ position: 'absolute', left: '50%', bottom: 0, width: 166, height: 22, borderRadius: radius.full, background: 'radial-gradient(ellipse, rgba(15,23,42,0.18), transparent 68%)', transform: 'translateX(-50%)', filter: 'blur(1px)', zIndex: 0 }} />

          <Box sx={{ position: 'absolute', left: '50%', bottom: 12, width: 150, height: 150, animation: `${packOpening} 2.12s cubic-bezier(.18,.9,.18,1) both`, willChange: 'transform', backfaceVisibility: 'hidden', zIndex: 3 }}>
            <Box sx={{ position: 'absolute', left: 7, right: 7, top: 4, height: 48, borderRadius: `${radius.xl} ${radius.xl} ${radius.md} ${radius.md}`, background: `linear-gradient(135deg, ${colors.rose.light}, ${accent})`, border: '2px solid rgba(255,255,255,0.86)', transformOrigin: '50% 100%', animation: `${packFlap} 2.12s cubic-bezier(.2,.85,.2,1) both`, boxShadow: `0 10px 22px ${accent}28`, zIndex: 3, willChange: 'transform', backfaceVisibility: 'hidden' }} />
            <Box sx={{
              position: 'absolute', inset: '26px 0 0', borderRadius: radius.xl, background: `linear-gradient(135deg, ${colors.rose.light}, ${accent})`, border: '2px solid rgba(255,255,255,0.86)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.25rem', zIndex: 2, boxShadow: `0 20px 38px ${accent}32`, willChange: 'transform', backfaceVisibility: 'hidden',
              '&::before': { content: '""', position: 'absolute', inset: 0, background: `radial-gradient(circle at 20% 0%, rgba(255,255,255,0.78), transparent 38%), radial-gradient(circle at 90% 100%, ${accent}42, transparent 42%)` },
              '&::after': { content: '""', position: 'absolute', inset: -42, background: 'linear-gradient(100deg, transparent 28%, rgba(255,255,255,0.88) 48%, transparent 68%)', animation: `${shineSweep} 1.18s ease-in-out infinite both`, willChange: 'transform' },
            }}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>{emoji}</Box>
            </Box>
          </Box>
        </Box>

        <Typography sx={{ mt: 1.5, fontFamily: font.serif, fontSize: '1.12rem', fontWeight: 850, color: colors.text.primary, position: 'relative', zIndex: 2 }}>
          Abrindo pacotinho...
        </Typography>
        <Typography sx={{ mt: 0.35, fontSize: '0.78rem', color: colors.text.muted, position: 'relative', zIndex: 2 }}>
          Segura aí, os bilhetinhos estão saindo do potinho.
        </Typography>
      </Box>
    </Dialog>
  )
}
