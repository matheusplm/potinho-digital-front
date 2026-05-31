import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { Box, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { radius } from '../../design-system'

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(5px); }
`

const appear = keyframes`
  from { opacity: 0; transform: translateX(-50%) translateY(10px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
`

const vanish = keyframes`
  from { opacity: 1; transform: translateX(-50%) translateY(0); }
  to   { opacity: 0; transform: translateX(-50%) translateY(8px); }
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
      bottom: 66,
      left: '50%',
      zIndex: 200,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0.3,
      px: 1.8, py: 1,
      borderRadius: radius.full,
      background: 'rgba(30,58,95,0.62)',
      backdropFilter: 'blur(14px)',
      border: '1px solid rgba(255,255,255,0.16)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
      animation: `${appear} 0.3s ease forwards, ${vanish} 0.35s ease 2.8s forwards`,
    }}>
      <Box sx={{ animation: `${bounce} 1.1s ease-in-out infinite`, display: 'flex' }}>
        <KeyboardArrowDownIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.9)' }} />
      </Box>
      <Typography sx={{
        fontSize: '0.65rem', fontWeight: 700,
        color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap', lineHeight: 1,
      }}>
        Deslize para baixo
      </Typography>
    </Box>
  )
}
