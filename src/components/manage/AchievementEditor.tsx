import { Box, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { Button, Input, toast, EmojiPickerInput } from '../ui'
import {
  useCollectionAchievementsQuery,
  useCreateCollectionAchievementMutation,
  useUpdateCollectionAchievementMutation,
} from '../../hooks/useNotes'
import { colors, font, radius } from '../../design-system'
import { uniqueConfigId } from '../../utils/slug'
import type {
  AchievementConditionType,
  CollectionAchievement,
  CollectionAchievementFormData,
  NoteTypeConfig,
  RarityConfig,
} from '../../types/note'

const CONDITIONS: { type: AchievementConditionType; label: string; needs: ('count' | 'rarity' | 'type')[] }[] = [
  { type: 'collect_count', label: 'Coletar N bilhetes', needs: ['count'] },
  { type: 'complete', label: 'Completar a coleção', needs: [] },
  { type: 'rarity_count', label: 'Coletar N de uma raridade', needs: ['rarity', 'count'] },
  { type: 'type_complete', label: 'Completar um tipo', needs: ['type'] },
  { type: 'favorite_count', label: 'Favoritar N bilhetes', needs: ['count'] },
  { type: 'rainbow', label: 'Uma de cada raridade', needs: [] },
]

interface FormState {
  label: string
  emoji: string
  description: string
  conditionType: AchievementConditionType
  count: number
  rarityId: string | null
  typeId: string | null
  order: number
}

function fromAchievement(a: CollectionAchievement | null, order: number): FormState {
  return {
    label: a?.label ?? '',
    emoji: a?.emoji ?? '🏅',
    description: a?.description ?? '',
    conditionType: a?.conditionType ?? 'collect_count',
    count: a?.count ?? 10,
    rarityId: a?.rarityId ?? null,
    typeId: a?.typeId ?? null,
    order: a?.order ?? order,
  }
}

export function AchievementEditor({ cid, achievement, rarities, types, onClose }: {
  cid: string
  achievement: CollectionAchievement | null
  rarities: RarityConfig[]
  types: NoteTypeConfig[]
  onClose: () => void
}) {
  const isNew = !achievement
  const { data: existing = [] } = useCollectionAchievementsQuery(cid)
  const [form, setForm] = useState<FormState>(() => fromAchievement(achievement, existing.length + 1))
  const createMutation = useCreateCollectionAchievementMutation(cid)
  const updateMutation = useUpdateCollectionAchievementMutation(cid)
  const isPending = createMutation.isPending || updateMutation.isPending

  const condition = CONDITIONS.find((c) => c.type === form.conditionType)!
  const needsCount = condition.needs.includes('count')
  const needsRarity = condition.needs.includes('rarity')
  const needsType = condition.needs.includes('type')

  function save() {
    const label = form.label.trim()
    if (!label) return
    if (needsRarity && !form.rarityId) { toast.error('Escolha uma raridade.'); return }
    if (needsType && !form.typeId) { toast.error('Escolha um tipo.'); return }

    const payload: CollectionAchievementFormData = {
      id: isNew ? undefined : achievement!.id,
      label,
      emoji: form.emoji.trim() || '🏅',
      description: form.description.trim(),
      conditionType: form.conditionType,
      count: needsCount ? Math.max(1, form.count) : null,
      rarityId: needsRarity ? form.rarityId : null,
      typeId: needsType ? form.typeId : null,
      order: form.order,
    }

    const options = {
      onSuccess: () => { toast.success(isNew ? 'Conquista criada!' : 'Conquista salva!'); onClose() },
      onError: (error: Error) => toast.error(error.message || 'Erro ao salvar conquista.'),
    }

    if (isNew) {
      const id = uniqueConfigId(label, existing.map((a) => a.id))
      createMutation.mutate({ ...payload, id }, options)
    } else {
      const { label: l, emoji, description, conditionType, count, rarityId, typeId, order } = payload
      updateMutation.mutate({ id: achievement!.id, data: { label: l, emoji, description, conditionType, count, rarityId, typeId, order } }, options)
    }
  }

  const pickerChip = (active: boolean, accent: string) => ({
    px: 1.05, py: 0.5, borderRadius: radius.full, cursor: 'pointer', flexShrink: 0,
    fontSize: '0.74rem', fontWeight: 800,
    color: active ? '#fff' : colors.text.secondary,
    background: active ? accent : 'rgba(0,0,0,0.04)',
    border: `1.5px solid ${active ? accent : colors.border.subtle}`,
  })

  return (
    <>
      <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 700, color: colors.text.primary, pb: 1 }}>
        {isNew ? 'Nova conquista' : `Editar ${form.emoji} ${form.label}`}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Stack direction="row" spacing={1.5}>
            <Input label="Nome" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} sx={{ flex: 1 }} />
            <EmojiPickerInput label="Emoji" value={form.emoji} onChange={(emoji) => setForm((f) => ({ ...f, emoji }))} />
          </Stack>
          <Input label="Descrição" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />

          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: colors.text.secondary, mb: 0.8 }}>Condição</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
              {CONDITIONS.map((c) => (
                <Box key={c.type} onClick={() => setForm((f) => ({ ...f, conditionType: c.type }))} sx={pickerChip(form.conditionType === c.type, colors.primary.main)}>
                  {c.label}
                </Box>
              ))}
            </Box>
          </Box>

          {needsCount && (
            <Input
              label="Quantidade"
              type="number"
              value={String(form.count)}
              onChange={(e) => setForm((f) => ({ ...f, count: Math.max(1, Number(e.target.value) || 1) }))}
              sx={{ width: 140 }}
            />
          )}

          {needsRarity && (
            <Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: colors.text.secondary, mb: 0.8 }}>Raridade</Typography>
              {rarities.length === 0 ? (
                <Typography sx={{ fontSize: '0.8rem', color: colors.text.muted }}>Crie raridades primeiro.</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                  {rarities.map((r) => (
                    <Box key={r.id} onClick={() => setForm((f) => ({ ...f, rarityId: r.id }))} sx={pickerChip(form.rarityId === r.id, r.chipColor || colors.primary.main)}>
                      {r.emoji} {r.label}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {needsType && (
            <Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: colors.text.secondary, mb: 0.8 }}>Tipo</Typography>
              {types.length === 0 ? (
                <Typography sx={{ fontSize: '0.8rem', color: colors.text.muted }}>Crie tipos primeiro.</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                  {types.map((t) => (
                    <Box key={t.id} onClick={() => setForm((f) => ({ ...f, typeId: t.id }))} sx={pickerChip(form.typeId === t.id, t.accentColor || colors.primary.main)}>
                      {t.emoji} {t.label}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.2, borderRadius: radius.lg, background: 'rgba(0,0,0,0.03)' }}>
            <Box sx={{ width: 40, height: 40, borderRadius: radius.full, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', background: `linear-gradient(135deg,${colors.primary.main}22,${colors.primary.main}44)` }}>
              {form.emoji}
            </Box>
            <Box>
              <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '0.9rem', color: colors.text.primary }}>{form.label || 'Conquista'}</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: colors.text.secondary }}>{form.description || condition.label}</Typography>
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1, py: 0.8 }}>Cancelar</Button>
        <Button variant="rose" onClick={save} loading={isPending} disabled={!form.label.trim()} sx={{ flex: 1, py: 0.8 }}>
          {isNew ? 'Criar' : 'Salvar'}
        </Button>
      </DialogActions>
    </>
  )
}
