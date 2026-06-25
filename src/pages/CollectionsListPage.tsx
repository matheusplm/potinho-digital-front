import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { Box, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConfirmDeleteDialog, LoadingState, PageTitle, ScrollablePage, toast } from '../components/ui'
import {
  useCollectionsQuery, useCreateCollectionMutation,
  useDeleteCollectionMutation, useUpdateCollectionMutation,
} from '../hooks/useNotes'
import { useBackground } from '../context/BackgroundContext'
import { useSimulation } from '../context/SimulationContext'
import { useUser } from '../context/UserContext'
import { colors, fadeIn, font } from '../design-system'
import { slugify } from '../utils/slug'
import { isCollectionOwner } from '../utils/collectionAccess'
import type { Collection, CollectionFormData } from '../types/note'
import { CollectionsFilterBar } from './collections/CollectionsFilterBar'
import { CollectionFormDialog } from './collections/CollectionFormDialog'
import { CollectionCardView, CollectionGridItem, CollectionListItem } from './collections/CollectionCard'
import { AddGhostCard } from './collections/AddGhostCard'

type ViewMode = 'cards' | 'grid' | 'list'
type SortType = 'name-asc' | 'name-desc'
const VIEW_KEY = 'potinho-collections-view'

export function CollectionsListPage() {
  const { theme } = useBackground()
  const { user, persona } = useUser()
  const { isActive, session, startSimulation } = useSimulation()
  const navigate = useNavigate()
  const { data: collections = [], isLoading } = useCollectionsQuery()
  const createMutation = useCreateCollectionMutation()
  const updateMutation = useUpdateCollectionMutation()
  const deleteMutation = useDeleteCollectionMutation()

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Collection | null>(null)
  const [deleting, setDeleting] = useState<Collection | null>(null)
  const [view, setView] = useState<ViewMode>(() => (localStorage.getItem(VIEW_KEY) as ViewMode) ?? 'cards')
  const [sort, setSort] = useState<SortType>('name-asc')
  const [search, setSearch] = useState('')

  const isWriter = persona === 'writer'

  useEffect(() => {
    if (!isActive || !session) return
    navigate(`/colecoes/${session.collectionSlug}`, { replace: true })
  }, [isActive, navigate, session])

  const displayedCollections = useMemo(() => {
    let result = collections
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((c) =>
        c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
      )
    }
    return [...result].sort((a, b) =>
      sort === 'name-asc'
        ? a.name.localeCompare(b.name, 'pt-BR')
        : b.name.localeCompare(a.name, 'pt-BR')
    )
  }, [collections, sort, search])

  function changeView(v: ViewMode) {
    setView(v)
    localStorage.setItem(VIEW_KEY, v)
  }

  function openCollection(col: Collection) {
    const slug = slugify(col.name)
    if (isActive) {
      startSimulation({
        collectionId: col.id,
        collectionSlug: slug,
        collectionName: col.name,
        collectionEmoji: col.emoji,
        preset: session?.preset ?? 'new_reader',
      })
      navigate(`/colecoes/${slug}`)
      return
    }
    navigate(isCollectionOwner(col, user?.id) ? `/colecoes/${slug}/gerenciar` : `/colecoes/${slug}`)
  }

  if (isActive && session) {
    return (
      <Box sx={{ height: '100%', position: 'relative', background: theme.gradient }}>
        <ScrollablePage sx={{ px: 2.5, py: 2.5, animation: `${fadeIn} 0.35s ease` }}>
          <LoadingState label="Voltando para a coleção" accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} sx={{ minHeight: 360 }} />
        </ScrollablePage>
      </Box>
    )
  }

  async function handleCreate(data: CollectionFormData) {
    await createMutation.mutateAsync(data)
    toast.success('Coleção criada!')
    setCreateOpen(false)
  }

  async function handleUpdate(data: CollectionFormData) {
    if (!editing) return
    await updateMutation.mutateAsync({ id: editing.id, data })
    toast.success('Coleção atualizada!')
    setEditing(null)
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      toast.success('Coleção excluída.')
      setDeleting(null)
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao excluir coleção.')
    }
  }

  return (
    <Box sx={{ height: '100%', position: 'relative', background: theme.gradient }}>
      <FavoriteIcon sx={{
        position: 'absolute', bottom: -80, right: -80,
        fontSize: 440, color: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(225,29,72,0.04)',
        pointerEvents: 'none',
      }} />

      <ScrollablePage sx={{ px: 2.5, pt: 2.5, pb: 4, animation: `${fadeIn} 0.35s ease` }}>
        <Box sx={{ mb: 2.5 }}>
          <PageTitle
            title="Coleções"
            subtitle={isLoading ? 'Carregando...' : collections.length === 0 ? 'Nenhuma ainda' : `${collections.length} coleção${collections.length !== 1 ? 'ões' : ''}`}
          />
        </Box>

        {!isLoading && collections.length > 0 && (
          <CollectionsFilterBar
            sort={sort} setSort={setSort}
            search={search} setSearch={setSearch}
            view={view} changeView={changeView}
            accent={theme.accent} textOnBg={theme.textOnBg} textOnBgMuted={theme.textOnBgMuted}
          />
        )}

        {isLoading && (
          <LoadingState label="Carregando coleções" accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} sx={{ minHeight: 320 }} />
        )}

        {!isLoading && collections.length === 0 && !search && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, textAlign: 'center', py: 8 }}>
            <Box sx={{
              width: 72, height: 72, borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.accent}22, ${theme.accent}44)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AutoAwesomeIcon sx={{ fontSize: 32, color: theme.accent, opacity: 0.7 }} />
            </Box>
            <Stack spacing={0.5}>
              <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.15rem', color: theme.textOnBg }}>
                {isWriter ? 'Nenhuma coleção ainda' : 'Nenhuma coleção'}
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: theme.textOnBgMuted, maxWidth: 240 }}>
                {isWriter ? 'Crie sua primeira coleção de bilhetes' : 'Peça para liberarem seu email em uma coleção'}
              </Typography>
            </Stack>
            {isWriter && <AddGhostCard view="cards" onClick={() => setCreateOpen(true)} accent={theme.accent} />}
          </Box>
        )}

        {!isLoading && collections.length > 0 && displayedCollections.length === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 1 }}>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1rem', color: theme.textOnBg }}>
              Nenhuma coleção aqui
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: theme.textOnBgMuted }}>
              Tente outro filtro
            </Typography>
          </Box>
        )}

        {!isLoading && displayedCollections.length > 0 && (
          <>
            {view === 'cards' && (
              <Stack spacing={1.4}>
                {displayedCollections.map((col, i) => (
                  <CollectionCardView key={col.id} col={col} i={i} onClick={() => openCollection(col)} onEdit={setEditing} onDelete={setDeleting} />
                ))}
                {isWriter && <AddGhostCard view="cards" onClick={() => setCreateOpen(true)} accent={theme.accent} />}
              </Stack>
            )}
            {view === 'grid' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.4 }}>
                {displayedCollections.map((col, i) => (
                  <CollectionGridItem key={col.id} col={col} i={i} onClick={() => openCollection(col)} onEdit={setEditing} onDelete={setDeleting} />
                ))}
                {isWriter && <AddGhostCard view="grid" onClick={() => setCreateOpen(true)} accent={theme.accent} />}
              </Box>
            )}
            {view === 'list' && (
              <Stack spacing={0.8}>
                {displayedCollections.map((col, i) => (
                  <CollectionListItem key={col.id} col={col} i={i} onClick={() => openCollection(col)} onEdit={setEditing} onDelete={setDeleting} />
                ))}
                {isWriter && <AddGhostCard view="list" onClick={() => setCreateOpen(true)} accent={theme.accent} />}
              </Stack>
            )}
          </>
        )}
      </ScrollablePage>

      <CollectionFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        isPending={createMutation.isPending}
        onSubmit={handleCreate}
      />

      <CollectionFormDialog
        open={!!editing}
        initial={editing ?? undefined}
        onClose={() => setEditing(null)}
        isPending={updateMutation.isPending}
        onSubmit={handleUpdate}
      />

      <ConfirmDeleteDialog
        open={!!deleting}
        title="Excluir coleção"
        description={<>Tem certeza que deseja excluir <strong style={{ color: colors.text.primary }}>{deleting?.name}</strong>? Todos os bilhetes, raridades e tipos serão removidos.</>}
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </Box>
  )
}
