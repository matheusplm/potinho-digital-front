import FavoriteIcon from '@mui/icons-material/Favorite'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { Box, Typography } from '@mui/material'
import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { chevronPulse, colors, dropFade, heartBeat } from '../../design-system'

function hasScrollableContent(): boolean {
  const main = document.querySelector('main')
  if (!main) return false
  for (const el of main.querySelectorAll('*')) {
    const { overflowY } = window.getComputedStyle(el)
    if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 10) {
      return true
    }
  }
  return false
}

export function ScrollHint() {
  const [visible, setVisible] = useState(false)
  const location = useLocation()
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setVisible(false)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (hasScrollableContent()) setVisible(true)
    }, 550)
    return () => clearTimeout(timerRef.current)
  }, [location.pathname])

  useEffect(() => {
    const hide = () => setVisible(false)
    document.addEventListener('scroll', hide, { capture: true, passive: true })
    document.addEventListener('touchmove', hide, { capture: true, passive: true })
    return () => {
      document.removeEventListener('scroll', hide, { capture: true })
      document.removeEventListener('touchmove', hide, { capture: true })
    }
  }, [])

  if (!visible) return null

  return (
    <Box sx={{
        position: 'fixed',
        top: '43%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        pointerEvents: 'none',
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.6,
          animation: `${dropFade} 3.2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
        }}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.7,
          }}>
          <Box sx={{
            width: 48, height: 48,
            borderRadius: '50%',
            background: `linear-gradient(160deg, ${colors.rose.main}, ${colors.purple.main})`,
            border: '1.5px solid rgba(255,255,255,0.28)',
            boxShadow: `0 8px 28px ${colors.rose.glow}, inset 0 1px 0 rgba(255,255,255,0.22)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
          }}>
            <FavoriteIcon sx={{
              fontSize: 16,
              color: '#fff',
              animation: `${heartBeat} 1.6s ease-in-out infinite`,
              lineHeight: 1,
            }} />
            <KeyboardArrowDownIcon sx={{
              fontSize: 18,
              color: 'rgba(255,255,255,0.9)',
              animation: `${chevronPulse} 1.4s ease-in-out infinite`,
              mt: '-2px',
            }} />
          </Box>
          <Typography sx={{
            fontSize: '0.66rem',
            fontWeight: 800,
            letterSpacing: 0.6,
            color: '#fff',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            px: 1.2,
            py: 0.4,
            borderRadius: 99,
            background: 'rgba(15,23,42,0.62)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
          }}>
            deslize para baixo
          </Typography>
          </Box>
        </Box>
      </Box>
  )
}
