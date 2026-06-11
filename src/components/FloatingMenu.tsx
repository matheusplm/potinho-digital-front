import LogoutIcon from '@mui/icons-material/Logout'
import FavoriteIcon from '@mui/icons-material/Favorite'
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined'
import CheckIcon from '@mui/icons-material/Check'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import { Box, Stack, Typography, Backdrop, IconButton } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { useBackground } from '../context/BackgroundContext'
import { useReader } from '../context/ReaderContext'
import { useSimulation } from '../context/SimulationContext'
import { useCollectionsQuery } from '../hooks/useNotes'
import { backgroundThemes, colors, font, radius } from '../design-system'

const menuIn = keyframes`
  from { opacity: 0; transform: scale(0.94) translateY(-6px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
`

export function FloatingMenu() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useUser()
  const { themeKey, setThemeKey, theme } = useBackground()
  const { activeCollectionId, setActiveCollectionId, unreadFor } = useReader()
  const { isActive: simulating } = useSimulation()
  const navigate = useNavigate()

  const isReader = user?.role === 'reader' && !simulating
  const { data: collections = [] } = useCollectionsQuery()
  const readerCollections = useMemo(
    () => isReader ? collections.filter((c) => c.access === 'reader') : [],
    [collections, isReader],
  )
  const showSwitcher = readerCollections.length > 1

  function switchTo(id: string) {
    setActiveCollectionId(id)
    setOpen(false)
    navigate('/home')
  }

  return (
    <>
      <Backdrop open={open} onClick={() => setOpen(false)} sx={{ zIndex: 90, bgcolor: 'transparent' }} />

      <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 100 }}>
        <IconButton
          onClick={() => setOpen((v) => !v)}
          sx={{
            width: 36, height: 36, borderRadius: '50%',
            bgcolor: open ? theme.accent : 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(12px)',
            boxShadow: open ? `0 4px 16px ${theme.accent}55` : '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
            border: '1px solid rgba(0,0,0,0.07)',
            color: open ? '#fff' : colors.text.primary,
            transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
            '&:hover': { bgcolor: open ? theme.accent : 'rgba(255,255,255,1)' },
          }}
        >
          <Stack spacing={0.4} sx={{ alignItems: 'center', justifyContent: 'center' }}>
            {[0, 1, 2].map((i) => (
              <Box key={i} sx={{
                width: open ? (i === 1 ? 12 : 14) : 14,
                height: 1.5, borderRadius: 1,
                bgcolor: open ? '#fff' : colors.text.primary,
                transition: 'all 0.2s',
                opacity: i === 1 ? 0.6 : 1,
              }} />
            ))}
          </Stack>
        </IconButton>

        {open && (
          <Box sx={{
            position: 'absolute', top: 44, right: 0, width: 220,
            background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(24px)',
            borderRadius: radius.lg,
            boxShadow: '0 16px 48px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255,255,255,0.6)', overflow: 'hidden',
            animation: `${menuIn} 0.2s cubic-bezier(0.16,1,0.3,1)`,
            transformOrigin: 'top right',
          }}>
            {/* user info */}
            <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center', px: 1.8, pt: 1.8, pb: 1.5 }}>
              <Box sx={{
                width: 38, height: 38, borderRadius: radius.md, flexShrink: 0,
                background: `linear-gradient(135deg, ${colors.primary.main}, ${theme.accent})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FavoriteIcon sx={{ fontSize: 17, color: '#fff' }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontFamily: font.serif, fontSize: '0.92rem', fontWeight: 700, color: colors.text.primary, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name?.split(' ')[0]}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: colors.text.muted, lineHeight: 1.2 }}>
                  {user?.role === 'writer' ? 'escritor' : 'leitor'}
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ height: '1px', bgcolor: colors.border.subtle, mx: 1.5 }} />

            {/* collection switcher (reader multi-tenant) */}
            {showSwitcher && (
              <>
                <Box sx={{ px: 1.8, py: 1.4 }}>
                  <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center', mb: 1.1 }}>
                    <SwapHorizIcon sx={{ fontSize: 14, color: colors.text.secondary }} />
                    <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, letterSpacing: 0.6, color: colors.text.secondary, textTransform: 'uppercase' }}>
                      Seus potinhos
                    </Typography>
                  </Stack>
                  <Stack spacing={0.5} sx={{ maxHeight: 196, overflowY: 'auto', mx: -0.6, px: 0.6 }}>
                    {readerCollections.map((collection) => {
                      const active = collection.id === activeCollectionId
                      const hasUnread = unreadFor(collection.id).length > 0
                      const bg = backgroundThemes.find((t) => t.key === collection.theme) ?? backgroundThemes[0]
                      return (
                        <Stack
                          key={collection.id}
                          direction="row"
                          spacing={1}
                          onClick={() => switchTo(collection.id)}
                          sx={{
                            alignItems: 'center', px: 1, py: 0.75, cursor: 'pointer', borderRadius: radius.md,
                            border: `1.5px solid ${active ? `${theme.accent}66` : 'transparent'}`,
                            background: active ? `${theme.accent}10` : 'transparent',
                            transition: 'background 0.12s, border-color 0.12s',
                            '&:hover': { background: active ? `${theme.accent}16` : 'rgba(0,0,0,0.035)' },
                          }}
                        >
                          <Box sx={{
                            width: 30, height: 30, borderRadius: radius.sm, flexShrink: 0, position: 'relative',
                            background: bg.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                          }}>
                            {collection.emoji}
                            {hasUnread && !active && (
                              <Box sx={{
                                position: 'absolute', top: -3, right: -3, width: 9, height: 9, borderRadius: radius.full,
                                background: colors.rose.main, border: '2px solid rgba(255,255,255,0.95)',
                              }} />
                            )}
                          </Box>
                          <Typography sx={{
                            flex: 1, minWidth: 0, fontFamily: font.serif, fontSize: '0.85rem',
                            fontWeight: active ? 800 : 600, color: colors.text.primary,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {collection.name}
                          </Typography>
                          {active && <CheckIcon sx={{ fontSize: 16, color: theme.accent, flexShrink: 0 }} />}
                        </Stack>
                      )
                    })}
                  </Stack>
                </Box>

                <Box sx={{ height: '1px', bgcolor: colors.border.subtle, mx: 1.5 }} />
              </>
            )}

            {/* theme picker */}
            <Box sx={{ px: 1.8, py: 1.4 }}>
              <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center', mb: 1.2 }}>
                <PaletteOutlinedIcon sx={{ fontSize: 14, color: colors.text.secondary }} />
                <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, letterSpacing: 0.6, color: colors.text.secondary, textTransform: 'uppercase' }}>
                  Tema de fundo
                </Typography>
              </Stack>
              <Stack spacing={1}>
                {([false, true] as const).map((dark) => (
                  <Box key={String(dark)}>
                    <Typography sx={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: 0.5, color: colors.text.muted, textTransform: 'uppercase', mb: 0.6 }}>
                      {dark ? 'Escuros' : 'Claros'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.8 }}>
                      {backgroundThemes.filter((bg) => bg.isDark === dark).map((bg) => {
                        const active = bg.key === themeKey
                        return (
                          <Box key={bg.key} onClick={() => setThemeKey(bg.key)} title={bg.label} sx={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: bg.gradient, cursor: 'pointer', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: `2px solid ${active ? bg.accent : 'rgba(0,0,0,0.08)'}`,
                            boxShadow: active ? `0 2px 8px ${bg.accent}55` : 'none',
                            transition: 'all 0.18s',
                            '&:hover': { transform: 'scale(1.12)' },
                          }}>
                            {active && <CheckIcon sx={{ fontSize: 14, color: bg.accent }} />}
                          </Box>
                        )
                      })}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box sx={{ height: '1px', bgcolor: colors.border.subtle, mx: 1.5 }} />

            {/* logout */}
            <Box sx={{ p: 1 }}>
              <Stack
                direction="row" spacing={1.4}
                onClick={() => { setOpen(false); logout() }}
                sx={{ alignItems: 'center',
                  px: 1.4, py: 1, cursor: 'pointer', borderRadius: radius.md,
                  transition: 'background 0.12s',
                  '&:hover': { bgcolor: `${colors.rose.main}12` },
                }}
              >
                <Box sx={{
                  width: 30, height: 30, borderRadius: radius.sm, flexShrink: 0,
                  background: `${colors.rose.main}14`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <LogoutIcon sx={{ fontSize: 16, color: colors.rose.main }} />
                </Box>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: colors.rose.main }}>
                  Sair
                </Typography>
              </Stack>
            </Box>
          </Box>
        )}
      </Box>
    </>
  )
}
