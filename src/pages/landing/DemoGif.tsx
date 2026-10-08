import { Box } from '@mui/material'
import { useBackground } from '../../context/BackgroundContext'
import poweredByGiphyDark from '../../assets/giphy/powered-by-giphy-dark.png'
import poweredByGiphyLight from '../../assets/giphy/powered-by-giphy-light.png'
import { radius } from '../../design-system'
import { gifSrc, type DemoNote } from './landingData'

export function DemoGif({ gif, height, eager = false }: { gif: NonNullable<DemoNote['gif']>; height: number; eager?: boolean }) {
  const { theme } = useBackground()
  return (
    <Box sx={{ position: 'relative', height, borderRadius: radius.lg, overflow: 'hidden', background: gif.bg ?? 'rgba(255,255,255,0.55)', display: 'flex', justifyContent: 'center' }}>
      <Box
        component="img"
        src={gifSrc(gif.id)}
        alt={gif.alt}
        loading={eager ? 'eager' : 'lazy'}
        draggable={false}
        sx={{ height: '100%', maxWidth: '100%', objectFit: 'contain', display: 'block', pointerEvents: 'none' }}
      />
      <Box
        component="img"
        src={theme.isDark ? poweredByGiphyDark : poweredByGiphyLight}
        alt="Powered by GIPHY"
        sx={{ position: 'absolute', right: 4, bottom: 4, height: 11, p: '2px 4px', borderRadius: 4, background: 'rgba(255,255,255,0.82)', boxSizing: 'content-box' }}
      />
    </Box>
  )
}
