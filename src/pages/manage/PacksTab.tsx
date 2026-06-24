import AddIcon from '@mui/icons-material/Add'
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda'
import ViewListIcon from '@mui/icons-material/ViewList'
import { Box, Chip, Dialog, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { Button, ConfirmDeleteDialog, LoadingState, SegmentedControl } from '../../components/ui'
import { useCollectionNotesQuery, useCollectionPacksQuery, useCollectionRaritiesQuery, useCollectionTypesQuery, useDeleteCollectionPackMutation, useUpdateCollectionPackMutation } from '../../hooks/useNotes'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { colors, font, radius } from '../../design-system'
import { useBackground } from '../../context/BackgroundContext'
import { toast } from '../../components/ui'
import { PACK_FILTERS, PackView, simulatePackOpening } from './packData'
import type { PackFilter, PackSimulation } from './packData'
import { PackEditor } from './PackEditor'
import { PackPreviewCard } from './PackPreviewCard'
import { PackSimulationDialog } from './PackSimulationDialog'
import type { CollectionPack } from '../../types/note'

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

        <Box sx={{ p: 1.7, borderRadius: radius.xl, background: theme.surfaceBg, backdropFilter: 'blur(14px)', border: `1px solid ${theme.surfaceBorder}` }}>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '0.98rem', color: theme.textOnBg }}>
            Como vai funcionar
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: theme.textOnBgMuted, lineHeight: 1.55 }}>
            Um pacotinho será uma regra de abertura dentro da coleção: quantidade de bilhetes, cooldown, filtros por tipo/raridade e formas de distribuição.
          </Typography>
        </Box>

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
