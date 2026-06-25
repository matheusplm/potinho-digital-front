import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import CasinoOutlinedIcon from '@mui/icons-material/CasinoOutlined'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import { Box, Chip, IconButton, Stack, Typography } from '@mui/material'
import { Card } from '../../components/ui'
import { colors, font, radius } from '../../design-system'
import { actionButtonSx } from './shared'
import { buildPackRules, formatPackSchedule, PACK_DISTRIBUTION_LABELS, PACK_STATUS_LABELS } from './packData'
import type { CollectionPack } from '../../types/note'
import type { PackView } from './packData'

export function PackPreviewCard({ pack, view, onEdit, onDelete, onSimulate, onSetPrimary }: {
  pack: CollectionPack; view: PackView
  onEdit: (pack: CollectionPack) => void
  onDelete: (pack: CollectionPack) => void
  onSimulate: (pack: CollectionPack) => void
  onSetPrimary: (pack: CollectionPack) => void
}) {
  const isActive = pack.status === 'active'
  const isPrimary = pack.category === 'daily'
  const compact = view === 'list'
  const rules = buildPackRules(pack)

  return (
    <Card sx={{ p: 0, overflow: 'hidden', border: `1.5px solid ${pack.accent}28`, boxShadow: `0 8px 24px ${pack.accent}18` }}>
      <Box sx={{ p: compact ? 1.25 : 1.6, background: pack.gradient, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 15% 0%, rgba(255,255,255,0.58), transparent 38%), radial-gradient(circle at 100% 100%, ${pack.accent}44, transparent 40%)`, pointerEvents: 'none' }} />
        <Stack direction="row" alignItems="center" spacing={1.1} sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ width: compact ? 38 : 44, height: compact ? 38 : 44, borderRadius: radius.lg, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.62)', border: '1px solid rgba(255,255,255,0.78)', boxShadow: `0 6px 18px ${pack.accent}24`, fontSize: compact ? '1.25rem' : '1.45rem' }}>
            {pack.emoji}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={0.7} alignItems="flex-start" sx={{ mb: 0.25 }}>
              <Typography sx={{ flex: 1, minWidth: 0, fontFamily: font.serif, fontWeight: 800, fontSize: compact ? '0.92rem' : '1rem', color: colors.text.primary, lineHeight: 1.15, display: '-webkit-box', WebkitLineClamp: compact ? 1 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                {pack.name}
              </Typography>
              <Chip label={isPrimary ? 'Principal' : PACK_STATUS_LABELS[pack.status]} size="small"
                sx={{ height: 19, fontSize: '0.68rem', fontWeight: 900, background: isPrimary ? '#fef3c7' : isActive ? '#dcfce7' : 'rgba(255,255,255,0.62)', color: isPrimary ? '#b45309' : isActive ? '#15803d' : colors.text.secondary, flexShrink: 0, '& .MuiChip-label': { px: 0.75 } }} />
            </Stack>
            <Typography sx={{ fontSize: compact ? '0.7rem' : '0.76rem', color: colors.text.secondary, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: compact ? 2 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
              {pack.description}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: compact ? 1.25 : 1.6 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : 'repeat(3, 1fr)', gap: 0.8, mb: compact ? 1 : 1.2 }}>
          {[['Cartas', `${pack.cardsPerOpen}`], ['Disponib.', formatPackSchedule(pack)], ['Distribuição', PACK_DISTRIBUTION_LABELS[pack.distribution]]].map(([label, value]) => (
            <Box key={label} sx={{ p: compact ? 0.75 : 0.9, borderRadius: radius.md, background: `${pack.accent}0f`, border: `1px solid ${pack.accent}18`, display: compact ? 'flex' : 'block', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.25 }}>{label}</Typography>
              <Typography sx={{ fontSize: compact ? '0.68rem' : '0.7rem', fontWeight: 800, color: pack.accent, lineHeight: 1.15, textAlign: compact ? 'right' : 'left', minWidth: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                {value}
              </Typography>
            </Box>
          ))}
        </Box>

        <Stack spacing={0.75}>
          <Typography sx={{ fontSize: '0.70rem', fontWeight: 900, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.8 }}>Regras</Typography>
          <Box sx={{ display: 'flex', gap: 0.55, flexWrap: 'wrap' }}>
            {rules.map((rule) => (
              <Box key={rule} sx={{ px: 0.9, py: 0.35, borderRadius: radius.full, background: 'rgba(0,0,0,0.035)', border: '1px solid rgba(0,0,0,0.045)', color: colors.text.secondary, fontSize: '0.72rem', fontWeight: 750, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {rule}
              </Box>
            ))}
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.6} justifyContent="flex-end" sx={{ mt: 1.3, flexWrap: 'wrap', rowGap: 0.6 }}>
          <IconButton size="small" aria-label={isPrimary ? 'pacotinho principal' : 'definir pacotinho principal'} onClick={() => !isPrimary && onSetPrimary(pack)} disabled={isPrimary} sx={actionButtonSx(isPrimary ? 'neutral' : 'primary')}>
            {isPrimary ? <StarIcon sx={{ fontSize: 16, color: '#eab308' }} /> : <StarBorderIcon sx={{ fontSize: 16 }} />}
          </IconButton>
          <IconButton size="small" aria-label="simular abertura do pacotinho" onClick={() => onSimulate(pack)} sx={actionButtonSx('neutral')}>
            <CasinoOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton size="small" aria-label="editar pacotinho" onClick={() => onEdit(pack)} sx={actionButtonSx('primary')}>
            <EditOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton size="small" aria-label="excluir pacotinho" onClick={() => onDelete(pack)} sx={actionButtonSx('danger')}>
            <DeleteForeverOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
      </Box>
    </Card>
  )
}
