import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import LockIcon from '@mui/icons-material/Lock'
import { Box, Card, CardContent, Chip, IconButton, Stack, Typography } from '@mui/material'
import type { Note, Rarity } from '../types/note'

interface RarityConfig {
  label: string
  cardBg: string
  textColor: string
  captionColor: string
  chipBg: string
  chipColor: string
  borderColor: string
  shadow: string
}

const rarityConfig: Record<Rarity, RarityConfig> = {
  comum: {
    label: 'Comum',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    textColor: '#1f2a44',
    captionColor: '#64748b',
    chipBg: '#f1f5f9',
    chipColor: '#475569',
    borderColor: 'rgba(100, 116, 139, 0.18)',
    shadow: '0 4px 18px rgba(0,0,0,0.06)',
  },
  incomum: {
    label: 'Incomum',
    cardBg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    textColor: '#1e3a8a',
    captionColor: '#3b82f6',
    chipBg: 'rgba(219, 234, 254, 0.85)',
    chipColor: '#1e40af',
    borderColor: 'rgba(59, 130, 246, 0.22)',
    shadow: '0 4px 18px rgba(59, 130, 246, 0.12)',
  },
  raro: {
    label: 'Raro',
    cardBg: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
    textColor: '#e0f2fe',
    captionColor: '#93c5fd',
    chipBg: 'rgba(255, 255, 255, 0.15)',
    chipColor: '#bfdbfe',
    borderColor: 'rgba(147, 197, 253, 0.22)',
    shadow: '0 4px 24px rgba(30, 58, 138, 0.3)',
  },
  lendario: {
    label: 'Lendário',
    cardBg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 55%, #fde68a 100%)',
    textColor: '#451a03',
    captionColor: '#92400e',
    chipBg: 'rgba(251, 191, 36, 0.28)',
    chipColor: '#78350f',
    borderColor: 'rgba(245, 158, 11, 0.35)',
    shadow: '0 4px 22px rgba(245, 158, 11, 0.2)',
  },
  mitico: {
    label: 'Mítico',
    cardBg: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 35%, #ede9fe 65%, #e0f2fe 100%)',
    textColor: '#1f2a44',
    captionColor: '#7c3aed',
    chipBg: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    chipColor: '#fff',
    borderColor: 'rgba(139, 92, 246, 0.26)',
    shadow: '0 4px 24px rgba(139, 92, 246, 0.16)',
  },
}

interface NoteCardProps {
  note: Note
  onToggleFavorite: (note: Note) => void
}

export function NoteCard({ note, onToggleFavorite }: NoteCardProps) {
  const cfg = rarityConfig[note.rarity]

  if (!note.owned) {
    return (
      <Card
        sx={{
          background: 'rgba(241, 245, 249, 0.75)',
          border: '1.5px solid rgba(148, 163, 184, 0.18)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        }}
      >
        <CardContent sx={{ py: '12px !important' }}>
          <Stack spacing={0.9}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Chip
                label={cfg.label.toUpperCase()}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  bgcolor: '#e2e8f0',
                  color: '#94a3b8',
                  filter: 'grayscale(1)',
                  '& .MuiChip-label': { px: 0.9 },
                }}
              />
              <LockIcon sx={{ color: '#94a3b8', fontSize: 17 }} />
            </Stack>
            <Typography
              variant="h6"
              sx={{ color: '#94a3b8', fontSize: '0.97rem', fontStyle: 'italic' }}
            >
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
    <Card
      sx={{
        background: cfg.cardBg,
        border: `1.5px solid ${cfg.borderColor}`,
        boxShadow: cfg.shadow,
        transition: 'transform 0.18s ease',
        '&:hover': { transform: 'translateY(-2px)' },
      }}
    >
      <CardContent sx={{ py: '14px !important' }}>
        <Stack spacing={1.2}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Chip
              label={cfg.label.toUpperCase()}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.66rem',
                fontWeight: 700,
                background: cfg.chipBg,
                color: cfg.chipColor,
                border: `1px solid ${cfg.borderColor}`,
                '& .MuiChip-label': { px: 0.9 },
              }}
            />
            <IconButton
              aria-label="favoritar bilhete"
              onClick={() => onToggleFavorite(note)}
              size="small"
              sx={{
                color: note.favorite ? '#f43f5e' : cfg.captionColor,
                opacity: note.favorite ? 1 : 0.55,
                transition: 'color 0.2s, opacity 0.2s',
                '&:hover': { opacity: 1, color: '#f43f5e' },
              }}
            >
              {note.favorite
                ? <FavoriteIcon sx={{ fontSize: 19 }} />
                : <FavoriteBorderIcon sx={{ fontSize: 19 }} />
              }
            </IconButton>
          </Stack>

          <Typography
            variant="h6"
            sx={{
              color: cfg.textColor,
              fontSize: '1.0rem',
              fontStyle: 'italic',
              lineHeight: 1.3,
            }}
          >
            {note.title}
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: cfg.textColor, opacity: 0.82, fontSize: '0.87rem', lineHeight: 1.5 }}
          >
            {note.message}
          </Typography>

          <Typography
            variant="caption"
            sx={{ color: cfg.captionColor, fontSize: '0.73rem', display: 'block', opacity: 0.85 }}
          >
            {note.obtainedAt
              ? `Obtido em ${new Date(note.obtainedAt).toLocaleDateString('pt-BR')}`
              : 'Não coletado'}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}
