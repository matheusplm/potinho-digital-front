import { Box, Stack, Typography } from '@mui/material'
import { font, radius, shadow, shimmer } from '../../design-system'
import type { DemoNote } from './landingData'

export function DemoNoteCard({ note }: { note: DemoNote }) {
  return (
    <Box sx={{
      background: note.rarityBg, borderRadius: radius.xl,
      border: `1.5px solid ${note.border}`, boxShadow: note.glow || shadow.sm,
      p: 2, position: 'relative', overflow: 'hidden',
      transition: 'transform 0.18s, box-shadow 0.18s',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: note.glow ? note.glow.replace(')', ', 0.36)').replace('0.', '0.3') : shadow.md },
    }}>
      {note.legendary && (
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg,transparent 20%,rgba(253,230,138,0.35) 50%,transparent 80%)',
          backgroundSize: '200% auto', animation: `${shimmer} 2.8s linear infinite`,
          pointerEvents: 'none', borderRadius: radius.xl,
        }} />
      )}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: note.rarityColor }}>
          {note.rarity}
        </Typography>
        <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: note.rarityColor, opacity: 0.65 }}>
          {note.legendary ? '★' : '◆'}
        </Typography>
      </Stack>
      <Typography sx={{ fontFamily: font.serif, fontSize: '0.84rem', color: note.rarityColor, lineHeight: 1.6, mb: 1.2 }}>
        {note.content}
      </Typography>
      <Box sx={{
        display: 'inline-flex', alignItems: 'center', px: 0.9, py: 0.25,
        borderRadius: radius.full, background: `${note.rarityColor}12`, border: `1px solid ${note.rarityColor}20`,
      }}>
        <Typography sx={{ fontSize: '0.64rem', fontWeight: 700, color: note.rarityColor }}>
          {note.type}
        </Typography>
      </Box>
    </Box>
  )
}
