import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { AdvancedOptions, Button, Card, ConfirmDeleteDialog, EmojiPickerInput, Input, SectionLabel, toast } from '../../components/ui'
import { RarityChip } from '../../components/collection/RarityChip'
import { useCollectionRaritiesQuery, useCreateCollectionRarityMutation, useDeleteCollectionRarityMutation, useImportCollectionRaritiesMutation, useUpdateCollectionRarityMutation } from '../../hooks/useNotes'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { useJsonImport } from '../../hooks/useJsonImport'
import { colors, font, radius, liftOnDark } from '../../design-system'
import { useBackground } from '../../context/BackgroundContext'
import { withAlpha } from '../../utils/colorUtils'
import { uniqueConfigId } from '../../utils/slug'
import type { RarityConfig } from '../../types/note'
import { ColorRow, actionButtonSx } from './shared'
import { RevealStyleEditor } from './RevealStyleEditor'

const NEW_RARITY: RarityConfig = {
  id: '', label: 'Nova raridade', emoji: '✨', odds: 10, order: 99,
  cardBg: '#ffffff', textColor: '#334155', captionColor: '#94a3b8',
  borderColor: '#cbd5e1', shadow: '0 4px 16px rgba(15,23,42,0.06)', glowColor: '',
  chipBg: '#f1f5f9', chipColor: '#64748b',
  revealEffect: 'none', revealMedia: '',
}

const DEFAULT_IMPORT_RARITIES_JSON = `[
  {
    "id": "comum",
    "label": "Comum",
    "emoji": "⚪",
    "odds": 60,
    "order": 1,
    "cardBg": "#ffffff",
    "textColor": "#334155",
    "captionColor": "#94a3b8",
    "borderColor": "#cbd5e1",
    "shadow": "0 4px 16px rgba(15,23,42,0.06)",
    "glowColor": "",
    "chipBg": "#f1f5f9",
    "chipColor": "#64748b",
    "revealEffect": "none",
    "revealMedia": ""
  }
]`

const RARITY_TEMPLATES: RarityConfig[] = [
  {
    id: 'comum', label: 'Comum', emoji: '⚪', odds: 60, order: 1,
    cardBg: 'linear-gradient(135deg,#ffffff 0%,#f8fafc 100%)', textColor: '#334155', captionColor: '#64748b',
    borderColor: '#cbd5e1', shadow: '0 4px 16px rgba(15,23,42,0.06)', glowColor: 'rgba(148,163,184,0.16)',
    chipBg: '#f1f5f9', chipColor: '#475569',
  },
  {
    id: 'incomum', label: 'Incomum', emoji: '🟢', odds: 25, order: 2,
    cardBg: 'linear-gradient(135deg,#ecfdf5 0%,#dcfce7 50%,#bbf7d0 100%)', textColor: '#14532d', captionColor: '#15803d',
    borderColor: '#22c55e', shadow: '0 6px 22px rgba(34,197,94,0.16)', glowColor: 'rgba(34,197,94,0.3)',
    chipBg: '#dcfce7', chipColor: '#15803d',
  },
  {
    id: 'raro', label: 'Raro', emoji: '🔵', odds: 10, order: 3,
    cardBg: 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 45%,#bfdbfe 100%)', textColor: '#1e3a8a', captionColor: '#2563eb',
    borderColor: '#3b82f6', shadow: '0 8px 26px rgba(59,130,246,0.2)', glowColor: 'rgba(59,130,246,0.35)',
    chipBg: '#dbeafe', chipColor: '#1d4ed8',
  },
  {
    id: 'muito_raro', label: 'Muito raro', emoji: '🟣', odds: 4, order: 4,
    cardBg: 'linear-gradient(135deg,#faf5ff 0%,#f3e8ff 42%,#ddd6fe 100%)', textColor: '#581c87', captionColor: '#7e22ce',
    borderColor: '#a855f7', shadow: '0 10px 30px rgba(168,85,247,0.22)', glowColor: 'rgba(168,85,247,0.38)',
    chipBg: '#f3e8ff', chipColor: '#7c3aed',
  },
  {
    id: 'lendario', label: 'Lendário', emoji: '🟠', odds: 1, order: 5,
    cardBg: 'linear-gradient(135deg,#fff7ed 0%,#fed7aa 42%,#f97316 100%)', textColor: '#431407', captionColor: '#9a3412',
    borderColor: '#fb923c', shadow: '0 12px 32px rgba(249,115,22,0.24)', glowColor: 'rgba(251,146,60,0.42)',
    chipBg: 'linear-gradient(135deg,#ffedd5,#fdba74)', chipColor: '#7c2d12',
  },
  {
    id: 'artefato', label: 'Artefato', emoji: '🌈', odds: 0, order: 6,
    cardBg: 'linear-gradient(135deg,#fef3c7 0%,#fbcfe8 22%,#ddd6fe 46%,#bfdbfe 70%,#bbf7d0 100%)', textColor: '#312e81', captionColor: '#7c3aed',
    borderColor: '#c084fc', shadow: '0 14px 40px rgba(124,58,237,0.25)', glowColor: 'rgba(236,72,153,0.45)',
    chipBg: 'linear-gradient(135deg,#f59e0b,#ec4899,#8b5cf6,#06b6d4)', chipColor: '#ffffff',
  },
]

const formatOdds = (odds: number) => (odds % 1 === 0 ? String(odds) : odds.toFixed(2))

const ODDS_TONE = {
  ok: { color: colors.success.main, text: colors.success.main, title: 'Distribuição de chances' },
  warn: { color: '#f59e0b', text: '#b45309', title: 'Distribuição de chances' },
  over: { color: colors.error.main, text: colors.error.main, title: '⚠ Soma ultrapassa 100%' },
}

function OddsMeter({ total }: { total: number }) {
  const tone = total > 100 ? 'over' : total > 95 ? 'warn' : 'ok'
  const { color, text, title } = ODDS_TONE[tone]
  const over = tone === 'over'
  return (
    <Box sx={{ borderRadius: radius.lg, px: 1.5, py: 1.1, bgcolor: `${color}12`, border: `1px solid ${color}40` }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
        <Typography variant="label" sx={{ color: liftOnDark(text) }}>{title}</Typography>
        <Typography variant="sm" sx={{ fontWeight: 800, color: over ? liftOnDark(text) : colors.text.secondary }}>{total.toFixed(2)}%</Typography>
      </Stack>
      <Box sx={{ height: 5, borderRadius: radius.full, bgcolor: colors.border.subtle, overflow: 'hidden' }}>
        <Box sx={{ height: '100%', width: `${Math.min(total, 100)}%`, borderRadius: radius.full, bgcolor: color, transition: 'width 0.2s ease, background-color 0.2s ease' }} />
      </Box>
      <Typography variant="xs" sx={{ mt: 0.7, textAlign: 'right', color: over ? liftOnDark(text) : colors.text.secondary }}>
        {over ? `excede em ${(total - 100).toFixed(2)}%` : `${(100 - total).toFixed(2)}% livres`}
      </Typography>
    </Box>
  )
}

function RarityPreview({ rarity }: { rarity: RarityConfig }) {
  const { cardBg, borderColor, shadow, glowColor, captionColor, textColor, odds } = rarity
  return (
    <Box sx={{ position: 'relative', p: 2.5, overflow: 'hidden', borderRadius: radius.xl, background: cardBg, border: `2px solid ${borderColor}`, boxShadow: glowColor ? `${shadow}, 0 0 28px ${withAlpha(glowColor, 53)}` : shadow }}>
      {glowColor && <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse at 50% -10%, ${withAlpha(glowColor, 20)}, transparent 65%)` }} />}
      <Stack spacing={1.5} sx={{ position: 'relative' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <RarityChip rarity={rarity} size="md" uppercase />
          <Typography variant="xs" sx={{ fontWeight: 700, color: captionColor }}>{formatOdds(odds)}% de chance</Typography>
        </Stack>
        <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.1rem', lineHeight: 1.25, color: textColor }}>
          Exemplo de bilhete ✨
        </Typography>
        <Typography variant="lg" sx={{ fontStyle: 'italic', lineHeight: 1.5, color: captionColor }}>
          "Aqui vai a mensagem especial que o leitor vai receber quando tirar essa raridade."
        </Typography>
      </Stack>
    </Box>
  )
}

function TemplateTile({ template, applied, onClick }: { template: RarityConfig; applied: boolean; onClick: () => void }) {
  const { cardBg, borderColor, glowColor } = template
  return (
    <Box
      onClick={onClick}
      sx={{
        p: 1, borderRadius: radius.lg, cursor: 'pointer', background: cardBg, transition: 'all 0.15s ease',
        border: `1.5px solid ${applied ? borderColor : 'rgba(0,0,0,0.07)'}`,
        boxShadow: applied && glowColor ? `0 0 16px ${withAlpha(glowColor, 60)}` : 'none',
        outline: applied ? `2px solid ${withAlpha(borderColor, 33)}` : 'none',
        '&:hover': { transform: 'translateY(-1px)', boxShadow: glowColor ? `0 0 14px ${withAlpha(glowColor, 40)}` : 'none', border: `1.5px solid ${borderColor}` },
      }}
    >
      <RarityChip rarity={template} />
    </Box>
  )
}

function RarityEditor({ cid, rarity, onClose }: { cid: string; rarity: RarityConfig | null; onClose: () => void }) {
  const isNew = !rarity
  const { data: existingRarities = [] } = useCollectionRaritiesQuery(cid)
  const [form, setForm] = useState<RarityConfig>(rarity ? { ...rarity } : { ...NEW_RARITY })
  const [appliedTemplateId, setAppliedTemplateId] = useState<string | null>(null)
  const orderSet = useRef(!isNew)
  useEffect(() => {
    if (orderSet.current) return
    orderSet.current = true
    setForm((f) => ({ ...f, order: existingRarities.length + 1 }))
  }, [existingRarities.length])
  const createMutation = useCreateCollectionRarityMutation(cid)
  const updateMutation = useUpdateCollectionRarityMutation(cid)
  const isPending = createMutation.isPending || updateMutation.isPending
  const set = (field: string, value: string | number) => setForm((f) => ({ ...f, [field]: value }))

  const otherOdds = existingRarities.filter((r) => r.id !== form.id).reduce((sum, r) => sum + r.odds, 0)
  const totalOdds = parseFloat((otherOdds + form.odds).toFixed(2))

  const applyTemplate = (template: RarityConfig) => {
    setAppliedTemplateId(template.id)
    setForm((current) => ({
      ...template,
      id: current.id,
      order: template.order,
      createdAt: current.createdAt,
      updatedAt: current.updatedAt,
    }))
  }

  const save = () => {
    const label = form.label.trim()
    if (!label) return

    const mutationOptions = {
      onSuccess: () => { toast.success(isNew ? 'Raridade criada!' : 'Raridade salva!'); onClose() },
      onError: (error: Error) => toast.error(error.message || 'Erro ao salvar raridade.'),
    }

    if (isNew) {
      const id = uniqueConfigId(label, existingRarities.map((item) => item.id))
      const payload = { ...form, id, label, order: form.order || existingRarities.length + 1 }
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
        {isNew ? 'Nova raridade' : `Editar ${form.emoji} ${form.label}`}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Box>
            <SectionLabel hint="clique para preencher automaticamente" sx={{ mb: 1 }}>Modelos prontos</SectionLabel>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.7 }}>
              {RARITY_TEMPLATES.map((template) => (
                <TemplateTile key={template.id} template={template} applied={appliedTemplateId === template.id} onClick={() => applyTemplate(template)} />
              ))}
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Input label="Nome" value={form.label} onChange={(e) => set('label', e.target.value)} sx={{ flex: 1 }} />
            <EmojiPickerInput label="Emoji" value={form.emoji} onChange={(emoji) => set('emoji', emoji)} />
            <Input label="Chance %" type="number" value={form.odds} onChange={(e) => set('odds', e.target.value === '' ? 0 : Number(e.target.value))} onBlur={(e) => set('odds', parseFloat(Math.max(0, Math.min(100, Number(e.target.value) || 0)).toFixed(2)))} sx={{ width: 95 }} inputProps={{ step: 0.01, min: 0, max: 100 }} />
          </Stack>
          <OddsMeter total={totalOdds} />
          <RarityPreview rarity={form} />
          <RevealStyleEditor
            cid={cid}
            form={form}
            rarities={existingRarities}
            onStyle={(revealStyle) => setForm((f) => ({ ...f, revealStyle }))}
            onField={set}
          />
          <AdvancedOptions label="🎨 Cores do bilhete" spacing={1.4}>
          <ColorRow label="Fundo do card" field="cardBg" value={form.cardBg} onChange={set} />
          <ColorRow label="Cor do texto" field="textColor" value={form.textColor} onChange={set} />
          <ColorRow label="Cor da legenda" field="captionColor" value={form.captionColor} onChange={set} />
          <ColorRow label="Cor da borda" field="borderColor" value={form.borderColor} onChange={set} />
          <ColorRow label="Sombra" field="shadow" value={form.shadow} onChange={set} />
          <ColorRow label="Brilho (vazio = sem)" field="glowColor" value={form.glowColor} onChange={set} />
          <ColorRow label="Fundo do chip" field="chipBg" value={form.chipBg} onChange={set} />
          <ColorRow label="Texto do chip" field="chipColor" value={form.chipColor} onChange={set} />
          </AdvancedOptions>
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

interface RaritiesTabProps { cid: string }

export function RaritiesTab({ cid }: RaritiesTabProps) {
  const { theme } = useBackground()
  const { data: rarities = [] } = useCollectionRaritiesQuery(cid)
  const deleteRarity = useDeleteCollectionRarityMutation(cid)
  const importRarities = useImportCollectionRaritiesMutation(cid)

  const [rarityDialogOpen, setRarityDialogOpen] = useState(false)
  const [editingRarity, setEditingRarity] = useState<RarityConfig | null>(null)
  const [rarityImportDialogOpen, setRarityImportDialogOpen] = useState(false)

  const rarityDelete = useConfirmDelete<RarityConfig>(deleteRarity, { success: 'Raridade excluída.', error: 'Erro ao excluir raridade.' })
  const rarityImport = useJsonImport(
    importRarities,
    (r) => r.created === 0
      ? `Nenhuma raridade nova, ${r.skipped} já existia${r.skipped !== 1 ? 'm' : ''}.`
      : r.skipped > 0
        ? `${r.created} importada${r.created !== 1 ? 's' : ''}, ${r.skipped} ignorada${r.skipped !== 1 ? 's' : ''} (id duplicado).`
        : `${r.created} raridade${r.created !== 1 ? 's' : ''} importada${r.created !== 1 ? 's' : ''}.`,
    () => setRarityImportDialogOpen(false),
    DEFAULT_IMPORT_RARITIES_JSON,
  )

  return (
    <>
      <Stack spacing={1.4}>
        <Stack spacing={1}>
          <Typography variant="sm" sx={{ color: theme.textOnBgMuted, fontWeight: 600 }}>
            {rarities.length} raridade{rarities.length !== 1 ? 's' : ''}
          </Typography>
          <Stack direction="row" spacing={0.8} alignItems="center" sx={{ flexWrap: 'wrap', rowGap: 0.8 }}>
            <Button variant="ghost" onClick={() => setRarityImportDialogOpen(true)} sx={{ flex: '1 1 132px', py: 0.7, px: 1.2, fontSize: '0.76rem' }}>
              Importar JSON
            </Button>
            <Button variant="primary" onClick={() => { setEditingRarity(null); setRarityDialogOpen(true) }} sx={{ flex: '1 1 94px', py: 0.7, px: 1.4, fontSize: '0.78rem' }}>
              <AddIcon sx={{ fontSize: 15, mr: 0.4 }} /> Nova
            </Button>
          </Stack>
        </Stack>
        {rarities.length === 0 && (
          <Typography variant="lg" sx={{ color: theme.textOnBgMuted, textAlign: 'center', py: 3 }}>
            Nenhuma raridade. Toque em "Nova" para criar.
          </Typography>
        )}
        {rarities.map((r) => (
          <Card key={r.id} sx={{ p: 0, overflow: 'hidden', background: r.cardBg, border: `1.5px solid ${r.borderColor}`, boxShadow: r.shadow }}>
            <Box sx={{ py: 1.4, px: 1.8 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <Box onClick={() => { setEditingRarity(r); setRarityDialogOpen(true) }} sx={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RarityChip rarity={r} uppercase />
                  <Typography variant="md" sx={{ fontWeight: 600, color: r.captionColor }}>{formatOdds(r.odds)}% de chance</Typography>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" aria-label="editar raridade" onClick={() => { setEditingRarity(r); setRarityDialogOpen(true) }} sx={actionButtonSx('primary')}>
                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton size="small" aria-label="excluir raridade" onClick={() => rarityDelete.setTarget(r)} sx={actionButtonSx('danger')}>
                    <DeleteForeverOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>
          </Card>
        ))}
      </Stack>

      <Dialog open={rarityImportDialogOpen} onClose={() => setRarityImportDialogOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: radius.xl, mx: 2, background: 'var(--pd-surface-paper)' } } }}>
        <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 800, color: colors.text.primary, pb: 0.5 }}>
          Importar raridades por JSON
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={1.3}>
            <Typography variant="md" sx={{ color: colors.text.secondary, lineHeight: 1.5 }}>
              Cole uma lista de raridades. Cada item precisa ter <strong>id</strong>, <strong>label</strong>, <strong>emoji</strong>, <strong>odds</strong>, <strong>order</strong> e as cores. Raridades com id já existente serão ignoradas.
            </Typography>
            <TextField multiline minRows={10} value={rarityImport.json} onChange={(e) => rarityImport.setJson(e.target.value)} fullWidth spellCheck={false}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: radius.lg, background: colors.surface.base, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '0.75rem', alignItems: 'flex-start' } }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="ghost" onClick={() => setRarityImportDialogOpen(false)} sx={{ flex: 1 }}>Cancelar</Button>
          <Button variant="primary" loading={importRarities.isPending} disabled={!rarityImport.json.trim() || importRarities.isPending} onClick={rarityImport.execute} sx={{ flex: 1 }}>Importar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rarityDialogOpen} onClose={() => { setRarityDialogOpen(false); setEditingRarity(null) }} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: radius.xl } } }}>
        {rarityDialogOpen && <RarityEditor key={editingRarity?.id ?? 'new'} cid={cid} rarity={editingRarity} onClose={() => { setRarityDialogOpen(false); setEditingRarity(null) }} />}
      </Dialog>

      <ConfirmDeleteDialog open={rarityDelete.isOpen} title={`Excluir a raridade "${rarityDelete.target?.label ?? ''}"?`} isPending={rarityDelete.isPending} onConfirm={rarityDelete.confirm} onClose={rarityDelete.close} />
    </>
  )
}
