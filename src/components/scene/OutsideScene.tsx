import { Box, ButtonBase, Tooltip, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useBackground } from '../../context/BackgroundContext'
import { backgroundThemes, font } from '../../design-system'
import { FloatingParticles } from '../FloatingParticles'
import { PotinhoMark } from '../PotinhoMark'
import { Cloud, Horizon } from './WindowScene'
import { sceneLook } from './sceneLook'

const bob = keyframes`
  0%, 100% { transform: translateY(0) rotate(var(--tilt)); }
  50%      { transform: translateY(-10px) rotate(calc(var(--tilt) + 5deg)); }
`

const sway = keyframes`
  0%, 100% { transform: rotate(var(--tilt)); }
  50%      { transform: rotate(calc(var(--tilt) + 3deg)); }
`

type Spot = { left: string; bottom: string; size: number; tilt: number; float?: boolean }

function spots(shape: string, horizon?: string): Spot[] {
  if (shape === 'porthole') return [{ left: '10%', bottom: 'calc(34% - 70px)', size: 120, tilt: -18, float: true }, { left: '78%', bottom: 'calc(34% - 18px)', size: 44, tilt: 22, float: true }]
  if (shape === 'submarine') return [{ left: '8%', bottom: '2%', size: 132, tilt: 28 }, { left: '80%', bottom: '5%', size: 58, tilt: -34 }]
  if (horizon) return [{ left: '6%', bottom: '1%', size: 140, tilt: -26 }, { left: '82%', bottom: '4%', size: 56, tilt: 18 }]
  return [{ left: '6%', bottom: '2%', size: 128, tilt: -22 }, { left: '84%', bottom: '24%', size: 46, tilt: 14 }]
}

export function OutsideScene() {
  const { theme } = useBackground()
  const { shape, horizon } = sceneLook(theme.key)
  const night = theme.isDark
  const underwater = shape === 'submarine'

  return (
    <Box aria-hidden sx={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none', background: theme.sky, transition: 'background 0.5s ease' }}>
      {!underwater && (night ? (
        <Box sx={{ position: 'absolute', top: '9%', right: '14%', width: 64, height: 64, borderRadius: '50%', boxShadow: '18px 10px 0 0 #f3ead2', filter: 'drop-shadow(0 0 22px rgba(243,234,210,0.45))' }} />
      ) : (
        <Box sx={{ position: 'absolute', top: '8%', right: '12%', width: 92, height: 92, borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, #fff7da, #f7d27a)', boxShadow: '0 0 0 18px rgba(255,236,170,0.3), 0 0 80px rgba(255,220,140,0.6)' }} />
      ))}
      {!night && !underwater && (
        <Box sx={{ position: 'absolute', inset: 0, containerType: 'inline-size' }}>
          <Cloud top="10%" scale={1.6} duration={120} delay={-30} />
          <Cloud top="24%" scale={1.1} duration={160} delay={-90} />
          <Cloud top="16%" scale={0.8} duration={200} delay={-150} />
        </Box>
      )}
      <FloatingParticles />
      <Horizon shape={shape} night={night} horizon={horizon} />
      {spots(shape, horizon).map((s, i) => (
        <Box key={i} sx={{
          position: 'absolute', left: s.left, bottom: s.bottom, zIndex: 2, transformOrigin: 'bottom left',
          display: i > 0 ? { xs: 'none', sm: 'block' } : 'block',
          transform: { xs: 'scale(0.68)', sm: 'none' },
        }}>
          <Box sx={{
            '--tilt': `${s.tilt}deg`, transform: `rotate(${s.tilt}deg)`, transformOrigin: 'bottom center',
            animation: `${s.float ? bob : sway} ${s.float ? 4 + i : 7 + i * 2}s ease-in-out infinite`,
            filter: 'drop-shadow(4px 6px 0 rgba(0,0,0,0.18))',
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}>
            <PotinhoMark size={s.size} />
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export function ViewPicker() {
  const { theme, themeKey, setThemeKey } = useBackground()
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, px: 2, pt: 1, pb: 1.4, background: theme.surfaceBg, border: `1.5px solid ${theme.surfaceBorder}`, borderRadius: '6px', boxShadow: '3px 4px 0 rgba(0,0,0,0.16)', transform: 'rotate(-1deg)' }}>
      <Typography sx={{ fontFamily: font.hand, fontSize: '1.25rem', lineHeight: 1, color: theme.textOnBgMuted }}>
        troca a vista
      </Typography>
      <Box role="radiogroup" aria-label="Tema" sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.9, maxWidth: 470 }}>
        {backgroundThemes.map((t) => {
          const sel = t.key === themeKey
          return (
            <Tooltip key={t.key} title={t.label} placement="top" arrow enterTouchDelay={0} leaveTouchDelay={1200}>
              <ButtonBase
                role="radio"
                aria-checked={sel}
                aria-label={t.label}
                onClick={() => setThemeKey(t.key)}
                sx={{
                  width: 30, height: 30, borderRadius: '50%', background: t.sky,
                  border: `2px solid ${sel ? '#fffdf7' : 'rgba(42,36,29,0.45)'}`,
                  boxShadow: sel ? `0 0 0 2.5px ${t.ink}, 2px 3px 0 rgba(0,0,0,0.2)` : '1px 2px 0 rgba(0,0,0,0.15)',
                  transform: sel ? 'scale(1.15)' : 'none', transition: 'transform 0.15s, box-shadow 0.15s',
                  '&:hover': { transform: 'scale(1.1)' },
                  '&:focus-visible': { outline: '2px dashed #fffdf7', outlineOffset: 3 },
                }}
              />
            </Tooltip>
          )
        })}
      </Box>
    </Box>
  )
}
