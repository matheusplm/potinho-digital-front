import AddIcon from '@mui/icons-material/Add'
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda'
import ViewListIcon from '@mui/icons-material/ViewList'
import { Box, Chip, Dialog, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { Button, ConfirmDeleteDialog, LoadingState, SegmentedControl } from '../../components/ui'
import { useCollectionNotesQuery, useCollectionPacksQuery, useCollectionRaritiesQuery, useCollectionTypesQuery, useCreateCollectionPackMutation, useDeleteCollectionPackMutation, useUpdateCollectionPackMutation } from '../../hooks/useNotes'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { colors, font, radius } from '../../design-system'
import { useBackground } from '../../context/BackgroundContext'
import { toast } from '../../components/ui'
import { uniqueConfigId } from '../../utils/slug'
import { PACK_FILTERS, PACK_RHYTHMS, PACK_TEMPLATES, PackView, detectRhythm, formatPackSchedule, simulatePackOpening } from './packData'
import type { PackFilter, PackSimulation } from './packData'
import { PackEditor } from './PackEditor'
import { PackPreviewCard } from './PackPreviewCard'
import { PackSimulationDialog } from './PackSimulationDialog'
import type { CollectionPack, CollectionPackFormData } from '../../types/note'

const QUICK_START_IDS = ['daily', 'surpresa', 'evento', 'saudade']
const QUICK_START = QUICK_START_IDS
  .map((id) => PACK_TEMPLATES.find((template) => template.id === id))
  .filter((template): template is CollectionPackFormData => !!template)

function quickRhythmLabel(template: CollectionPackFormData) {
  const rhythm = detectRhythm(template)
  if (rhythm === 'custom') return formatPackSchedule(template)
  return PACK_RHYTHMS.find((item) => item.id === rhythm)?.label ?? formatPackSchedule(template)
}

const PACK_VIEW_OPTIONS = [
  { id: 'cards' as PackView, label: 'Cards', icon: <ViewAgendaIcon /> },
  { id: 'list' as PackView, label: 'Lista', icon: <ViewListIcon /> },
]

interface PacksTabProps { cid: string }

export function PacksTab({ cid }: PacksTabProps) {
  const { theme } = useBackground()
  const { data: notes = [] } = useCollectionNotesQuery(cid)
  const { data: rarities = [] } = useCollectionRaritiesQuery(cid)
  const { data: types = [] } = useCollectionTypesQuery(cid)
  const { data: packs = [], isLoading: packsLoading } = useCollectionPacksQuery(cid)
  const createPack = useCreateCollectionPackMutation(cid)
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

  function handleSimulatePack(pack: CollectionPack) {
    const simulation = simulatePackOpening(pack, notes, rarities)
    if (!simulation) {
      toast.info('Esse pacotinho não tem bilhetes compatíveis com as regras atuais.')
      return
    }
    setPackSimulation(simulation)
  }

  function handleQuickCreate(template: CollectionPackFormData) {
    const payload: CollectionPackFormData = {
      ...template,
      status: 'active',
      id: uniqueConfigId(template.name, packs.map((item) => item.id)),
    }
    createPack.mutate(payload, {
      onSuccess: () => toast.success(`${template.emoji} ${template.name} criado! Use o lápis para personalizar.`),
      onError: (error: Error) => toast.error(error.message || 'Erro ao criar pacotinho.'),
    })
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
                {packsLoading ? 'Carregando pacotinhos...' : packs.length === 0 ? 'Seu primeiro pacotinho ✨' : `${filteredPacks.length} de ${packs.length} pacotinho${packs.length !== 1 ? 's' : ''}`}
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: theme.textOnBgMuted, opacity: 0.76, mt: 0.2 }}>
                {packs.length > 0 ? 'Toque no 🎲 para testar a sorte de uma abertura.' : 'Escolha um modelo abaixo para começar.'}
              </Typography>
            </Box>
            <Button variant="primary" onClick={() => { setEditingPack(null); setPackDialogOpen(true) }} sx={{ py: 0.7, px: 1.4, fontSize: '0.78rem' }}>
              <AddIcon sx={{ fontSize: 15, mr: 0.4 }} /> Novo
            </Button>
          </Stack>

          {packs.length > 0 && <SegmentedControl options={PACK_VIEW_OPTIONS} value={packView} onChange={setPackView} />}

          {packs.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
              {PACK_FILTERS.map((filter) => {
                const active = packFilter === filter.id
                return (
                  <Chip key={filter.id} label={filter.label} size="small" onClick={() => setPackFilter(filter.id)}
                    sx={{ height: 26, fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', background: active ? theme.accent : theme.surfaceBg, color: active ? '#fff' : theme.textOnBgMuted, border: `1.5px solid ${active ? theme.accent : theme.surfaceBorder}`, backdropFilter: 'blur(10px)' }} />
                )
              })}
            </Box>
          )}
        </Stack>

        {packsLoading && <LoadingState compact label="Carregando pacotinhos" accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} />}

        {!packsLoading && packs.length === 0 && (
          <Stack spacing={1.4}>
            <Box sx={{ p: 1.7, borderRadius: radius.xl, background: theme.surfaceBg, backdropFilter: 'blur(14px)', border: `1px solid ${theme.surfaceBorder}` }}>
              <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '0.98rem', color: theme.textOnBg, mb: 0.3 }}>
                O que é um pacotinho?
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: theme.textOnBgMuted, lineHeight: 1.55 }}>
                É como a pessoa recebe seus bilhetes: abre o pacotinho e ganha cartas surpresa. Você define quantas cartas saem e com que frequência.
              </Typography>
            </Box>

            <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: theme.textOnBgMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Comece com um toque
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
              {QUICK_START.map((template) => (
                <Box
                  key={template.id}
                  onClick={() => !createPack.isPending && handleQuickCreate(template)}
                  sx={{
                    p: 1.4, borderRadius: radius.xl, cursor: 'pointer', background: template.gradient,
                    border: '1.5px solid rgba(255,255,255,0.7)', boxShadow: `0 6px 20px ${template.accent}22`,
                    opacity: createPack.isPending ? 0.6 : 1,
                    transition: 'transform 0.16s ease, box-shadow 0.16s ease',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 10px 26px ${template.accent}33` },
                  }}
                >
                  <Typography sx={{ fontSize: '1.5rem', lineHeight: 1, mb: 0.6 }}>{template.emoji}</Typography>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 900, color: colors.text.primary, lineHeight: 1.2, mb: 0.3 }}>
                    {template.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: colors.text.secondary, lineHeight: 1.4, mb: 0.8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {template.description}
                  </Typography>
                  <Box sx={{ display: 'inline-flex', px: 0.8, py: 0.3, borderRadius: radius.full, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.8)' }}>
                    <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: template.accent }}>
                      🃏 {template.cardsPerOpen} · {quickRhythmLabel(template)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Button variant="ghost" fullWidth onClick={() => { setEditingPack(null); setPackDialogOpen(true) }} sx={{ py: 0.8, fontSize: '0.8rem' }}>
              Prefiro criar do zero
            </Button>
          </Stack>
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
