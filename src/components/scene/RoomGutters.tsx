import { Box } from '@mui/material'
import { Room, RoomCorner } from './Furniture'

const WIDE = '@media (min-width: 1280px)'
const ROOMY = '@media (min-width: 1480px)'

export function RoomGutters() {
  return (
    <Box aria-hidden sx={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', display: 'none', [WIDE]: { display: 'block' } }}>
      <Room windowHeight={118} pieces={1} sx={{ position: 'absolute', left: '3%', bottom: 28, [ROOMY]: { transform: 'scale(1.18)', transformOrigin: 'bottom left' } }} />
      <RoomCorner side="right" size={66} sx={{ position: 'absolute', right: '3%', bottom: 30, [ROOMY]: { transform: 'scale(1.18)', transformOrigin: 'bottom right' } }} />
    </Box>
  )
}
