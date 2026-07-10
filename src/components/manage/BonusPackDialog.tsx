import { Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Button, toast } from '../ui'
import { NotifyComposer, EMPTY_NOTIFY_DRAFT, notifyDraftToConfig } from './NotifyComposer'
import type { NotifyDraft } from './NotifyComposer'
import { useAddPackOpensMutation } from '../../hooks/useNotes'
import { colors, font, radius } from '../../design-system'
import type { CollectionPack } from '../../types/note'

export interface BonusPackTarget {
  email: string
  pack: CollectionPack
  currentOpens: number | undefined
}

export function BonusPackDialog({ cid, target, onClose, onSuccess }: {
  cid: string
  target: BonusPackTarget | null
  onClose: () => void
  onSuccess?: () => void
}) {
  const addPackOpensMutation = useAddPackOpensMutation(cid)
  const [opens, setOpens] = useState(1)
  const [notify, setNotify] = useState<NotifyDraft>(EMPTY_NOTIFY_DRAFT)

  useEffect(() => {
    if (target) {
      setOpens(1)
      setNotify(EMPTY_NOTIFY_DRAFT)
    }
  }, [target])

  async function handleConfirm() {
    if (!target) return
    try {
      await addPackOpensMutation.mutateAsync({
        email: target.email,
        packId: target.pack.id,
        opens,
        notify: notifyDraftToConfig(notify),
      })
      toast.success(
        'Brindes enviados! 🎁',
        notify.enabled ? { description: 'O leitor recebe seu recado junto.' } : undefined,
      )
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao atualizar brindes.')
    }
  }

  async function handleRemove() {
    if (!target) return
    try {
      await addPackOpensMutation.mutateAsync({ email: target.email, packId: target.pack.id, opens: 0 })
      toast.success('Acesso ao brinde removido.')
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao remover brinde.')
    }
  }

  return (
    <Dialog open={!!target} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: radius.xl, mx: 2, background: 'var(--pd-surface-paper)' } } }}>
      <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 800, color: colors.text.primary, pb: 0.5 }}>
        {target ? `${target.pack.emoji} ${target.pack.name}` : ''}
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={1.8}>
          <Typography sx={{ fontSize: '0.78rem', color: colors.text.secondary }}>
            Presente para <strong>{target?.email}</strong>
            {target?.currentOpens !== undefined && <> · aberturas atuais: <strong>{target.currentOpens}</strong></>}
          </Typography>

          <TextField
            label="Quantas aberturas adicionar"
            type="number"
            value={opens}
            onChange={(e) => setOpens(Math.max(1, Number(e.target.value)))}
            inputProps={{ min: 1 }}
            fullWidth
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: radius.lg } }}
          />

          <NotifyComposer
            value={notify}
            onChange={setNotify}
            toggleTitle="Personalizar o aviso?"
            toggleSubtitle="sem personalizar, o leitor recebe o aviso padrão de novos pacotinhos"
            messagePlaceholder="Pensei em você hoje... deixei uns pacotinhos te esperando 💌"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: 'wrap' }}>
        {target?.currentOpens !== undefined && (
          <Button variant="ghost" loading={addPackOpensMutation.isPending} onClick={handleRemove} sx={{ flex: '1 1 100%', color: 'error.main' }}>
            Remover brinde
          </Button>
        )}
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>Cancelar</Button>
        <Button variant="primary" loading={addPackOpensMutation.isPending} disabled={opens < 1 || addPackOpensMutation.isPending} onClick={handleConfirm} sx={{ flex: 1 }}>
          Enviar 🎁
        </Button>
      </DialogActions>
    </Dialog>
  )
}
