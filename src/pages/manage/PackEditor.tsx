import CasinoOutlinedIcon from '@mui/icons-material/CasinoOutlined'
import { Box, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { AdvancedOptions, Button, ChoiceChip, EmojiPickerInput, HintText, Input, OptionTile, SectionLabel } from '../../components/ui'
import { useCollectionNotesQuery, useCreateCollectionPackMutation, useCollectionPacksQuery, useUpdateCollectionPackMutation } from '../../hooks/useNotes'
import { colors, font, ink, radius, liftOnDark } from '../../design-system'
import { isHexColor, uniqueConfigId } from '../../utils/slug'
import { toast } from '../../components/ui'
import { ColorPickTile } from './shared'
import { ImagePicker } from '../../components/ImagePicker'
import { PATTERN_OPTIONS, resolvePackLook } from '../../components/pack-opening/packLook'
import { PackPouchPreview } from './PackPouchPreview'
import {
  PACK_TEMPLATES, PACK_COLOR_PRESETS, gradientBase, pouchGradient, PACK_CATEGORY_LABELS, PACK_CATEGORY_OPTIONS, PACK_CATEGORY_HINTS,
  PACK_STATUS_OPTIONS, PACK_STATUS_HINTS,
  PACK_DISTRIBUTION_OPTIONS, PACK_DISTRIBUTION_HINTS,
  PACK_RHYTHMS, PACK_RHYTHM_CUSTOM_HINT, detectRhythm, rhythmPatch,
  simulatePackOpening,
} from './packData'
import { PackSimulationDialog } from './PackSimulationDialog'
import type { PackSimulation } from './packData'
import { rarityTone } from '../../components/collection/rarityTone'
import type { CollectionPack, CollectionPackFormData, RarityConfig, NoteTypeConfig } from '../../types/note'

function CheckRow({ checked, label, hint, onClick }: { checked: boolean; label: string; hint?: string; onClick: () => void }) {
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start" onClick={onClick} sx={{ cursor: 'pointer', px: 0.5, py: 0.2 }}>
      <CheckSquare checked={checked} />
      <Box>
        <Typography variant="md" sx={{ fontWeight: 700, color: colors.text.primary, userSelect: 'none', lineHeight: 1.3 }}>{label}</Typography>
        {hint && <Typography variant="xs" sx={{ color: colors.text.muted, mt: 0.15 }}>{hint}</Typography>}
      </Box>
    </Stack>
  )
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
    name: pack.name, emoji: pack.emoji, imageUrl: pack.imageUrl ?? null, description: pack.description, category: pack.category, status: pack.status,
    distribution: pack.distribution, cardsPerOpen: pack.cardsPerOpen, cooldownHours: pack.cooldownHours,
    allowedTypeIds: pack.allowedTypeIds, allowedRarityIds: pack.allowedRarityIds, guaranteedRarityId: pack.guaranteedRarityId,
    gradient: pack.gradient, accent: pack.accent, scheduleMode: pack.scheduleMode ?? 'cooldown',
    scheduleTime: pack.scheduleTime ?? null, scheduleTimezone: pack.scheduleTimezone ?? 'America/Sao_Paulo',
    cumulative: pack.cumulative ?? false, maxAccumulated: pack.maxAccumulated ?? 3,
    pattern: pack.pattern ?? 'dots', shine: pack.shine ?? true, showName: pack.showName ?? true,
  } : { ...PACK_TEMPLATES[0] })
  const [simulation, setSimulation] = useState<PackSimulation | null>(null)
  const [wantsImageIcon, setWantsImageIcon] = useState(false)
  const [wantsCustomColor, setWantsCustomColor] = useState(false)
  const iconIsImage = Boolean(form.imageUrl) || wantsImageIcon
  const look = resolvePackLook(form)
  const activePreset = PACK_COLOR_PRESETS.find((preset) => preset.gradient === form.gradient && preset.accent === form.accent)
  const colorIsCustom = wantsCustomColor || !activePreset
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

  return (
    <>
      <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 700, color: colors.text.primary, pb: 1 }}>
        {isNew ? 'Novo pacotinho' : `Editar ${form.emoji} ${form.name}`}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.2} sx={{ pt: 1 }}>
          {isNew && (
            <Box>
              <SectionLabel sx={{ mb: 0.8 }}>Comece com um modelo</SectionLabel>
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
                        <Typography variant="sm" sx={{ fontWeight: 900, color: ink.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {template.name}
                        </Typography>
                        <Typography variant="xs" sx={{ fontWeight: 800, color: template.accent }}>
                          {PACK_CATEGORY_LABELS[template.category]}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          <Box sx={{ borderRadius: radius.xl, overflow: 'hidden', border: `1px solid ${colors.border.subtle}`, background: colors.fill.subtle }}>
            <PackPouchPreview form={form} />
            <Stack direction="row" alignItems="center" justifyContent={{ xs: 'center', sm: 'space-between' }} spacing={1} sx={{ px: 1.5, py: 0.7, background: colors.surface.paper, borderTop: `1px solid ${colors.border.subtle}` }}>
              <Typography variant="xxs" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 800, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                Prévia da abertura
              </Typography>
              <Button variant="ghost" onClick={runSimulation} sx={{ py: 0.45, px: 1.1, fontSize: '0.73rem', whiteSpace: 'nowrap' }}>
                <CasinoOutlinedIcon sx={{ fontSize: 14, mr: 0.4 }} /> Simular abertura
              </Button>
            </Stack>
          </Box>

          <Input label="Nome" value={form.name} onChange={(e) => set('name', e.target.value)} fullWidth />

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Input label="Cartas por abertura" type="number" value={form.cardsPerOpen}
              onChange={(e) => set('cardsPerOpen', Math.max(1, Number(e.target.value) || 1))}
              inputProps={{ min: 1, max: 20 }} sx={{ width: 170, flexShrink: 0 }} />
            <Typography variant="xs" sx={{ color: colors.text.muted, lineHeight: 1.45, flex: 1 }}>
              Quantos bilhetes saem cada vez que a pessoa abre.
            </Typography>
          </Stack>

          <Box>
            <SectionLabel sx={{ mb: 0.8 }}>Com que frequência a pessoa recebe?</SectionLabel>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.7 }}>
              {PACK_RHYTHMS.map((item) => {
                const active = rhythm === item.id
                return (
                  <OptionTile
                    key={item.id}
                    variant="solid"
                    active={active}
                    icon={item.emoji}
                    title={item.label}
                    onClick={() => setForm((current) => ({ ...current, ...rhythmPatch(item.id, current) }))}
                    sx={{ px: 0.5, py: 0.8 }}
                  />
                )
              })}
            </Box>
            <HintText>{rhythmHint}</HintText>

            {form.scheduleMode === 'fixed_time' && (
              <Stack spacing={1} sx={{ mt: 1.2 }}>
                <Input label="Horário (BRT)" type="time" value={form.scheduleTime ?? '06:00'} onChange={(e) => set('scheduleTime', e.target.value || null)} sx={{ width: 170 }} inputProps={{ step: 60 }} />
                <CheckRow checked={form.cumulative} label="Acumular slots não abertos" onClick={() => set('cumulative', !form.cumulative)} />
                {form.cumulative && (
                  <Input label="Máximo acumulado" type="number" value={form.maxAccumulated} onChange={(e) => set('maxAccumulated', Math.max(1, Number(e.target.value) || 1))} inputProps={{ min: 1, max: 30 }} sx={{ width: 170 }} />
                )}
              </Stack>
            )}
          </Box>

          <CheckRow checked={form.status === 'active'} label="Visível para os leitores" hint={PACK_STATUS_HINTS[form.status]} onClick={() => set('status', form.status === 'active' ? 'draft' : 'active')} />

          <AdvancedOptions>
          <Box>
            <SectionLabel sx={{ mb: 0.8 }}>Ícone do pacotinho</SectionLabel>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1, mb: 1.2 }}>
              <OptionTile active={!iconIsImage} title={`${form.emoji} Emoji`} label="Emoji" onClick={() => { setWantsImageIcon(false); set('imageUrl', null) }} />
              <OptionTile active={iconIsImage} title="🖼️ GIF ou imagem" label="GIF ou imagem" onClick={() => setWantsImageIcon(true)} />
            </Box>
            {iconIsImage
              ? <ImagePicker value={form.imageUrl ?? null} onChange={(url) => set('imageUrl', url)} mediaType="stickers" label="GIF ou imagem" />
              : <EmojiPickerInput label="Emoji" value={form.emoji} onChange={(emoji) => set('emoji', emoji)} />}
          </Box>

          <Box>
            <SectionLabel hint="fundo e detalhes do pacotinho" sx={{ mb: 0.8 }}>Cor do pacotinho</SectionLabel>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 0.7 }}>
              <OptionTile active={colorIsCustom} onClick={() => setWantsCustomColor(true)} label="Cor personalizada" icon="🎛️" title="Personalizado" layout="row" />
              {PACK_COLOR_PRESETS.map((preset) => (
                <OptionTile
                  key={preset.label}
                  active={!colorIsCustom && activePreset === preset}
                  onClick={() => { setWantsCustomColor(false); setForm((current) => ({ ...current, gradient: preset.gradient, accent: preset.accent })) }}
                  label={`Cor ${preset.label}`}
                  title={preset.label}
                  layout="row"
                  icon={<Box sx={{ width: 22, height: 22, flexShrink: 0, borderRadius: '50%', background: `radial-gradient(circle at 68% 68%, ${preset.accent} 0 4px, transparent 4.5px), ${preset.gradient}`, boxShadow: `0 0 0 2px ${colors.surface.base}, 0 2px 8px rgba(15,23,42,0.18)` }} />}
                />
              ))}
            </Box>
            {colorIsCustom && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 0.7, mt: 1.2 }}>
                <ColorPickTile title="Fundo" hint="a cor do pacotinho" fill={form.gradient} value={gradientBase(form.gradient, isHexColor(form.accent) ? form.accent : '#e11d48')} onPick={(color) => set('gradient', pouchGradient(color))} />
                <ColorPickTile title="Destaque" hint="brilho, sombra e linha de rasgar" fill={form.accent} value={isHexColor(form.accent) ? form.accent : '#e11d48'} onPick={(color) => set('accent', color)} />
              </Box>
            )}
          </Box>

            <Box>
              <SectionLabel sx={{ mb: 0.8 }}>Estampa</SectionLabel>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                {PATTERN_OPTIONS.map((option) => (
                  <ChoiceChip key={option.id} label={option.label} selected={look.pattern === option.id} onClick={() => set('pattern', option.id)} />
                ))}
              </Box>
            </Box>
            <Stack spacing={0.8}>
              <CheckRow checked={look.shine} label="Brilho metalizado" hint="Um reflexo passando pelo pacotinho." onClick={() => set('shine', !look.shine)} />
              <CheckRow checked={look.showName} label="Mostrar o nome no pacotinho" onClick={() => set('showName', !look.showName)} />
            </Stack>
                <Box>
                  <SectionLabel sx={{ mb: 0.8 }}>Descrição</SectionLabel>
                  <TextField multiline rows={2} fullWidth placeholder="Descrição do pacotinho..." value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: radius.md, fontSize: '0.86rem', background: colors.surface.overlay, '& fieldset': { borderColor: colors.border.medium } } }} />
                </Box>

                {form.scheduleMode === 'cooldown' && (
                  <Box>
                    <SectionLabel sx={{ mb: 0.8 }}>Cooldown exato (horas)</SectionLabel>
                    <Input type="number" value={form.cooldownHours ?? ''} onChange={(e) => set('cooldownHours', e.target.value === '' ? null : Number(e.target.value))} inputProps={{ min: 1, max: 8760 }} sx={{ width: 170 }} />
                    <HintText>Vazio = sem recarga automática (uma vez só). 24 = diário, 168 = semanal.</HintText>
                  </Box>
                )}

                <Box>
                  <SectionLabel sx={{ mb: 0.8 }}>Categoria</SectionLabel>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                    {PACK_CATEGORY_OPTIONS.map((option) => (
                      <ChoiceChip key={option.id} label={option.label} selected={form.category === option.id} onClick={() => set('category', option.id)} />
                    ))}
                  </Box>
                  <HintText>{PACK_CATEGORY_HINTS[form.category]}</HintText>
                </Box>

                <Box>
                  <SectionLabel sx={{ mb: 0.8 }}>Status</SectionLabel>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                    {PACK_STATUS_OPTIONS.map((option) => (
                      <ChoiceChip key={option.id} label={option.label} selected={form.status === option.id} onClick={() => set('status', option.id)} />
                    ))}
                  </Box>
                  <HintText>{PACK_STATUS_HINTS[form.status]}</HintText>
                </Box>

                <Box>
                  <SectionLabel sx={{ mb: 0.8 }}>Distribuição</SectionLabel>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                    {PACK_DISTRIBUTION_OPTIONS.map((option) => (
                      <ChoiceChip key={option.id} label={option.label} selected={form.distribution === option.id} onClick={() => set('distribution', option.id)} />
                    ))}
                  </Box>
                  <HintText>{PACK_DISTRIBUTION_HINTS[form.distribution]}</HintText>
                </Box>

                <Box>
                  <SectionLabel sx={{ mb: 0.8 }}>Tipos permitidos</SectionLabel>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                    <ChoiceChip label="Todos" selected={form.allowedTypeIds.length === 0} onClick={() => set('allowedTypeIds', [])} />
                    {types.map((type) => (
                      <ChoiceChip key={type.id} label={`${type.emoji} ${type.label}`} selected={form.allowedTypeIds.includes(type.id)} tone={{ bg: type.tagBg, text: liftOnDark(type.tagColor), border: `${type.accentColor}55` }} onClick={() => toggle('allowedTypeIds', type.id)} />
                    ))}
                  </Box>
                  <HintText>Só bilhetes desses tipos podem sair deste pacotinho.</HintText>
                </Box>

                <Box>
                  <SectionLabel sx={{ mb: 0.8 }}>Raridades permitidas</SectionLabel>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                    <ChoiceChip label="Todas" selected={form.allowedRarityIds.length === 0} onClick={() => set('allowedRarityIds', [])} />
                    {rarities.map((rarity) => (
                      <ChoiceChip key={rarity.id} label={`${rarity.emoji} ${rarity.label}`} selected={form.allowedRarityIds.includes(rarity.id)} tone={rarityTone(rarity)} onClick={() => toggle('allowedRarityIds', rarity.id)} />
                    ))}
                  </Box>
                </Box>

                <Box>
                  <SectionLabel sx={{ mb: 0.8 }}>Raridade garantida</SectionLabel>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                    <ChoiceChip label="Nenhuma" selected={form.guaranteedRarityId === null} onClick={() => set('guaranteedRarityId', null)} />
                    {rarities.map((rarity) => (
                      <ChoiceChip key={rarity.id} label={`${rarity.emoji} ${rarity.label}`} selected={form.guaranteedRarityId === rarity.id} tone={rarityTone(rarity)} onClick={() => set('guaranteedRarityId', rarity.id)} />
                    ))}
                  </Box>
                  <HintText>Pelo menos uma carta dessa raridade sai em toda abertura.</HintText>
                </Box>

          </AdvancedOptions>
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
