import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import FavoriteIcon from '@mui/icons-material/Favorite'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import LockIcon from '@mui/icons-material/Lock'
import { Box, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useState } from 'react'
import { useUser } from '../context/UserContext'
import { useCollectionQuery, useRaritiesQuery, useTypesQuery } from '../hooks/useNotes'
import { Card, Button, Input, ScrollablePage, toast } from '../components/ui'
import { colors, font } from '../design-system'
import { useBackground } from '../context/BackgroundContext'
import { api } from '../services/api'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`

const FLOATING = [
  { size: 14, left: '7%',  delay: '0s',   dur: '10s', opacity: 0.12 },
  { size: 10, left: '22%', delay: '3s',   dur: '13s', opacity: 0.09 },
  { size: 18, left: '70%', delay: '1.5s', dur: '11s', opacity: 0.11 },
  { size: 11, left: '86%', delay: '5s',   dur: '12s', opacity: 0.08 },
]

export function WriterHomePage() {
  const { user, setUser } = useUser()
  const { theme } = useBackground()
  const { data: collection } = useCollectionQuery()
  const { data: rarities = [] } = useRaritiesQuery()
  const { data: types = [] } = useTypesQuery()
  const [inviteEmailInput, setInviteEmailInput] = useState(user?.inviteEmail ?? '')
  const [savingEmail, setSavingEmail] = useState(false)

  async function handleSaveInviteEmail() {
    if (!inviteEmailInput.trim()) return
    setSavingEmail(true)
    try {
      await api.setInviteEmail(inviteEmailInput.trim())
      setUser({ ...user!, inviteEmail: inviteEmailInput.trim().toLowerCase() })
      toast.success('Email de convite atualizado!')
    } catch {
      toast.error('Erro ao salvar email.')
    } finally {
      setSavingEmail(false)
    }
  }

  const firstName = user?.name?.split(' ')[0] ?? ''
  const totalNotes = collection?.total ?? 0
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <Box sx={{ height: '100%', position: 'relative', overflow: 'hidden', background: theme.gradient }}>
      <FavoriteIcon sx={{
        position: 'absolute', bottom: -80, right: -80,
        fontSize: 500, color: 'rgba(29,78,216,0.05)', pointerEvents: 'none',
      }} />

      {FLOATING.map((h, i) => (
        <FavoriteIcon key={i} sx={{
          position: 'absolute', bottom: '-4px', left: h.left,
          fontSize: h.size, color: theme.accent, opacity: h.opacity, pointerEvents: 'none',
          animation: `float-w-${i} ${h.dur} ${h.delay} ease-in infinite`,
          [`@keyframes float-w-${i}`]: {
            '0%':   { transform: 'translateY(0) rotate(-6deg)', opacity: 0 },
            '8%':   { opacity: h.opacity },
            '92%':  { opacity: h.opacity * 0.5 },
            '100%': { transform: 'translateY(-105vh) rotate(10deg)', opacity: 0 },
          },
        }} />
      ))}

      <ScrollablePage sx={{ px: 2.5, py: 2.5, gap: 3, animation: `${fadeIn} 0.4s ease` }}>
        <Stack spacing={0.3}>
          <Typography sx={{ fontSize: '0.82rem', color: theme.textOnBgMuted, fontWeight: 500 }}>
            {greeting},
          </Typography>
          <Typography sx={{
            fontFamily: font.serif, fontWeight: 700, fontSize: '2rem',
            color: theme.textOnBg, lineHeight: 1.1, letterSpacing: '-0.5px',
          }}>
            {firstName} 💙
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: theme.textOnBgMuted, fontStyle: 'italic', mt: 0.5 }}>
            o potinho está esperando por você
          </Typography>
        </Stack>

        <Stack spacing={1.5}>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: 1.2, color: theme.textOnBgMuted, textTransform: 'uppercase' }}>
            Seu potinho
          </Typography>
          <Stack direction="row" spacing={1.5}>
            {[
              { label: 'Bilhetes',  value: totalNotes,       icon: <AutoAwesomeIcon sx={{ fontSize: 18, color: colors.primary.main }} />, color: colors.primary.main },
              { label: 'Raridades', value: rarities.length,  icon: <FavoriteIcon    sx={{ fontSize: 18, color: colors.rose.main }} />,    color: colors.rose.main },
              { label: 'Tipos',     value: types.length,     icon: <Inventory2Icon  sx={{ fontSize: 18, color: colors.purple.light }} />, color: colors.purple.light },
            ].map((stat) => (
              <Card key={stat.label} sx={{ flex: 1, p: 1.5, textAlign: 'center' }}>
                <Box sx={{ mb: 0.8 }}>{stat.icon}</Box>
                <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: stat.color, lineHeight: 1, fontFamily: font.serif }}>
                  {stat.value}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: colors.text.muted, fontWeight: 600, mt: 0.3 }}>
                  {stat.label}
                </Typography>
              </Card>
            ))}
          </Stack>
        </Stack>

        {user?.coupleCode && (
          <Card sx={{ p: 2, background: `linear-gradient(135deg,${colors.primary.main}08,${colors.rose.main}08)` }}>
            <Stack spacing={1.5}>
              <Stack spacing={0.5}>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: 1, color: colors.text.muted, textTransform: 'uppercase' }}>
                  Código de convite
                </Typography>
                <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.8rem', color: colors.text.primary, letterSpacing: '0.2em' }}>
                  {user.coupleCode}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: colors.text.muted, fontStyle: 'italic' }}>
                  Compartilhe com quem você ama 💙
                </Typography>
              </Stack>

              <Box sx={{ height: '1px', bgcolor: colors.border.subtle }} />

              <Stack spacing={0.8}>
                <Stack direction="row" spacing={0.6} alignItems="center">
                  <LockIcon sx={{ fontSize: 13, color: colors.text.secondary }} />
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: 0.8, color: colors.text.secondary, textTransform: 'uppercase' }}>
                    Email autorizado
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="flex-end">
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={inviteEmailInput}
                    onChange={(e) => setInviteEmailInput(e.target.value)}
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { fontSize: '0.82rem' }, '& input': { py: 0.7 } }}
                  />
                  <Button
                    variant="primary"
                    loading={savingEmail}
                    onClick={handleSaveInviteEmail}
                    sx={{ py: 0.85, px: 1.5, fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                  >
                    Salvar
                  </Button>
                </Stack>
                {user.inviteEmail && (
                  <Typography sx={{ fontSize: '0.72rem', color: colors.success.main }}>
                    ✓ {user.inviteEmail}
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Card>
        )}
      </ScrollablePage>
    </Box>
  )
}
