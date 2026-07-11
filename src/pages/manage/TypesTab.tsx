import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { AdvancedOptions, Button, Card, ConfirmDeleteDialog, EmojiPickerInput, Input, toast } from '../../components/ui'
import { useCollectionTypesQuery, useCreateCollectionTypeMutation, useDeleteCollectionTypeMutation, useImportCollectionTypesMutation, useUpdateCollectionTypeMutation } from '../../hooks/useNotes'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { useJsonImport } from '../../hooks/useJsonImport'
import { colors, font, radius } from '../../design-system'
import { useBackground } from '../../context/BackgroundContext'
import { uniqueConfigId } from '../../utils/slug'
import type { NoteTypeConfig } from '../../types/note'
import { ColorRow, actionButtonSx } from './shared'

const NEW_TYPE: NoteTypeConfig = {
  id: '', label: 'Novo tipo', emoji: '✨', order: 99,
  accentColor: '#6366f1', tagBg: '#eef2ff', tagColor: '#4f46e5',
}

const DEFAULT_IMPORT_TYPES_JSON = `[
  {
    "id": "alegria",
    "label": "Alegria",
    "emoji": "😊",
    "order": 1,
    "accentColor": "#6366f1",
    "tagBg": "#eef2ff",
    "tagColor": "#4f46e5"
  }
]`

function TypeEditor({ cid, type, onClose }: { cid: string; type: NoteTypeConfig | null; onClose: () => void }) {
  const isNew = !type
  const { data: existingTypes = [] } = useCollectionTypesQuery(cid)
  const [form, setForm] = useState<NoteTypeConfig>(type ? { ...type } : { ...NEW_TYPE, order: existingTypes.length + 1 })
  const createMutation = useCreateCollectionTypeMutation(cid)
  const updateMutation = useUpdateCollectionTypeMutation(cid)
  const isPending = createMutation.isPending || updateMutation.isPending
  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  const save = () => {
    const label = form.label.trim()
    if (!label) return

    const mutationOptions = {
      onSuccess: () => { toast.success(isNew ? 'Tipo criado!' : 'Tipo salvo!'); onClose() },
      onError: (error: Error) => toast.error(error.message || 'Erro ao salvar tipo.'),
    }

    if (isNew) {
      const id = uniqueConfigId(label, existingTypes.map((item) => item.id))
      const payload = { ...form, id, label, order: form.order || existingTypes.length + 1 }
      delete payload.createdAt
      delete payload.updatedAt
      createMutation.mutate(payload, mutationOptions)
      return
    }
    const { id, ...data } = { ...form, label }
    delete data.createdAt
    delete data.updatedAt
    updateMutation.mutate({ id, data }, mutationOptions)
  }

  return (
    <>
      <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 700, color: colors.text.primary, pb: 1 }}>
        {isNew ? 'Novo tipo' : `Editar ${form.emoji} ${form.label}`}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Stack direction="row" spacing={1.5}>
            <Input label="Nome" value={form.label} onChange={(e) => set('label', e.target.value)} sx={{ flex: 1 }} />
            <EmojiPickerInput label="Emoji" value={form.emoji} onChange={(emoji) => set('emoji', emoji)} />
          </Stack>
          <AdvancedOptions label="🎨 Cores da tag" spacing={1.4}>
            <ColorRow label="Cor de destaque" field="accentColor" value={form.accentColor} onChange={set} />
            <ColorRow label="Fundo da tag" field="tagBg" value={form.tagBg} onChange={set} />
            <ColorRow label="Texto da tag" field="tagColor" value={form.tagColor} onChange={set} />
          </AdvancedOptions>
          <Box sx={{ display: 'inline-flex', px: 0.8, py: 0.3, borderRadius: radius.md, bgcolor: form.tagBg, gap: 0.3, alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.8rem' }}>{form.emoji}</Typography>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: form.tagColor }}>{form.label}</Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1, py: 0.8 }}>Cancelar</Button>
        <Button variant="primary" onClick={save} loading={isPending} disabled={!form.label.trim()} sx={{ flex: 1, py: 0.8 }}>
          {isNew ? 'Criar' : 'Salvar'}
        </Button>
      </DialogActions>
    </>
  )
}

interface TypesTabProps { cid: string }

export function TypesTab({ cid }: TypesTabProps) {
  const { theme } = useBackground()
  const { data: types = [] } = useCollectionTypesQuery(cid)
  const deleteType = useDeleteCollectionTypeMutation(cid)
  const importTypes = useImportCollectionTypesMutation(cid)

  const [typeDialogOpen, setTypeDialogOpen] = useState(false)
  const [editingType, setEditingType] = useState<NoteTypeConfig | null>(null)
  const [typeImportDialogOpen, setTypeImportDialogOpen] = useState(false)

  const typeDelete = useConfirmDelete<NoteTypeConfig>(deleteType, { success: 'Tipo excluído.', error: 'Erro ao excluir tipo.' })
  const typeImport = useJsonImport(
    importTypes,
    (r) => r.created === 0
      ? `Nenhum tipo novo, ${r.skipped} já existia${r.skipped !== 1 ? 'm' : ''}.`
      : r.skipped > 0
        ? `${r.created} importado${r.created !== 1 ? 's' : ''}, ${r.skipped} ignorado${r.skipped !== 1 ? 's' : ''} (id duplicado).`
        : `${r.created} tipo${r.created !== 1 ? 's' : ''} importado${r.created !== 1 ? 's' : ''}.`,
    () => setTypeImportDialogOpen(false),
    DEFAULT_IMPORT_TYPES_JSON,
  )

  return (
    <>
      <Stack spacing={1.4}>
        <Stack spacing={1}>
          <Typography sx={{ fontSize: '0.72rem', color: theme.textOnBgMuted, fontWeight: 600 }}>
            {types.length} tipo{types.length !== 1 ? 's' : ''}
          </Typography>
          <Stack direction="row" spacing={0.8} alignItems="center" sx={{ flexWrap: 'wrap', rowGap: 0.8 }}>
            <Button variant="ghost" onClick={() => setTypeImportDialogOpen(true)} sx={{ flex: '1 1 132px', py: 0.7, px: 1.2, fontSize: '0.76rem' }}>
              Importar JSON
            </Button>
            <Button variant="primary" onClick={() => { setEditingType(null); setTypeDialogOpen(true) }} sx={{ flex: '1 1 94px', py: 0.7, px: 1.4, fontSize: '0.78rem' }}>
              <AddIcon sx={{ fontSize: 15, mr: 0.4 }} /> Novo
            </Button>
          </Stack>
        </Stack>
        {types.length === 0 && (
          <Typography sx={{ fontSize: '0.85rem', color: theme.textOnBgMuted, textAlign: 'center', py: 3 }}>
            Nenhum tipo. Toque em "Novo" para criar.
          </Typography>
        )}
        {types.map((t) => (
          <Card key={t.id} sx={{ p: 0, overflow: 'hidden', border: `1.5px solid ${t.accentColor}22`, boxShadow: `0 2px 8px ${t.accentColor}18` }}>
            <Box sx={{ py: 1.4, px: 1.8 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <Box onClick={() => { setEditingType(t); setTypeDialogOpen(true) }} sx={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ px: 1, py: 0.4, borderRadius: radius.md, bgcolor: t.tagBg, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.85rem' }}>{t.emoji}</Typography>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: t.tagColor }}>{t.label}</Typography>
                  </Box>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: t.accentColor }} />
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" aria-label="editar tipo" onClick={() => { setEditingType(t); setTypeDialogOpen(true) }} sx={actionButtonSx('primary')}>
                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton size="small" aria-label="excluir tipo" onClick={() => typeDelete.setTarget(t)} sx={actionButtonSx('danger')}>
                    <DeleteForeverOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>
          </Card>
        ))}
      </Stack>

      <Dialog open={typeImportDialogOpen} onClose={() => setTypeImportDialogOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: radius.xl, mx: 2, background: 'var(--pd-surface-paper)' } } }}>
        <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 800, color: colors.text.primary, pb: 0.5 }}>
          Importar tipos por JSON
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={1.3}>
            <Typography sx={{ fontSize: '0.82rem', color: colors.text.secondary, lineHeight: 1.5 }}>
              Cole uma lista de tipos. Cada item precisa ter <strong>id</strong>, <strong>label</strong>, <strong>emoji</strong>, <strong>order</strong>, <strong>accentColor</strong>, <strong>tagBg</strong> e <strong>tagColor</strong>. Tipos com id já existente serão ignorados.
            </Typography>
            <TextField multiline minRows={10} value={typeImport.json} onChange={(e) => typeImport.setJson(e.target.value)} fullWidth spellCheck={false}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: radius.lg, background: colors.surface.base, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '0.75rem', alignItems: 'flex-start' } }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="ghost" onClick={() => setTypeImportDialogOpen(false)} sx={{ flex: 1 }}>Cancelar</Button>
          <Button variant="primary" loading={importTypes.isPending} disabled={!typeImport.json.trim() || importTypes.isPending} onClick={typeImport.execute} sx={{ flex: 1 }}>Importar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={typeDialogOpen} onClose={() => { setTypeDialogOpen(false); setEditingType(null) }} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: radius.xl } } }}>
        {typeDialogOpen && <TypeEditor key={editingType?.id ?? 'new'} cid={cid} type={editingType} onClose={() => { setTypeDialogOpen(false); setEditingType(null) }} />}
      </Dialog>

      <ConfirmDeleteDialog open={typeDelete.isOpen} title={`Excluir o tipo "${typeDelete.target?.label ?? ''}"?`} isPending={typeDelete.isPending} onConfirm={typeDelete.confirm} onClose={typeDelete.close} />
    </>
  )
}
