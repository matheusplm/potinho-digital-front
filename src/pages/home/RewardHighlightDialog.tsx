import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui'
import { RewardCard } from '../../components/collection/RewardCard'
import { colors, font, radius } from '../../design-system'
import { normalizeRevealEffect, useRevealEffect } from '../../effects'
import type { CollectionDailyReward, NoteTypeConfig, RarityConfig } from '../../types/note'

const revealAura = keyframes`
  0% { opacity: 0; transform: scale(0.92); }
  35% { opacity: 0.9; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.12); }
`
const revealShake = keyframes`
  0%, 100% { transform: translate3d(0,0,0) rotate(0deg); }
  15% { transform: translate3d(-7px,2px,0) rotate(-0.7deg); }
  30% { transform: translate3d(7px,-2px,0) rotate(0.7deg); }
  45% { transform: translate3d(-6px,1px,0) rotate(-0.5deg); }
  60% { transform: translate3d(6px,-1px,0) rotate(0.5deg); }
  78% { transform: translate3d(-3px,0,0) rotate(0deg); }
`

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function RewardHighlightDialog({ open, rewards, rarities, types, collectionSlug, accent, onClose, onRewardClick }: {
  open: boolean
  rewards: CollectionDailyReward[]
  rarities: RarityConfig[]
  types: NoteTypeConfig[]
  collectionSlug: string
  accent: string
  onClose: () => void
  onRewardClick: (reward: CollectionDailyReward) => void
}) {
  const navigate = useNavigate()

  const paperRef = useRef<HTMLDivElement>(null)
  const { play, layer } = useRevealEffect()
  const dataRef = useRef({ rewards, rarities, accent, play })
  dataRef.current = { rewards, rarities, accent, play }
  const firedRef = useRef(false)
  const [celebration, setCelebration] = useState<{ color: string; shake: boolean } | null>(null)

  useEffect(() => {
    if (!open) { firedRef.current = false; setCelebration(null); return }
    if (firedRef.current) return
    firedRef.current = true
    const { rewards: rw, rarities: rs, accent: ac, play: playEffect } = dataRef.current
    const rarest = rw
      .map((reward) => rs.find((r) => r.id === reward.rarity))
      .filter((r): r is RarityConfig => !!r && !!r.revealEffect && r.revealEffect !== 'none')
      .sort((a, b) => a.odds - b.odds)[0]
    if (!rarest || prefersReducedMotion()) return
    setCelebration({ color: rarest.glowColor || rarest.borderColor || ac, shake: rarest.odds <= 5 })
    const fireTimer = window.setTimeout(() => {
      const { kind, media } = normalizeRevealEffect(rarest.revealEffect, rarest.revealMedia, rarest.revealEmoji, rarest.emoji)
      playEffect({ kind, media, accent: ac, anchor: paperRef.current?.getBoundingClientRect() ?? null })
    }, 320)
    const clearTimer = window.setTimeout(() => setCelebration(null), 1000)
    return () => { window.clearTimeout(fireTimer); window.clearTimeout(clearTimer) }
  }, [open])

  return (
    <>
    {layer}
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          ref: paperRef,
          sx: {
            mx: 2,
            borderRadius: radius.xl,
            overflow: 'hidden',
            position: 'relative',
            background: 'rgba(255,250,247,0.98)',
            boxShadow: '0 24px 70px rgba(15,23,42,0.18)',
            ...(celebration?.shake ? { animation: `${revealShake} 0.55s ease 0.24s both` } : {}),
          },
        },
        backdrop: {
          sx: { background: 'rgba(15,23,42,0.18)', backdropFilter: 'blur(8px)' },
        },
      }}
    >
      {celebration && (
        <Box aria-hidden sx={{
          position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none',
          background: `radial-gradient(circle at 50% 42%, ${celebration.color}, transparent 68%)`,
          mixBlendMode: 'screen',
          animation: `${revealAura} 0.9s ease-out both`,
        }} />
      )}
      <Box sx={{
        p: 2,
        background: `radial-gradient(circle at 18% 0%, rgba(255,255,255,0.76), transparent 38%), linear-gradient(135deg, ${colors.rose.main}14, ${accent}18)`,
        position: 'relative',
      }}>
        <DialogTitle sx={{ p: 0, fontFamily: font.serif, fontWeight: 850, fontSize: '1.18rem', color: colors.text.primary }}>
          Você recebeu 💌
        </DialogTitle>
        <Typography sx={{ mt: 0.35, fontSize: '0.78rem', color: colors.text.secondary }}>
          Leia seus novos bilhetinhos antes de guardar na coleção.
        </Typography>
      </Box>
      <DialogContent sx={{ pt: 2, px: 2, pb: 1.5 }}>
        <Stack spacing={1.2}>
          {rewards.map((reward, index) => (
            <RewardCard
              key={`${reward.id}-${index}`}
              reward={reward}
              rarities={rarities}
              types={types}
              onClick={() => onRewardClick(reward)}
            />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>Fechar</Button>
        <Button
          variant="primary"
          onClick={() => { onClose(); navigate(`/colecoes/${collectionSlug}`) }}
          sx={{ flex: 1, whiteSpace: 'nowrap' }}
        >
          Ver coleção
        </Button>
      </DialogActions>
    </Dialog>
    </>
  )
}
