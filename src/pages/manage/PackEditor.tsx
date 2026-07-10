import CasinoOutlinedIcon from '@mui/icons-material/CasinoOutlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Box, Chip, Collapse, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Button, EmojiPickerInput, Input } from '../../components/ui'
import { useCollectionNotesQuery, useCreateCollectionPackMutation, useCollectionPacksQuery, useUpdateCollectionPackMutation } from '../../hooks/useNotes'
import { colors, font, radius } from '../../design-system'
import { gradientTextSx } from '../../utils/colorUtils'
import { uniqueConfigId } from '../../utils/slug'
import { toast } from '../../components/ui'
import { ColorRow } from './shared'
import {
  PACK_TEMPLATES, PACK_CATEGORY_LABELS, PACK_CATEGORY_OPTIONS, PACK_CATEGORY_HINTS,
  PACK_STATUS_OPTIONS, PACK_STATUS_HINTS, PACK_STATUS_LABELS,
  PACK_DISTRIBUTION_OPTIONS, PACK_DISTRIBUTION_HINTS,
  PACK_RHYTHMS, PACK_RHYTHM_CUSTOM_HINT, detectRhythm, rhythmPatch,
  formatPackSchedule, simulatePackOpening,
} from './packData'
import { PackSimulationDialog } from './PackSimulationDialog'
import type { PackSimulation } from './packData'
import type { CollectionPack, CollectionPackFormData, RarityConfig, NoteTypeConfig } from '../../types/note'

function SectionLabel({ children }: { children: ReactNode }) {
  return <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: colors.text.secondary, mb: 0.8 }}>{children}</Typography>
}

function HintText({ children }: { children: ReactNode }) {
  return <Typography sx={{ fontSize: '0.68rem', color: colors.text.muted, mt: 0.7, lineHeight: 1.45 }}>{children}</Typography>
}

function CheckSquare({ checked }: { checked: boolean }) {
  return (
    <Box sx={{
      width: 18, height: 18, borderRadius: 4, flexShrink: 0, mt: 0.2,
      border: `2px solid ${checked ? colors.primary.main : colors.border.medium}`,
      background: checked ? colors.primary.main : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.14s',
    }}>
      {checked && <Box component="span" sx={{ color: '#fff', fontSize: '0.65rem', lineHeight: 1, fontWeight: 900 }}>✓</Box>}
    </Box>
  )
}

export function PackEditor({ cid, pack, rarities, types, onClose }: {
  cid: string; pack: CollectionPack | null; rarities: RarityConfig[]; types: NoteTypeConfig[]; onClose: () => void
}) {
  const isNew = !pack
  const { data: existingPacks = [] } = useCollectionPacksQuery(cid)
  const { data: notes = [] } = useCollectionNotesQuery(cid)
  const [form, setForm] = useState<CollectionPackFormData>(pack ? {
    name: pack.name, emoji: pack.emoji, description: pack.description, category: pack.category, status: pack.status,
    distribution: pack.distribution, cardsPerOpen: pack.cardsPerOpen, cooldownHours: pack.cooldownHours,
    allowedTypeIds: pack.allowedTypeIds, allowedRarityIds: pack.allowedRarityIds, guaranteedRarityId: pack.guaranteedRarityId,
    gradient: pack.gradient, accent: pack.accent, scheduleMode: pack.scheduleMode ?? 'cooldown',
    scheduleTime: pack.scheduleTime ?? null, scheduleTimezone: pack.scheduleTimezone ?? 'America/Sao_Paulo',
    cumulative: pack.cumulative ?? false, maxAccumulated: pack.maxAccumulated ?? 3,
  } : { ...PACK_TEMPLATES[0] })
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [simulation, setSimulation] = useState<PackSimulation | null>(null)
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

  const rhythm = detectRhythm(form)
  const rhythmHint = rhythm === 'custom' ? PACK_RHYTHM_CUSTOM_HINT : PACK_RHYTHMS.find((r) => r.id === rhythm)?.hint

  function runSimulation() {
    const previewPack: CollectionPack = {
      ...form,
      id: pack?.id ?? 'preview',
      collectionId: cid,
      name: form.name.trim() || 'Meu pacotinho',
    }
    const result = simulatePackOpening(previewPack, notes, rarities)
    if (!result) {
      toast.info('Nenhum bilhete compatível com essas regras ainda. Crie bilhetes na aba Bilhetes primeiro.')
      return
    }
    setSimulation(result)
  }

  const save = () => {
    const name = form.name.trim()
    if (!name) return
    const payload: CollectionPackFormData = { ...form, name }
    if (isNew) payload.id = uniqueConfigId(name, existingPacks.map((item) => item.id))
    else delete payload.id

    const onError = (error: Error) => toast.error(error.message || 'Erro ao salvar pacotinho.')

    if (isNew) {
      createMutation.mutate(payload, {
        onSuccess: () => { toast.success('Pacotinho criado!'); onClose() },
        onError,
      })
    } else {
      updateMutation.mutate({ id: pack.id, data: payload }, {
        onSuccess: (updated) => {
          const warning = updated.pendingOpensWarning
          if (warning && warning.readersAffected > 0) {
            toast.info(
              `${warning.readersAffected} leitor${warning.readersAffected === 1 ? '' : 'es'} ainda ${warning.readersAffected === 1 ? 'tem' : 'têm'} ${warning.totalOpens} abertura${warning.totalOpens === 1 ? '' : 's'} pendente${warning.totalOpens === 1 ? '' : 's'} deste pacotinho`,
              { description: 'As regras novas só valem a partir da próxima abertura.' },
            )
          } else {
            toast.success('Pacotinho salvo!')
          }
          onClose()
        },
        onError,
      })
    }
  }

  const statusChipStyle = form.status === 'active'
    ? { background: '#dcfce7', color: '#15803d' }
    : form.status === 'draft'
      ? { background: 'rgba(255,255,255,0.72)', color: colors.text.secondary }
      : { background: 'rgba(0,0,0,0.08)', color: colors.text.secondary }

  return (
    <>
      <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 700, color: colors.text.primary, pb: 1 }}>
        {isNew ? 'Novo pacotinho' : `Editar ${form.emoji} ${form.name}`}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.2} sx={{ pt: 1 }}>
          {isNew && (
            <Box>
              <SectionLabel>Comece com um modelo</SectionLabel>
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
          )}

          <Box sx={{ borderRadius: radius.xl, overflow: 'hidden', border: `1.5px solid ${form.accent}2e`, boxShadow: `0 8px 22px ${form.accent}16` }}>
            <Box sx={{ p: 1.5, background: form.gradient, position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 15% 0%, rgba(255,255,255,0.58), transparent 38%), radial-gradient(circle at 100% 100%, ${form.accent}44, transparent 40%)`, pointerEvents: 'none' }} />
              <Stack direction="row" alignItems="center" spacing={1.1} sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: radius.lg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.62)', border: '1px solid rgba(255,255,255,0.78)', boxShadow: `0 6px 18px ${form.accent}24`, fontSize: '1.45rem' }}>
                  {form.emoji}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={0.7} alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography sx={{ flex: 1, minWidth: 0, fontFamily: font.serif, fontWeight: 800, fontSize: '1rem', color: colors.text.primary, lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {form.name.trim() || 'Meu pacotinho'}
                    </Typography>
                    <Chip label={PACK_STATUS_LABELS[form.status]} size="small"
                      sx={{ height: 19, fontSize: '0.66rem', fontWeight: 900, flexShrink: 0, ...statusChipStyle, '& .MuiChip-label': { px: 0.75 } }} />
                  </Stack>
                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', rowGap: 0.4 }}>
                    {[`🃏 ${form.cardsPerOpen} carta${form.cardsPerOpen === 1 ? '' : 's'}`, formatPackSchedule(form)].map((text) => (
                      <Box key={text} sx={{ px: 0.8, py: 0.25, borderRadius: radius.full, background: 'rgba(255,255,255,0.62)', border: '1px solid rgba(255,255,255,0.78)' }}>
                        <Typography sx={{ fontSize: '0.64rem', fontWeight: 800, color: form.accent }}>{text}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, py: 0.7, background: '#fff', borderTop: `1px solid ${colors.border.subtle}` }}>
              <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                Prévia ao vivo
              </Typography>
              <Button variant="ghost" onClick={runSimulation} sx={{ py: 0.45, px: 1.1, fontSize: '0.73rem' }}>
                <CasinoOutlinedIcon sx={{ fontSize: 14, mr: 0.4 }} /> Simular abertura
              </Button>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Input label="Nome" value={form.name} onChange={(e) => set('name', e.target.value)} sx={{ flex: 1 }} />
            <EmojiPickerInput label="Emoji" value={form.emoji} onChange={(emoji) => set('emoji', emoji)} />
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Input label="Cartas por abertura" type="number" value={form.cardsPerOpen}
              onChange={(e) => set('cardsPerOpen', Math.max(1, Number(e.target.value) || 1))}
              inputProps={{ min: 1, max: 20 }} sx={{ width: 170, flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.7rem', color: colors.text.muted, lineHeight: 1.45, flex: 1 }}>
              Quantos bilhetes saem cada vez que a pessoa abre.
            </Typography>
          </Stack>

          <Box>
            <SectionLabel>Com que frequência ela recebe?</SectionLabel>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.7 }}>
              {PACK_RHYTHMS.map((item) => {
                const active = rhythm === item.id
                return (
                  <Box key={item.id} onClick={() => setForm((current) => ({ ...current, ...rhythmPatch(item.id, current) }))} sx={{
                    px: 0.5, py: 0.8, borderRadius: radius.lg, cursor: 'pointer', textAlign: 'center',
                    background: active ? colors.primary.main : 'rgba(0,0,0,0.04)',
                    border: `1.5px solid ${active ? colors.primary.main : colors.border.subtle}`,
                    transition: 'all 0.14s',
                  }}>
                    <Typography sx={{ fontSize: '0.95rem', lineHeight: 1 }}>{item.emoji}</Typography>
                    <Typography sx={{ mt: 0.4, fontSize: '0.62rem', fontWeight: 800, lineHeight: 1.2, color: active ? '#fff' : colors.text.secondary }}>
                      {item.label}
                    </Typography>
                  </Box>
                )
              })}
            </Box>
            <HintText>{rhythmHint}</HintText>

            {form.scheduleMode === 'fixed_time' && (
              <Stack spacing={1} sx={{ mt: 1.2 }}>
                <Input label="Horário (BRT)" type="time" value={form.scheduleTime ?? '06:00'} onChange={(e) => set('scheduleTime', e.target.value || null)} sx={{ width: 170 }} inputProps={{ step: 60 }} />
                <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 0.5, py: 0.3, cursor: 'pointer' }} onClick={() => set('cumulative', !form.cumulative)}>
                  <CheckSquare checked={form.cumulative} />
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: colors.text.primary, userSelect: 'none' }}>
                    Acumular slots não abertos
                  </Typography>
                </Stack>
                {form.cumulative && (
                  <Input label="Máximo acumulado" type="number" value={form.maxAccumulated} onChange={(e) => set('maxAccumulated', Math.max(1, Number(e.target.value) || 1))} inputProps={{ min: 1, max: 30 }} sx={{ width: 170 }} />
                )}
              </Stack>
            )}
          </Box>

          <Stack direction="row" spacing={1} alignItems="flex-start" onClick={() => set('status', form.status === 'active' ? 'draft' : 'active')} sx={{ cursor: 'pointer', px: 0.5 }}>
            <CheckSquare checked={form.status === 'active'} />
            <Box>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: colors.text.primary, userSelect: 'none', lineHeight: 1.3 }}>
                Visível para os leitores
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: colors.text.muted, mt: 0.15 }}>
                {PACK_STATUS_HINTS[form.status]}
              </Typography>
            </Box>
          </Stack>

          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" onClick={() => setAdvancedOpen((v) => !v)} sx={{
              cursor: 'pointer', py: 0.7, px: 1.1, borderRadius: radius.md,
              background: 'rgba(0,0,0,0.03)', border: `1px solid ${colors.border.subtle}`,
              transition: 'background 0.14s', '&:hover': { background: 'rgba(0,0,0,0.05)' },
            }}>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: colors.text.secondary }}>
                ⚙️ Opções avançadas
              </Typography>
              <ExpandMoreIcon sx={{ fontSize: 18, color: colors.text.muted, transform: advancedOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </Stack>

            <Collapse in={advancedOpen}>
              <Stack spacing={2.2} sx={{ pt: 2 }}>
                <Box>
                  <SectionLabel>Descrição</SectionLabel>
                  <TextField multiline rows={2} fullWidth placeholder="Descrição do pacotinho..." value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: radius.md, fontSize: '0.86rem', background: colors.surface.overlay, '& fieldset': { borderColor: colors.border.medium } } }} />
                </Box>

                {form.scheduleMode === 'cooldown' && (
                  <Box>
                    <SectionLabel>Cooldown exato (horas)</SectionLabel>
                    <Input type="number" value={form.cooldownHours ?? ''} onChange={(e) => set('cooldownHours', e.target.value === '' ? null : Number(e.target.value))} inputProps={{ min: 1, max: 8760 }} sx={{ width: 170 }} />
                    <HintText>Vazio = sem recarga automática (uma vez só). 24 = diário, 168 = semanal.</HintText>
                  </Box>
                )}

                <Box>
                  <SectionLabel>Categoria</SectionLabel>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                    {PACK_CATEGORY_OPTIONS.map((option) => (
                      <Chip key={option.id} label={option.label} size="small" onClick={() => set('category', option.id)}
                        sx={{ cursor: 'pointer', fontWeight: 800, background: form.category === option.id ? colors.primary.main : 'rgba(0,0,0,0.05)', color: form.category === option.id ? '#fff' : colors.text.secondary }} />
                    ))}
                  </Box>
                  <HintText>{PACK_CATEGORY_HINTS[form.category]}</HintText>
                </Box>

                <Box>
                  <SectionLabel>Status</SectionLabel>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                    {PACK_STATUS_OPTIONS.map((option) => (
                      <Chip key={option.id} label={option.label} size="small" onClick={() => set('status', option.id)}
                        sx={{ cursor: 'pointer', fontWeight: 800, background: form.status === option.id ? colors.primary.main : 'rgba(0,0,0,0.05)', color: form.status === option.id ? '#fff' : colors.text.secondary }} />
                    ))}
                  </Box>
                  <HintText>{PACK_STATUS_HINTS[form.status]}</HintText>
                </Box>

                <Box>
                  <SectionLabel>Distribuição</SectionLabel>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                    {PACK_DISTRIBUTION_OPTIONS.map((option) => (
                      <Chip key={option.id} label={option.label} size="small" onClick={() => set('distribution', option.id)}
                        sx={{ cursor: 'pointer', fontWeight: 800, background: form.distribution === option.id ? colors.primary.main : 'rgba(0,0,0,0.05)', color: form.distribution === option.id ? '#fff' : colors.text.secondary }} />
                    ))}
                  </Box>
                  <HintText>{PACK_DISTRIBUTION_HINTS[form.distribution]}</HintText>
                </Box>

                <Box>
                  <SectionLabel>Tipos permitidos</SectionLabel>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                    <Chip label="Todos" size="small" onClick={() => set('allowedTypeIds', [])}
                      sx={{ cursor: 'pointer', fontWeight: 800, background: form.allowedTypeIds.length === 0 ? colors.primary.main : 'rgba(0,0,0,0.05)', color: form.allowedTypeIds.length === 0 ? '#fff' : colors.text.secondary }} />
                    {types.map((type) => (
                      <Chip key={type.id} label={`${type.emoji} ${type.label}`} size="small" onClick={() => toggle('allowedTypeIds', type.id)}
                        sx={{ cursor: 'pointer', fontWeight: 800, background: form.allowedTypeIds.includes(type.id) ? type.tagBg : 'rgba(0,0,0,0.05)', color: form.allowedTypeIds.includes(type.id) ? type.tagColor : colors.text.secondary, border: `1px solid ${form.allowedTypeIds.includes(type.id) ? `${type.accentColor}55` : 'transparent'}` }} />
                    ))}
                  </Box>
                  <HintText>Só bilhetes desses tipos podem sair deste pacotinho.</HintText>
                </Box>

                <Box>
                  <SectionLabel>Raridades permitidas</SectionLabel>
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
                  <SectionLabel>Raridade garantida</SectionLabel>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                    <Chip label="Nenhuma" size="small" onClick={() => set('guaranteedRarityId', null)}
                      sx={{ cursor: 'pointer', fontWeight: 800, background: form.guaranteedRarityId === null ? colors.primary.main : 'rgba(0,0,0,0.05)', color: form.guaranteedRarityId === null ? '#fff' : colors.text.secondary }} />
                    {rarities.map((rarity) => (
                      <Chip key={rarity.id} label={`${rarity.emoji} ${rarity.label}`} size="small" onClick={() => set('guaranteedRarityId', rarity.id)}
                        sx={{ cursor: 'pointer', fontWeight: 800, background: form.guaranteedRarityId === rarity.id ? rarity.chipBg : 'rgba(0,0,0,0.05)', border: `1px solid ${form.guaranteedRarityId === rarity.id ? rarity.borderColor : 'transparent'}`, '& .MuiChip-label': form.guaranteedRarityId === rarity.id ? gradientTextSx(rarity.chipColor) : { color: colors.text.secondary } }} />
                    ))}
                  </Box>
                  <HintText>Pelo menos uma carta dessa raridade sai em toda abertura.</HintText>
                </Box>

                <ColorRow label="Gradiente" field="gradient" value={form.gradient} onChange={(field, value) => set(field as 'gradient', value)} />
                <ColorRow label="Cor destaque" field="accent" value={form.accent} onChange={(field, value) => set(field as 'accent', value)} />
              </Stack>
            </Collapse>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1, py: 0.8 }}>Cancelar</Button>
        <Button variant="primary" onClick={save} loading={isPending} disabled={!form.name.trim()} sx={{ flex: 1, py: 0.8 }}>
          {isNew ? 'Criar' : 'Salvar'}
        </Button>
      </DialogActions>

      <PackSimulationDialog
        simulation={simulation}
        rarities={rarities}
        types={types}
        onClose={() => setSimulation(null)}
        onSimulateAgain={runSimulation}
      />
    </>
  )
}
