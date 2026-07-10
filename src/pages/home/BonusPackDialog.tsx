import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui'
import { font, ink, radius } from '../../design-system'
import { formatRemainingTime } from '../../utils/packCooldowns'
import type { CollectionPack } from '../../types/note'

export function BonusPackDialog({ pack, isRealReader, canOpen, block, opens, accrued, cooldownMs, isOpeningPack, accent, onClose, onOpen }: {
  pack: CollectionPack | null
  isRealReader: boolean
  canOpen: boolean
  block: 'cooldown' | null
  opens: number
  accrued: number
  cooldownMs: number
  isOpeningPack: boolean
  accent: string
  onClose: () => void
  onOpen: (count?: number) => void
}) {
  const [confirmAll, setConfirmAll] = useState(false)
  const effectiveCount = pack?.cumulative ? accrued : opens

  useEffect(() => { if (!pack) setConfirmAll(false) }, [pack])

  return (
    <Dialog
      open={!!pack}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            mx: 2,
            borderRadius: radius.xl,
            overflow: 'hidden',
            background: pack?.gradient ?? 'rgba(255,250,247,0.98)',
            boxShadow: `0 24px 70px ${pack?.accent ?? accent}28`,
          },
        },
        backdrop: {
          sx: { background: 'rgba(15,23,42,0.18)', backdropFilter: 'blur(8px)' },
        },
      }}
    >
      {pack && (
        <>
          <Box sx={{ p: 2, position: 'relative', background: 'radial-gradient(circle at 18% 0%, rgba(255,255,255,0.64), transparent 40%)' }}>
            <DialogTitle sx={{
              p: 0,
              fontFamily: font.serif,
              fontWeight: 850,
              fontSize: '1.18rem',
              color: ink.primary,
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
            }}>
              {pack.emoji} {pack.name}
            </DialogTitle>
            <Typography sx={{ mt: 0.45, fontSize: '0.78rem', color: ink.secondary, fontWeight: 700 }}>
              {isRealReader && block === 'cooldown'
                ? `Disponível em ${formatRemainingTime(cooldownMs)}`
                : isRealReader && pack.cumulative && accrued > 1
                  ? `${accrued} aberturas acumuladas`
                  : 'Pacotinho bônus disponível'}
            </Typography>
          </Box>
          <DialogContent sx={{ px: 2, pt: 1.5, pb: 1 }}>
            <Box sx={{ p: 1.25, borderRadius: radius.lg, background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.62)', backdropFilter: 'blur(8px)' }}>
              <Typography sx={{ fontSize: '0.83rem', color: ink.secondary, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                {pack.description || 'Abra este pacote especial para tentar descobrir novos bilhetinhos da coleção.'}
              </Typography>
              <Stack direction="row" spacing={0.7} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 0.6 }}>
                <Box sx={{ px: 0.85, py: 0.35, borderRadius: radius.full, background: `${pack.accent}18`, color: pack.accent, fontSize: '0.68rem', fontWeight: 850 }}>
                  {pack.cardsPerOpen} bilhete{pack.cardsPerOpen !== 1 ? 's' : ''}
                </Box>
                {pack.cooldownHours != null && (
                  <Box sx={{ px: 0.85, py: 0.35, borderRadius: radius.full, background: 'rgba(255,255,255,0.72)', color: ink.secondary, fontSize: '0.68rem', fontWeight: 800 }}>
                    {pack.cooldownHours}h cooldown
                  </Box>
                )}
                {pack.guaranteedRarityId && (
                  <Box sx={{ px: 0.85, py: 0.35, borderRadius: radius.full, background: 'rgba(255,247,237,0.9)', color: '#c2410c', fontSize: '0.68rem', fontWeight: 850 }}>
                    garantia especial
                  </Box>
                )}
              </Stack>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 2, gap: 0.8, flexDirection: 'column' }}>
            {effectiveCount > 1 && canOpen && !confirmAll && (
              <Button variant="primary" disabled={isOpeningPack} onClick={() => setConfirmAll(true)} sx={{ width: '100%', whiteSpace: 'nowrap' }}>
                Abrir todos ({effectiveCount}x)
              </Button>
            )}
            {effectiveCount > 1 && canOpen && confirmAll && (
              <Stack direction="row" spacing={0.8} sx={{ width: '100%' }}>
                <Button variant="ghost" onClick={() => setConfirmAll(false)} sx={{ flex: 1 }}>Cancelar</Button>
                <Button variant="primary" disabled={isOpeningPack} onClick={() => { setConfirmAll(false); onOpen(effectiveCount) }} sx={{ flex: 1, whiteSpace: 'nowrap' }}>
                  Confirmar ({effectiveCount}x)
                </Button>
              </Stack>
            )}
            <Stack direction="row" spacing={0.8} sx={{ width: '100%' }}>
              <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>Agora não</Button>
              <Button
                variant="primary"
                disabled={isOpeningPack || (isRealReader && !canOpen)}
                onClick={() => onOpen()}
                sx={{ flex: 1, whiteSpace: 'nowrap' }}
              >
                {block === 'cooldown' ? 'Em cooldown' : effectiveCount > 1 ? 'Abrir 1' : 'Abrir bônus'}
              </Button>
            </Stack>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}
