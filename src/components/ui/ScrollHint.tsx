import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { Box, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { colors } from '../../design-system'

const overlayIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`

const dropFade = keyframes`
  0%   { opacity: 0; transform: translateY(0); }
  18%  { opacity: 1; transform: translateY(0); }
  82%  { opacity: 0; transform: translateY(42vh); }
  100% { opacity: 0; transform: translateY(0); }
`

const chevronDrift = keyframes`
  0%,100% { transform: translateY(-3px); }
  50%     { transform: translateY(4px);  }
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
    <>
      <Box sx={{
        position: 'fixed',
        top: '25%',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        zIndex: 190,
        pointerEvents: 'none',
        backdropFilter: 'blur(1px)',
        WebkitBackdropFilter: 'blur(1px)',
        background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.06) 60%, rgba(255,255,255,0.18) 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%)',
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%)',
        animation: `${overlayIn} 0.5s ease forwards`,
      }} />

      <Box sx={{
        position: 'fixed',
        top: '44%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        pointerEvents: 'none',
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
          animation: `${dropFade} 3s ease-in-out infinite`,
        }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: '50%',
            background: `linear-gradient(160deg, ${colors.primary.main}, ${colors.purple.main})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 6px 24px ${colors.primary.glow}, 0 2px 8px rgba(0,0,0,0.14)`,
            animation: `${chevronDrift} 1.4s ease-in-out infinite`,
          }}>
            <KeyboardArrowDownIcon sx={{ fontSize: 24, color: '#fff' }} />
          </Box>
          <Typography sx={{
            fontSize: '0.7rem', fontWeight: 800, letterSpacing: 0.5,
            color: colors.text.primary, whiteSpace: 'nowrap', lineHeight: 1,
            textShadow: '0 1px 10px rgba(255,255,255,1)',
          }}>
            Deslize para baixo
          </Typography>
        </Box>
      </Box>
    </>
  )
}
