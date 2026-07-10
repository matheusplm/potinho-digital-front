import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Button, toast } from '../../components/ui'
import { NotifyComposer, EMPTY_NOTIFY_DRAFT, notifyDraftToConfig } from '../../components/manage/NotifyComposer'
import type { NotifyDraft } from '../../components/manage/NotifyComposer'
import { useReleaseNotesMutation } from '../../hooks/useNotes'
import { colors, font, radius } from '../../design-system'
import type { NoteRecord } from '../../types/note'

export function ReleaseDialog({ cid, notes, open, onClose }: {
  cid: string
  notes: NoteRecord[]
  open: boolean
  onClose: () => void
}) {
  const releaseMutation = useReleaseNotesMutation(cid)
  const [notify, setNotify] = useState<NotifyDraft>(EMPTY_NOTIFY_DRAFT)

  useEffect(() => {
    if (!open) setNotify(EMPTY_NOTIFY_DRAFT)
  }, [open])

  const count = notes.length

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: radius.xl, mx: 2, background: 'rgba(255,253,251,0.98)' } } }}>
      <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 800, color: colors.text.primary, pb: 0.5 }}>
        <RocketLaunchIcon sx={{ fontSize: 20, mr: 0.8, verticalAlign: 'text-bottom', color: colors.primary.main }} />
        Lançar {count} bilhete{count === 1 ? '' : 's'}?
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2}>
          <Box sx={{ maxHeight: 130, overflowY: 'auto', p: 1.2, borderRadius: radius.lg, background: 'rgba(0,0,0,0.03)', border: `1px solid ${colors.border.subtle}` }}>
            <Stack spacing={0.4}>
              {notes.map((note) => (
                <Typography key={note.id} sx={{ fontSize: '0.78rem', color: colors.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  💌 {note.title}
                </Typography>
              ))}
            </Stack>
          </Box>

          <Typography sx={{ fontSize: '0.8rem', color: colors.text.secondary, lineHeight: 1.55 }}>
            Eles passam a valer pra todos os leitores e podem sair nos pacotinhos.
            <Typography component="span" sx={{ fontWeight: 800, color: colors.rose.main }}> Não dá pra desfazer um lançamento.</Typography>
          </Typography>

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
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>Cancelar</Button>
        <Button variant="primary" loading={releaseMutation.isPending} onClick={handleRelease} sx={{ flex: 1 }}>
          Lançar 🚀
        </Button>
      </DialogActions>
    </Dialog>
  )
}
