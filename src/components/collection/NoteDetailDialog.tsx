import { Box, Dialog, DialogActions, DialogContent, Stack, Typography } from '@mui/material'
import { Suspense, lazy, useRef } from 'react'
import { Button, LoadingState } from '../ui'
import { ink, radius } from '../../design-system'
import { useBackground } from '../../context/BackgroundContext'
import { RewardCard } from './RewardCard'
import type { CollectionDailyReward, CollectionNoteView, NoteRecord, RarityConfig, NoteTypeConfig } from '../../types/note'

const ShareCartinha = lazy(() => import('../album/ShareCartinha').then((m) => ({ default: m.ShareCartinha })))

export type ReadableNote = CollectionDailyReward | CollectionNoteView | NoteRecord

export function NoteDetailDialog({ note, rarities, types, onClose }: {
  note: ReadableNote | null; rarities: RarityConfig[]; types: NoteTypeConfig[]; onClose: () => void
}) {
  const { theme } = useBackground()
  const cardRef = useRef<HTMLDivElement>(null)
  const rarity = note ? rarities.find((item) => item.id === note.rarity) : undefined
  const reward: CollectionDailyReward | null = note && {
    id: note.id,
    title: note.title ?? '',
    message: note.message ?? '',
    rarity: note.rarity,
    typeId: note.typeId,
    typeIds: note.typeIds,
    imageUrl: note.imageUrl ?? null,
    imageLayout: note.imageLayout,
    isNew: 'isNew' in note ? note.isNew : false,
  }

  return (
    <Dialog open={!!note} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { mx: 2, borderRadius: radius.xl, overflow: 'hidden' } } }}>
      {reward && (
        <>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={1.4}>
              <Box ref={cardRef}>
                <RewardCard reward={reward} rarities={rarities} types={types} expanded />
              </Box>
              <Stack spacing={0.7}>
                <Typography sx={{ fontSize: '0.70rem', fontWeight: 900, letterSpacing: 0.8, color: rarity?.captionColor ?? ink.muted, textTransform: 'uppercase' }}>
                  Compartilhar
                </Typography>
                <Suspense fallback={<LoadingState compact label="Preparando compartilhamento" />}>
                  <ShareCartinha reward={reward} rarities={rarities} types={types} theme={theme} sourceRef={cardRef} />
                </Suspense>
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.4 }}>
            <Button variant="primary" onClick={onClose} sx={{ flex: 1 }}>Fechar</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}
