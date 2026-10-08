import { Box } from '@mui/material'
import poweredByGiphy from '../../assets/giphy/powered-by-giphy-light.png'
import { RewardCard } from '../../components/collection/RewardCard'
import { DEMO_RARITIES, DEMO_TYPES, toReward, type DemoNote } from './landingData'

const FILL_SX = {
  height: '100%',
  '& > div:first-of-type': { height: '100%', display: 'flex', flexDirection: 'column' },
  '& > div:first-of-type > .MuiStack-root': { flex: 1, justifyContent: 'space-between' },
}

export function DemoNoteCard({ note, eager = false, fill = false }: { note: DemoNote; eager?: boolean; fill?: boolean }) {
  return (
    <Box sx={{ position: 'relative', ...(fill ? FILL_SX : {}) }}>
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
