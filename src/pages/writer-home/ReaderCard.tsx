import { Box, LinearProgress, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Button, Card } from '../../components/ui'
import { brandGradient, colors, font, liftOnDark, radius } from '../../design-system'
import { withAlpha } from '../../utils/colorUtils'
import { timeAgo } from '../../utils/timeAgo'
import { readerPath, rhythmLabel, stockLabel, type ReaderSummary, type StockLevel } from './insights'

const STOCK_TONE: Record<StockLevel, string> = {
  ok: '#15803d',
  low: '#b45309',
  done: '#be123c',
  manual: '#64748b',
}

const STOCK_EMOJI: Record<StockLevel, string> = {
  ok: '📦',
  low: '⏳',
  done: '🎉',
  manual: '🎁',
}

export function ReaderCard({ reader, onGift }: { reader: ReaderSummary; onGift: (reader: ReaderSummary, anchor: HTMLElement) => void }) {
  const navigate = useNavigate()
  const completion = reader.total > 0 ? Math.round((reader.owned / reader.total) * 100) : 0
  const tone = liftOnDark(STOCK_TONE[reader.stock.level])
  const rhythm = rhythmLabel(reader.stock)
  const favorites = reader.favorites.length

  return (
    <Card sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1.3} alignItems="center">
          <Box sx={{
            width: 42, height: 42, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: brandGradient(true), color: '#fff', fontFamily: font.serif, fontWeight: 700, fontSize: '1.15rem',
            boxShadow: '0 6px 16px rgba(124,58,237,0.25)',
          }}>
            {reader.name.charAt(0)}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.08rem', color: colors.text.primary, lineHeight: 1.2 }}>
              {reader.name}
            </Typography>
            <Typography variant="xs" noWrap sx={{ color: colors.text.muted }}>
              {reader.collection.emoji} {reader.collection.name} · {reader.email}
            </Typography>
          </Box>
          {reader.recent > 0 && (
            <Box sx={{ px: 1, py: 0.35, borderRadius: radius.full, flexShrink: 0, background: withAlpha('#16a34a', 14), border: `1px solid ${withAlpha('#16a34a', 28)}` }}>
              <Typography variant="xs" sx={{ fontWeight: 800, color: liftOnDark('#15803d'), whiteSpace: 'nowrap' }}>
                +{reader.recent} desde ontem
              </Typography>
            </Box>
          )}
        </Stack>

        <Stack spacing={0.7}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography variant="sm" sx={{ color: colors.text.secondary }}>
              {reader.owned} de {reader.total} bilhetes
            </Typography>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1rem', color: colors.primary.text }}>
              {completion}%
            </Typography>
          </Stack>
          <LinearProgress variant="determinate" value={completion} sx={{
            height: 7, borderRadius: radius.full, bgcolor: colors.fill.medium,
            '& .MuiLinearProgress-bar': { borderRadius: radius.full, background: `linear-gradient(90deg, ${colors.primary.main}, ${colors.purple.main})` },
          }} />
        </Stack>

        <Stack spacing={0.8}>
          <Typography variant="sm" sx={{ color: colors.text.secondary }}>
            🕊️ {reader.lastObtainedAt ? `último bilhete ${timeAgo(reader.lastObtainedAt)}` : 'ainda não abriu nenhum bilhete'}
            {favorites > 0 && ` · 💛 ${favorites} ${favorites === 1 ? 'favorito' : 'favoritos'}`}
          </Typography>
          <Box sx={{ px: 1.2, py: 0.9, borderRadius: radius.md, background: withAlpha(STOCK_TONE[reader.stock.level], 10), border: `1px solid ${withAlpha(STOCK_TONE[reader.stock.level], 22)}` }}>
            <Typography variant="sm" sx={{ fontWeight: 800, color: tone }}>
              {STOCK_EMOJI[reader.stock.level]} {stockLabel(reader.stock)}
            </Typography>
            {rhythm && (
              <Typography variant="xs" sx={{ color: colors.text.muted, mt: 0.2 }}>
                {rhythm}, se abrir todo dia
              </Typography>
            )}
          </Box>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button variant="ghost" onClick={() => navigate(readerPath(reader.slug, reader.email))} sx={{ flex: 1, py: 0.8, fontSize: '0.8rem' }}>
            👀 Ver álbum
          </Button>
          {reader.bonusPacks.length > 0 && (
            <Button variant="ghost" onClick={(event) => onGift(reader, event.currentTarget)} sx={{ flex: 1, py: 0.8, fontSize: '0.8rem' }}>
              🎁 Mandar mimo
            </Button>
          )}
        </Stack>
      </Stack>
    </Card>
  )
}
