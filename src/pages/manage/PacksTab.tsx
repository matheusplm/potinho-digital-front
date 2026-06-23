import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import CasinoOutlinedIcon from '@mui/icons-material/CasinoOutlined'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda'
import ViewListIcon from '@mui/icons-material/ViewList'
import { Box, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useEffect, useState } from 'react'
import { Button, Card, ConfirmDeleteDialog, EmojiPickerInput, Input, LoadingState, SegmentedControl, toast } from '../../components/ui'
import {
  useCollectionNotesQuery, useCollectionPacksQuery, useCollectionRaritiesQuery, useCollectionTypesQuery,
  useCreateCollectionPackMutation, useDeleteCollectionPackMutation, useUpdateCollectionPackMutation,
} from '../../hooks/useNotes'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { colors, font, radius, shineSweep } from '../../design-system'
import { useBackground } from '../../context/BackgroundContext'
import { gradientTextSx } from '../../utils/colorUtils'
import { uniqueConfigId } from '../../utils/slug'
import type {
  CollectionPack, CollectionPackCategory, CollectionPackDistribution, CollectionPackFormData, CollectionPackStatus, NoteRecord, RarityConfig, NoteTypeConfig,
} from '../../types/note'
import { actionButtonSx, ColorRow } from './shared'

type PackFilter = 'all' | 'active' | 'draft' | 'daily' | 'bonus' | 'guaranteed' | 'thematic'
type PackView = 'cards' | 'list'
type PackSimulation = { pack: CollectionPack; rewards: NoteRecord[]; eligibleCount: number; guaranteedApplied: boolean }

const packOpening = keyframes`
  0%{transform:translate3d(0,0,0) rotate(-3deg) scale(0.98);}
  30%{transform:translate3d(0,-7px,0) rotate(4deg) scale(1.035);}
  58%{transform:translate3d(0,1px,0) rotate(-2deg) scale(1);}
  82%{transform:translate3d(0,-4px,0) rotate(2deg) scale(1.055);}
  100%{transform:translate3d(0,0,0) rotate(0deg) scale(1);}
`
const packOpeningCentered = keyframes`
  0%{transform:translate3d(-50%,0,0) rotate(-3deg) scale(0.98);}
  30%{transform:translate3d(-50%,-7px,0) rotate(4deg) scale(1.035);}
  58%{transform:translate3d(-50%,1px,0) rotate(-2deg) scale(1);}
  82%{transform:translate3d(-50%,-4px,0) rotate(2deg) scale(1.055);}
  100%{transform:translate3d(-50%,0,0) rotate(0deg) scale(1);}
`
const rewardReveal = keyframes`from{opacity:0;transform:translate3d(0,16px,0) scale(0.94) rotate(-1deg);}to{opacity:1;transform:translate3d(0,0,0) scale(1) rotate(0deg);}`
const sparkleFloat = keyframes`from{opacity:0;transform:translate3d(0,10px,0) scale(0.7);}45%{opacity:1;}to{opacity:0;transform:translate3d(0,-34px,0) scale(1.25);}`
const packFlap = keyframes`
  0%,38%{transform:translate3d(0,0,0) rotateX(0deg) scaleY(1);}
  64%{transform:translate3d(0,-8px,0) rotateX(46deg) scaleY(0.82);}
  100%{transform:translate3d(0,-11px,0) rotateX(62deg) scaleY(0.7);}
`
const cardEject = keyframes`
  0%,30%{opacity:0;transform:translate3d(-50%,34px,0) rotate(0deg) scale(0.78);}
  66%,100%{opacity:1;transform:translate3d(calc(-50% + var(--x)),calc(-1 * var(--y)),0) rotate(var(--r)) scale(1);}
`
const burstRing = keyframes`from{opacity:0.48;transform:translate3d(-50%,-50%,0) scale(0.54);}to{opacity:0;transform:translate3d(-50%,-50%,0) scale(1.55);}`
const openingSceneFade = keyframes`from{opacity:0;transform:translate3d(0,8px,0) scale(0.98);}to{opacity:1;transform:translate3d(0,0,0) scale(1);}`

const PACK_DEFAULT_SCHEDULE: Pick<CollectionPackFormData, 'scheduleMode' | 'scheduleTime' | 'scheduleTimezone' | 'cumulative' | 'maxAccumulated'> = {
  scheduleMode: 'cooldown', scheduleTime: null, scheduleTimezone: 'America/Sao_Paulo', cumulative: false, maxAccumulated: 3,
}

const PACK_TEMPLATES: CollectionPackFormData[] = [
  {
    id: 'daily', name: 'Pacotinho diário', emoji: '💌',
    description: 'O pacote padrão da coleção, liberado automaticamente por tempo.',
    cardsPerOpen: 1, cooldownHours: 24, distribution: 'all_with_access', status: 'active', category: 'daily',
    allowedTypeIds: [], allowedRarityIds: [], guaranteedRarityId: null,
    gradient: 'linear-gradient(135deg,#fff1f2,#ffe4e6,#fbcfe8)', accent: '#e11d48', ...PACK_DEFAULT_SCHEDULE,
  },
  {
    id: 'daily_fixed', name: 'Diário hora fixa', emoji: '⏰',
    description: 'Liberado todo dia no mesmo horário. Slots acumulam se não forem abertos.',
    cardsPerOpen: 1, cooldownHours: null, distribution: 'all_with_access', status: 'active', category: 'daily',
    allowedTypeIds: [], allowedRarityIds: [], guaranteedRarityId: null,
    gradient: 'linear-gradient(135deg,#fff1f2,#ffe4e6,#fbcfe8)', accent: '#e11d48',
    scheduleMode: 'fixed_time', scheduleTime: '06:00', scheduleTimezone: 'America/Sao_Paulo', cumulative: true, maxAccumulated: 3,
  },
  {
    id: 'sentimental', name: 'Pacote sentimental', emoji: '🥹',
    description: 'Exemplo de pacote temático filtrando apenas um tipo de bilhete.',
    cardsPerOpen: 4, cooldownHours: 168, distribution: 'manual_bonus', status: 'draft', category: 'thematic',
    allowedTypeIds: [], allowedRarityIds: [], guaranteedRarityId: null,
    gradient: 'linear-gradient(135deg,#eef2ff,#e0e7ff,#f5d0fe)', accent: '#6366f1', ...PACK_DEFAULT_SCHEDULE,
  },
  {
    id: 'legendary', name: 'Lendário garantido', emoji: '👑',
    description: 'Exemplo de pacote especial para eventos, datas e recompensas raras.',
    cardsPerOpen: 3, cooldownHours: null, distribution: 'selected_readers', status: 'draft', category: 'guaranteed',
    allowedTypeIds: [], allowedRarityIds: [], guaranteedRarityId: null,
    gradient: 'linear-gradient(135deg,#fff7ed,#fed7aa,#fde68a)', accent: '#f97316', ...PACK_DEFAULT_SCHEDULE,
  },
  {
    id: 'saudade', name: 'Dose de saudade', emoji: '🌙',
    description: 'Pacotinho emocional para bilhetes de saudade e carinho.',
    cardsPerOpen: 2, cooldownHours: 12, distribution: 'all_with_access', status: 'draft', category: 'thematic',
    allowedTypeIds: [], allowedRarityIds: [], guaranteedRarityId: null,
    gradient: 'linear-gradient(135deg,#eef2ff,#c7d2fe,#e0e7ff)', accent: '#4f46e5', ...PACK_DEFAULT_SCHEDULE,
  },
  {
    id: 'surpresa', name: 'Surpresa relâmpago', emoji: '⚡',
    description: 'Um bônus rápido liberado manualmente pelo criador.',
    cardsPerOpen: 1, cooldownHours: null, distribution: 'manual_bonus', status: 'active', category: 'bonus',
    allowedTypeIds: [], allowedRarityIds: [], guaranteedRarityId: null,
    gradient: 'linear-gradient(135deg,#fefce8,#fef3c7,#fde68a)', accent: '#eab308', ...PACK_DEFAULT_SCHEDULE,
  },
  {
    id: 'evento', name: 'Evento especial', emoji: '🎉',
    description: 'Template para aniversário, datas especiais ou coleções sazonais.',
    cardsPerOpen: 5, cooldownHours: null, distribution: 'all_with_access', status: 'draft', category: 'bonus',
    allowedTypeIds: [], allowedRarityIds: [], guaranteedRarityId: null,
    gradient: 'linear-gradient(135deg,#ecfeff,#cffafe,#f0abfc)', accent: '#06b6d4', ...PACK_DEFAULT_SCHEDULE,
  },
]

const PACK_FILTERS: { id: PackFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'active', label: 'Ativos' },
  { id: 'draft', label: 'Rascunhos' },
  { id: 'daily', label: 'Diários' },
  { id: 'bonus', label: 'Bônus' },
  { id: 'guaranteed', label: 'Garantidos' },
  { id: 'thematic', label: 'Temáticos' },
]

const PACK_VIEW_OPTIONS = [
  { id: 'cards' as PackView, label: 'Cards', icon: <ViewAgendaIcon /> },
  { id: 'list' as PackView, label: 'Lista', icon: <ViewListIcon /> },
]

const PACK_CATEGORY_LABELS: Record<CollectionPackCategory, string> = {
  daily: 'Diário', bonus: 'Bônus', guaranteed: 'Garantido', thematic: 'Temático',
}
const PACK_STATUS_LABELS: Record<CollectionPackStatus, string> = {
  active: 'Ativo', draft: 'Rascunho', disabled: 'Pausado',
}
const PACK_DISTRIBUTION_LABELS: Record<CollectionPackDistribution, string> = {
  all_with_access: 'Todos com acesso', manual_bonus: 'Brinde manual', selected_readers: 'Selecionar leitores',
}
const PACK_CATEGORY_OPTIONS = Object.entries(PACK_CATEGORY_LABELS).map(([id, label]) => ({ id: id as CollectionPackCategory, label }))
const PACK_STATUS_OPTIONS = Object.entries(PACK_STATUS_LABELS).map(([id, label]) => ({ id: id as CollectionPackStatus, label }))
const PACK_DISTRIBUTION_OPTIONS = Object.entries(PACK_DISTRIBUTION_LABELS).map(([id, label]) => ({ id: id as CollectionPackDistribution, label }))

function formatPackSchedule(pack: { scheduleMode?: string; scheduleTime?: string | null; cooldownHours?: number | null; cumulative?: boolean }) {
  if (pack.scheduleMode === 'fixed_time') return `⏰ ${pack.scheduleTime ?? '06:00'}${pack.cumulative ? ' (acum.)' : ''}`
  return formatCooldown(pack.cooldownHours ?? null)
}

function formatCooldown(hours: number | null) {
  if (!hours) return 'Uso único'
  if (hours < 24) return `${hours}h`
  if (hours % 24 === 0) return `${hours / 24} dia${hours / 24 === 1 ? '' : 's'}`
  return `${hours}h`
}

function buildPackRules(pack: CollectionPack) {
  return [
    pack.allowedTypeIds.length > 0 ? `${pack.allowedTypeIds.length} tipo${pack.allowedTypeIds.length === 1 ? '' : 's'} permitido${pack.allowedTypeIds.length === 1 ? '' : 's'}` : 'Todos os tipos',
    pack.allowedRarityIds.length > 0 ? `${pack.allowedRarityIds.length} raridade${pack.allowedRarityIds.length === 1 ? '' : 's'} permitida${pack.allowedRarityIds.length === 1 ? '' : 's'}` : 'Todas as raridades',
    pack.guaranteedRarityId ? `Garante ${pack.guaranteedRarityId}` : 'Sem garantia fixa',
  ]
}

function pickRandomNote(notes: NoteRecord[]) {
  return notes[Math.floor(Math.random() * notes.length)]
}

function pickWeightedNote(notes: NoteRecord[], rarities: RarityConfig[]) {
  const availableRarities = rarities
    .filter((r) => r.odds > 0 && notes.some((n) => n.rarity === r.id))
    .map((r) => ({ ...r, weight: r.odds * 10 }))

  const totalWeight = availableRarities.reduce((sum, r) => sum + r.weight, 0)
  if (availableRarities.length === 0 || totalWeight <= 0) return pickRandomNote(notes)

  let cursor = Math.random() * totalWeight
  const selectedRarity = availableRarities.find((r) => { cursor -= r.weight; return cursor <= 0 }) ?? availableRarities[availableRarities.length - 1]
  const rarityNotes = notes.filter((n) => n.rarity === selectedRarity.id)
  return pickRandomNote(rarityNotes.length > 0 ? rarityNotes : notes)
}

function simulatePackOpening(pack: CollectionPack, notes: NoteRecord[], rarities: RarityConfig[]): PackSimulation | null {
  const eligibleNotes = notes.filter((n) =>
    (pack.allowedTypeIds.length === 0 || pack.allowedTypeIds.includes(n.typeId)) &&
    (pack.allowedRarityIds.length === 0 || pack.allowedRarityIds.includes(n.rarity)),
  )
  if (eligibleNotes.length === 0) return null

  const rewards: NoteRecord[] = []
  const guaranteedPool = pack.guaranteedRarityId ? eligibleNotes.filter((n) => n.rarity === pack.guaranteedRarityId) : []
  if (pack.guaranteedRarityId && guaranteedPool.length > 0) rewards.push(pickRandomNote(guaranteedPool))

  while (rewards.length < pack.cardsPerOpen) rewards.push(pickWeightedNote(eligibleNotes, rarities))

  return { pack, rewards, eligibleCount: eligibleNotes.length, guaranteedApplied: Boolean(pack.guaranteedRarityId && guaranteedPool.length > 0) }
}

function PackEditor({ cid, pack, rarities, types, onClose }: {
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

function PackPreviewCard({ pack, view, onEdit, onDelete, onSimulate, onSetPrimary }: {
  pack: CollectionPack; view: PackView
  onEdit: (pack: CollectionPack) => void
  onDelete: (pack: CollectionPack) => void
  onSimulate: (pack: CollectionPack) => void
  onSetPrimary: (pack: CollectionPack) => void
}) {
  const isActive = pack.status === 'active'
  const isPrimary = pack.category === 'daily'
  const compact = view === 'list'
  const rules = buildPackRules(pack)
  return (
    <Card sx={{ p: 0, overflow: 'hidden', border: `1.5px solid ${pack.accent}28`, boxShadow: `0 8px 24px ${pack.accent}18` }}>
      <Box sx={{ p: compact ? 1.25 : 1.6, background: pack.gradient, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 15% 0%, rgba(255,255,255,0.58), transparent 38%), radial-gradient(circle at 100% 100%, ${pack.accent}44, transparent 40%)`, pointerEvents: 'none' }} />
        <Stack direction="row" alignItems="center" spacing={1.1} sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ width: compact ? 38 : 44, height: compact ? 38 : 44, borderRadius: radius.lg, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.62)', border: '1px solid rgba(255,255,255,0.78)', boxShadow: `0 6px 18px ${pack.accent}24`, fontSize: compact ? '1.25rem' : '1.45rem' }}>
            {pack.emoji}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={0.7} alignItems="flex-start" sx={{ mb: 0.25 }}>
              <Typography sx={{ flex: 1, minWidth: 0, fontFamily: font.serif, fontWeight: 800, fontSize: compact ? '0.92rem' : '1rem', color: colors.text.primary, lineHeight: 1.15, display: '-webkit-box', WebkitLineClamp: compact ? 1 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                {pack.name}
              </Typography>
              <Chip label={isPrimary ? 'Principal' : PACK_STATUS_LABELS[pack.status]} size="small"
                sx={{ height: 19, fontSize: '0.68rem', fontWeight: 900, background: isPrimary ? '#fef3c7' : isActive ? '#dcfce7' : 'rgba(255,255,255,0.62)', color: isPrimary ? '#b45309' : isActive ? '#15803d' : colors.text.secondary, flexShrink: 0, '& .MuiChip-label': { px: 0.75 } }} />
            </Stack>
            <Typography sx={{ fontSize: compact ? '0.7rem' : '0.76rem', color: colors.text.secondary, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: compact ? 2 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
              {pack.description}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: compact ? 1.25 : 1.6 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : 'repeat(3, 1fr)', gap: 0.8, mb: compact ? 1 : 1.2 }}>
          {[['Cartas', `${pack.cardsPerOpen}`], ['Disponib.', formatPackSchedule(pack)], ['Distribuição', PACK_DISTRIBUTION_LABELS[pack.distribution]]].map(([label, value]) => (
            <Box key={label} sx={{ p: compact ? 0.75 : 0.9, borderRadius: radius.md, background: `${pack.accent}0f`, border: `1px solid ${pack.accent}18`, display: compact ? 'flex' : 'block', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.25 }}>{label}</Typography>
              <Typography sx={{ fontSize: compact ? '0.68rem' : '0.7rem', fontWeight: 800, color: pack.accent, lineHeight: 1.15, textAlign: compact ? 'right' : 'left', minWidth: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                {value}
              </Typography>
            </Box>
          ))}
        </Box>

        <Stack spacing={0.75}>
          <Typography sx={{ fontSize: '0.70rem', fontWeight: 900, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.8 }}>Regras</Typography>
          <Box sx={{ display: 'flex', gap: 0.55, flexWrap: 'wrap' }}>
            {rules.map((rule) => (
              <Box key={rule} sx={{ px: 0.9, py: 0.35, borderRadius: radius.full, background: 'rgba(0,0,0,0.035)', border: '1px solid rgba(0,0,0,0.045)', color: colors.text.secondary, fontSize: '0.72rem', fontWeight: 750, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {rule}
              </Box>
            ))}
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.6} justifyContent="flex-end" sx={{ mt: 1.3, flexWrap: 'wrap', rowGap: 0.6 }}>
          <IconButton size="small" aria-label={isPrimary ? 'pacotinho principal' : 'definir pacotinho principal'} onClick={() => !isPrimary && onSetPrimary(pack)} disabled={isPrimary} sx={actionButtonSx(isPrimary ? 'neutral' : 'primary')}>
            {isPrimary ? <StarIcon sx={{ fontSize: 16, color: '#eab308' }} /> : <StarBorderIcon sx={{ fontSize: 16 }} />}
          </IconButton>
          <IconButton size="small" aria-label="simular abertura do pacotinho" onClick={() => onSimulate(pack)} sx={actionButtonSx('neutral')}>
            <CasinoOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton size="small" aria-label="editar pacotinho" onClick={() => onEdit(pack)} sx={actionButtonSx('primary')}>
            <EditOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton size="small" aria-label="excluir pacotinho" onClick={() => onDelete(pack)} sx={actionButtonSx('danger')}>
            <DeleteForeverOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
      </Box>
    </Card>
  )
}

function PackSimulationDialog({ simulation, rarities, types, onClose, onSimulateAgain }: {
  simulation: PackSimulation | null; rarities: RarityConfig[]; types: NoteTypeConfig[]; onClose: () => void; onSimulateAgain: () => void
}) {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (!simulation) return
    setRevealed(false)
    const timeout = window.setTimeout(() => setRevealed(true), 1480)
    return () => window.clearTimeout(timeout)
  }, [simulation])

  return (
    <Dialog open={!!simulation} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: radius.xl, mx: 2, overflow: 'hidden', background: '#fffaf7' } } }}>
      {simulation && (
        <>
          <Box sx={{ p: 2, background: simulation.pack.gradient, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 15% 0%, rgba(255,255,255,0.62), transparent 38%), radial-gradient(circle at 100% 100%, ${simulation.pack.accent}44, transparent 40%)`, pointerEvents: 'none' }} />
            {[0, 1, 2, 3, 4].map((item) => (
              <Box key={item} sx={{ position: 'absolute', left: `${18 + item * 15}%`, bottom: 18 + (item % 2) * 14, width: 7, height: 7, borderRadius: radius.full, background: 'rgba(255,255,255,0.88)', boxShadow: `0 0 18px ${simulation.pack.accent}88`, animation: `${sparkleFloat} ${1.25 + item * 0.12}s ease-in-out infinite`, animationDelay: `${item * 0.15}s` }} />
            ))}
            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ width: 46, height: 46, borderRadius: radius.lg, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.64)', border: '1px solid rgba(255,255,255,0.78)', boxShadow: `0 8px 20px ${simulation.pack.accent}24`, fontSize: '1.45rem', animation: `${packOpening} 0.95s cubic-bezier(.2,.9,.2,1)` }}>
                {simulation.pack.emoji}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.08rem', color: colors.text.primary }}>
                  {revealed ? simulation.pack.name : 'Abrindo pacotinho...'}
                </Typography>
                <Typography sx={{ fontSize: '0.76rem', color: colors.text.secondary }}>
                  {revealed
                    ? `${simulation.eligibleCount} bilhete${simulation.eligibleCount === 1 ? '' : 's'} elegível${simulation.eligibleCount === 1 ? '' : 'eis'}`
                    : 'Separando as cartinhas desse pacote'}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <DialogContent sx={{ pt: 2, minHeight: 280 }}>
            {!revealed ? (
              <Box sx={{ py: 3.1, textAlign: 'center', position: 'relative', overflow: 'hidden', animation: `${openingSceneFade} 0.22s ease-out both` }}>
                <Box sx={{ position: 'absolute', left: '50%', top: 112, width: 190, height: 190, borderRadius: radius.full, background: `radial-gradient(circle, ${simulation.pack.accent}24 0%, transparent 66%)`, transform: 'translate(-50%,-50%)', animation: `${burstRing} 1.55s ease-out infinite both`, willChange: 'transform, opacity', pointerEvents: 'none' }} />
                <Box sx={{ position: 'relative', width: 210, height: 188, mx: 'auto', perspective: 680, transform: 'translateZ(0)' }}>
                  {[
                    { x: '-46px', y: '78px', r: '-16deg', delay: '0.28s' },
                    { x: '0px', y: '92px', r: '2deg', delay: '0.38s' },
                    { x: '46px', y: '78px', r: '16deg', delay: '0.48s' },
                  ].map((card, index) => (
                    <Box key={index} sx={{
                      '--x': card.x, '--y': card.y, '--r': card.r,
                      position: 'absolute', left: '50%', bottom: 24, width: 54, height: 76, borderRadius: 2.2,
                      background: 'linear-gradient(135deg,#ffffff,#fff7ed)', border: `1.5px solid ${simulation.pack.accent}42`,
                      boxShadow: `0 12px 26px ${simulation.pack.accent}20`, animation: `${cardEject} 1.2s cubic-bezier(.18,.95,.22,1) both`,
                      animationDelay: card.delay, opacity: 0, overflow: 'hidden', willChange: 'transform, opacity',
                      backfaceVisibility: 'hidden', transform: 'translateZ(0)',
                      '&::before': { content: '""', position: 'absolute', inset: 7, borderRadius: 1.5, border: `1px solid ${simulation.pack.accent}24`, background: `radial-gradient(circle at 50% 20%, ${simulation.pack.accent}20, transparent 48%)` },
                      '&::after': { content: '""', position: 'absolute', left: '50%', top: '50%', width: 16, height: 16, borderRadius: radius.full, background: `${simulation.pack.accent}18`, transform: 'translate(-50%,-50%)' },
                    }} />
                  ))}
                  <Box sx={{ position: 'absolute', left: '50%', bottom: 8, width: 132, height: 132, transform: 'translateX(-50%)', animation: `${packOpeningCentered} 1.24s cubic-bezier(.2,.9,.2,1) both`, willChange: 'transform', backfaceVisibility: 'hidden' }}>
                    <Box sx={{ position: 'absolute', left: 7, right: 7, top: 4, height: 44, borderRadius: `${radius.xl} ${radius.xl} ${radius.md} ${radius.md}`, background: simulation.pack.gradient, border: '2px solid rgba(255,255,255,0.86)', transformOrigin: '50% 100%', animation: `${packFlap} 1.2s cubic-bezier(.2,.85,.2,1) both`, boxShadow: `0 10px 22px ${simulation.pack.accent}28`, zIndex: 3, willChange: 'transform', backfaceVisibility: 'hidden' }} />
                    <Box sx={{ position: 'absolute', inset: '24px 0 0', borderRadius: radius.xl, background: simulation.pack.gradient, border: '2px solid rgba(255,255,255,0.86)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.15rem', zIndex: 2, boxShadow: `0 18px 34px ${simulation.pack.accent}28`, willChange: 'transform', backfaceVisibility: 'hidden',
                      '&::before': { content: '""', position: 'absolute', inset: 0, background: `radial-gradient(circle at 20% 0%, rgba(255,255,255,0.72), transparent 38%), radial-gradient(circle at 90% 100%, ${simulation.pack.accent}34, transparent 42%)` },
                      '&::after': { content: '""', position: 'absolute', inset: -42, background: 'linear-gradient(100deg, transparent 28%, rgba(255,255,255,0.88) 48%, transparent 68%)', animation: `${shineSweep} 1.28s ease-in-out infinite both`, animationDelay: '0.12s', willChange: 'transform' },
                    }}>
                      <Box sx={{ position: 'relative', zIndex: 1 }}>{simulation.pack.emoji}</Box>
                    </Box>
                  </Box>
                </Box>
                <Typography sx={{ mt: 1.1, fontFamily: font.serif, fontSize: '1rem', fontWeight: 800, color: colors.text.primary }}>Abrindo o pacotinho</Typography>
                <Typography sx={{ mt: 0.35, fontSize: '0.76rem', color: colors.text.muted }}>As cartinhas estão saindo do potinho...</Typography>
              </Box>
            ) : (
              <Stack spacing={1.1} sx={{ animation: `${openingSceneFade} 0.2s ease-out both` }}>
                {simulation.guaranteedApplied && (
                  <Box sx={{ px: 1.1, py: 0.7, borderRadius: radius.md, background: `${simulation.pack.accent}12`, border: `1px solid ${simulation.pack.accent}24`, color: simulation.pack.accent, fontSize: '0.74rem', fontWeight: 800 }}>
                    Garantia aplicada nesta simulação.
                  </Box>
                )}
                {simulation.rewards.map((note, index) => {
                  const rarity = rarities.find((item) => item.id === note.rarity)
                  const type = types.find((item) => item.id === note.typeId)
                  return (
                    <Box key={`${note.id}-${index}`} sx={{ p: 1.25, borderRadius: radius.lg, background: rarity?.cardBg ?? colors.surface.overlay, border: `1.5px solid ${rarity?.borderColor ?? colors.border.subtle}`, boxShadow: rarity?.glowColor ? `${rarity.shadow}, 0 0 22px ${rarity.glowColor}` : rarity?.shadow, opacity: 0, animation: `${rewardReveal} 0.42s cubic-bezier(.2,.85,.2,1) forwards`, animationDelay: `${index * 0.12}s` }}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <Box sx={{ width: 28, height: 28, borderRadius: radius.md, display: 'flex', alignItems: 'center', justifyContent: 'center', background: rarity?.chipBg ?? 'rgba(0,0,0,0.04)', color: rarity ? colors.text.primary : colors.text.secondary, fontSize: '0.78rem', fontWeight: 900, flexShrink: 0 }}>
                          {index + 1}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontFamily: font.serif, fontSize: '0.92rem', fontWeight: 800, color: rarity?.textColor ?? colors.text.primary, mb: 0.2 }}>{note.title}</Typography>
                          <Typography sx={{ fontSize: '0.74rem', color: rarity?.captionColor ?? colors.text.secondary, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.45 }}>{note.message}</Typography>
                          <Stack direction="row" spacing={0.5} sx={{ mt: 0.75, flexWrap: 'wrap', rowGap: 0.45 }}>
                            {rarity && (
                              <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 0.75, py: 0.25, borderRadius: radius.full, background: rarity.chipBg, border: `1px solid ${rarity.borderColor}`, fontSize: '0.70rem', fontWeight: 750 }}>
                                <Box component="span" sx={gradientTextSx(rarity.chipColor)}>{rarity.emoji} {rarity.label}</Box>
                              </Box>
                            )}
                            {type && (
                              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35, px: 0.75, py: 0.25, borderRadius: radius.full, background: type.tagBg, color: type.tagColor, border: `1px solid ${type.accentColor}44`, fontSize: '0.70rem', fontWeight: 750 }}>
                                {type.emoji} {type.label}
                              </Box>
                            )}
                          </Stack>
                        </Box>
                      </Stack>
                    </Box>
                  )
                })}
              </Stack>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button variant="ghost" onClick={onClose} sx={{ flex: 1, minWidth: 0 }}>Fechar</Button>
            <Button variant="primary" onClick={onSimulateAgain} sx={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', px: 1.2 }}>
              <CasinoOutlinedIcon sx={{ fontSize: 16, mr: 0.45 }} /> Outra
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}

interface PacksTabProps { cid: string }

export function PacksTab({ cid }: PacksTabProps) {
  const { theme } = useBackground()
  const { data: notes = [] } = useCollectionNotesQuery(cid)
  const { data: rarities = [] } = useCollectionRaritiesQuery(cid)
  const { data: types = [] } = useCollectionTypesQuery(cid)
  const { data: packs = [], isLoading: packsLoading } = useCollectionPacksQuery(cid)
  const updatePack = useUpdateCollectionPackMutation(cid)
  const deletePack = useDeleteCollectionPackMutation(cid)

  const [packFilter, setPackFilter] = useState<PackFilter>('all')
  const [packView, setPackView] = useState<PackView>('cards')
  const [packDialogOpen, setPackDialogOpen] = useState(false)
  const [editingPack, setEditingPack] = useState<CollectionPack | null>(null)
  const [packSimulation, setPackSimulation] = useState<PackSimulation | null>(null)

  const packDelete = useConfirmDelete<CollectionPack>(deletePack, { success: 'Pacotinho excluído.', error: 'Erro ao excluir pacotinho.' })

  const filteredPacks = packs.filter((pack) => {
    if (packFilter === 'all') return true
    if (packFilter === 'active') return pack.status === 'active'
    if (packFilter === 'draft') return pack.status === 'draft'
    return pack.category === packFilter
  })

  const handleSimulatePack = (pack: CollectionPack) => {
    const simulation = simulatePackOpening(pack, notes, rarities)
    if (!simulation) {
      toast.info('Esse pacotinho não tem bilhetes compatíveis com as regras atuais.')
      return
    }
    setPackSimulation(simulation)
  }

  async function handleSetPrimaryPack(pack: CollectionPack) {
    try {
      const previousPrimary = packs.filter((item) => item.id !== pack.id && item.category === 'daily')
      await Promise.all([
        updatePack.mutateAsync({ id: pack.id, data: { category: 'daily', status: 'active' } }),
        ...previousPrimary.map((item) => updatePack.mutateAsync({ id: item.id, data: { category: 'bonus' } })),
      ])
      toast.success(`${pack.name} agora é o pacotinho principal.`)
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao definir pacotinho principal.')
    }
  }

  return (
    <>
      <Stack spacing={1.4}>
        <Stack spacing={1.1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography sx={{ fontSize: '0.72rem', color: theme.textOnBgMuted, fontWeight: 600 }}>
                {packsLoading ? 'Carregando pacotinhos...' : `${filteredPacks.length} de ${packs.length} pacotinho${packs.length !== 1 ? 's' : ''}`}
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: theme.textOnBgMuted, opacity: 0.76, mt: 0.2 }}>
                Regras reais salvas por coleção.
              </Typography>
            </Box>
            <Button variant="primary" onClick={() => { setEditingPack(null); setPackDialogOpen(true) }} sx={{ py: 0.7, px: 1.4, fontSize: '0.78rem' }}>
              <AddIcon sx={{ fontSize: 15, mr: 0.4 }} /> Novo
            </Button>
          </Stack>

          <SegmentedControl options={PACK_VIEW_OPTIONS} value={packView} onChange={setPackView} />

          <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
            {PACK_FILTERS.map((filter) => {
              const active = packFilter === filter.id
              return (
                <Chip key={filter.id} label={filter.label} size="small" onClick={() => setPackFilter(filter.id)}
                  sx={{ height: 26, fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', background: active ? colors.primary.main : 'rgba(255,255,255,0.5)', color: active ? '#fff' : theme.textOnBgMuted, border: `1.5px solid ${active ? colors.primary.main : 'rgba(255,255,255,0.55)'}`, backdropFilter: 'blur(10px)' }} />
              )
            })}
          </Box>
        </Stack>

        <Card sx={{ p: 1.7, background: theme.surfaceBg, backdropFilter: 'blur(14px)', border: `1px solid ${theme.surfaceBorder}` }}>
          <Box>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '0.98rem', color: theme.textOnBg }}>
              Como vai funcionar
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: theme.textOnBgMuted, lineHeight: 1.55 }}>
              Um pacotinho será uma regra de abertura dentro da coleção: quantidade de bilhetes, cooldown, filtros por tipo/raridade e formas de distribuição.
            </Typography>
          </Box>
        </Card>

        {packsLoading && <LoadingState compact label="Carregando pacotinhos" accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} />}

        {!packsLoading && packs.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography sx={{ fontFamily: font.serif, fontSize: '1rem', fontWeight: 700, color: theme.textOnBg, mb: 0.5 }}>Nenhum pacotinho ainda</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: theme.textOnBgMuted }}>Crie um pacote usando os templates prontos</Typography>
          </Box>
        )}

        {!packsLoading && packs.length > 0 && filteredPacks.length === 0 && (
          <Typography sx={{ fontSize: '0.82rem', color: theme.textOnBgMuted, textAlign: 'center', py: 3 }}>
            Nenhum pacotinho nesse filtro
          </Typography>
        )}

        {!packsLoading && (
          <Stack spacing={packView === 'cards' ? 1.4 : 0.9}>
            {filteredPacks.map((pack) => (
              <PackPreviewCard
                key={pack.id}
                pack={pack}
                view={packView}
                onEdit={(item) => { setEditingPack(item); setPackDialogOpen(true) }}
                onDelete={packDelete.setTarget}
                onSimulate={handleSimulatePack}
                onSetPrimary={handleSetPrimaryPack}
              />
            ))}
          </Stack>
        )}
      </Stack>

      <Dialog open={packDialogOpen} onClose={() => { setPackDialogOpen(false); setEditingPack(null) }} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: radius.xl } } }}>
        {packDialogOpen && (
          <PackEditor
            key={editingPack?.id ?? 'new'}
            cid={cid}
            pack={editingPack}
            rarities={rarities}
            types={types}
            onClose={() => { setPackDialogOpen(false); setEditingPack(null) }}
          />
        )}
      </Dialog>

      <PackSimulationDialog
        simulation={packSimulation}
        rarities={rarities}
        types={types}
        onClose={() => setPackSimulation(null)}
        onSimulateAgain={() => packSimulation && handleSimulatePack(packSimulation.pack)}
      />

      <ConfirmDeleteDialog open={packDelete.isOpen} title={`Excluir o pacotinho "${packDelete.target?.name ?? ''}"?`} isPending={packDelete.isPending} onConfirm={packDelete.confirm} onClose={packDelete.close} />
    </>
  )
}
