import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import LockIcon from '@mui/icons-material/Lock'
import { Box, Card, CardContent, Chip, IconButton, Stack, Typography } from '@mui/material'
import type { Note, RarityConfig, NoteTypeConfig } from '../types/note'
import { useCardConfig } from '../context/CardConfigContext'

interface NoteCardProps {
  note: Note
  onToggleFavorite: (note: Note) => void
}

const RARITY_FALLBACK: RarityConfig = {
  id: 'comum', label: 'Comum', emoji: '⚪', odds: 60, order: 1,
  cardBg: 'rgba(255,255,255,0.95)', textColor: '#1f2a44', captionColor: '#64748b',
  borderColor: 'rgba(100,116,139,0.18)', shadow: '0 4px 18px rgba(0,0,0,0.06)',
  glowColor: '', chipBg: '#f1f5f9', chipColor: '#475569',
}

const TYPE_FALLBACK: NoteTypeConfig = {
  id: 'amor', label: 'Amor', emoji: '❤️', order: 1,
  accentColor: '#e11d48', tagBg: 'rgba(225,29,72,0.1)', tagColor: '#be123c',
}

export function NoteCard({ note, onToggleFavorite }: NoteCardProps) {
  const { rarities, types } = useCardConfig()
  const cfg: RarityConfig = rarities[note.rarity] ?? RARITY_FALLBACK
  const typeCfg: NoteTypeConfig = types[note.typeId] ?? TYPE_FALLBACK

  if (!note.owned) {
    return (
      <Card sx={{ background: 'rgba(241,245,249,0.75)', border: '1.5px solid rgba(148,163,184,0.18)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', borderRadius: '10px' }}>
        <CardContent sx={{ py: '12px !important' }}>
          <Stack spacing={0.9}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Chip
                label={cfg.label.toUpperCase()} size="small"
                sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700, bgcolor: '#e2e8f0', color: '#94a3b8', filter: 'grayscale(1)', '& .MuiChip-label': { px: 0.9 } }}
              />
              <LockIcon sx={{ color: '#94a3b8', fontSize: 17 }} />
            </Stack>
            <Typography variant="h6" sx={{ color: '#94a3b8', fontSize: '0.97rem', fontStyle: 'italic' }}>
              Bilhete secreto
            </Typography>
            <Typography variant="body2" sx={{ color: '#b0bec5', fontSize: '0.83rem' }}>
              Abra pacotinhos para revelar este bilhete.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card sx={{
      background: cfg.cardBg,
      border: `1.5px solid ${cfg.borderColor}`,
      borderRadius: '10px',
      boxShadow: cfg.glowColor ? `${cfg.shadow}, 0 0 16px ${cfg.glowColor}` : cfg.shadow,
      transition: 'transform 0.18s ease',
      '&:hover': { transform: 'translateY(-2px)' },
    }}>
      <CardContent sx={{ py: '14px !important' }}>
        <Stack spacing={1.2}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={0.6} alignItems="center">
              <Chip
                label={`${cfg.emoji} ${cfg.label.toUpperCase()}`} size="small"
                sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700, background: cfg.chipBg, color: cfg.chipColor, border: `1px solid ${cfg.borderColor}`, '& .MuiChip-label': { px: 0.9 } }}
              />
              <Box sx={{ px: 0.8, py: 0.2, borderRadius: 1, bgcolor: typeCfg.tagBg, display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <Typography sx={{ fontSize: '0.64rem', lineHeight: 1 }}>{typeCfg.emoji}</Typography>
                <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: typeCfg.tagColor, lineHeight: 1 }}>{typeCfg.label}</Typography>
              </Box>
            </Stack>
            <IconButton
              aria-label="favoritar bilhete"
              onClick={() => onToggleFavorite(note)}
              size="small"
              sx={{ color: note.favorite ? '#f43f5e' : cfg.captionColor, opacity: note.favorite ? 1 : 0.55, transition: 'color 0.2s,opacity 0.2s', '&:hover': { opacity: 1, color: '#f43f5e' } }}
            >
              {note.favorite ? <FavoriteIcon sx={{ fontSize: 19 }} /> : <FavoriteBorderIcon sx={{ fontSize: 19 }} />}
            </IconButton>
          </Stack>

          <Typography variant="h6" sx={{ color: cfg.textColor, fontSize: '1.0rem', fontStyle: 'italic', lineHeight: 1.3 }}>
            {note.title}
          </Typography>

          <Typography variant="body2" sx={{ color: cfg.textColor, opacity: 0.82, fontSize: '0.87rem', lineHeight: 1.5 }}>
            {note.message}
          </Typography>

          <Typography variant="caption" sx={{ color: cfg.captionColor, fontSize: '0.73rem', display: 'block', opacity: 0.85 }}>
            {note.obtainedAt
              ? `Obtido em ${new Date(note.obtainedAt).toLocaleDateString('pt-BR')}`
              : 'Não coletado'}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}
