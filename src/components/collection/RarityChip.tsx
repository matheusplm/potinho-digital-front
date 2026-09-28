import { Chip, type SxProps, type Theme } from '@mui/material'
import type { RarityConfig } from '../../types/note'
import { gradientTextSx } from '../../utils/colorUtils'
import { mergeSx } from '../ui/sx'

type ChipRarity = Pick<RarityConfig, 'emoji' | 'label' | 'chipBg' | 'chipColor' | 'borderColor'>

const SIZES = {
  sm: { height: 20, fontSize: '0.68rem', px: 0.8 },
  md: { height: 22, fontSize: '0.72rem', px: 1 },
}

export function RarityChip({ rarity, size = 'sm', bordered = false, uppercase = false, sx }: {
  rarity: ChipRarity
  size?: keyof typeof SIZES
  bordered?: boolean
  uppercase?: boolean
  sx?: SxProps<Theme>
}) {
  const { height, fontSize, px } = SIZES[size]
  return (
    <Chip
      size="small"
      label={`${rarity.emoji} ${uppercase ? rarity.label.toUpperCase() : rarity.label}`}
      sx={mergeSx({
        height, fontSize, fontWeight: 800, background: rarity.chipBg,
        border: bordered ? `1px solid ${rarity.borderColor}` : 'none',
        '& .MuiChip-label': { px, ...gradientTextSx(rarity.chipColor) },
      }, sx)}
    />
  )
}
