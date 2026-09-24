import { Box, Typography } from '@mui/material'
import { colors, font } from '../../design-system'

export function SectionTitle({ children, sub }: { children: string; sub?: string }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography component="h2" sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.45rem', color: '#1e3a5f', lineHeight: 1.2 }}>
        {children}
      </Typography>
      <Box sx={{ mt: 0.6, width: 36, height: 2.5, borderRadius: 2, background: 'linear-gradient(90deg,#1d4ed8,#e11d48)' }} />
      {sub && (
        <Typography sx={{ mt: 1.2, fontSize: '0.86rem', color: colors.text.secondary, lineHeight: 1.65 }}>
          {sub}
        </Typography>
      )}
    </Box>
  )
}
