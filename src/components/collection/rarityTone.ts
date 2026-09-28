import type { ChoiceTone } from '../ui/ChoiceChip'
import type { RarityConfig } from '../../types/note'
import { gradientTextSx } from '../../utils/colorUtils'

export function rarityTone(rarity: Pick<RarityConfig, 'chipBg' | 'chipColor' | 'borderColor'>): ChoiceTone {
  return { bg: rarity.chipBg, border: rarity.borderColor, label: gradientTextSx(rarity.chipColor) }
}
