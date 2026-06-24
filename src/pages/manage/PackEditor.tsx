import { Box, Chip, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { Button, EmojiPickerInput, Input } from '../../components/ui'
import { useCreateCollectionPackMutation, useCollectionPacksQuery, useUpdateCollectionPackMutation } from '../../hooks/useNotes'
import { colors, font, radius } from '../../design-system'
import { gradientTextSx } from '../../utils/colorUtils'
import { uniqueConfigId } from '../../utils/slug'
import { toast } from '../../components/ui'
import { ColorRow } from './shared'
import {
  PACK_TEMPLATES, PACK_CATEGORY_LABELS, PACK_CATEGORY_OPTIONS,
  PACK_STATUS_OPTIONS, PACK_DISTRIBUTION_OPTIONS,
} from './packData'
import type { CollectionPack, CollectionPackFormData, RarityConfig, NoteTypeConfig } from '../../types/note'

export function PackEditor({ cid, pack, rarities, types, onClose }: {
  cid: string; pack: CollectionPack | null; rarities: RarityConfig[]; types: NoteTypeConfig[]; onClose: () => void
}) {
  const isNew = !pack
  const { data: existingPacks = [] } = useCollectionPacksQuery(cid)
  const [form, setForm] = useState<CollectionPackFormData>(pack ? {
    name: pack.name, emoji: pack.emoji, description: pack.description, category: pack.category, status: pack.status,
    distribution: pack.distribution, cardsPerOpen: pack.cardsPerOpen, cooldownHours: pack.cooldownHours,
    allowedTypeIds: pack.allowedTypeIds, allowedRarityIds: pack.allowedRarityIds, guaranteedRarityId: pack.guaranteedRarityId,
    gradient: pack.gradient, accent: pack.accent, scheduleMode: pack.scheduleMode ?? 'cooldown',
    scheduleTime: pack.scheduleTime ?? null, scheduleTimezone: pack.scheduleTimezone ?? 'America/Sao_Paulo',
    cumulative: pack.cumulative ?? false, maxAccumulated: pack.maxAccumulated ?? 3,
  } : { ...PACK_TEMPLATES[0] })
  const createMutation = useCreateCollectionPackMutation(cid)
  const updateMutation = useUpdateCollectionPackMutation(cid)
  const isPending = createMutation.isPending || updateMutation.isPending

  const set = <K extends keyof CollectionPackFormData>(field: K, value: CollectionPackFormData[K]) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const toggle = (field: 'allowedTypeIds' | 'allowedRarityIds', id: string) => {
    setForm((current) => {
      const values = current[field]
      return { ...current, [field]: values.includes(id) ? values.filter((item) => item !== id) : [...values, id] }
    })
  }

  const applyTemplate = (template: CollectionPackFormData) => {
    setForm((current) => ({
      ...template,
      id: isNew ? template.id : current.id,
      allowedTypeIds: current.allowedTypeIds,
      allowedRarityIds: current.allowedRarityIds,
      guaranteedRarityId: current.guaranteedRarityId,
    }))
  }

  const save = () => {
    const name = form.name.trim()
    if (!name) return
    const payload: CollectionPackFormData = { ...form, name }
    if (isNew) payload.id = uniqueConfigId(name, existingPacks.map((item) => item.id))
    else delete payload.id

    const options = {
      onSuccess: () => { toast.success(isNew ? 'Pacotinho criado!' : 'Pacotinho salvo!'); onClose() },
      onError: (error: Error) => toast.error(error.message || 'Erro ao salvar pacotinho.'),
    }

    if (isNew) createMutation.mutate(payload, options)
    else updateMutation.mutate({ id: pack.id, data: payload }, options)
  }

  return (
    <>
      <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 700, color: colors.text.primary, pb: 1 }}>
        {isNew ? 'Novo pacotinho' : `Editar ${form.emoji} ${form.name}`}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: colors.text.secondary, mb: 0.8 }}>Templates</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.8 }}>
              {PACK_TEMPLATES.map((template) => (
                <Box key={template.id} onClick={() => applyTemplate(template)} sx={{
                  p: 1, borderRadius: radius.lg, cursor: 'pointer', background: template.gradient,
                  border: `1.5px solid ${form.name === template.name ? template.accent : 'rgba(255,255,255,0.65)'}`,
                  boxShadow: form.name === template.name ? `0 0 22px ${template.accent}44` : `0 4px 16px ${template.accent}18`,
                  transition: 'transform 0.16s ease, box-shadow 0.16s ease',
                  '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 0 24px ${template.accent}44` },
                }}>
                  <Stack direction="row" alignItems="center" spacing={0.8}>
                    <Typography sx={{ fontSize: '1.1rem' }}>{template.emoji}</Typography>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, color: colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {template.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.70rem', fontWeight: 800, color: template.accent }}>
                        {PACK_CATEGORY_LABELS[template.category]}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Input label="Nome" value={form.name} onChange={(e) => set('name', e.target.value)} sx={{ flex: 1 }} />
            <EmojiPickerInput label="Emoji" value={form.emoji} onChange={(emoji) => set('emoji', emoji)} />
          </Stack>
          <TextField multiline rows={2} fullWidth placeholder="Descrição do pacotinho..." value={form.description}
            onChange={(e) => set('description', e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: radius.md, fontSize: '0.86rem', background: colors.surface.overlay, '& fieldset': { borderColor: colors.border.medium } } }} />

          <Stack direction="row" spacing={1.5}>
            <Input label="Cartas" type="number" value={form.cardsPerOpen} onChange={(e) => set('cardsPerOpen', Number(e.target.value))} sx={{ flex: 1 }} />
          </Stack>

          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: colors.text.secondary, mb: 0.8 }}>Disponibilidade</Typography>
            <Stack spacing={1.2}>
              <Box sx={{ display: 'flex', gap: 0.7 }}>
                {([['cooldown', '⏱ Cooldown'], ['fixed_time', '🕐 Hora fixa']] as const).map(([mode, label]) => (
                  <Box key={mode} onClick={() => set('scheduleMode', mode)} sx={{
                    flex: 1, px: 1, py: 0.85, borderRadius: radius.lg, cursor: 'pointer', textAlign: 'center',
                    fontSize: '0.75rem', fontWeight: 800,
                    background: form.scheduleMode === mode ? colors.primary.main : 'rgba(0,0,0,0.04)',
                    color: form.scheduleMode === mode ? '#fff' : colors.text.secondary,
                    border: `1.5px solid ${form.scheduleMode === mode ? colors.primary.main : colors.border.subtle}`,
                    transition: 'all 0.14s',
                  }}>{label}</Box>
                ))}
              </Box>
              {form.scheduleMode === 'cooldown' && (
                <Input label="Cooldown (horas)" type="number" value={form.cooldownHours ?? ''} onChange={(e) => set('cooldownHours', e.target.value === '' ? null : Number(e.target.value))} inputProps={{ min: 1, max: 8760 }} />
              )}
              {form.scheduleMode === 'fixed_time' && (
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1.5}>
                    <Input label="Horário (BRT)" type="time" value={form.scheduleTime ?? '06:00'} onChange={(e) => set('scheduleTime', e.target.value || null)} sx={{ flex: 1 }} inputProps={{ step: 60 }} />
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 0.5, py: 0.5, cursor: 'pointer' }} onClick={() => set('cumulative', !form.cumulative)}>
                    <Box sx={{
                      width: 18, height: 18, borderRadius: 4, border: `2px solid ${form.cumulative ? colors.primary.main : colors.border.medium}`,
                      background: form.cumulative ? colors.primary.main : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.14s',
                    }}>
                      {form.cumulative && <Box component="span" sx={{ color: '#fff', fontSize: '0.65rem', lineHeight: 1, fontWeight: 900 }}>✓</Box>}
                    </Box>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: colors.text.primary, userSelect: 'none' }}>
                      Acumular slots não abertos
                    </Typography>
                  </Stack>
                  {form.cumulative && (
                    <Input label="Máximo acumulado" type="number" value={form.maxAccumulated} onChange={(e) => set('maxAccumulated', Math.max(1, Number(e.target.value) || 1))} inputProps={{ min: 1, max: 30 }} sx={{ width: 160 }} />
                  )}
                </Stack>
              )}
            </Stack>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: colors.text.secondary, mb: 0.8 }}>Categoria</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
              {PACK_CATEGORY_OPTIONS.map((option) => (
                <Chip key={option.id} label={option.label} size="small" onClick={() => set('category', option.id)}
                  sx={{ cursor: 'pointer', fontWeight: 800, background: form.category === option.id ? colors.primary.main : 'rgba(0,0,0,0.05)', color: form.category === option.id ? '#fff' : colors.text.secondary }} />
              ))}
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: colors.text.secondary, mb: 0.8 }}>Status</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
              {PACK_STATUS_OPTIONS.map((option) => (
                <Chip key={option.id} label={option.label} size="small" onClick={() => set('status', option.id)}
                  sx={{ cursor: 'pointer', fontWeight: 800, background: form.status === option.id ? colors.primary.main : 'rgba(0,0,0,0.05)', color: form.status === option.id ? '#fff' : colors.text.secondary }} />
              ))}
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: colors.text.secondary, mb: 0.8 }}>Distribuição</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
              {PACK_DISTRIBUTION_OPTIONS.map((option) => (
                <Chip key={option.id} label={option.label} size="small" onClick={() => set('distribution', option.id)}
                  sx={{ cursor: 'pointer', fontWeight: 800, background: form.distribution === option.id ? colors.primary.main : 'rgba(0,0,0,0.05)', color: form.distribution === option.id ? '#fff' : colors.text.secondary }} />
              ))}
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: colors.text.secondary, mb: 0.8 }}>Tipos permitidos</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
              <Chip label="Todos" size="small" onClick={() => set('allowedTypeIds', [])}
                sx={{ cursor: 'pointer', fontWeight: 800, background: form.allowedTypeIds.length === 0 ? colors.primary.main : 'rgba(0,0,0,0.05)', color: form.allowedTypeIds.length === 0 ? '#fff' : colors.text.secondary }} />
              {types.map((type) => (
                <Chip key={type.id} label={`${type.emoji} ${type.label}`} size="small" onClick={() => toggle('allowedTypeIds', type.id)}
                  sx={{ cursor: 'pointer', fontWeight: 800, background: form.allowedTypeIds.includes(type.id) ? type.tagBg : 'rgba(0,0,0,0.05)', color: form.allowedTypeIds.includes(type.id) ? type.tagColor : colors.text.secondary, border: `1px solid ${form.allowedTypeIds.includes(type.id) ? `${type.accentColor}55` : 'transparent'}` }} />
              ))}
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: colors.text.secondary, mb: 0.8 }}>Raridades permitidas</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
              <Chip label="Todas" size="small" onClick={() => set('allowedRarityIds', [])}
                sx={{ cursor: 'pointer', fontWeight: 800, background: form.allowedRarityIds.length === 0 ? colors.primary.main : 'rgba(0,0,0,0.05)', color: form.allowedRarityIds.length === 0 ? '#fff' : colors.text.secondary }} />
              {rarities.map((rarity) => (
                <Chip key={rarity.id} label={`${rarity.emoji} ${rarity.label}`} size="small" onClick={() => toggle('allowedRarityIds', rarity.id)}
                  sx={{ cursor: 'pointer', fontWeight: 800, background: form.allowedRarityIds.includes(rarity.id) ? rarity.chipBg : 'rgba(0,0,0,0.05)', border: `1px solid ${form.allowedRarityIds.includes(rarity.id) ? rarity.borderColor : 'transparent'}`, '& .MuiChip-label': form.allowedRarityIds.includes(rarity.id) ? gradientTextSx(rarity.chipColor) : { color: colors.text.secondary } }} />
              ))}
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: colors.text.secondary, mb: 0.8 }}>Raridade garantida</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
              <Chip label="Nenhuma" size="small" onClick={() => set('guaranteedRarityId', null)}
                sx={{ cursor: 'pointer', fontWeight: 800, background: form.guaranteedRarityId === null ? colors.primary.main : 'rgba(0,0,0,0.05)', color: form.guaranteedRarityId === null ? '#fff' : colors.text.secondary }} />
              {rarities.map((rarity) => (
                <Chip key={rarity.id} label={`${rarity.emoji} ${rarity.label}`} size="small" onClick={() => set('guaranteedRarityId', rarity.id)}
                  sx={{ cursor: 'pointer', fontWeight: 800, background: form.guaranteedRarityId === rarity.id ? rarity.chipBg : 'rgba(0,0,0,0.05)', border: `1px solid ${form.guaranteedRarityId === rarity.id ? rarity.borderColor : 'transparent'}`, '& .MuiChip-label': form.guaranteedRarityId === rarity.id ? gradientTextSx(rarity.chipColor) : { color: colors.text.secondary } }} />
              ))}
            </Box>
          </Box>

          <ColorRow label="Gradiente" field="gradient" value={form.gradient} onChange={(field, value) => set(field as 'gradient', value)} />
          <ColorRow label="Cor destaque" field="accent" value={form.accent} onChange={(field, value) => set(field as 'accent', value)} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1, py: 0.8 }}>Cancelar</Button>
        <Button variant="primary" onClick={save} loading={isPending} disabled={!form.name.trim()} sx={{ flex: 1, py: 0.8 }}>
          {isNew ? 'Criar' : 'Salvar'}
        </Button>
      </DialogActions>
    </>
  )
}
