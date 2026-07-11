import { Box, Dialog, DialogActions, DialogContent, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Button, toast } from '../../components/ui'
import { NotifyComposer, EMPTY_NOTIFY_DRAFT, notifyDraftToConfig } from '../../components/manage/NotifyComposer'
import type { NotifyDraft } from '../../components/manage/NotifyComposer'
import { useReleaseNotesMutation } from '../../hooks/useNotes'
import { useBackground } from '../../context/BackgroundContext'
import { colors, font, radius } from '../../design-system'
import type { NoteRecord, RarityConfig } from '../../types/note'

const CHIP_PREVIEW_LIMIT = 6

export function ReleaseDialog({ cid, notes, rarities, open, onClose }: {
  cid: string
  notes: NoteRecord[]
  rarities: RarityConfig[]
  open: boolean
  onClose: () => void
}) {
  const { theme } = useBackground()
  const releaseMutation = useReleaseNotesMutation(cid)
  const [notify, setNotify] = useState<NotifyDraft>(EMPTY_NOTIFY_DRAFT)

  useEffect(() => {
    if (!open) setNotify(EMPTY_NOTIFY_DRAFT)
  }, [open])

  const count = notes.length
  const preview = notes.slice(0, CHIP_PREVIEW_LIMIT)
  const remaining = count - preview.length

  function handleRelease() {
    releaseMutation.mutate({ noteIds: notes.map((n) => n.id), notify: notifyDraftToConfig(notify) }, {
      onSuccess: ({ notified }) => {
        toast.success(
          `${count} bilhete${count === 1 ? '' : 's'} lançado${count === 1 ? '' : 's'}! 🚀`,
          notified ? { description: 'Os leitores foram avisados.' } : undefined,
        )
        onClose()
      },
      onError: (e) => toast.error((e as Error).message || 'Erro ao lançar bilhetes.'),
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: radius.xl, mx: 2, overflow: 'hidden' } } }}>
      <Box sx={{ px: 3, pt: 2.6, pb: 2, background: `linear-gradient(135deg, ${theme.accent}1c, transparent 70%)` }}>
        <Stack direction="row" alignItems="center" spacing={1.4}>
          <Box sx={{
            width: 46, height: 46, borderRadius: radius.lg, flexShrink: 0, fontSize: '1.4rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `${theme.accent}1e`, border: `1px solid ${theme.accent}38`,
          }}>
            🚀
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.15rem', color: colors.text.primary, lineHeight: 1.2 }}>
              Lançar {count} bilhete{count === 1 ? '' : 's'}
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: colors.text.secondary, mt: 0.2 }}>
              Eles entram no sorteio e aparecem pros leitores. 🔒 Sem volta depois.
            </Typography>
          </Box>
        </Stack>
      </Box>

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2.2}>
          <Stack direction="row" spacing={0.6} sx={{ flexWrap: 'wrap', rowGap: 0.6 }}>
            {preview.map((note) => {
              const r = rarities.find((x) => x.id === note.rarity)
              return (
                <Box key={note.id} sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 0.5, maxWidth: 190,
                  px: 1.1, py: 0.45, borderRadius: radius.full,
                  background: colors.surface.overlay, border: `1px solid ${r?.borderColor ?? colors.border.subtle}`,
                }}>
                  <Typography sx={{ fontSize: '0.74rem', flexShrink: 0 }}>{r?.emoji ?? '💌'}</Typography>
                  <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {note.title}
                  </Typography>
                </Box>
              )
            })}
            {remaining > 0 && (
              <Box sx={{
                display: 'inline-flex', alignItems: 'center', px: 1.1, py: 0.45, borderRadius: radius.full,
                background: `${theme.accent}14`, border: `1px solid ${theme.accent}30`,
              }}>
                <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: theme.accent }}>
                  +{remaining} bilhete{remaining === 1 ? '' : 's'}
                </Typography>
              </Box>
            )}
          </Stack>

          <Box sx={{ height: '1px', background: colors.border.subtle }} />

          <NotifyComposer
            value={notify}
            onChange={setNotify}
            toggleTitle="Avisar os leitores?"
            toggleSubtitle="anuncie a novidade com uma mensagem sua"
            messagePlaceholder="Chegaram bilhetes novos fresquinhos pra você... 💙"
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>Ainda não</Button>
        <Button variant="primary" loading={releaseMutation.isPending} onClick={handleRelease} sx={{ flex: 1.4 }}>
          Lançar agora 🚀
        </Button>
      </DialogActions>
    </Dialog>
  )
}
