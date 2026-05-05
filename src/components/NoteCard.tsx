import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import {
  alpha,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
  type Theme,
} from '@mui/material'
import type { Note, Rarity } from '../types/note'

const rarityStyles: Record<Rarity, { label: string; background: string; textColor: string }> = {
  comum: {
    label: 'COMUM',
    background: '#ffffff',
    textColor: '#1f2937',
  },
  incomum: {
    label: 'INCOMUM',
    background: '#dbeafe',
    textColor: '#1e3a8a',
  },
  raro: {
    label: 'RARO',
    background: '#1e3a8a',
    textColor: '#f8fafc',
  },
  lendario: {
    label: 'LENDARIO',
    background: 'linear-gradient(135deg, #f8d65b 0%, #e6b800 100%)',
    textColor: '#3d2d00',
  },
  mitico: {
    label: 'MITICO',
    background:
      'linear-gradient(120deg, #ff4d4d 0%, #ffa64d 18%, #ffe34d 36%, #4dff88 54%, #4da6ff 72%, #b84dff 100%)',
    textColor: '#1f2937',
  },
}

function cardStyle(theme: Theme, note: Note) {
  const rarityStyle = rarityStyles[note.rarity]

  if (note.owned) {
    return {
      background: rarityStyle.background,
      color: rarityStyle.textColor,
      border: '2px solid',
      borderColor: alpha('#0f172a', 0.25),
      boxShadow: '0 12px 20px rgba(15, 23, 42, 0.18)',
    }
  }

  return {
    filter: 'grayscale(1)',
    background: alpha(theme.palette.grey[200], 0.8),
    border: '2px solid',
    borderColor: alpha(theme.palette.grey[500], 0.3),
  }
}

interface NoteCardProps {
  note: Note
  onToggleFavorite: (note: Note) => void
}

export function NoteCard({ note, onToggleFavorite }: NoteCardProps) {
  const rarityStyle = rarityStyles[note.rarity]

  return (
    <Card sx={(theme) => cardStyle(theme, note)}>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Chip
              label={rarityStyle.label}
              size="small"
              sx={{
                backgroundColor: note.owned ? alpha('#ffffff', 0.25) : undefined,
                color: note.owned ? rarityStyle.textColor : undefined,
                border: '1px solid',
                borderColor: note.owned ? alpha('#111827', 0.25) : 'divider',
              }}
            />
            <IconButton
              aria-label="favoritar bilhete"
              onClick={() => onToggleFavorite(note)}
              disabled={!note.owned}
            >
              {note.favorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
            </IconButton>
          </Stack>

          <Typography variant="h6">{note.owned ? note.title : 'Bilhete secreto'}</Typography>
          <Typography variant="body2" color={note.owned ? 'inherit' : 'text.secondary'}>
            {note.owned ? note.message : 'Colete este bilhete para revelar a mensagem romantica.'}
          </Typography>
          <Typography variant="caption" color={note.owned ? 'inherit' : 'text.secondary'}>
            {note.obtainedAt
              ? `Obtido em ${new Date(note.obtainedAt).toLocaleDateString('pt-BR')}`
              : 'Ainda nao coletado'}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}
