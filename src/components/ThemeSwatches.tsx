import CheckIcon from '@mui/icons-material/Check'
import { Box, Stack, Tooltip, Typography } from '@mui/material'
import { useBackground } from '../context/BackgroundContext'
import { backgroundThemes } from '../design-system'

export function ThemeSwatches({ size = 28, labelColor }: { size?: number; labelColor: string }) {
  const { themeKey, setThemeKey } = useBackground()
  return (
    <Stack spacing={1}>
      {([false, true] as const).map((dark) => (
        <Box key={String(dark)}>
          <Typography sx={{ fontSize: '0.66rem', fontWeight: 700, letterSpacing: 0.5, color: labelColor, textTransform: 'uppercase', mb: 0.6 }}>
            {dark ? 'Escuros' : 'Claros'}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: size >= 28 ? 0.8 : 0.7 }}>
            {backgroundThemes.filter((bg) => bg.isDark === dark).map((bg) => {
              const active = bg.key === themeKey
              return (
                <Tooltip key={bg.key} title={bg.label} enterTouchDelay={0} leaveTouchDelay={1500} placement="top" arrow>
                  <Box
                    component="button"
                    type="button"
                    aria-label={`Tema ${bg.label}`}
                    aria-pressed={active}
                    onClick={() => setThemeKey(bg.key)}
                    sx={{
                      width: size, height: size, borderRadius: '50%', p: 0,
                      background: bg.gradient, cursor: 'pointer', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `2px solid ${active ? bg.accent : 'rgba(0,0,0,0.08)'}`,
                      boxShadow: active ? `0 2px 8px ${bg.accent}55` : 'none',
                      transition: 'all 0.18s',
                      '&:hover': { transform: 'scale(1.12)' },
                    }}
                  >
                    {active && <CheckIcon sx={{ fontSize: size / 2, color: bg.accent }} />}
                  </Box>
                </Tooltip>
              )
            })}
          </Box>
        </Box>
      ))}
    </Stack>
  )
}
