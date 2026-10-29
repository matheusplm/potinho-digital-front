import { Box, ButtonBase, Typography } from '@mui/material'
import { useBackground } from '../../context/BackgroundContext'
import { backgroundThemes, colors, font } from '../../design-system'
import { SectionTitle } from './SectionTitle'

const TILTS = [-2.5, 1.5, -1, 2, -1.8, 1, -0.6, 2.4, -2, 0.8, -1.4, 1.8]

export function ThemesShowcase() {
  const { themeKey, setThemeKey } = useBackground()

  return (
    <Box component="section" sx={{ maxWidth: 1180, mx: 'auto', px: { xs: 2.5, md: 5 }, py: { xs: 8, md: 11 } }}>
      <SectionTitle kicker="pra cada pessoa, um papel" sub="Quem recebe escolhe o fundo que mais combina. Toca num pra ver esta página mudar.">
        {`${backgroundThemes.length} papéis pra escolher`}
      </SectionTitle>
      <Box role="radiogroup" aria-label="Tema de fundo" sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 2.8 }, rowGap: { xs: 2.5, md: 3.5 }, pt: 1 }}>
        {backgroundThemes.map((t, i) => {
          const sel = t.key === themeKey
          return (
            <ButtonBase
              key={t.key}
              role="radio"
              aria-checked={sel}
              aria-label={t.label}
              onClick={() => setThemeKey(t.key)}
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, borderRadius: '4px', '&:focus-visible': { outline: `2px dashed ${colors.text.primary}`, outlineOffset: 6 } }}
            >
              <Box sx={{
                position: 'relative',
                width: { xs: 74, md: 92 }, height: { xs: 92, md: 114 },
                background: t.gradient,
                border: `1px solid ${t.isDark ? 'rgba(0,0,0,0.4)' : 'rgba(60,42,20,0.16)'}`,
                boxShadow: sel ? '4px 6px 0 rgba(60,42,20,0.22)' : '2px 3px 0 rgba(60,42,20,0.12)',
                transform: sel ? `rotate(0deg) translateY(-6px)` : `rotate(${TILTS[i % TILTS.length]}deg)`,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': { transform: 'rotate(0deg) translateY(-4px)' },
              }}>
                <Box sx={{ position: 'absolute', top: -7, left: '50%', width: 38, height: 13, transform: 'translateX(-50%) rotate(-3deg)', background: t.accent, opacity: 0.55 }} />
                <Box sx={{ position: 'absolute', left: 10, right: 10, bottom: 12, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {[1, 0.75, 0.5].map((w) => (
                    <Box key={w} sx={{ height: 2, width: `${w * 100}%`, background: t.textOnBg, opacity: 0.25 }} />
                  ))}
                </Box>
              </Box>
              <Typography sx={{ fontFamily: font.hand, fontSize: '1.2rem', lineHeight: 1, color: sel ? colors.text.primary : colors.text.secondary, fontWeight: sel ? 700 : 500, borderBottom: `1.5px solid ${sel ? colors.text.primary : 'transparent'}`, whiteSpace: 'nowrap' }}>
                {t.label}
              </Typography>
            </ButtonBase>
          )
        })}
      </Box>
    </Box>
  )
}
