import { Box } from '@mui/material'
import { PackPouch } from '../../components/pack-opening/PackPouch'
import { withAlpha } from '../../utils/colorUtils'
import type { CollectionPackFormData } from '../../types/note'

const SCALE = 0.62

export function PackPouchPreview({ form }: { form: CollectionPackFormData }) {
  return (
    <Box
      ref={(el: HTMLDivElement | null) => { if (el) el.inert = true }}
      aria-hidden
      sx={{ display: 'flex', justifyContent: 'center', pt: 2.2, pb: 2.6, background: `radial-gradient(circle at 50% 48%, ${withAlpha(form.accent, 22)}, transparent 60%)` }}
    >
      <Box sx={{ width: 216 * SCALE, height: 300 * SCALE }}>
        <Box sx={{ transform: `scale(${SCALE})`, transformOrigin: 'top left' }}>
          <PackPouch
            gradient={form.gradient}
            accent={form.accent}
            emoji={form.emoji}
            look={form}
            name={form.name.trim() || 'Meu pacotinho'}
            state="idle"
            onTorn={() => {}}
            reducedMotion={false}
          />
        </Box>
      </Box>
    </Box>
  )
}
