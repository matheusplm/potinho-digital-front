import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { Box, Stack, Typography } from '@mui/material'
import { useSimulation } from '../context/SimulationContext'
import { useBackground } from '../context/BackgroundContext'
import { colors, font, radius } from '../design-system'

export function SimulationBanner() {
  const { session } = useSimulation()
  const { theme } = useBackground()
  if (!session) return null

  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 480,
      zIndex: 110,
      px: 1.5,
      pt: 'max(10px, env(safe-area-inset-top, 0px))',
      pointerEvents: 'none',
    }}>
      <Box sx={{
        pointerEvents: 'auto',
        px: 1.2,
        py: 0.85,
        borderRadius: radius.lg,
        background: theme.surfaceBg,
        backdropFilter: 'blur(16px)',
        border: `1.5px solid ${colors.primary.main}28`,
        boxShadow: '0 10px 28px rgba(15,23,42,0.12)',
      }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{
            width: 32,
            height: 32,
            borderRadius: radius.md,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${colors.primary.main}14`,
            color: colors.primary.main,
            flexShrink: 0,
          }}>
            <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.70rem', fontWeight: 900, letterSpacing: 0.7, color: colors.primary.main, textTransform: 'uppercase' }}>
              Prévia do leitor
            </Typography>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '0.82rem', color: theme.textOnBg, lineHeight: 1.2 }}>
              {session.collectionEmoji} {session.collectionName}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}
