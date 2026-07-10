import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { Button } from './ui'
import { colors, font, radius } from '../design-system'
import type { CollectionTemplate } from '../services/collectionTemplates'

function SummaryRow({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <Typography sx={{ fontSize: '0.9rem', lineHeight: 1.4, flexShrink: 0 }}>{icon}</Typography>
      <Typography sx={{ fontSize: '0.84rem', color: colors.text.secondary, lineHeight: 1.55 }}>{children}</Typography>
    </Stack>
  )
}

export function KitConfirmDialog({ open, template, inviteEmail, isPending, onConfirm, onClose }: {
  open: boolean
  template: CollectionTemplate | null
  inviteEmail?: string
  isPending: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <Dialog
      open={open && !!template}
      onClose={isPending ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: radius.xl, mx: 2, background: 'var(--pd-surface-paper)' } } }}
    >
      {template && (
        <>
          <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 800, color: colors.text.primary, pb: 0.5 }}>
            Criar &ldquo;{template.collection.name}&rdquo;?
          </DialogTitle>
          <DialogContent>
            <Stack spacing={1.1} sx={{ pt: 0.5 }}>
              <SummaryRow icon={template.emoji}>
                Kit <strong style={{ color: colors.text.primary }}>{template.title}</strong>
              </SummaryRow>
              <SummaryRow icon="✉️">
                <strong style={{ color: colors.text.primary }}>{template.notes.length} bilhetes de exemplo</strong> já escritos para você editar
              </SummaryRow>
              <SummaryRow icon="🎁">
                {template.raritiesCount} raridades · {template.typesCount} tipos · {template.packsCount} pacotinhos
              </SummaryRow>
              {inviteEmail ? (
                <Box sx={{ p: 1.1, borderRadius: radius.md, background: 'rgba(29,78,216,0.06)', border: '1px solid rgba(29,78,216,0.18)' }}>
                  <Typography sx={{ fontSize: '0.82rem', color: colors.text.primary, lineHeight: 1.5 }}>
                    💌 Convidando <strong>{inviteEmail}</strong>: a pessoa recebe o convite por email assim que a coleção nascer.
                  </Typography>
                </Box>
              ) : (
                <SummaryRow icon="🔓">
                  Sem convite por enquanto. Dá para convidar depois na aba Acesso.
                </SummaryRow>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button variant="ghost" onClick={onClose} disabled={isPending} sx={{ flex: 1 }}>
              Voltar
            </Button>
            <Button variant="primary" loading={isPending} onClick={onConfirm} sx={{ flex: 1 }}>
              Criar agora 💙
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}
