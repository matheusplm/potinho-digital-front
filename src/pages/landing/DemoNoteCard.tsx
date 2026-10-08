import { Box } from '@mui/material'
import poweredByGiphy from '../../assets/giphy/powered-by-giphy-light.png'
import { RewardCard } from '../../components/collection/RewardCard'
import { DEMO_RARITIES, DEMO_TYPES, toReward, type DemoNote } from './landingData'

export function DemoNoteCard({ note, eager = false }: { note: DemoNote; eager?: boolean }) {
  return (
    <Box sx={{ position: 'relative' }}>
      <RewardCard reward={toReward(note)} rarities={DEMO_RARITIES} types={DEMO_TYPES} expanded lazyImage={!eager} />
      {note.gif && (
        <Box
          component="img"
          src={poweredByGiphy}
          alt="Powered by GIPHY"
          sx={{ position: 'absolute', right: 10, bottom: 8, height: 9, opacity: 0.5, pointerEvents: 'none', zIndex: 2 }}
        />
      )}
    </Box>
  )
}
