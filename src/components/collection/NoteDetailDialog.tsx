import { Dialog, DialogActions, DialogContent, Stack, Typography } from '@mui/material'
import { Suspense, lazy } from 'react'
import { Button, LoadingState } from '../ui'
import { colors, radius } from '../../design-system'
import { useBackground } from '../../context/BackgroundContext'
import { RewardCard } from './RewardCard'
import type { CollectionDailyReward, CollectionNoteView, NoteRecord, RarityConfig, NoteTypeConfig } from '../../types/note'

const ShareCartinha = lazy(() => import('../album/ShareCartinha').then((m) => ({ default: m.ShareCartinha })))

export type ReadableNote = CollectionDailyReward | CollectionNoteView | NoteRecord

export function NoteDetailDialog({ note, rarities, types, onClose }: {
  note: ReadableNote | null; rarities: RarityConfig[]; types: NoteTypeConfig[]; onClose: () => void
}) {
  const { theme } = useBackground()
  const rarity = note ? rarities.find((item) => item.id === note.rarity) : undefined
  const type = note ? types.find((item) => item.id === note.typeId) : undefined

  return (
    <Dialog open={!!note} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { mx: 2, borderRadius: radius.xl, overflow: 'hidden' } } }}>
      {note && (
        <>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={1.4}>
              <RewardCard
                reward={{
                  id: note.id,
                  title: note.title ?? '',
                  message: note.message ?? '',
                  rarity: note.rarity,
                  typeId: note.typeId,
                  imageUrl: note.imageUrl ?? null,
                  imageLayout: note.imageLayout,
                  isNew: 'isNew' in note ? note.isNew : false,
                }}
                rarities={rarities}
                types={types}
                expanded
              />
              <Stack spacing={0.7}>
                <Typography sx={{ fontSize: '0.70rem', fontWeight: 900, letterSpacing: 0.8, color: rarity?.captionColor ?? colors.text.muted, textTransform: 'uppercase' }}>
                  Compartilhar
                </Typography>
                <Suspense fallback={<LoadingState compact label="Preparando compartilhamento" />}>
                  <ShareCartinha note={note} r={rarity} t={type} theme={theme} />
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
