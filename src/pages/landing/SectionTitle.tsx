import { Box, Typography } from '@mui/material'
import { colors, font } from '../../design-system'

export function SectionTitle({ children, sub, kicker }: { children: string; sub?: string; kicker?: string }) {
  return (
    <Box sx={{ mb: 3 }}>
      {kicker && (
        <Typography sx={{ fontFamily: font.hand, fontSize: '1.35rem', color: colors.primary.text, lineHeight: 1, mb: 0.8 }}>
          {kicker}
        </Typography>
      )}
      <Typography component="h2" sx={{ fontFamily: font.serif, fontWeight: 500, fontSize: { xs: '1.9rem', md: '2.4rem' }, letterSpacing: '-0.02em', color: colors.text.primary, lineHeight: 1.1 }}>
        {children}
      </Typography>
      {sub && (
        <Typography sx={{ mt: 1.4, color: colors.text.secondary, lineHeight: 1.65, fontSize: '1rem', maxWidth: 520 }}>
          {sub}
        </Typography>
      )}
    </Box>
  )
}
