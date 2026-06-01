import FavoriteIcon from '@mui/icons-material/Favorite'
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
  0%   { opacity: 0; transform: translateY(0);    }
  16%  { opacity: 1; transform: translateY(0);    }
  80%  { opacity: 0; transform: translateY(54vh); }
  100% { opacity: 0; transform: translateY(0);    }
`

const heartBeat = keyframes`
  0%,100% { transform: scale(1);    }
  30%     { transform: scale(1.22); }
  60%     { transform: scale(0.94); }
`

const chevronPulse = keyframes`
  0%,100% { opacity: 0.5; transform: translateY(0);   }
  50%     { opacity: 1;   transform: translateY(4px); }
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
        background: 'linear-gradient(to bottom, transparent 0%, rgba(255,228,236,0.08) 55%, rgba(255,228,236,0.22) 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 22%)',
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 22%)',
        animation: `${overlayIn} 0.5s ease forwards`,
      }} />

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
            px: 1.6, pt: 1.1, pb: 1,
            borderRadius: '20px',
            background: `linear-gradient(160deg, ${colors.rose.main}ee, ${colors.purple.main}ee)`,
            backdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(255,255,255,0.25)',
            boxShadow: `0 8px 28px ${colors.rose.glow}, 0 2px 8px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FavoriteIcon sx={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.85)',
                animation: `${heartBeat} 1.6s ease-in-out infinite`,
              }} />
              <Typography sx={{
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: 0.4,
                color: 'rgba(255,255,255,0.95)',
                whiteSpace: 'nowrap',
                lineHeight: 1,
              }}>
                deslize para baixo
              </Typography>
              <FavoriteIcon sx={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.85)',
                animation: `${heartBeat} 1.6s ease-in-out 0.8s infinite`,
              }} />
            </Box>

            <Box sx={{
              display: 'flex',
              gap: 0.3,
              animation: `${chevronPulse} 1.4s ease-in-out infinite`,
            }}>
              {[0, 1, 2].map((i) => (
                <KeyboardArrowDownIcon key={i} sx={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.9)',
                  opacity: 1 - i * 0.25,
                  mt: `-${i * 2}px`,
                }} />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  )
}
