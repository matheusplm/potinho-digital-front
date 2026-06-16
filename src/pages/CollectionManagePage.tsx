import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import FavoriteIcon from '@mui/icons-material/Favorite'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda'
import ViewListIcon from '@mui/icons-material/ViewList'
import DensitySmallIcon from '@mui/icons-material/DensitySmall'
import CasinoOutlinedIcon from '@mui/icons-material/CasinoOutlined'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import { Box, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Input, LoadingState, PageTitle, ScrollablePage, SegmentedControl, toast } from '../components/ui'
import { NoteDetailDialog, type ReadableNote } from './CollectionPlayPage'
import {
  useCollectionsQuery,
  useCollectionNotesQuery, useCreateCollectionNoteMutation, useImportCollectionNotesMutation, useUpdateCollectionNoteMutation, useDeleteCollectionNoteMutation,
  useCollectionRaritiesQuery, useCreateCollectionRarityMutation, useUpdateCollectionRarityMutation, useDeleteCollectionRarityMutation,
  useCollectionTypesQuery, useCreateCollectionTypeMutation, useUpdateCollectionTypeMutation, useDeleteCollectionTypeMutation,
  useCollectionPacksQuery, useCreateCollectionPackMutation, useUpdateCollectionPackMutation, useDeleteCollectionPackMutation,
  useCollectionAchievementsQuery, useCreateCollectionAchievementMutation, useDeleteCollectionAchievementMutation,
  useCollectionAccessQuery, useGrantAccessMutation, useAddPackOpensMutation,
} from '../hooks/useNotes'
import { AchievementEditor } from '../components/manage/AchievementEditor'
import { useBackground } from '../context/BackgroundContext'
import { useUser } from '../context/UserContext'
import { colors, font, radius } from '../design-system'
import { isCollectionOwner } from '../utils/collectionAccess'
import { isHexColor, slugify, uniqueConfigId } from '../utils/slug'
import type {
  AchievementConditionType,
  CollectionAchievement,
  CollectionPack,
  CollectionPackCategory,
  CollectionPackDistribution,
  CollectionPackFormData,
  CollectionPackStatus,
  NoteFormData,
  NoteRecord,
  RarityConfig,
  NoteTypeConfig,
} from '../types/note'

const fadeIn = keyframes`from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}`
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
const shineSweep = keyframes`from{transform:translate3d(-130%,0,0) rotate(16deg);}to{transform:translate3d(130%,0,0) rotate(16deg);}`
const openingSceneFade = keyframes`from{opacity:0;transform:translate3d(0,8px,0) scale(0.98);}to{opacity:1;transform:translate3d(0,0,0) scale(1);}`

type Tab = 'notes' | 'rarities' | 'types' | 'packs' | 'achievements' | 'access'
type NoteSort = 'newest' | 'oldest' | 'az' | 'rarity' | 'type'
type NoteView = 'cards' | 'list' | 'compact'
type PackFilter = 'all' | 'active' | 'draft' | 'daily' | 'bonus' | 'guaranteed' | 'thematic'
type PackView = 'cards' | 'list'
type PackSimulation = { pack: CollectionPack; rewards: NoteRecord[]; eligibleCount: number; guaranteedApplied: boolean }

const TABS = [
  { id: 'notes' as Tab, label: 'Bilhetes' },
  { id: 'rarities' as Tab, label: 'Raridades' },
  { id: 'types' as Tab, label: 'Tipos' },
  { id: 'packs' as Tab, label: 'Pacotinhos' },
  { id: 'achievements' as Tab, label: 'Conquistas' },
  { id: 'access' as Tab, label: 'Acesso' },
]

const NOTE_SORT_OPTIONS: { id: NoteSort; label: string }[] = [
  { id: 'newest', label: 'Mais recentes' },
  { id: 'oldest', label: 'Mais antigos' },
  { id: 'az', label: 'A-Z' },
  { id: 'rarity', label: 'Raridade' },
  { id: 'type', label: 'Tipo' },
]

const NOTE_VIEW_OPTIONS = [
  { id: 'cards' as NoteView, label: 'Cards', icon: <ViewAgendaIcon /> },
  { id: 'list' as NoteView, label: 'Lista', icon: <ViewListIcon /> },
  { id: 'compact' as NoteView, label: 'Compacta', icon: <DensitySmallIcon /> },
]

const NOTE_PAGE_SIZE = 60

const ACHIEVEMENT_PRESETS: { emoji: string; label: string; description: string; conditionType: AchievementConditionType; count: number | null }[] = [
  { emoji: '🌱', label: 'Primeiro bilhete', description: 'Coletou o primeiro bilhetinho.', conditionType: 'collect_count', count: 1 },
  { emoji: '🎴', label: 'Colecionador(a)', description: 'Coletou 10 bilhetes.', conditionType: 'collect_count', count: 10 },
  { emoji: '🏆', label: 'Mestre', description: 'Coletou 25 bilhetes.', conditionType: 'collect_count', count: 25 },
  { emoji: '👑', label: 'Coleção completa', description: 'Coletou todos os bilhetes.', conditionType: 'complete', count: null },
  { emoji: '🌈', label: 'Arco-íris', description: 'Uma de cada raridade.', conditionType: 'rainbow', count: null },
  { emoji: '❤️', label: 'Coração cheio', description: 'Favoritou 5 bilhetes.', conditionType: 'favorite_count', count: 5 },
]

const EMPTY_NOTE: NoteFormData = { title: '', message: '', rarity: '', typeId: '' }
const DEFAULT_IMPORT_JSON = `[
  {
    "title": "Seu título aqui",
    "message": "Seu bilhetinho aqui",
    "rarity": "comum",
    "typeId": "alegria"
  }
]`

const NEW_RARITY: RarityConfig = {
  id: '', label: 'Nova raridade', emoji: '✨', odds: 10, order: 99,
  cardBg: '#ffffff', textColor: '#334155', captionColor: '#94a3b8',
  borderColor: '#cbd5e1', shadow: '0 4px 16px rgba(15,23,42,0.06)', glowColor: '',
  chipBg: '#f1f5f9', chipColor: '#64748b',
}

const NEW_TYPE: NoteTypeConfig = {
  id: '', label: 'Novo tipo', emoji: '✨', order: 99,
  accentColor: '#6366f1', tagBg: '#eef2ff', tagColor: '#4f46e5',
}

const PACK_TEMPLATES: CollectionPackFormData[] = [
  {
    id: 'daily',
    name: 'Pacotinho diário',
    emoji: '💌',
    description: 'O pacote padrão da coleção, liberado automaticamente por tempo.',
    cardsPerOpen: 1,
    cooldownHours: 24,
    maxOpensPerUser: null,
    distribution: 'all_with_access',
    status: 'active',
    category: 'daily',
    allowedTypeIds: [],
    allowedRarityIds: [],
    guaranteedRarityId: null,
    gradient: 'linear-gradient(135deg,#fff1f2,#ffe4e6,#fbcfe8)',
    accent: '#e11d48',
  },
  {
    id: 'sentimental',
    name: 'Pacote sentimental',
    emoji: '🥹',
    description: 'Exemplo de pacote temático filtrando apenas um tipo de bilhete.',
    cardsPerOpen: 4,
    cooldownHours: 168,
    maxOpensPerUser: 1,
    distribution: 'manual_bonus',
    status: 'draft',
    category: 'thematic',
    allowedTypeIds: [],
    allowedRarityIds: [],
    guaranteedRarityId: null,
    gradient: 'linear-gradient(135deg,#eef2ff,#e0e7ff,#f5d0fe)',
    accent: '#6366f1',
  },
  {
    id: 'legendary',
    name: 'Lendário garantido',
    emoji: '👑',
    description: 'Exemplo de pacote especial para eventos, datas e recompensas raras.',
    cardsPerOpen: 3,
    cooldownHours: null,
    maxOpensPerUser: 1,
    distribution: 'selected_readers',
    status: 'draft',
    category: 'guaranteed',
    allowedTypeIds: [],
    allowedRarityIds: [],
    guaranteedRarityId: null,
    gradient: 'linear-gradient(135deg,#fff7ed,#fed7aa,#fde68a)',
    accent: '#f97316',
  },
  {
    id: 'saudade',
    name: 'Dose de saudade',
    emoji: '🌙',
    description: 'Pacotinho emocional para bilhetes de saudade e carinho.',
    cardsPerOpen: 2,
    cooldownHours: 12,
    maxOpensPerUser: null,
    distribution: 'all_with_access',
    status: 'draft',
    category: 'thematic',
    allowedTypeIds: [],
    allowedRarityIds: [],
    guaranteedRarityId: null,
    gradient: 'linear-gradient(135deg,#eef2ff,#c7d2fe,#e0e7ff)',
    accent: '#4f46e5',
  },
  {
    id: 'surpresa',
    name: 'Surpresa relâmpago',
    emoji: '⚡',
    description: 'Um bônus rápido liberado manualmente pelo criador.',
    cardsPerOpen: 1,
    cooldownHours: null,
    maxOpensPerUser: 1,
    distribution: 'manual_bonus',
    status: 'active',
    category: 'bonus',
    allowedTypeIds: [],
    allowedRarityIds: [],
    guaranteedRarityId: null,
    gradient: 'linear-gradient(135deg,#fefce8,#fef3c7,#fde68a)',
    accent: '#eab308',
  },
  {
    id: 'evento',
    name: 'Evento especial',
    emoji: '🎉',
    description: 'Template para aniversário, datas especiais ou coleções sazonais.',
    cardsPerOpen: 5,
    cooldownHours: null,
    maxOpensPerUser: 1,
    distribution: 'all_with_access',
    status: 'draft',
    category: 'bonus',
    allowedTypeIds: [],
    allowedRarityIds: [],
    guaranteedRarityId: null,
    gradient: 'linear-gradient(135deg,#ecfeff,#cffafe,#f0abfc)',
    accent: '#06b6d4',
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
  daily: 'Diário',
  bonus: 'Bônus',
  guaranteed: 'Garantido',
  thematic: 'Temático',
}

const PACK_STATUS_LABELS: Record<CollectionPackStatus, string> = {
  active: 'Ativo',
  draft: 'Rascunho',
  disabled: 'Pausado',
}

const PACK_DISTRIBUTION_LABELS: Record<CollectionPackDistribution, string> = {
  all_with_access: 'Todos com acesso',
  manual_bonus: 'Brinde manual',
  selected_readers: 'Selecionar leitores',
}

const PACK_CATEGORY_OPTIONS = Object.entries(PACK_CATEGORY_LABELS).map(([id, label]) => ({ id: id as CollectionPackCategory, label }))
const PACK_STATUS_OPTIONS = Object.entries(PACK_STATUS_LABELS).map(([id, label]) => ({ id: id as CollectionPackStatus, label }))
const PACK_DISTRIBUTION_OPTIONS = Object.entries(PACK_DISTRIBUTION_LABELS).map(([id, label]) => ({ id: id as CollectionPackDistribution, label }))

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

function actionButtonSx(tone: 'primary' | 'danger' | 'neutral' = 'neutral') {
  const color = tone === 'primary'
    ? colors.primary.main
    : tone === 'danger'
      ? colors.rose.main
      : colors.text.secondary

  return {
    color,
    p: 0.75,
    borderRadius: radius.md,
    background: `${color}12`,
    border: `1px solid ${color}24`,
    transition: 'transform 0.16s ease, background 0.16s ease, box-shadow 0.16s ease',
    '&:hover': {
      background: `${color}20`,
      transform: 'translateY(-1px) scale(1.05)',
      boxShadow: `0 5px 14px ${color}22`,
    },
  }
}

function ColorRow({ label, field, value, onChange }: { label: string; field: string; value: string; onChange: (f: string, v: string) => void }) {
  const showPicker = isHexColor(value)
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Typography sx={{ fontSize: '0.8rem', color: colors.text.secondary, width: 120, flexShrink: 0 }}>{label}</Typography>
      {showPicker && (
        <Box sx={{ position: 'relative', width: 32, height: 32, borderRadius: 1.5, overflow: 'hidden', border: `1.5px solid ${colors.border.medium}`, flexShrink: 0 }}>
          <input type="color" value={value} onChange={(e) => onChange(field, e.target.value)}
            style={{ position: 'absolute', inset: 0, width: '200%', height: '200%', border: 'none', cursor: 'pointer', padding: 0, margin: '-25%' }} />
        </Box>
      )}
      <Input value={value} onChange={(e) => onChange(field, e.target.value)} fullWidth
        placeholder={showPicker ? undefined : 'CSS: #hex, rgba(), gradiente...'}
        sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.78rem' }, '& input': { py: 0.7 } }} />
    </Stack>
  )
}

function NoteDialog({ open, editing, rarities, types, cid, onClose }: {
  open: boolean; editing: NoteRecord | null; rarities: RarityConfig[]; types: NoteTypeConfig[]; cid: string; onClose: () => void
}) {
  const [form, setForm] = useState<NoteFormData>(EMPTY_NOTE)
  const [touched, setTouched] = useState({ title: false, message: false, rarity: false, typeId: false })
  const createMutation = useCreateCollectionNoteMutation(cid)
  const updateMutation = useUpdateCollectionNoteMutation(cid)
  const isLoading = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (!open) return
    setForm(editing ? { title: editing.title, message: editing.message, rarity: editing.rarity, typeId: editing.typeId } : EMPTY_NOTE)
    setTouched({ title: false, message: false, rarity: false, typeId: false })
  }, [open, editing])

  const errors = {
    title: form.title.trim().length === 0 ? 'Obrigatório' : form.title.length > 60 ? 'Máx 60 caracteres' : '',
    message: form.message.trim().length === 0 ? 'Obrigatório' : form.message.length > 500 ? 'Máx 500 caracteres' : '',
    rarity: !form.rarity ? 'Selecione uma raridade' : '',
    typeId: !form.typeId ? 'Selecione um tipo' : '',
  }
  const hasErrors = Object.values(errors).some(Boolean)

  function touch(field: keyof typeof touched) {
    setTouched((t) => ({ ...t, [field]: true }))
  }

  async function handleSubmit() {
    if (hasErrors) {
      setTouched({ title: true, message: true, rarity: true, typeId: true })
      return
    }
    try {
      if (editing) { await updateMutation.mutateAsync({ id: editing.id, data: form }); toast.success('Bilhete atualizado!') }
      else { await createMutation.mutateAsync(form); toast.success('Bilhete criado!') }
      onClose()
    } catch (e) { toast.error((e as Error).message || 'Erro ao salvar bilhete.') }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: radius.xl, mx: 2, background: 'rgba(255,253,251,0.98)', backdropFilter: 'blur(24px)' } } }}>
      <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 700, color: colors.text.primary, pb: 1 }}>
        {editing ? 'Editar bilhete' : 'Novo bilhete'}
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: touched.title && errors.title ? colors.error.main : colors.text.secondary }}>Título</Typography>
              <Typography sx={{ fontSize: '0.68rem', color: form.title.length > 60 ? colors.error.main : colors.text.muted }}>{form.title.length}/60</Typography>
            </Stack>
            <Input
              placeholder="Título especial..." value={form.title}
              onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); touch('title') }}
              onBlur={() => touch('title')}
              error={touched.title && !!errors.title}
              helperText={touched.title && errors.title ? errors.title : undefined}
            />
          </Box>
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: touched.message && errors.message ? colors.error.main : colors.text.secondary }}>Mensagem</Typography>
              <Typography sx={{ fontSize: '0.68rem', color: form.message.length > 500 ? colors.error.main : colors.text.muted }}>{form.message.length}/500</Typography>
            </Stack>
            <TextField multiline rows={4} fullWidth placeholder="Escreva algo especial..." value={form.message}
              onChange={(e) => { setForm((f) => ({ ...f, message: e.target.value })); touch('message') }}
              onBlur={() => touch('message')}
              error={touched.message && !!errors.message}
              helperText={touched.message && errors.message ? errors.message : undefined}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: radius.md, fontSize: '0.88rem', background: colors.surface.overlay, '& fieldset': { borderColor: colors.border.medium } } }}
            />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: touched.rarity && errors.rarity ? colors.error.main : colors.text.secondary, mb: 0.8 }}>Raridade</Typography>
            {rarities.length === 0 ? <Typography sx={{ fontSize: '0.8rem', color: colors.text.muted }}>Crie raridades na aba Raridades.</Typography> : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                {rarities.map((r) => (
                  <Box key={r.id} onClick={() => { setForm((f) => ({ ...f, rarity: r.id })); touch('rarity') }} sx={{
                    px: 1.4, py: 0.6, borderRadius: radius.full, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 0.5,
                    background: form.rarity === r.id ? r.chipBg : 'rgba(0,0,0,0.04)',
                    color: form.rarity === r.id ? r.chipColor : colors.text.secondary,
                    border: `1.5px solid ${form.rarity === r.id ? r.borderColor : touched.rarity && errors.rarity ? colors.error.main + '66' : 'transparent'}`,
                    fontWeight: 700, fontSize: '0.78rem', transition: 'all 0.15s',
                  }}>{r.emoji} {r.label}</Box>
                ))}
              </Box>
            )}
            {touched.rarity && errors.rarity && (
              <Typography sx={{ fontSize: '0.68rem', color: colors.error.main, mt: 0.5, pl: 0.5 }}>{errors.rarity}</Typography>
            )}
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: touched.typeId && errors.typeId ? colors.error.main : colors.text.secondary, mb: 0.8 }}>Tipo</Typography>
            {types.length === 0 ? <Typography sx={{ fontSize: '0.8rem', color: colors.text.muted }}>Crie tipos na aba Tipos.</Typography> : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                {types.map((t) => (
                  <Box key={t.id} onClick={() => { setForm((f) => ({ ...f, typeId: t.id })); touch('typeId') }} sx={{
                    px: 1.4, py: 0.6, borderRadius: radius.full, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 0.5,
                    background: form.typeId === t.id ? t.tagBg : 'rgba(0,0,0,0.04)',
                    color: form.typeId === t.id ? t.tagColor : colors.text.secondary,
                    border: `1.5px solid ${form.typeId === t.id ? t.accentColor + '55' : touched.typeId && errors.typeId ? colors.error.main + '66' : 'transparent'}`,
                    fontWeight: 700, fontSize: '0.78rem', transition: 'all 0.15s',
                  }}>{t.emoji} {t.label}</Box>
                ))}
              </Box>
            )}
            {touched.typeId && errors.typeId && (
              <Typography sx={{ fontSize: '0.68rem', color: colors.error.main, mt: 0.5, pl: 0.5 }}>{errors.typeId}</Typography>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>Cancelar</Button>
        <Button variant="primary" loading={isLoading} onClick={handleSubmit} sx={{ flex: 1 }}>
          {editing ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function RarityEditor({ cid, rarity, onClose }: { cid: string; rarity: RarityConfig | null; onClose: () => void }) {
  const isNew = !rarity
  const { data: existingRarities = [] } = useCollectionRaritiesQuery(cid)
  const [form, setForm] = useState<RarityConfig>(rarity ? { ...rarity } : { ...NEW_RARITY, order: existingRarities.length + 1 })
  const createMutation = useCreateCollectionRarityMutation(cid)
  const updateMutation = useUpdateCollectionRarityMutation(cid)
  const isPending = createMutation.isPending || updateMutation.isPending
  const set = (field: string, value: string | number) => setForm((f) => ({ ...f, [field]: value }))
  const applyTemplate = (template: RarityConfig) => {
    setForm((current) => ({
      ...template,
      id: current.id,
      order: current.order || template.order,
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
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: colors.text.secondary, mb: 0.8 }}>
              Templates D&D
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.8 }}>
              {RARITY_TEMPLATES.map((template) => (
                <Box
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  sx={{
                    p: 1,
                    borderRadius: radius.lg,
                    cursor: 'pointer',
                    background: template.cardBg,
                    border: `1.5px solid ${form.label === template.label ? template.borderColor : 'rgba(255,255,255,0.65)'}`,
                    boxShadow: form.label === template.label ? `0 0 22px ${template.glowColor}` : template.shadow,
                    transition: 'transform 0.16s ease, box-shadow 0.16s ease',
                    '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 0 24px ${template.glowColor}` },
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={0.8}>
                    <Chip label={`${template.emoji} ${template.label}`} size="small"
                      sx={{ height: 21, fontSize: '0.72rem', fontWeight: 800, background: template.chipBg, color: template.chipColor, '& .MuiChip-label': { px: 0.8 } }} />
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: template.captionColor }}>
                      {template.odds}%
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Input label="Nome" value={form.label} onChange={(e) => set('label', e.target.value)} sx={{ flex: 1 }} />
            <Input label="Emoji" value={form.emoji} onChange={(e) => set('emoji', e.target.value)} sx={{ width: 80 }} />
            <Input label="Chance %" type="number" value={form.odds} onChange={(e) => set('odds', Number(e.target.value))} sx={{ width: 95 }} />
          </Stack>
          <ColorRow label="Fundo do card" field="cardBg" value={form.cardBg} onChange={set} />
          <ColorRow label="Cor do texto" field="textColor" value={form.textColor} onChange={set} />
          <ColorRow label="Cor da legenda" field="captionColor" value={form.captionColor} onChange={set} />
          <ColorRow label="Cor da borda" field="borderColor" value={form.borderColor} onChange={set} />
          <ColorRow label="Sombra" field="shadow" value={form.shadow} onChange={set} />
          <ColorRow label="Brilho (vazio = sem)" field="glowColor" value={form.glowColor} onChange={set} />
          <ColorRow label="Fundo do chip" field="chipBg" value={form.chipBg} onChange={set} />
          <ColorRow label="Texto do chip" field="chipColor" value={form.chipColor} onChange={set} />
          <Box sx={{ p: 1.5, borderRadius: radius.lg, background: form.cardBg, border: `1.5px solid ${form.borderColor}`, boxShadow: form.shadow }}>
            <Stack direction="row" alignItems="center" spacing={0.8}>
              <Chip label={`${form.emoji} ${form.label.toUpperCase()}`} size="small"
                sx={{ height: 20, fontSize: '0.72rem', fontWeight: 700, background: form.chipBg, color: form.chipColor, '& .MuiChip-label': { px: 0.9 } }} />
              <Typography sx={{ fontSize: '0.85rem', fontStyle: 'italic', color: form.textColor }}>Pré-visualização</Typography>
            </Stack>
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
            <Input label="Emoji" value={form.emoji} onChange={(e) => set('emoji', e.target.value)} sx={{ width: 80 }} />
          </Stack>
          <ColorRow label="Cor de destaque" field="accentColor" value={form.accentColor} onChange={set} />
          <ColorRow label="Fundo da tag" field="tagBg" value={form.tagBg} onChange={set} />
          <ColorRow label="Texto da tag" field="tagColor" value={form.tagColor} onChange={set} />
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

function ConfirmDeleteDialog({ open, label, isPending, onConfirm, onClose }: {
  open: boolean; label: string; isPending: boolean; onConfirm: () => void; onClose: () => void
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: radius.xl, mx: 2 } } }}>
      <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 700, color: colors.text.primary }}>Excluir {label}?</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: '0.88rem', color: colors.text.secondary }}>Esta ação não pode ser desfeita.</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>Cancelar</Button>
        <Button variant="rose" loading={isPending} onClick={onConfirm} sx={{ flex: 1 }}>Excluir</Button>
      </DialogActions>
    </Dialog>
  )
}

function PackEditor({ cid, pack, rarities, types, onClose }: {
  cid: string
  pack: CollectionPack | null
  rarities: RarityConfig[]
  types: NoteTypeConfig[]
  onClose: () => void
}) {
  const isNew = !pack
  const { data: existingPacks = [] } = useCollectionPacksQuery(cid)
  const [form, setForm] = useState<CollectionPackFormData>(pack ? {
    name: pack.name,
    emoji: pack.emoji,
    description: pack.description,
    category: pack.category,
    status: pack.status,
    distribution: pack.distribution,
    cardsPerOpen: pack.cardsPerOpen,
    cooldownHours: pack.cooldownHours,
    maxOpensPerUser: pack.maxOpensPerUser,
    allowedTypeIds: pack.allowedTypeIds,
    allowedRarityIds: pack.allowedRarityIds,
    guaranteedRarityId: pack.guaranteedRarityId,
    gradient: pack.gradient,
    accent: pack.accent,
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
      return {
        ...current,
        [field]: values.includes(id) ? values.filter((item) => item !== id) : [...values, id],
      }
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
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: colors.text.secondary, mb: 0.8 }}>
              Templates
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.8 }}>
              {PACK_TEMPLATES.map((template) => (
                <Box
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  sx={{
                    p: 1,
                    borderRadius: radius.lg,
                    cursor: 'pointer',
                    background: template.gradient,
                    border: `1.5px solid ${form.name === template.name ? template.accent : 'rgba(255,255,255,0.65)'}`,
                    boxShadow: form.name === template.name ? `0 0 22px ${template.accent}44` : `0 4px 16px ${template.accent}18`,
                    transition: 'transform 0.16s ease, box-shadow 0.16s ease',
                    '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 0 24px ${template.accent}44` },
                  }}
                >
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
            <Input label="Emoji" value={form.emoji} onChange={(e) => set('emoji', e.target.value)} sx={{ width: 80 }} />
          </Stack>
          <TextField multiline rows={2} fullWidth placeholder="Descrição do pacotinho..." value={form.description}
            onChange={(e) => set('description', e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: radius.md, fontSize: '0.86rem', background: colors.surface.overlay, '& fieldset': { borderColor: colors.border.medium } } }}
          />

          <Stack direction="row" spacing={1.5}>
            <Input label="Cartas" type="number" value={form.cardsPerOpen} onChange={(e) => set('cardsPerOpen', Number(e.target.value))} sx={{ flex: 1 }} />
            <Input label="Cooldown h" type="number" value={form.cooldownHours ?? ''} onChange={(e) => set('cooldownHours', e.target.value === '' ? null : Number(e.target.value))} sx={{ flex: 1 }} />
            {form.distribution === 'all_with_access' && (
              <Input label="Máx. por pessoa" type="number" value={form.maxOpensPerUser ?? ''} onChange={(e) => set('maxOpensPerUser', e.target.value === '' ? null : Number(e.target.value))} sx={{ flex: 1 }} />
            )}
          </Stack>

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
                  sx={{ cursor: 'pointer', fontWeight: 800, background: form.allowedRarityIds.includes(rarity.id) ? rarity.chipBg : 'rgba(0,0,0,0.05)', color: form.allowedRarityIds.includes(rarity.id) ? rarity.chipColor : colors.text.secondary, border: `1px solid ${form.allowedRarityIds.includes(rarity.id) ? rarity.borderColor : 'transparent'}` }} />
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
                  sx={{ cursor: 'pointer', fontWeight: 800, background: form.guaranteedRarityId === rarity.id ? rarity.chipBg : 'rgba(0,0,0,0.05)', color: form.guaranteedRarityId === rarity.id ? rarity.chipColor : colors.text.secondary, border: `1px solid ${form.guaranteedRarityId === rarity.id ? rarity.borderColor : 'transparent'}` }} />
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

function formatCooldown(hours: number | null) {
  if (!hours) return 'Uso único'
  if (hours < 24) return `${hours}h`
  if (hours % 24 === 0) return `${hours / 24} dia${hours / 24 === 1 ? '' : 's'}`
  return `${hours}h`
}

function buildPackRules(pack: CollectionPack) {
  const isManual = pack.distribution === 'manual_bonus' || pack.distribution === 'selected_readers'
  return [
    pack.allowedTypeIds.length > 0 ? `${pack.allowedTypeIds.length} tipo${pack.allowedTypeIds.length === 1 ? '' : 's'} permitido${pack.allowedTypeIds.length === 1 ? '' : 's'}` : 'Todos os tipos',
    pack.allowedRarityIds.length > 0 ? `${pack.allowedRarityIds.length} raridade${pack.allowedRarityIds.length === 1 ? '' : 's'} permitida${pack.allowedRarityIds.length === 1 ? '' : 's'}` : 'Todas as raridades',
    pack.guaranteedRarityId ? `Garante ${pack.guaranteedRarityId}` : 'Sem garantia fixa',
    ...(!isManual ? [pack.maxOpensPerUser ? `${pack.maxOpensPerUser} abertura${pack.maxOpensPerUser === 1 ? '' : 's'} por pessoa` : 'Sem limite por pessoa'] : []),
  ]
}

function pickRandomNote(notes: NoteRecord[]) {
  return notes[Math.floor(Math.random() * notes.length)]
}

function pickWeightedNote(notes: NoteRecord[], rarities: RarityConfig[]) {
  const availableRarities = rarities
    .filter((rarity) => notes.some((note) => note.rarity === rarity.id))
    .map((rarity) => ({ ...rarity, weight: rarity.odds > 0 ? rarity.odds : 1 }))

  const totalWeight = availableRarities.reduce((sum, rarity) => sum + rarity.weight, 0)
  if (availableRarities.length === 0 || totalWeight <= 0) return pickRandomNote(notes)

  let cursor = Math.random() * totalWeight
  const selectedRarity = availableRarities.find((rarity) => {
    cursor -= rarity.weight
    return cursor <= 0
  }) ?? availableRarities[availableRarities.length - 1]

  const rarityNotes = notes.filter((note) => note.rarity === selectedRarity.id)
  return pickRandomNote(rarityNotes.length > 0 ? rarityNotes : notes)
}

function simulatePackOpening(pack: CollectionPack, notes: NoteRecord[], rarities: RarityConfig[]): PackSimulation | null {
  const eligibleNotes = notes.filter((note) =>
    (pack.allowedTypeIds.length === 0 || pack.allowedTypeIds.includes(note.typeId)) &&
    (pack.allowedRarityIds.length === 0 || pack.allowedRarityIds.includes(note.rarity)),
  )

  if (eligibleNotes.length === 0) return null

  const rewards: NoteRecord[] = []
  const guaranteedPool = pack.guaranteedRarityId
    ? eligibleNotes.filter((note) => note.rarity === pack.guaranteedRarityId)
    : []

  if (pack.guaranteedRarityId && guaranteedPool.length > 0) {
    rewards.push(pickRandomNote(guaranteedPool))
  }

  while (rewards.length < pack.cardsPerOpen) {
    rewards.push(pickWeightedNote(eligibleNotes, rarities))
  }

  return {
    pack,
    rewards,
    eligibleCount: eligibleNotes.length,
    guaranteedApplied: Boolean(pack.guaranteedRarityId && guaranteedPool.length > 0),
  }
}

function PackPreviewCard({ pack, view, onEdit, onDelete, onSimulate, onSetPrimary }: {
  pack: CollectionPack
  view: PackView
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
      <Box sx={{
        p: compact ? 1.25 : 1.6,
        background: pack.gradient,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 15% 0%, rgba(255,255,255,0.58), transparent 38%), radial-gradient(circle at 100% 100%, ${pack.accent}44, transparent 40%)`,
          pointerEvents: 'none',
        }} />
        <Stack direction="row" alignItems="center" spacing={1.1} sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{
            width: compact ? 38 : 44,
            height: compact ? 38 : 44,
            borderRadius: radius.lg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.62)',
            border: '1px solid rgba(255,255,255,0.78)',
            boxShadow: `0 6px 18px ${pack.accent}24`,
            fontSize: compact ? '1.25rem' : '1.45rem',
          }}>
            {pack.emoji}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={0.7} alignItems="flex-start" sx={{ mb: 0.25 }}>
              <Typography sx={{
                flex: 1,
                minWidth: 0,
                fontFamily: font.serif,
                fontWeight: 800,
                fontSize: compact ? '0.92rem' : '1rem',
                color: colors.text.primary,
                lineHeight: 1.15,
                display: '-webkit-box',
                WebkitLineClamp: compact ? 1 : 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
              }}>
                {pack.name}
              </Typography>
              <Chip
                label={isPrimary ? 'Principal' : PACK_STATUS_LABELS[pack.status]}
                size="small"
                sx={{
                  height: 19,
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  background: isPrimary ? '#fef3c7' : isActive ? '#dcfce7' : 'rgba(255,255,255,0.62)',
                  color: isPrimary ? '#b45309' : isActive ? '#15803d' : colors.text.secondary,
                  flexShrink: 0,
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            </Stack>
            <Typography sx={{
              fontSize: compact ? '0.7rem' : '0.76rem',
              color: colors.text.secondary,
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: compact ? 2 : 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
            }}>
              {pack.description}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: compact ? 1.25 : 1.6 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : 'repeat(3, 1fr)', gap: 0.8, mb: compact ? 1 : 1.2 }}>
          {[
            ['Cartas', `${pack.cardsPerOpen}`],
            ['Cooldown', formatCooldown(pack.cooldownHours)],
            ['Distribuição', PACK_DISTRIBUTION_LABELS[pack.distribution]],
          ].map(([label, value]) => (
            <Box key={label} sx={{
              p: compact ? 0.75 : 0.9,
              borderRadius: radius.md,
              background: `${pack.accent}0f`,
              border: `1px solid ${pack.accent}18`,
              display: compact ? 'flex' : 'block',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.25 }}>
                {label}
              </Typography>
              <Typography sx={{
                fontSize: compact ? '0.68rem' : '0.7rem',
                fontWeight: 800,
                color: pack.accent,
                lineHeight: 1.15,
                textAlign: compact ? 'right' : 'left',
                minWidth: 0,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
              }}>
                {value}
              </Typography>
            </Box>
          ))}
        </Box>

        <Stack spacing={0.75}>
          <Typography sx={{ fontSize: '0.70rem', fontWeight: 900, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Regras
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.55, flexWrap: 'wrap' }}>
            {rules.map((rule) => (
              <Box key={rule} sx={{
                px: 0.9,
                py: 0.35,
                borderRadius: radius.full,
                background: 'rgba(0,0,0,0.035)',
                border: '1px solid rgba(0,0,0,0.045)',
                color: colors.text.secondary,
                fontSize: '0.72rem',
                fontWeight: 750,
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {rule}
              </Box>
            ))}
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.6} justifyContent="flex-end" sx={{ mt: 1.3, flexWrap: 'wrap', rowGap: 0.6 }}>
          <IconButton
            size="small"
            aria-label={isPrimary ? 'pacotinho principal' : 'definir pacotinho principal'}
            onClick={() => !isPrimary && onSetPrimary(pack)}
            disabled={isPrimary}
            sx={actionButtonSx(isPrimary ? 'neutral' : 'primary')}
          >
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
  simulation: PackSimulation | null
  rarities: RarityConfig[]
  types: NoteTypeConfig[]
  onClose: () => void
  onSimulateAgain: () => void
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
          <Box sx={{
            p: 2,
            background: simulation.pack.gradient,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <Box sx={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle at 15% 0%, rgba(255,255,255,0.62), transparent 38%), radial-gradient(circle at 100% 100%, ${simulation.pack.accent}44, transparent 40%)`,
              pointerEvents: 'none',
            }} />
            {[0, 1, 2, 3, 4].map((item) => (
              <Box key={item} sx={{
                position: 'absolute',
                left: `${18 + item * 15}%`,
                bottom: 18 + (item % 2) * 14,
                width: 7,
                height: 7,
                borderRadius: radius.full,
                background: 'rgba(255,255,255,0.88)',
                boxShadow: `0 0 18px ${simulation.pack.accent}88`,
                animation: `${sparkleFloat} ${1.25 + item * 0.12}s ease-in-out infinite`,
                animationDelay: `${item * 0.15}s`,
              }} />
            ))}
            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{
                width: 46,
                height: 46,
                borderRadius: radius.lg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.64)',
                border: '1px solid rgba(255,255,255,0.78)',
                boxShadow: `0 8px 20px ${simulation.pack.accent}24`,
                fontSize: '1.45rem',
                animation: `${packOpening} 0.95s cubic-bezier(.2,.9,.2,1)`,
              }}>
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
              <Box sx={{
                py: 3.1,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                animation: `${openingSceneFade} 0.22s ease-out both`,
              }}>
                <Box sx={{
                  position: 'absolute',
                  left: '50%',
                  top: 112,
                  width: 190,
                  height: 190,
                  borderRadius: radius.full,
                  background: `radial-gradient(circle, ${simulation.pack.accent}24 0%, transparent 66%)`,
                  transform: 'translate(-50%,-50%)',
                  animation: `${burstRing} 1.55s ease-out infinite both`,
                  willChange: 'transform, opacity',
                  pointerEvents: 'none',
                }} />
                <Box sx={{ position: 'relative', width: 210, height: 188, mx: 'auto', perspective: 680, transform: 'translateZ(0)' }}>
                  {[
                    { x: '-46px', y: '78px', r: '-16deg', delay: '0.28s' },
                    { x: '0px', y: '92px', r: '2deg', delay: '0.38s' },
                    { x: '46px', y: '78px', r: '16deg', delay: '0.48s' },
                  ].map((card, index) => (
                    <Box key={index} sx={{
                      '--x': card.x,
                      '--y': card.y,
                      '--r': card.r,
                      position: 'absolute',
                      left: '50%',
                      bottom: 24,
                      width: 54,
                      height: 76,
                      borderRadius: 2.2,
                      background: 'linear-gradient(135deg,#ffffff,#fff7ed)',
                      border: `1.5px solid ${simulation.pack.accent}42`,
                      boxShadow: `0 12px 26px ${simulation.pack.accent}20`,
                      animation: `${cardEject} 1.2s cubic-bezier(.18,.95,.22,1) both`,
                      animationDelay: card.delay,
                      opacity: 0,
                      overflow: 'hidden',
                      willChange: 'transform, opacity',
                      backfaceVisibility: 'hidden',
                      transform: 'translateZ(0)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 7,
                        borderRadius: 1.5,
                        border: `1px solid ${simulation.pack.accent}24`,
                        background: `radial-gradient(circle at 50% 20%, ${simulation.pack.accent}20, transparent 48%)`,
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        width: 16,
                        height: 16,
                        borderRadius: radius.full,
                        background: `${simulation.pack.accent}18`,
                        transform: 'translate(-50%,-50%)',
                      },
                    }} />
                  ))}

                  <Box sx={{
                    position: 'absolute',
                    left: '50%',
                    bottom: 8,
                    width: 132,
                    height: 132,
                    transform: 'translateX(-50%)',
                    animation: `${packOpeningCentered} 1.24s cubic-bezier(.2,.9,.2,1) both`,
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                  }}>
                    <Box sx={{
                      position: 'absolute',
                      left: 7,
                      right: 7,
                      top: 4,
                      height: 44,
                      borderRadius: `${radius.xl} ${radius.xl} ${radius.md} ${radius.md}`,
                      background: simulation.pack.gradient,
                      border: '2px solid rgba(255,255,255,0.86)',
                      transformOrigin: '50% 100%',
                      animation: `${packFlap} 1.2s cubic-bezier(.2,.85,.2,1) both`,
                      boxShadow: `0 10px 22px ${simulation.pack.accent}28`,
                      zIndex: 3,
                      willChange: 'transform',
                      backfaceVisibility: 'hidden',
                    }} />
                    <Box sx={{
                      position: 'absolute',
                      inset: '24px 0 0',
                      borderRadius: radius.xl,
                      background: simulation.pack.gradient,
                      border: '2px solid rgba(255,255,255,0.86)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3.15rem',
                      zIndex: 2,
                      boxShadow: `0 18px 34px ${simulation.pack.accent}28`,
                      willChange: 'transform',
                      backfaceVisibility: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(circle at 20% 0%, rgba(255,255,255,0.72), transparent 38%), radial-gradient(circle at 90% 100%, ${simulation.pack.accent}34, transparent 42%)`,
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: -42,
                        background: 'linear-gradient(100deg, transparent 28%, rgba(255,255,255,0.88) 48%, transparent 68%)',
                        animation: `${shineSweep} 1.28s ease-in-out infinite both`,
                        animationDelay: '0.12s',
                        willChange: 'transform',
                      },
                    }}>
                      <Box sx={{ position: 'relative', zIndex: 1 }}>{simulation.pack.emoji}</Box>
                    </Box>
                  </Box>
                </Box>
                <Typography sx={{ mt: 1.1, fontFamily: font.serif, fontSize: '1rem', fontWeight: 800, color: colors.text.primary }}>
                  Abrindo o pacotinho
                </Typography>
                <Typography sx={{ mt: 0.35, fontSize: '0.76rem', color: colors.text.muted }}>
                  As cartinhas estão saindo do potinho...
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.1} sx={{ animation: `${openingSceneFade} 0.2s ease-out both` }}>
                {simulation.guaranteedApplied && (
                  <Box sx={{
                    px: 1.1,
                    py: 0.7,
                    borderRadius: radius.md,
                    background: `${simulation.pack.accent}12`,
                    border: `1px solid ${simulation.pack.accent}24`,
                    color: simulation.pack.accent,
                    fontSize: '0.74rem',
                    fontWeight: 800,
                  }}>
                    Garantia aplicada nesta simulação.
                  </Box>
                )}

                {simulation.rewards.map((note, index) => {
                  const rarity = rarities.find((item) => item.id === note.rarity)
                  const type = types.find((item) => item.id === note.typeId)
                  return (
                    <Box key={`${note.id}-${index}`} sx={{
                      p: 1.25,
                      borderRadius: radius.lg,
                      background: rarity?.cardBg ?? colors.surface.overlay,
                      border: `1.5px solid ${rarity?.borderColor ?? colors.border.subtle}`,
                      boxShadow: rarity?.glowColor
                        ? `${rarity.shadow}, 0 0 22px ${rarity.glowColor}`
                        : rarity?.shadow,
                      opacity: 0,
                      animation: `${rewardReveal} 0.42s cubic-bezier(.2,.85,.2,1) forwards`,
                      animationDelay: `${index * 0.12}s`,
                    }}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <Box sx={{
                          width: 28,
                          height: 28,
                          borderRadius: radius.md,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: rarity?.chipBg ?? 'rgba(0,0,0,0.04)',
                          color: rarity?.chipColor ?? colors.text.secondary,
                          fontSize: '0.78rem',
                          fontWeight: 900,
                          flexShrink: 0,
                        }}>
                          {index + 1}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontFamily: font.serif, fontSize: '0.92rem', fontWeight: 800, color: rarity?.textColor ?? colors.text.primary, mb: 0.2 }}>
                            {note.title}
                          </Typography>
                          <Typography sx={{ fontSize: '0.74rem', color: rarity?.captionColor ?? colors.text.secondary, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.45 }}>
                            {note.message}
                          </Typography>
                          <Stack direction="row" spacing={0.5} sx={{ mt: 0.75, flexWrap: 'wrap', rowGap: 0.45 }}>
                            {rarity && (
                              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35, px: 0.75, py: 0.25, borderRadius: radius.full, background: rarity.chipBg, color: rarity.chipColor, border: `1px solid ${rarity.borderColor}`, fontSize: '0.70rem', fontWeight: 750 }}>
                                {rarity.emoji} {rarity.label}
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


export function CollectionManagePage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { theme } = useBackground()
  const { user } = useUser()
  const [tab, setTab] = useState<Tab>('notes')

  const { data: collections = [], isLoading: collectionsLoading } = useCollectionsQuery()
  const collection = collections.find((c) => slugify(c.name) === slug)
  const cid = collection?.id ?? ''
  const canManage = collection ? isCollectionOwner(collection, user?.id) : false

  useEffect(() => {
    if (collectionsLoading || !user) return
    if (!collection) return
    if (!canManage) {
      toast.info('Só o autor da coleção pode editá-la.')
      navigate(`/colecoes/${slug}`, { replace: true })
    }
  }, [collectionsLoading, user, collection, canManage, slug, navigate])

  const [search, setSearch] = useState('')
  const [rarityFilter, setRarityFilter] = useState<string>('all')
  const [noteSort, setNoteSort] = useState<NoteSort>('newest')
  const [noteView, setNoteView] = useState<NoteView>('cards')
  const [visibleNoteCount, setVisibleNoteCount] = useState(NOTE_PAGE_SIZE)
  const [packFilter, setPackFilter] = useState<PackFilter>('all')
  const [packView, setPackView] = useState<PackView>('cards')
  const [packDialogOpen, setPackDialogOpen] = useState(false)
  const [editingPack, setEditingPack] = useState<CollectionPack | null>(null)
  const [deletingPack, setDeletingPack] = useState<CollectionPack | null>(null)
  const [packSimulation, setPackSimulation] = useState<PackSimulation | null>(null)

  const [noteDialog, setNoteDialog] = useState(false)
  const [editingNote, setEditingNote] = useState<NoteRecord | null>(null)
  const [deletingNote, setDeletingNote] = useState<NoteRecord | null>(null)
  const [viewingNote, setViewingNote] = useState<ReadableNote | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importJson, setImportJson] = useState(DEFAULT_IMPORT_JSON)

  const [rarityDialogOpen, setRarityDialogOpen] = useState(false)
  const [editingRarity, setEditingRarity] = useState<RarityConfig | null>(null)
  const [deletingRarity, setDeletingRarity] = useState<RarityConfig | null>(null)

  const [typeDialogOpen, setTypeDialogOpen] = useState(false)
  const [editingType, setEditingType] = useState<NoteTypeConfig | null>(null)
  const [deletingType, setDeletingType] = useState<NoteTypeConfig | null>(null)

  const [achievementDialogOpen, setAchievementDialogOpen] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState<CollectionAchievement | null>(null)
  const [deletingAchievement, setDeletingAchievement] = useState<CollectionAchievement | null>(null)

  const [emailInput, setEmailInput] = useState('')
  const [packOpensDialog, setPackOpensDialog] = useState<{ email: string; pack: CollectionPack; currentOpens: number | undefined } | null>(null)
  const [packOpensInput, setPackOpensInput] = useState(1)

  const { data: notes = [], isLoading: notesLoading } = useCollectionNotesQuery(cid)
  const { data: rarities = [] } = useCollectionRaritiesQuery(cid)
  const { data: types = [] } = useCollectionTypesQuery(cid)
  const { data: packs = [], isLoading: packsLoading } = useCollectionPacksQuery(cid)
  const { data: achievements = [] } = useCollectionAchievementsQuery(cid)
  const { data: accesses = [], isLoading: accessLoading } = useCollectionAccessQuery(cid)
  const deleteNote = useDeleteCollectionNoteMutation(cid)
  const importNotes = useImportCollectionNotesMutation(cid)
  const deleteRarity = useDeleteCollectionRarityMutation(cid)
  const deleteType = useDeleteCollectionTypeMutation(cid)
  const updatePack = useUpdateCollectionPackMutation(cid)
  const deletePack = useDeleteCollectionPackMutation(cid)
  const createAchievement = useCreateCollectionAchievementMutation(cid)
  const deleteAchievement = useDeleteCollectionAchievementMutation(cid)
  const grantMutation = useGrantAccessMutation(cid)
  const addPackOpensMutation = useAddPackOpensMutation(cid)

  function addAchievementPreset(preset: typeof ACHIEVEMENT_PRESETS[number]) {
    const id = uniqueConfigId(preset.label, achievements.map((a) => a.id))
    createAchievement.mutate(
      { id, label: preset.label, emoji: preset.emoji, description: preset.description, conditionType: preset.conditionType, count: preset.count, rarityId: null, typeId: null, order: achievements.length + 1 },
      { onSuccess: () => toast.success('Conquista adicionada!'), onError: (e: Error) => toast.error(e.message || 'Erro ao adicionar.') },
    )
  }

  function confirmDeleteAchievement() {
    if (!deletingAchievement) return
    deleteAchievement.mutate(deletingAchievement.id, {
      onSuccess: () => { toast.success('Conquista excluída.'); setDeletingAchievement(null) },
      onError: (e: Error) => toast.error(e.message || 'Erro ao excluir.'),
    })
  }

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase()
    const rarityOrder = new Map(rarities.map((rarity) => [rarity.id, rarity.order]))
    const typeOrder = new Map(types.map((type) => [type.id, type.order]))
    const filtered = notes.filter((note) =>
      (rarityFilter === 'all' || note.rarity === rarityFilter) &&
      (q === '' || note.title.toLowerCase().includes(q) || note.message.toLowerCase().includes(q)),
    )
    return filtered.sort((a, b) => {
      if (noteSort === 'oldest') return (a.createdAt ?? '').localeCompare(b.createdAt ?? '') || a.title.localeCompare(b.title, 'pt-BR')
      if (noteSort === 'az') return a.title.localeCompare(b.title, 'pt-BR')
      if (noteSort === 'rarity') return (rarityOrder.get(b.rarity) ?? 0) - (rarityOrder.get(a.rarity) ?? 0) || a.title.localeCompare(b.title, 'pt-BR')
      if (noteSort === 'type') return (typeOrder.get(a.typeId) ?? 0) - (typeOrder.get(b.typeId) ?? 0) || a.title.localeCompare(b.title, 'pt-BR')
      return (b.createdAt ?? '').localeCompare(a.createdAt ?? '') || a.title.localeCompare(b.title, 'pt-BR')
    })
  }, [noteSort, notes, rarities, rarityFilter, search, types])

  const visibleNotes = useMemo(
    () => filteredNotes.slice(0, visibleNoteCount),
    [filteredNotes, visibleNoteCount],
  )

  useEffect(() => {
    setVisibleNoteCount(NOTE_PAGE_SIZE)
  }, [noteSort, noteView, rarityFilter, search])

  const filteredPacks = useMemo(() => {
    return packs.filter((pack) => {
      if (packFilter === 'all') return true
      if (packFilter === 'active') return pack.status === 'active'
      if (packFilter === 'draft') return pack.status === 'draft'
      return pack.category === packFilter
    })
  }, [packs, packFilter])

  const accessBonusPacks = useMemo(
    () => packs.filter((pack) => pack.category !== 'daily' && pack.distribution !== 'all_with_access'),
    [packs],
  )

  async function handleGrant() {
    const email = emailInput.trim()
    if (!email) return
    try { await grantMutation.mutateAsync(email); setEmailInput(''); toast.success(`Acesso concedido para ${email}`) }
    catch (e) { toast.error((e as Error).message || 'Erro ao conceder acesso.') }
  }


  function openPackOpensDialog(email: string, pack: CollectionPack, currentOpens: number | undefined) {
    setPackOpensInput(1)
    setPackOpensDialog({ email, pack, currentOpens })
  }

  async function handleConfirmPackOpens() {
    if (!packOpensDialog) return
    const { email, pack } = packOpensDialog
    try {
      await addPackOpensMutation.mutateAsync({ email, packId: pack.id, opens: packOpensInput })
      toast.success('Brindes atualizados.')
      setPackOpensDialog(null)
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao atualizar brindes.')
    }
  }

  async function handleRemovePackAccess() {
    if (!packOpensDialog) return
    const { email, pack } = packOpensDialog
    try {
      await addPackOpensMutation.mutateAsync({ email, packId: pack.id, opens: 0 })
      toast.success('Acesso ao brinde removido.')
      setPackOpensDialog(null)
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao remover brinde.')
    }
  }

  const confirmDeleteNote = () => {
    if (!deletingNote) return
    deleteNote.mutate(deletingNote.id, {
      onSuccess: () => { toast.success('Bilhete removido.'); setDeletingNote(null) },
      onError: (e: Error) => toast.error(e.message || 'Erro ao remover bilhete.'),
    })
  }

  async function handleImportNotes() {
    try {
      JSON.parse(importJson)
    } catch {
      toast.error('JSON inválido. Revise vírgulas, aspas e colchetes.')
      return
    }

    try {
      const result = await importNotes.mutateAsync(importJson)
      toast.success(`${result.created} bilhete${result.created !== 1 ? 's' : ''} importado${result.created !== 1 ? 's' : ''}.`)
      setImportDialogOpen(false)
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao importar bilhetes.')
    }
  }
  const confirmDeleteRarity = () => {
    if (!deletingRarity) return
    deleteRarity.mutate(deletingRarity.id, {
      onSuccess: () => { toast.success('Raridade excluída.'); setDeletingRarity(null) },
      onError: (e: Error) => toast.error(e.message || 'Erro ao excluir raridade.'),
    })
  }
  const confirmDeleteType = () => {
    if (!deletingType) return
    deleteType.mutate(deletingType.id, {
      onSuccess: () => { toast.success('Tipo excluído.'); setDeletingType(null) },
      onError: (e: Error) => toast.error(e.message || 'Erro ao excluir tipo.'),
    })
  }
  const confirmDeletePack = () => {
    if (!deletingPack) return
    deletePack.mutate(deletingPack.id, {
      onSuccess: () => { toast.success('Pacotinho excluído.'); setDeletingPack(null) },
      onError: (error) => toast.error((error as Error).message || 'Erro ao excluir pacotinho.'),
    })
  }

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

  if (collectionsLoading || (collection && !canManage)) {
    return (
      <Box sx={{ height: '100%', position: 'relative', background: theme.gradient }}>
        <ScrollablePage sx={{ px: 2.5, py: 2.5 }}>
          <LoadingState label="Carregando coleção" accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} sx={{ minHeight: 360 }} />
        </ScrollablePage>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100%', position: 'relative', background: theme.gradient }}>
      <FavoriteIcon sx={{ position: 'absolute', bottom: -60, right: -60, fontSize: 400, color: 'rgba(225,29,72,0.04)', pointerEvents: 'none' }} />

      <ScrollablePage sx={{ px: 2.5, py: 2.5, animation: `${fadeIn} 0.35s ease` }}>
        <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 2.5 }}>
          <IconButton
            size="small"
            aria-label="voltar para coleções"
            onClick={() => navigate('/colecoes')}
            sx={{
              width: 38,
              height: 38,
              color: theme.textOnBg,
              background: 'rgba(255,255,255,0.5)',
              border: '1.5px solid rgba(255,255,255,0.66)',
              backdropFilter: 'blur(14px)',
              boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
              transition: 'transform 0.16s ease, background 0.16s ease, box-shadow 0.16s ease',
              '&:hover': {
                background: 'rgba(255,255,255,0.76)',
                transform: 'translateX(-2px) scale(1.04)',
                boxShadow: '0 10px 28px rgba(15,23,42,0.12)',
              },
              '&:active': {
                transform: 'translateX(-1px) scale(0.98)',
              },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 20, filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.6))' }} />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <PageTitle title={collection?.name ?? 'Gerenciar'} subtitle="Bilhetes, raridades, tipos, pacotinhos e acessos" />
          </Box>
        </Stack>

        <Box sx={{ mb: 2 }}>
          <SegmentedControl options={TABS} value={tab} onChange={setTab} />
        </Box>

        {tab === 'notes' && (
          <Stack spacing={1.5}>
            <Stack spacing={1}>
              <Typography sx={{ fontSize: '0.72rem', color: theme.textOnBgMuted, fontWeight: 600 }}>
                {notes.length} bilhete{notes.length !== 1 ? 's' : ''}
              </Typography>
              <Stack direction="row" spacing={0.8} alignItems="center" sx={{ flexWrap: 'wrap', rowGap: 0.8 }}>
                <Box sx={{ flex: '1 1 260px', minWidth: 230 }}>
                  <SegmentedControl options={NOTE_VIEW_OPTIONS} value={noteView} onChange={setNoteView} />
                </Box>
                <Button variant="ghost" onClick={() => setImportDialogOpen(true)} sx={{ flex: '1 1 132px', py: 0.7, px: 1.2, fontSize: '0.76rem', background: 'rgba(255,255,255,0.44)' }}>
                  Importar JSON
                </Button>
                <Button variant="primary" onClick={() => { setEditingNote(null); setNoteDialog(true) }} sx={{ flex: '1 1 94px', py: 0.7, px: 1.4, fontSize: '0.78rem' }}>
                  <AddIcon sx={{ fontSize: 15, mr: 0.4 }} /> Novo
                </Button>
              </Stack>
            </Stack>

            {notes.length > 0 && (
              <Stack spacing={1}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 1, px: 1.4, py: 0.7,
                  background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)',
                  border: '1.5px solid rgba(255,255,255,0.6)', borderRadius: radius.lg,
                }}>
                  <SearchIcon sx={{ fontSize: 17, color: colors.text.muted, flexShrink: 0 }} />
                  <Box component="input" value={search}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    placeholder="Buscar bilhete..."
                    sx={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.86rem', color: colors.text.primary, fontFamily: 'inherit', '&::placeholder': { color: colors.text.muted } }}
                  />
                  {search && (
                    <Box onClick={() => setSearch('')} sx={{ display: 'flex', cursor: 'pointer', color: colors.text.muted }}>
                      <CloseIcon sx={{ fontSize: 15 }} />
                    </Box>
                  )}
                </Box>
                {rarities.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
                    <Chip label="Todas" size="small" onClick={() => setRarityFilter('all')}
                      sx={{ height: 26, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                        bgcolor: rarityFilter === 'all' ? colors.primary.main : 'rgba(255,255,255,0.5)',
                        color: rarityFilter === 'all' ? '#fff' : colors.text.secondary }} />
                    {rarities.map((r) => (
                      <Chip key={r.id} label={`${r.emoji} ${r.label}`} size="small" onClick={() => setRarityFilter(r.id)}
                        sx={{ height: 26, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                          background: rarityFilter === r.id ? r.chipBg : 'rgba(255,255,255,0.5)',
                          color: rarityFilter === r.id ? r.chipColor : colors.text.secondary,
                          border: `1.5px solid ${rarityFilter === r.id ? r.borderColor : 'transparent'}` }} />
                    ))}
                  </Box>
                )}
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.7,
                  flexWrap: 'wrap',
                  px: 0.1,
                }}>
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: 0.6, color: theme.textOnBgMuted, textTransform: 'uppercase' }}>
                    Ordenar
                  </Typography>
                  {NOTE_SORT_OPTIONS.map((option) => (
                    <Chip
                      key={option.id}
                      label={option.label}
                      size="small"
                      onClick={() => setNoteSort(option.id)}
                      sx={{
                        height: 26,
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        bgcolor: noteSort === option.id ? colors.purple.main : 'rgba(255,255,255,0.5)',
                        color: noteSort === option.id ? '#fff' : colors.text.secondary,
                        border: `1.5px solid ${noteSort === option.id ? colors.purple.main : 'rgba(255,255,255,0.35)'}`,
                        '& .MuiChip-label': { px: 0.9 },
                      }}
                    />
                  ))}
                  <Typography sx={{ ml: 'auto', fontSize: '0.7rem', color: theme.textOnBgMuted, fontWeight: 700 }}>
                    {Math.min(visibleNoteCount, filteredNotes.length)} de {filteredNotes.length} exibido{filteredNotes.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Stack>
            )}

            {notesLoading && <LoadingState compact label="Carregando bilhetes" accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} />}

            {!notesLoading && notes.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography sx={{ fontFamily: font.serif, fontSize: '1rem', fontWeight: 700, color: theme.textOnBg, mb: 0.5 }}>
                  Nenhum bilhete ainda
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: theme.textOnBgMuted }}>Crie o primeiro card desta coleção</Typography>
              </Box>
            )}

            {!notesLoading && notes.length > 0 && filteredNotes.length === 0 && (
              <Typography sx={{ fontSize: '0.82rem', color: theme.textOnBgMuted, textAlign: 'center', py: 3 }}>
                Nenhum bilhete com esses filtros
              </Typography>
            )}

            {visibleNotes.map((note) => {
              const r = rarities.find((x) => x.id === note.rarity)
              const t = types.find((x) => x.id === note.typeId)
              if (noteView === 'compact') {
                return (
                  <Card key={note.id} accent={r?.borderColor} onClick={() => setViewingNote(note)} sx={{
                    p: 0,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: `1px solid ${r?.borderColor ?? colors.border.subtle}`,
                    background: 'rgba(255,255,255,0.74)',
                    boxShadow: '0 3px 10px rgba(15,23,42,0.05)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.9)',
                      boxShadow: '0 5px 14px rgba(15,23,42,0.08)',
                    },
                  }}>
                    <Stack direction="row" alignItems="center" spacing={0.8} sx={{ minHeight: 38, px: 1, py: 0.35 }}>
                      <Box sx={{ width: 6, height: 22, borderRadius: radius.full, background: r?.borderColor ?? colors.border.subtle, flexShrink: 0 }} />
                      <Typography sx={{
                        flex: 1,
                        minWidth: 0,
                        fontFamily: font.serif,
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        color: r?.textColor ?? colors.text.primary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {note.title}
                      </Typography>
                      <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0, opacity: 0.72 }}>
                        <IconButton
                          size="small"
                          aria-label="editar bilhete"
                          onClick={(event) => { event.stopPropagation(); setEditingNote(note); setNoteDialog(true) }}
                          sx={{ ...actionButtonSx('primary'), width: 28, height: 28 }}
                        >
                          <EditOutlinedIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label="excluir bilhete"
                          onClick={(event) => { event.stopPropagation(); setDeletingNote(note) }}
                          sx={{ ...actionButtonSx('danger'), width: 28, height: 28 }}
                        >
                          <DeleteForeverOutlinedIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Card>
                )
              }
              if (noteView === 'list') {
                return (
                  <Card key={note.id} accent={r?.borderColor} onClick={() => setViewingNote(note)} sx={{
                    p: 0,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: `1.5px solid ${r?.borderColor ?? colors.border.subtle}`,
                    background: 'rgba(255,255,255,0.78)',
                    boxShadow: '0 6px 18px rgba(15,23,42,0.07)',
                    transition: 'transform 0.16s ease, box-shadow 0.16s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: `0 8px 24px ${r?.glowColor || 'rgba(15,23,42,0.1)'}`,
                    },
                  }}>
                    <Stack direction="row" alignItems="stretch" sx={{ minHeight: 74 }}>
                      <Box sx={{ width: 5, flexShrink: 0, background: r ? `linear-gradient(180deg,${r.borderColor},${r.glowColor || r.borderColor})` : colors.border.subtle }} />
                      <Box sx={{ flex: 1, minWidth: 0, px: 1.25, py: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack direction="row" spacing={0.6} alignItems="center" sx={{ minWidth: 0 }}>
                              <Typography sx={{
                                fontFamily: font.serif,
                                fontWeight: 800,
                                fontSize: '0.92rem',
                                color: r?.textColor ?? colors.text.primary,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}>
                                {note.title}
                              </Typography>
                              {r && (
                                <Box sx={{ px: 0.65, py: 0.15, borderRadius: radius.full, background: r.chipBg, color: r.chipColor, border: `1px solid ${r.borderColor}`, fontSize: '0.68rem', fontWeight: 850, flexShrink: 0 }}>
                                  {r.emoji}
                                </Box>
                              )}
                              {t && (
                                <Box sx={{ px: 0.65, py: 0.15, borderRadius: radius.full, background: t.tagBg, color: t.tagColor, border: `1px solid ${t.accentColor}33`, fontSize: '0.68rem', fontWeight: 850, flexShrink: 0 }}>
                                  {t.emoji}
                                </Box>
                              )}
                            </Stack>
                            <Typography sx={{
                              mt: 0.25,
                              fontSize: '0.74rem',
                              color: r?.captionColor ?? colors.text.secondary,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {note.message}
                            </Typography>
                            <Typography sx={{ mt: 0.35, fontSize: '0.70rem', color: colors.text.muted, fontWeight: 700 }}>
                              {[r?.label, t?.label].filter(Boolean).join(' · ') || 'Sem categoria'}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={0.4} sx={{ flexShrink: 0 }}>
                            <IconButton
                              size="small"
                              aria-label="editar bilhete"
                              onClick={(event) => { event.stopPropagation(); setEditingNote(note); setNoteDialog(true) }}
                              sx={actionButtonSx('primary')}
                            >
                              <EditOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              aria-label="excluir bilhete"
                              onClick={(event) => { event.stopPropagation(); setDeletingNote(note) }}
                              sx={actionButtonSx('danger')}
                            >
                              <DeleteForeverOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>
                  </Card>
                )
              }
              return (
                <Card key={note.id} accent={r?.borderColor} onClick={() => setViewingNote(note)} sx={{
                  p: 0,
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer',
                  background: r?.cardBg ?? colors.surface.base,
                  border: `1.5px solid ${r?.borderColor ?? colors.border.subtle}`,
                  boxShadow: r?.glowColor
                    ? `${r.shadow}, 0 0 26px ${r.glowColor}`
                    : r?.shadow,
                  '&::before': r ? {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    background: `radial-gradient(circle at 10% 0%, rgba(255,255,255,0.46), transparent 34%), radial-gradient(circle at 100% 100%, ${r.glowColor || r.borderColor}, transparent 34%)`,
                    opacity: 0.42,
                    mixBlendMode: 'soft-light',
                  } : undefined,
                }}>
                  <Box sx={{ height: '3px', background: r ? `linear-gradient(90deg,${r.borderColor},${r.glowColor || r.borderColor})` : colors.border.subtle, position: 'relative', zIndex: 1 }} />
                  <Box sx={{ p: 1.8, position: 'relative', zIndex: 1 }}>
                    <Stack spacing={0.8}>
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          aria-label="editar bilhete"
                          onClick={(event) => { event.stopPropagation(); setEditingNote(note); setNoteDialog(true) }}
                          sx={actionButtonSx('primary')}
                        >
                          <EditOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label="excluir bilhete"
                          onClick={(event) => { event.stopPropagation(); setDeletingNote(note) }}
                          sx={actionButtonSx('danger')}
                        >
                          <DeleteForeverOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Stack>
                      <Box sx={{
                        flex: 1,
                        minWidth: 0,
                        p: 1,
                        borderRadius: radius.lg,
                        background: 'rgba(255,255,255,0.68)',
                        border: '1px solid rgba(255,255,255,0.58)',
                        backdropFilter: 'blur(8px)',
                      }}>
                        <Typography sx={{
                          fontFamily: font.serif,
                          fontWeight: 700,
                          fontSize: '0.93rem',
                          color: r?.textColor ?? colors.text.primary,
                          mb: 0.3,
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          overflowWrap: 'anywhere',
                          wordBreak: 'break-word',
                        }}>
                          {note.title}
                        </Typography>
                        <Typography sx={{
                          fontSize: '0.78rem',
                          color: r?.captionColor ?? colors.text.secondary,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.5,
                          overflowWrap: 'anywhere',
                          wordBreak: 'break-word',
                        }}>
                          {note.message}
                        </Typography>
                        {(r || t) && (
                          <Stack direction="row" spacing={0.6} sx={{ mt: 0.9, flexWrap: 'wrap', rowGap: 0.5 }}>
                            {r && (
                              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, px: 1, py: 0.3, borderRadius: radius.full, background: r.chipBg, color: r.chipColor, border: `1px solid ${r.borderColor}`, fontSize: '0.72rem', fontWeight: 700 }}>
                                {r.emoji} {r.label}
                              </Box>
                            )}
                            {t && (
                              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, px: 1, py: 0.3, borderRadius: radius.full, background: t.tagBg, color: t.tagColor, border: `1px solid ${t.accentColor}44`, fontSize: '0.72rem', fontWeight: 700 }}>
                                {t.emoji} {t.label}
                              </Box>
                            )}
                          </Stack>
                        )}
                      </Box>
                    </Stack>
                  </Box>
                </Card>
              )
            })}

            {!notesLoading && filteredNotes.length > visibleNotes.length && (
              <Button
                variant="ghost"
                onClick={() => setVisibleNoteCount((count) => count + NOTE_PAGE_SIZE)}
                sx={{
                  alignSelf: 'center',
                  mt: 0.5,
                  px: 1.6,
                  py: 0.8,
                  fontSize: '0.78rem',
                  background: 'rgba(255,255,255,0.5)',
                }}
              >
                Mostrar mais {Math.min(NOTE_PAGE_SIZE, filteredNotes.length - visibleNotes.length)} bilhetes
              </Button>
            )}
          </Stack>
        )}

        {tab === 'rarities' && (
          <Stack spacing={1.4}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontSize: '0.72rem', color: theme.textOnBgMuted, fontWeight: 600 }}>
                {rarities.length} raridade{rarities.length !== 1 ? 's' : ''}
              </Typography>
              <Button variant="primary" onClick={() => { setEditingRarity(null); setRarityDialogOpen(true) }} sx={{ py: 0.7, px: 1.4, fontSize: '0.78rem' }}>
                <AddIcon sx={{ fontSize: 15, mr: 0.4 }} /> Nova
              </Button>
            </Stack>
            {rarities.length === 0 && (
              <Typography sx={{ fontSize: '0.85rem', color: theme.textOnBgMuted, textAlign: 'center', py: 3 }}>
                Nenhuma raridade. Toque em “Nova” para criar.
              </Typography>
            )}
            {rarities.map((r) => (
              <Card key={r.id} sx={{ p: 0, overflow: 'hidden', background: r.cardBg, border: `1.5px solid ${r.borderColor}`, boxShadow: r.shadow }}>
                <Box sx={{ py: 1.4, px: 1.8 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                    <Box onClick={() => { setEditingRarity(r); setRarityDialogOpen(true) }} sx={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={`${r.emoji} ${r.label.toUpperCase()}`} size="small"
                        sx={{ height: 20, fontSize: '0.72rem', fontWeight: 700, background: r.chipBg, color: r.chipColor, '& .MuiChip-label': { px: 0.9 } }} />
                      <Typography sx={{ fontSize: '0.78rem', color: r.captionColor, fontWeight: 600 }}>{r.odds}% de chance</Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" aria-label="editar raridade" onClick={() => { setEditingRarity(r); setRarityDialogOpen(true) }} sx={actionButtonSx('primary')}>
                        <EditOutlinedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton size="small" aria-label="excluir raridade" onClick={() => setDeletingRarity(r)} sx={actionButtonSx('danger')}>
                        <DeleteForeverOutlinedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Box>
              </Card>
            ))}
          </Stack>
        )}

        {tab === 'types' && (
          <Stack spacing={1.4}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontSize: '0.72rem', color: theme.textOnBgMuted, fontWeight: 600 }}>
                {types.length} tipo{types.length !== 1 ? 's' : ''}
              </Typography>
              <Button variant="primary" onClick={() => { setEditingType(null); setTypeDialogOpen(true) }} sx={{ py: 0.7, px: 1.4, fontSize: '0.78rem' }}>
                <AddIcon sx={{ fontSize: 15, mr: 0.4 }} /> Novo
              </Button>
            </Stack>
            {types.length === 0 && (
              <Typography sx={{ fontSize: '0.85rem', color: theme.textOnBgMuted, textAlign: 'center', py: 3 }}>
                Nenhum tipo. Toque em “Novo” para criar.
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
                      <IconButton size="small" aria-label="excluir tipo" onClick={() => setDeletingType(t)} sx={actionButtonSx('danger')}>
                        <DeleteForeverOutlinedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Box>
              </Card>
            ))}
          </Stack>
        )}

        {tab === 'packs' && (
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
                    <Chip
                      key={filter.id}
                      label={filter.label}
                      size="small"
                      onClick={() => setPackFilter(filter.id)}
                      sx={{
                        height: 26,
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: active ? colors.primary.main : 'rgba(255,255,255,0.5)',
                        color: active ? '#fff' : colors.text.secondary,
                        border: `1.5px solid ${active ? colors.primary.main : 'rgba(255,255,255,0.55)'}`,
                        backdropFilter: 'blur(10px)',
                      }}
                    />
                  )
                })}
              </Box>
            </Stack>

            <Card sx={{ p: 1.7, background: 'rgba(255,255,255,0.64)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.62)' }}>
              <Box>
                <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '0.98rem', color: colors.text.primary }}>
                  Como vai funcionar
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: colors.text.secondary, lineHeight: 1.55 }}>
                  Um pacotinho será uma regra de abertura dentro da coleção: quantidade de bilhetes, cooldown, filtros por tipo/raridade e formas de distribuição.
                </Typography>
              </Box>
            </Card>

            {packsLoading && <LoadingState compact label="Carregando pacotinhos" accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} />}

            {!packsLoading && packs.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography sx={{ fontFamily: font.serif, fontSize: '1rem', fontWeight: 700, color: theme.textOnBg, mb: 0.5 }}>
                  Nenhum pacotinho ainda
                </Typography>
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
                  onDelete={setDeletingPack}
                  onSimulate={handleSimulatePack}
                  onSetPrimary={handleSetPrimaryPack}
                />
              ))}
            </Stack>
            )}
          </Stack>
        )}

        {tab === 'achievements' && (
          <Stack spacing={1.4}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontSize: '0.72rem', color: theme.textOnBgMuted, fontWeight: 600 }}>
                {achievements.length} conquista{achievements.length !== 1 ? 's' : ''}
              </Typography>
              <Button variant="primary" onClick={() => { setEditingAchievement(null); setAchievementDialogOpen(true) }} sx={{ py: 0.7, px: 1.4, fontSize: '0.78rem' }}>
                <AddIcon sx={{ fontSize: 15, mr: 0.4 }} /> Nova
              </Button>
            </Stack>

            <Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.5, color: theme.textOnBgMuted, textTransform: 'uppercase', mb: 0.7 }}>
                Adicionar rápido
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.6, overflowX: 'auto', pb: 0.4, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                {ACHIEVEMENT_PRESETS.filter((p) => !achievements.some((a) => a.label === p.label)).map((p) => (
                  <Box
                    key={p.label}
                    onClick={() => addAchievementPreset(p)}
                    sx={{
                      flexShrink: 0, px: 1.05, py: 0.55, borderRadius: radius.full, cursor: 'pointer',
                      fontSize: '0.74rem', fontWeight: 800, color: theme.textOnBg,
                      background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.62)', backdropFilter: 'blur(10px)',
                    }}
                  >
                    + {p.emoji} {p.label}
                  </Box>
                ))}
              </Box>
            </Box>

            {achievements.length === 0 && (
              <Typography sx={{ fontSize: '0.85rem', color: theme.textOnBgMuted, textAlign: 'center', py: 3 }}>
                Nenhuma conquista. Use “Adicionar rápido” ou “Nova”.
              </Typography>
            )}
            {achievements.map((a) => (
              <Card key={a.id} sx={{ p: 0, overflow: 'hidden' }}>
                <Box sx={{ py: 1.3, px: 1.8 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                    <Box onClick={() => { setEditingAchievement(a); setAchievementDialogOpen(true) }} sx={{ flex: 1, minWidth: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.3 }}>
                      <Box sx={{ width: 38, height: 38, flexShrink: 0, borderRadius: radius.full, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', background: `linear-gradient(135deg,${colors.primary.main}22,${colors.primary.main}44)`, border: `1px solid ${colors.primary.main}33` }}>
                        {a.emoji}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '0.92rem', color: colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {a.label}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: colors.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {a.description || a.conditionType}
                        </Typography>
                      </Box>
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" aria-label="editar conquista" onClick={() => { setEditingAchievement(a); setAchievementDialogOpen(true) }} sx={actionButtonSx('primary')}>
                        <EditOutlinedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton size="small" aria-label="excluir conquista" onClick={() => setDeletingAchievement(a)} sx={actionButtonSx('danger')}>
                        <DeleteForeverOutlinedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Box>
              </Card>
            ))}
          </Stack>
        )}

        {tab === 'access' && (
          <Stack spacing={2}>
            <Card sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.8, color: colors.text.muted, textTransform: 'uppercase' }}>
                  Convidar por email
                </Typography>
                <Stack direction="row" spacing={1} alignItems="flex-end">
                  <Input type="email" placeholder="email@exemplo.com" value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { fontSize: '0.84rem' }, '& input': { py: 0.75 } }} />
                  <Button variant="primary" loading={grantMutation.isPending} onClick={handleGrant} disabled={!emailInput.trim()} sx={{ py: 0.85, px: 1.5, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    <PersonAddIcon sx={{ fontSize: 16, mr: 0.4 }} /> Convidar
                  </Button>
                </Stack>
              </Stack>
            </Card>

            {accessLoading && <LoadingState compact label="Carregando acessos" accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} />}

            {!accessLoading && accesses.length === 0 && (
              <Typography sx={{ fontSize: '0.82rem', color: theme.textOnBgMuted, textAlign: 'center', py: 2 }}>
                Nenhum acesso concedido ainda
              </Typography>
            )}

            {accesses.map((a) => (
              <Card key={a.email} sx={{ p: 1.8 }}>
                <Stack spacing={1.4}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ width: 36, height: 36, borderRadius: radius.md, background: `linear-gradient(135deg,${colors.primary.main},${colors.rose.main})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Typography sx={{ fontFamily: font.serif, fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
                        {a.email[0].toUpperCase()}
                      </Typography>
                    </Box>
                    <Typography sx={{ flex: 1, fontSize: '0.84rem', color: colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.email}
                    </Typography>
                    <IconButton size="small" aria-label="ver coleção" onClick={() => navigate(`/colecoes/${slug}/gerenciar/leitores/${encodeURIComponent(a.email)}`)} sx={{ ...actionButtonSx('neutral'), flexShrink: 0 }}>
                      <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                  </Stack>

                  {accessBonusPacks.length > 0 && (
                    <Stack spacing={0.8}>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.7, color: colors.text.muted, textTransform: 'uppercase' }}>
                        Brindes liberados
                      </Typography>
                      <Stack direction="row" spacing={0.7} sx={{ flexWrap: 'wrap', rowGap: 0.7 }}>
                        {accessBonusPacks.map((pack) => {
                          const opens = a.packOpens?.[pack.id]
                          const selected = opens !== undefined
                          const label = selected
                            ? `${pack.emoji} ${pack.name} (${opens})`
                            : `${pack.emoji} ${pack.name}`
                          return (
                            <Chip
                              key={pack.id}
                              label={label}
                              onClick={() => openPackOpensDialog(a.email, pack, opens)}
                              disabled={addPackOpensMutation.isPending}
                              sx={{
                                maxWidth: '100%',
                                height: 28,
                                borderRadius: radius.full,
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                color: selected ? '#fff' : pack.accent,
                                background: selected ? pack.accent : `${pack.accent}12`,
                                border: `1px solid ${pack.accent}${selected ? '00' : '33'}`,
                                '& .MuiChip-label': {
                                  px: 1,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                },
                                '&:hover': {
                                  background: selected ? pack.accent : `${pack.accent}1f`,
                                },
                              }}
                            />
                          )
                        })}
                      </Stack>
                    </Stack>
                  )}
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </ScrollablePage>

      <Dialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: radius.xl, mx: 2, background: 'rgba(255,253,251,0.98)' } } }}
      >
        <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 800, color: colors.text.primary, pb: 0.5 }}>
          Importar bilhetes por JSON
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={1.3}>
            <Typography sx={{ fontSize: '0.82rem', color: colors.text.secondary, lineHeight: 1.5 }}>
              Cole uma lista de bilhetes. Cada item precisa ter <strong>title</strong>, <strong>message</strong>, <strong>rarity</strong> e <strong>typeId</strong>.
            </Typography>
            <TextField
              multiline
              minRows={10}
              value={importJson}
              onChange={(event) => setImportJson(event.target.value)}
              fullWidth
              spellCheck={false}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: radius.lg,
                  background: colors.surface.base,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '0.75rem',
                  alignItems: 'flex-start',
                },
              }}
            />
            <Box sx={{ p: 1.1, borderRadius: radius.lg, background: `${theme.accent}10`, border: `1px solid ${theme.accent}24` }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: theme.accent, mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.7 }}>
                IDs aceitos
              </Typography>
              <Typography sx={{ fontSize: '0.74rem', color: colors.text.secondary, lineHeight: 1.5 }}>
                Raridades: {rarities.map((rarity) => rarity.id).join(', ') || 'crie uma raridade primeiro'}
              </Typography>
              <Typography sx={{ fontSize: '0.74rem', color: colors.text.secondary, lineHeight: 1.5 }}>
                Tipos: {types.map((type) => type.id).join(', ') || 'crie um tipo primeiro'}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="ghost" onClick={() => setImportDialogOpen(false)} sx={{ flex: 1 }}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            loading={importNotes.isPending}
            disabled={!importJson.trim() || importNotes.isPending}
            onClick={handleImportNotes}
            sx={{ flex: 1 }}
          >
            Importar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!packOpensDialog}
        onClose={() => setPackOpensDialog(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: radius.xl, mx: 2, background: 'rgba(255,253,251,0.98)' } } }}
      >
        <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 800, color: colors.text.primary, pb: 0.5 }}>
          {packOpensDialog ? `${packOpensDialog.pack.emoji} ${packOpensDialog.pack.name}` : ''}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={1.5}>
            {packOpensDialog?.currentOpens !== undefined && (
              <Typography sx={{ fontSize: '0.82rem', color: colors.text.secondary }}>
                Aberturas atuais: <strong>{packOpensDialog.currentOpens}</strong>
              </Typography>
            )}
            <TextField
              label="Quantas aberturas adicionar"
              type="number"
              value={packOpensInput}
              onChange={(e) => setPackOpensInput(Math.max(1, Number(e.target.value)))}
              inputProps={{ min: 1 }}
              fullWidth
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: radius.lg } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: 'wrap' }}>
          {packOpensDialog?.currentOpens !== undefined && (
            <Button
              variant="ghost"
              loading={addPackOpensMutation.isPending}
              onClick={handleRemovePackAccess}
              sx={{ flex: '1 1 100%', color: 'error.main' }}
            >
              Remover brinde
            </Button>
          )}
          <Button variant="ghost" onClick={() => setPackOpensDialog(null)} sx={{ flex: 1 }}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            loading={addPackOpensMutation.isPending}
            disabled={packOpensInput < 1 || addPackOpensMutation.isPending}
            onClick={handleConfirmPackOpens}
            sx={{ flex: 1 }}
          >
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      <NoteDialog open={noteDialog} editing={editingNote} rarities={rarities} types={types} cid={cid} onClose={() => { setNoteDialog(false); setEditingNote(null) }} />

      <Dialog open={rarityDialogOpen} onClose={() => { setRarityDialogOpen(false); setEditingRarity(null) }} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: radius.xl } } }}>
        {rarityDialogOpen && <RarityEditor key={editingRarity?.id ?? 'new'} cid={cid} rarity={editingRarity} onClose={() => { setRarityDialogOpen(false); setEditingRarity(null) }} />}
      </Dialog>

      <Dialog open={typeDialogOpen} onClose={() => { setTypeDialogOpen(false); setEditingType(null) }} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: radius.xl } } }}>
        {typeDialogOpen && <TypeEditor key={editingType?.id ?? 'new'} cid={cid} type={editingType} onClose={() => { setTypeDialogOpen(false); setEditingType(null) }} />}
      </Dialog>

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

      <Dialog open={achievementDialogOpen} onClose={() => { setAchievementDialogOpen(false); setEditingAchievement(null) }} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: radius.xl } } }}>
        {achievementDialogOpen && (
          <AchievementEditor
            key={editingAchievement?.id ?? 'new'}
            cid={cid}
            achievement={editingAchievement}
            rarities={rarities}
            types={types}
            onClose={() => { setAchievementDialogOpen(false); setEditingAchievement(null) }}
          />
        )}
      </Dialog>

      <ConfirmDeleteDialog open={!!deletingNote} label={`o bilhete “${deletingNote?.title ?? ''}”`} isPending={deleteNote.isPending} onConfirm={confirmDeleteNote} onClose={() => setDeletingNote(null)} />
      <ConfirmDeleteDialog open={!!deletingRarity} label={`a raridade “${deletingRarity?.label ?? ''}”`} isPending={deleteRarity.isPending} onConfirm={confirmDeleteRarity} onClose={() => setDeletingRarity(null)} />
      <ConfirmDeleteDialog open={!!deletingType} label={`o tipo “${deletingType?.label ?? ''}”`} isPending={deleteType.isPending} onConfirm={confirmDeleteType} onClose={() => setDeletingType(null)} />
      <ConfirmDeleteDialog open={!!deletingPack} label={`o pacotinho “${deletingPack?.name ?? ''}”`} isPending={deletePack.isPending} onConfirm={confirmDeletePack} onClose={() => setDeletingPack(null)} />
      <ConfirmDeleteDialog open={!!deletingAchievement} label={`a conquista “${deletingAchievement?.label ?? ''}”`} isPending={deleteAchievement.isPending} onConfirm={confirmDeleteAchievement} onClose={() => setDeletingAchievement(null)} />
      <NoteDetailDialog note={viewingNote} rarities={rarities} types={types} onClose={() => setViewingNote(null)} />
      <PackSimulationDialog
        simulation={packSimulation}
        rarities={rarities}
        types={types}
        onClose={() => setPackSimulation(null)}
        onSimulateAgain={() => packSimulation && handleSimulatePack(packSimulation.pack)}
      />
    </Box>
  )
}
