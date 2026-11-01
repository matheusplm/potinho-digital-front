import ContentCutIcon from '@mui/icons-material/ContentCut'
import { Box, ButtonBase, Tooltip, Typography } from '@mui/material'
import { useBackground } from '../../context/BackgroundContext'
import { backgroundThemes, colors, font } from '../../design-system'
import { FloatingParticles } from '../FloatingParticles'
import { Cloud } from './WindowScene'
import { Birds, Celestial, Horizon } from './Horizons'
import { sceneLook } from './sceneLook'

export function OutsideScene() {
  const { theme } = useBackground()
  const { shape, horizon, sky } = sceneLook(theme.key)
  const night = theme.isDark

  return (
    <Box aria-hidden sx={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none', background: theme.sky, transition: 'background 0.5s ease' }}>
      <Celestial sky={sky} night={night} scale={2.1} />
      {!night && sky !== 'none' && (
        <Box sx={{ position: 'absolute', inset: 0, containerType: 'inline-size' }}>
          <Cloud top="10%" scale={1.6} duration={120} delay={-30} />
          <Cloud top="24%" scale={1.1} duration={160} delay={-90} />
          <Cloud top="16%" scale={0.8} duration={200} delay={-150} />
        </Box>
      )}
      {!night && sky !== 'none' && <Birds />}
      <FloatingParticles />
      <Horizon shape={shape} night={night} horizon={horizon} />
    </Box>
  )
}

export function ViewPicker() {
  const { theme, themeKey, setThemeKey } = useBackground()
  return (
    <Box sx={{
      position: 'relative', mx: { xs: -2.5, sm: -4 }, mb: -2.5, mt: 1.6, px: 2, pt: 1.4, pb: 'max(14px, env(safe-area-inset-bottom))',
      borderTop: `2.5px dashed color-mix(in srgb, var(--pd-text-primary) 28%, transparent)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.1,
      background: 'color-mix(in srgb, var(--pd-text-primary) 4%, transparent)',
    }}>
      <ContentCutIcon aria-hidden sx={{ position: 'absolute', top: -11, left: 14, fontSize: 18, color: 'color-mix(in srgb, var(--pd-text-primary) 45%, transparent)', background: theme.surfaceBg, px: '2px', boxSizing: 'content-box' }} />
      <Typography sx={{ fontFamily: font.hand, fontSize: '1.35rem', lineHeight: 1, color: theme.textOnBgMuted, transform: 'rotate(-2deg)' }}>
        troca a vista: <Box component="span" sx={{ color: colors.primary.text, fontWeight: 700 }}>{theme.label}</Box>
      </Typography>
      <Box role="radiogroup" aria-label="Tema" sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 40px)', justifyContent: 'center', gap: 1 }}>
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
                  width: 40, height: 40, borderRadius: '50%', background: t.sky,
                  border: `2px solid ${sel ? '#fffdf7' : 'rgba(42,36,29,0.45)'}`,
                  boxShadow: sel ? `0 0 0 2.5px ${t.ink}, 2px 3px 0 rgba(0,0,0,0.2)` : '1px 2px 0 rgba(0,0,0,0.15)',
                  transform: sel ? 'scale(1.1)' : 'none', transition: 'transform 0.15s, box-shadow 0.15s',
                  '&:hover': { transform: 'scale(1.08)' },
                  '&:focus-visible': { outline: `2px dashed ${colors.text.primary}`, outlineOffset: 3 },
                }}
              />
            </Tooltip>
          )
        })}
      </Box>
    </Box>
  )
}

export function Postmark({ label }: { label: string }) {
  return (
    <Box aria-hidden sx={{ position: 'absolute', top: { xs: 14, sm: 18 }, right: { xs: 12, sm: 18 }, display: 'flex', alignItems: 'center', transform: 'rotate(10deg)', opacity: 0.85, pointerEvents: 'none' }}>
      <Box component="svg" viewBox="0 0 40 24" sx={{ width: { xs: 30, sm: 40 }, mr: '-4px' }}>
        {[5, 12, 19].map((y) => <path key={y} d={`M0 ${y} q 5 -4 10 0 t 10 0 t 10 0 t 10 0`} fill="none" stroke={colors.primary.text} strokeWidth="1.6" />)}
      </Box>
      <Box sx={{
        width: { xs: 58, sm: 70 }, height: { xs: 58, sm: 70 }, borderRadius: '50%', border: `2px solid ${colors.primary.text}`, outline: `1px solid ${colors.primary.text}`, outlineOffset: '3px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: colors.primary.text, textAlign: 'center',
      }}>
        <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.22em', lineHeight: 1 }}>VISTA</Typography>
        <Typography sx={{ fontFamily: font.hand, fontSize: { xs: '0.85rem', sm: '1rem' }, fontWeight: 700, lineHeight: 1.05, px: 0.5 }}>{label}</Typography>
      </Box>
    </Box>
  )
}
