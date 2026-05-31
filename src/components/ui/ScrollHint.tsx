import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { Box, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { colors } from '../../design-system'

const floatFade = keyframes`
  0%   { opacity: 0; transform: translateX(-50%) translateY(-4px); }
  22%  { opacity: 1; transform: translateX(-50%) translateY(2px); }
  55%  { opacity: 0.95; transform: translateX(-50%) translateY(8px); }
  100% { opacity: 0; transform: translateX(-50%) translateY(18px); }
`

const chevronDrift = keyframes`
  0%   { opacity: 0.4; transform: translateY(-2px); }
  50%  { opacity: 1; transform: translateY(2px); }
  100% { opacity: 0.4; transform: translateY(-2px); }
`

function findScrollable(el: Element, depth = 0): boolean {
  if (depth > 6) return false
  if (el.scrollHeight > el.clientHeight + 20) return true
  return Array.from(el.children).some((child) => findScrollable(child, depth + 1))
}

export function ScrollHint() {
  const [visible, setVisible] = useState(false)
  const location = useLocation()
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setVisible(false)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const main = document.querySelector('main')
      if (main && findScrollable(main)) setVisible(true)
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
      bottom: 72,
      left: '50%',
      zIndex: 200,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0.5,
      animation: `${floatFade} 2.6s ease-in-out infinite`,
    }}>
      <Box sx={{
        width: 30, height: 30, borderRadius: '50%',
        background: `linear-gradient(160deg, ${colors.primary.main}, ${colors.purple.main})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 4px 16px ${colors.primary.glow}`,
        animation: `${chevronDrift} 1.3s ease-in-out infinite`,
      }}>
        <KeyboardArrowDownIcon sx={{ fontSize: 20, color: '#fff' }} />
      </Box>
      <Typography sx={{
        fontSize: '0.62rem', fontWeight: 800, letterSpacing: 0.4,
        color: colors.text.secondary, whiteSpace: 'nowrap', lineHeight: 1,
      }}>
        Deslize para baixo
      </Typography>
    </Box>
  )
}
