import { Box, Stack, Typography } from '@mui/material'
import { font, ink, packCtaFloat, radius, shineSweep } from '../design-system'
import { Button } from './ui'

export interface PendingInvite {
  token: string
  collectionName: string
  inviterName: string
  expiresAt: string
}

const DAY_MS = 86_400_000

function expiryLabel(expiresAt: string): string | null {
  const days = Math.ceil((Date.parse(expiresAt) - Date.now()) / DAY_MS)
  if (!Number.isFinite(days) || days < 0) return null
  if (days <= 1) return 'expira hoje'
  return `expira em ${days} dias`
}

export function PendingInviteCard({ invite, onOpen }: { invite: PendingInvite; onOpen: () => void }) {
  const collection = invite.collectionName || 'uma coleção'
  const inviter = invite.inviterName?.trim()
  const expiry = expiryLabel(invite.expiresAt)

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={`Abrir convite para ${collection}`}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen()
        }
      }}
      sx={{
        position: 'relative', overflow: 'hidden', cursor: 'pointer', borderRadius: radius.xl, p: { xs: 1.8, sm: 2.1 },
        background: 'linear-gradient(135deg,#eff6ff 0%,#fce7f3 55%,#ede9fe 100%)',
        border: '1.5px solid rgba(29,78,216,0.22)',
        boxShadow: '0 14px 36px rgba(29,78,216,0.16), 0 2px 8px rgba(225,29,72,0.08)',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 18px 42px rgba(29,78,216,0.22), 0 2px 8px rgba(225,29,72,0.1)' },
        '&:focus-visible': { outline: '2px solid #1d4ed8', outlineOffset: 3 },
      }}
    >
      <Box aria-hidden sx={{
        position: 'absolute', top: 0, bottom: 0, left: 0, width: '45%', pointerEvents: 'none',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)',
        animation: `${shineSweep} 3.2s ease-in-out 0.6s infinite`,
        '@media (prefers-reduced-motion: reduce)': { animation: 'none', display: 'none' },
      }} />

      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ position: 'relative', gap: { xs: 1.6, sm: 2 } }}>
        <Stack direction="row" spacing={1.6} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{
            width: 58, height: 58, flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.9rem', background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.95)',
            boxShadow: '0 8px 20px rgba(225,29,72,0.18)',
            animation: `${packCtaFloat} 2.6s ease-in-out infinite`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}>
            💌
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="xs" sx={{ fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', color: '#1d4ed8' }}>
              Você recebeu um convite
            </Typography>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.18rem', lineHeight: 1.2, color: ink.primary, mt: 0.3, overflowWrap: 'anywhere' }}>
              {collection}
            </Typography>
            <Typography variant="md" sx={{ color: ink.primary, opacity: 0.78, mt: 0.3, lineHeight: 1.4 }}>
              {inviter ? `${inviter} preparou essa coleção pra você` : 'Uma coleção foi preparada pra você'}
              {expiry ? ` · ${expiry}` : ''}
            </Typography>
          </Box>
        </Stack>
  
        <Button
          variant="primary"
          onClick={(event) => {
            event.stopPropagation()
            onOpen()
          }}
          sx={{ py: 1.1, px: { sm: 3 }, width: { xs: '100%', sm: 'auto' }, flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          Abrir convite 💙
      </Button>
      </Stack>
    </Box>
  )
}
