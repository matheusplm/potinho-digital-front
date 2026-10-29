import { Box } from '@mui/material'
import { RoomCorner } from './Furniture'
import { SillScene } from './WindowScene'

const WIDE = '@media (min-width: 1280px)'
const ROOMY = '@media (min-width: 1480px)'

export function RoomGutters() {
  return (
    <Box aria-hidden sx={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', display: 'none', [WIDE]: { display: 'block' } }}>
      <Box sx={{ position: 'absolute', left: '4%', top: 96 }}>
        <SillScene height={110} />
      </Box>
      <Box sx={{ position: 'absolute', right: '5%', top: 150, display: 'none', [ROOMY]: { display: 'block' } }}>
        <SillScene height={92} />
      </Box>
      <RoomCorner side="left" size={78} sx={{ position: 'absolute', left: '3%', bottom: 30, [ROOMY]: { transform: 'scale(1.2)', transformOrigin: 'bottom left' } }} />
      <RoomCorner side="right" size={78} sx={{ position: 'absolute', right: '3%', bottom: 30, [ROOMY]: { transform: 'scale(1.2)', transformOrigin: 'bottom right' } }} />
    </Box>
  )
}
