import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { Box, Typography } from '@mui/material'
import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { keyframes } from '@emotion/react'
import { chevronPulse, font, themeInk } from '../../design-system'

const nudge = keyframes`
  0%, 100% { transform: translateY(0); opacity: 1; }
  50%      { transform: translateY(4px); opacity: 0.85; }
`

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

const HINT_MS = 2600

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
    if (!visible) return
    const timer = setTimeout(() => setVisible(false), HINT_MS)
    return () => clearTimeout(timer)
  }, [visible])

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
    <Box aria-hidden sx={{
      position: 'fixed',
      bottom: 'calc(env(safe-area-inset-bottom, 0px) + 92px)',
      right: 16,
      zIndex: 200,
      pointerEvents: 'none',
      animation: `${nudge} 1.6s ease-in-out infinite`,
    }}>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 0.3, px: 1, py: 0.35,
        background: '#fffdf7', border: '1.5px solid #2a241d', borderRadius: '3px',
        boxShadow: '2px 2px 0 rgba(42,36,29,0.25)', transform: 'rotate(-3deg)',
      }}>
        <Typography sx={{ fontFamily: font.hand, fontSize: '1.05rem', lineHeight: 1, color: '#2a241d' }}>tem mais</Typography>
        <KeyboardArrowDownIcon sx={{ fontSize: 16, color: themeInk.ink, animation: `${chevronPulse} 1.4s ease-in-out infinite` }} />
      </Box>
    </Box>
  )
}
