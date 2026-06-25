import LogoutIcon from '@mui/icons-material/Logout'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined'
import MailOutlinedIcon from '@mui/icons-material/MailOutlined'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined'
import CheckIcon from '@mui/icons-material/Check'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import BlockIcon from '@mui/icons-material/Block'
import { Box, Stack, Typography, Backdrop, IconButton, Tooltip } from '@mui/material'
import { useMemo, useState } from 'react'
import { OnboardingOverlay } from './ui'
import { useNavigate } from 'react-router-dom'
import { useUser, type UserRole } from '../context/UserContext'
import { isCollectionReader, personaCapabilities } from '../utils/collectionAccess'
import { useBackground } from '../context/BackgroundContext'
import { useReader } from '../context/ReaderContext'
import { useSimulation } from '../context/SimulationContext'
import { useCollectionsQuery } from '../hooks/useNotes'
import { backgroundThemes, colors, font, menuIn, radius } from '../design-system'

export function FloatingMenu() {
  const [open, setOpen] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const { user, persona, setPersona, logout } = useUser()
  const { themeKey, setThemeKey, theme } = useBackground()
  const { activeCollectionId, setActiveCollectionId, unreadFor } = useReader()
  const { isActive: simulating } = useSimulation()
  const navigate = useNavigate()

  const isReader = persona === 'reader' && !simulating
  const notifSupported = typeof Notification !== 'undefined'
  const [notifEnabled, setNotifEnabled] = useState(
    () => notifSupported && Notification.permission === 'granted' && localStorage.getItem('potinho-notif') === 'true',
  )
  const notifStatus = notifSupported ? Notification.permission : 'denied'

  async function handleNotificationToggle() {
    if (!notifSupported || notifStatus === 'denied') return
    if (notifEnabled) {
      localStorage.removeItem('potinho-notif')
      setNotifEnabled(false)
      return
    }
    const result = await Notification.requestPermission()
    if (result === 'granted') {
      localStorage.setItem('potinho-notif', 'true')
      setNotifEnabled(true)
      new Notification('Potinho Digital 🎁', { body: 'Notificações ativadas!' })
    }
  }
  const { data: collections = [] } = useCollectionsQuery()
  const { canSwitch, canWriter, canReader } = useMemo(
    () => personaCapabilities(collections, user?.id, user?.role ?? 'writer'),
    [collections, user?.id, user?.role],
  )
  const readerCollections = useMemo(
    () => (isReader ? collections.filter((c) => isCollectionReader(c, user?.id)) : []),
    [collections, isReader, user?.id],
  )
  const showCollectionSwitcher = readerCollections.length > 1

  function switchTo(id: string) {
    setActiveCollectionId(id)
    setOpen(false)
    navigate('/home')
  }

  function switchPersona(next: UserRole) {
    if (next === persona) return
    if (next === 'writer' && !canWriter) return
    if (next === 'reader' && !canReader) return
    setPersona(next)
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
            bgcolor: open ? theme.accent : theme.surfaceBg,
            backdropFilter: 'blur(12px)',
            boxShadow: open ? `0 4px 16px ${theme.accent}55` : '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.08)',
            border: `1px solid ${theme.surfaceBorder}`,
            color: open ? '#fff' : theme.textOnBg,
            transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
            '&:hover': { bgcolor: open ? theme.accent : theme.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,1)' },
          }}
        >
          <Stack spacing={0.4} sx={{ alignItems: 'center', justifyContent: 'center' }}>
            {[0, 1, 2].map((i) => (
              <Box key={i} sx={{
                width: open ? (i === 1 ? 12 : 14) : 14,
                height: 1.5, borderRadius: 1,
                bgcolor: open ? '#fff' : theme.textOnBg,
                transition: 'all 0.2s',
                opacity: i === 1 ? 0.6 : 1,
              }} />
            ))}
          </Stack>
        </IconButton>

        {open && (
          <Box sx={{
            position: 'absolute', top: 44, right: 0, width: 220,
            background: theme.surfaceBg, backdropFilter: 'blur(24px)',
            borderRadius: radius.lg,
            boxShadow: `0 16px 48px rgba(0,0,0,${theme.isDark ? '0.48' : '0.16'}), 0 2px 8px rgba(0,0,0,0.08)`,
            border: `1px solid ${theme.surfaceBorder}`, overflow: 'hidden',
            animation: `${menuIn} 0.2s cubic-bezier(0.16,1,0.3,1)`,
            transformOrigin: 'top right',
          }}>
            <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center', px: 1.8, pt: 1.8, pb: 1.5 }}>
              <Box sx={{
                width: 38, height: 38, borderRadius: radius.md, flexShrink: 0,
                background: `linear-gradient(135deg, ${colors.primary.main}, ${theme.accent})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FavoriteIcon sx={{ fontSize: 17, color: '#fff' }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontFamily: font.serif, fontSize: '0.92rem', fontWeight: 700, color: theme.textOnBg, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name?.split(' ')[0]}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: theme.textOnBgMuted, lineHeight: 1.2 }}>
                  {persona === 'writer' ? 'escritor' : 'leitor'}
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ height: '1px', bgcolor: theme.surfaceBorder, mx: 1.5 }} />

            {(canSwitch || canWriter || canReader) && (
              <Box sx={{ px: 1.8, py: 1.4 }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.6, color: theme.textOnBgMuted, textTransform: 'uppercase', mb: 1 }}>
                  Modo de uso
                </Typography>
                <Stack direction="row" spacing={0.6}>
                  {([
                    { role: 'reader' as const, label: 'Leitor', icon: <MenuBookOutlinedIcon sx={{ fontSize: 15 }} />, enabled: canReader, disabledTip: 'Você ainda não tem acesso a nenhuma coleção como leitor' },
                    { role: 'writer' as const, label: 'Escritor', icon: <EditOutlinedIcon sx={{ fontSize: 15 }} />, enabled: canWriter, disabledTip: 'Crie uma coleção para usar o modo escritor' },
                  ]).map(({ role, label, icon, enabled, disabledTip }) => {
                    const active = persona === role
                    const btn = (
                      <Box
                        key={role}
                        onClick={() => enabled && switchPersona(role)}
                        sx={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5,
                          py: 0.85, borderRadius: radius.md, cursor: enabled ? 'pointer' : 'default',
                          border: `1.5px solid ${active ? `${theme.accent}66` : theme.surfaceBorder}`,
                          background: active ? `${theme.accent}12` : 'transparent',
                          opacity: enabled ? 1 : 0.4,
                          transition: 'background 0.12s, border-color 0.12s',
                          '&:hover': enabled ? { background: active ? `${theme.accent}18` : theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' } : undefined,
                        }}
                      >
                        {icon}
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: active ? 800 : 600, color: active ? theme.accent : theme.textOnBgMuted }}>
                          {label}
                        </Typography>
                      </Box>
                    )
                    return enabled ? btn : (
                      <Tooltip key={role} title={disabledTip} enterTouchDelay={0} leaveTouchDelay={2000} placement="bottom" arrow sx={{ flex: 1 }}>
                        <span style={{ flex: 1 }}>{btn}</span>
                      </Tooltip>
                    )
                  })}
                </Stack>
              </Box>
            )}

            {(canSwitch || canWriter || canReader) && (
              <Box sx={{ height: '1px', bgcolor: theme.surfaceBorder, mx: 1.5 }} />
            )}

            {showCollectionSwitcher && (
              <>
                <Box sx={{ px: 1.8, py: 1.4 }}>
                  <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center', mb: 1.1 }}>
                    <SwapHorizIcon sx={{ fontSize: 14, color: theme.textOnBgMuted }} />
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.6, color: theme.textOnBgMuted, textTransform: 'uppercase' }}>
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
                            '&:hover': { background: active ? `${theme.accent}16` : theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.035)' },
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
                                background: colors.rose.main, border: `2px solid ${theme.isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)'}`,
                              }} />
                            )}
                          </Box>
                          <Typography sx={{
                            flex: 1, minWidth: 0, fontFamily: font.serif, fontSize: '0.85rem',
                            fontWeight: active ? 800 : 600, color: theme.textOnBg,
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

                <Box sx={{ height: '1px', bgcolor: theme.surfaceBorder, mx: 1.5 }} />
              </>
            )}

            <Box sx={{ px: 1.8, py: 1.4 }}>
              <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center', mb: 1.2 }}>
                <PaletteOutlinedIcon sx={{ fontSize: 14, color: theme.textOnBgMuted }} />
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.6, color: theme.textOnBgMuted, textTransform: 'uppercase' }}>
                  Tema de fundo
                </Typography>
              </Stack>
              <Stack spacing={1}>
                {([false, true] as const).map((dark) => (
                  <Box key={String(dark)}>
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: 0.5, color: theme.textOnBgMuted, textTransform: 'uppercase', mb: 0.6 }}>
                      {dark ? 'Escuros' : 'Claros'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.8 }}>
                      {backgroundThemes.filter((bg) => bg.isDark === dark).map((bg) => {
                        const active = bg.key === themeKey
                        return (
                          <Tooltip key={bg.key} title={bg.label} enterTouchDelay={0} leaveTouchDelay={1500} placement="top" arrow>
                            <Box onClick={() => setThemeKey(bg.key)} sx={{
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
                          </Tooltip>
                        )
                      })}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>

            {notifSupported && (
              <>
                <Box sx={{ height: '1px', bgcolor: theme.surfaceBorder, mx: 1.5 }} />
                <Box sx={{ p: 1 }}>
                  <Stack
                    direction="row" spacing={1.4}
                    onClick={() => { void handleNotificationToggle() }}
                    sx={{
                      alignItems: 'center', px: 1.4, py: 1, borderRadius: radius.md,
                      cursor: notifStatus === 'denied' ? 'not-allowed' : 'pointer',
                      opacity: notifStatus === 'denied' ? 0.5 : 1,
                      transition: 'background 0.12s',
                      '&:hover': notifStatus !== 'denied' ? { bgcolor: `${theme.accent}0e` } : undefined,
                    }}
                  >
                    <Box sx={{
                      width: 30, height: 30, borderRadius: radius.sm, flexShrink: 0,
                      background: notifEnabled ? `${theme.accent}18` : theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {notifStatus === 'denied'
                        ? <BlockIcon sx={{ fontSize: 15, color: theme.textOnBgMuted }} />
                        : notifEnabled
                          ? <NotificationsActiveIcon sx={{ fontSize: 16, color: theme.accent }} />
                          : <NotificationsNoneOutlinedIcon sx={{ fontSize: 16, color: theme.textOnBgMuted }} />
                      }
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: theme.textOnBg }}>
                        Notificações
                      </Typography>
                      <Typography sx={{ fontSize: '0.68rem', color: theme.textOnBgMuted }}>
                        {notifStatus === 'denied' ? 'bloqueado pelo navegador' : notifEnabled ? 'ativo — toque para desligar' : 'toque para ativar'}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </>
            )}

            <Box sx={{ height: '1px', bgcolor: theme.surfaceBorder, mx: 1.5 }} />

            <Box sx={{ p: 1 }}>
              <Stack
                direction="row" spacing={1.4}
                onClick={() => { setOpen(false); navigate('/conta') }}
                sx={{
                  alignItems: 'center', px: 1.4, py: 1, cursor: 'pointer', borderRadius: radius.md,
                  transition: 'background 0.12s',
                  '&:hover': { bgcolor: `${theme.accent}0e` },
                }}
              >
                <Box sx={{
                  width: 30, height: 30, borderRadius: radius.sm, flexShrink: 0,
                  background: `${theme.accent}14`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ManageAccountsOutlinedIcon sx={{ fontSize: 16, color: theme.accent }} />
                </Box>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: theme.textOnBg }}>
                  Minha conta
                </Typography>
              </Stack>
              {user?.role === 'writer' && (
                <Stack
                  direction="row" spacing={1.4}
                  onClick={() => { setOpen(false); navigate('/mail-logs') }}
                  sx={{
                    alignItems: 'center', px: 1.4, py: 1, cursor: 'pointer', borderRadius: radius.md,
                    transition: 'background 0.12s',
                    '&:hover': { bgcolor: `${theme.accent}0e` },
                  }}
                >
                  <Box sx={{
                    width: 30, height: 30, borderRadius: radius.sm, flexShrink: 0,
                    background: `${theme.accent}14`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <MailOutlinedIcon sx={{ fontSize: 16, color: theme.accent }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: theme.textOnBg }}>
                    Log de emails
                  </Typography>
                </Stack>
              )}
            </Box>

            <Box sx={{ height: '1px', bgcolor: theme.surfaceBorder, mx: 1.5 }} />

            <Box sx={{ p: 1 }}>
              <Stack
                direction="row" spacing={1.4}
                onClick={() => { setOpen(false); setShowTutorial(true) }}
                sx={{
                  alignItems: 'center', px: 1.4, py: 1, cursor: 'pointer', borderRadius: radius.md,
                  transition: 'background 0.12s',
                  '&:hover': { bgcolor: `${theme.accent}0e` },
                }}
              >
                <Box sx={{
                  width: 30, height: 30, borderRadius: radius.sm, flexShrink: 0,
                  background: `${theme.accent}14`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <PlayCircleOutlineIcon sx={{ fontSize: 16, color: theme.accent }} />
                </Box>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: theme.textOnBg }}>
                  Ver tutorial
                </Typography>
              </Stack>
            </Box>

            <Box sx={{ height: '1px', bgcolor: theme.surfaceBorder, mx: 1.5 }} />

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

      {showTutorial && <OnboardingOverlay onDismiss={() => setShowTutorial(false)} />}
    </>
  )
}
