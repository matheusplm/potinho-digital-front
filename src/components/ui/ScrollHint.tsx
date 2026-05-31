import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { Box, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { colors, radius } from '../../design-system'

const hop = keyframes`
  0%, 50%, 100% { transform: translateX(-50%) translateY(0); }
  62%  { transform: translateX(-50%) translateY(-11px); }
  74%  { transform: translateX(-50%) translateY(0); }
  83%  { transform: translateX(-50%) translateY(-5px); }
  92%  { transform: translateX(-50%) translateY(0); }
`

const chevronBounce = keyframes`
  0%, 100% { transform: translateY(-1px); }
  50%       { transform: translateY(3px); }
`

const appear = keyframes`
  from { opacity: 0; transform: translateX(-50%) translateY(14px) scale(0.85); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
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
      bottom: 70,
      left: '50%',
      zIndex: 200,
      pointerEvents: 'none',
      animation: `${appear} 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards, ${hop} 1.9s ease-in-out 0.4s infinite`,
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.4,
        px: 1.6, pt: 1, pb: 0.9,
        borderRadius: radius.full,
        background: `linear-gradient(160deg, ${colors.primary.main}f0, ${colors.purple.main}f0)`,
        backdropFilter: 'blur(14px)',
        border: '1.5px solid rgba(255,255,255,0.22)',
        boxShadow: `0 6px 22px ${colors.primary.glow}, inset 0 1px 0 rgba(255,255,255,0.25)`,
      }}>
        <Box sx={{
          width: 26, height: 26, borderRadius: '50%',
          background: 'rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: `${chevronBounce} 1.1s ease-in-out infinite`,
        }}>
          <KeyboardArrowDownIcon sx={{ fontSize: 19, color: '#fff' }} />
        </Box>
        <Typography sx={{
          fontSize: '0.64rem', fontWeight: 800, letterSpacing: 0.3,
          color: 'rgba(255,255,255,0.95)', whiteSpace: 'nowrap', lineHeight: 1,
        }}>
          Deslize para baixo
        </Typography>
      </Box>
    </Box>
  )
}
