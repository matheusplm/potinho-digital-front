import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { Box, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Button, ConfirmDeleteDialog, Input, LoadingState, PageTitle, ScrollablePage, toast } from '../components/ui'
import {
  queryKeys, useCollectionsQuery, useCollectionTrashQuery, useCreateCollectionMutation,
  useDeleteCollectionMutation, useMyNotificationsQuery, useRestoreCollectionMutation, useUpdateCollectionMutation,
} from '../hooks/useNotes'
import { useBackground } from '../context/BackgroundContext'
import { FloatingParticles } from '../components/FloatingParticles'
import { useSimulation } from '../context/SimulationContext'
import { useUser } from '../context/UserContext'
import { colors, fadeIn, font } from '../design-system'
import { slugify } from '../utils/slug'
import { isCollectionOwner } from '../utils/collectionAccess'
import { ApiRequestError } from '../services/api'
import { COLLECTION_TEMPLATES, createCollectionFromTemplate } from '../services/collectionTemplates'
import type { CollectionTemplate } from '../services/collectionTemplates'
import { TemplateKitRow } from '../components/TemplateKitRow'
import { KitConfirmDialog } from '../components/KitConfirmDialog'
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
  const [readersWarning, setReadersWarning] = useState<string | null>(null)
  const [confirmNameInput, setConfirmNameInput] = useState('')
  const [creatingKit, setCreatingKit] = useState<string | null>(null)
  const [kitToConfirm, setKitToConfirm] = useState<CollectionTemplate | null>(null)
  const [view, setView] = useState<ViewMode>(() => (localStorage.getItem(VIEW_KEY) as ViewMode) ?? 'cards')
  const [sort, setSort] = useState<SortType>('name-asc')
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const isWriter = persona === 'writer'
  const { data: trashItem } = useCollectionTrashQuery({ enabled: isWriter })
  const restoreMutation = useRestoreCollectionMutation()

  const hasReaderCollections = useMemo(() => collections.some((c) => c.access === 'reader'), [collections])
  const { data: myNotifications = [] } = useMyNotificationsQuery({ enabled: hasReaderCollections })
  const unreadNewsCids = useMemo(
    () => new Set(myNotifications.filter((n) => !n.readAt).map((n) => n.collectionId)),
    [myNotifications],
  )

  useEffect(() => {
    if (!isActive || !session) return
    navigate(`/colecoes/${session.collectionSlug}`, { replace: true })
  }, [isActive, navigate, session])

  const displayedCollections = useMemo(() => {
    let result = collections.filter((c) => c.access === (persona === 'writer' ? 'owner' : 'reader'))
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
  }, [collections, sort, search, persona])

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
        <FloatingParticles />
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

  async function handleKitCreate(template: CollectionTemplate) {
    if (creatingKit) return
    setCreatingKit(template.id)
    try {
      const { collection } = await createCollectionFromTemplate(template)
      await queryClient.invalidateQueries({ queryKey: queryKeys.collections() })
      toast.success('Coleção pronta! Deixamos bilhetes de exemplo para você editar. 💙')
      setKitToConfirm(null)
      navigate(`/colecoes/${slugify(collection.name)}/gerenciar`)
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao criar a coleção.')
    } finally {
      setCreatingKit(null)
    }
  }

  async function handleRestore() {
    if (!trashItem || restoreMutation.isPending) return
    try {
      await restoreMutation.mutateAsync(trashItem.id)
      toast.success(`"${trashItem.name}" restaurada! 💙`)
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao restaurar a coleção.')
    }
  }

  async function handleUpdate(data: CollectionFormData) {
    if (!editing) return
    await updateMutation.mutateAsync({ id: editing.id, data })
    toast.success('Coleção atualizada!')
    setEditing(null)
  }

  async function handleDelete(force = false, confirmName?: string) {
    if (!deleting) return
    try {
      const result = await deleteMutation.mutateAsync({ id: deleting.id, force, confirmName })
      toast.success(
        'Coleção movida para a lixeira. 🗑️',
        result.purged ? { description: `"${result.purged.name}" foi excluída permanentemente.` } : undefined,
      )
      setDeleting(null)
      setReadersWarning(null)
      setConfirmNameInput('')
    } catch (error) {
      const err = error as ApiRequestError
      if (err.code === 'COLLECTION_HAS_READERS') {
        setConfirmNameInput('')
        setReadersWarning(err.message)
        return
      }
      toast.error(err.message || 'Erro ao excluir coleção.')
    }
  }

  return (
    <Box sx={{ height: '100%', position: 'relative', background: theme.gradient }}>
      <FloatingParticles />
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

        {!isLoading && displayedCollections.length === 0 && !search && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, textAlign: 'center', py: isWriter ? 4 : 8 }}>
            <Box sx={{
              width: 72, height: 72, borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.accent}22, ${theme.accent}44)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AutoAwesomeIcon sx={{ fontSize: 32, color: theme.accent, opacity: 0.7 }} />
            </Box>
            <Stack spacing={0.5}>
              <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.15rem', color: theme.textOnBg }}>
                {isWriter ? 'Sua primeira coleção' : 'Nenhuma coleção'}
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: theme.textOnBgMuted, maxWidth: 260 }}>
                {isWriter ? 'Comece com um kit pronto ou crie do zero' : 'Peça para liberarem seu email em uma coleção'}
              </Typography>
            </Stack>
            {isWriter && (
              <Stack spacing={0.9} sx={{ width: '100%', maxWidth: 360, textAlign: 'left' }}>
                {COLLECTION_TEMPLATES.map((template) => (
                  <TemplateKitRow
                    key={template.id}
                    template={template}
                    busy={creatingKit === template.id}
                    dimmed={!!creatingKit && creatingKit !== template.id}
                    onClick={() => !creatingKit && setKitToConfirm(template)}
                  />
                ))}
                <Typography sx={{ fontSize: '0.66rem', color: theme.textOnBgMuted, textAlign: 'center', opacity: 0.85 }}>
                  Cada kit já vem com bilhetes de exemplo, raridades e pacotinhos
                </Typography>
                <AddGhostCard view="cards" onClick={() => setCreateOpen(true)} accent={theme.accent} />
              </Stack>
            )}
          </Box>
        )}

        {!isLoading && !!search && displayedCollections.length === 0 && (
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
                  <CollectionCardView key={col.id} col={col} i={i} onClick={() => openCollection(col)} onEdit={setEditing} onDelete={setDeleting} hasNews={unreadNewsCids.has(col.id)} />
                ))}
                {isWriter && <AddGhostCard view="cards" onClick={() => setCreateOpen(true)} accent={theme.accent} />}
              </Stack>
            )}
            {view === 'grid' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.4 }}>
                {displayedCollections.map((col, i) => (
                  <CollectionGridItem key={col.id} col={col} i={i} onClick={() => openCollection(col)} onEdit={setEditing} onDelete={setDeleting} hasNews={unreadNewsCids.has(col.id)} />
                ))}
                {isWriter && <AddGhostCard view="grid" onClick={() => setCreateOpen(true)} accent={theme.accent} />}
              </Box>
            )}
            {view === 'list' && (
              <Stack spacing={0.8}>
                {displayedCollections.map((col, i) => (
                  <CollectionListItem key={col.id} col={col} i={i} onClick={() => openCollection(col)} onEdit={setEditing} onDelete={setDeleting} hasNews={unreadNewsCids.has(col.id)} />
                ))}
                {isWriter && <AddGhostCard view="list" onClick={() => setCreateOpen(true)} accent={theme.accent} />}
              </Stack>
            )}
          </>
        )}

        {isWriter && !isLoading && (
          <Box sx={{
            mt: 2.5, p: 1.6, borderRadius: '16px',
            border: `1.5px dashed ${theme.accent}55`,
            background: 'rgba(255,255,255,0.35)', backdropFilter: 'blur(10px)',
          }}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Typography sx={{ fontSize: '1.3rem', lineHeight: 1, flexShrink: 0, opacity: trashItem ? 1 : 0.55 }}>🗑️</Typography>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: theme.textOnBg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {trashItem ? `Lixeira: ${trashItem.emoji} ${trashItem.name}` : 'Lixeira vazia'}
                </Typography>
                <Typography sx={{ fontSize: '0.66rem', color: theme.textOnBgMuted }}>
                  {trashItem
                    ? 'some de vez quando outra coleção for excluída'
                    : 'coleções excluídas ficam aqui para restaurar'}
                </Typography>
              </Box>
              {trashItem && (
                <Button variant="ghost" loading={restoreMutation.isPending} onClick={handleRestore} sx={{ py: 0.6, px: 1.3, fontSize: '0.76rem', flexShrink: 0 }}>
                  Restaurar
                </Button>
              )}
            </Stack>
          </Box>
        )}
      </ScrollablePage>

      <CollectionFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        isPending={createMutation.isPending}
        onSubmit={handleCreate}
        onSelectTemplate={(template) => { setCreateOpen(false); setKitToConfirm(template) }}
      />

      <CollectionFormDialog
        open={!!editing}
        initial={editing ?? undefined}
        onClose={() => setEditing(null)}
        isPending={updateMutation.isPending}
        onSubmit={handleUpdate}
      />

      <ConfirmDeleteDialog
        open={!!deleting && !readersWarning}
        title="Excluir coleção"
        description={<>Tem certeza que deseja excluir <strong style={{ color: colors.text.primary }}>{deleting?.name}</strong>? Todos os bilhetes, raridades e tipos serão removidos.</>}
        isPending={deleteMutation.isPending}
        onConfirm={() => void handleDelete(false)}
        onClose={() => setDeleting(null)}
      />

      <ConfirmDeleteDialog
        open={!!readersWarning}
        title="⚠️ Tem gente usando essa coleção"
        description={
          <Stack spacing={1.2}>
            <Typography sx={{ fontSize: '0.88rem', color: colors.text.primary, fontWeight: 700 }}>
              {readersWarning}
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: colors.text.secondary, lineHeight: 1.6 }}>
              A coleção vai para a lixeira e some para essas pessoas. Para confirmar, digite o nome exato da coleção:
            </Typography>
            <Input
              placeholder={deleting?.name ?? ''}
              value={confirmNameInput}
              onChange={(e) => setConfirmNameInput(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.86rem' }, '& input': { py: 0.9 } }}
            />
          </Stack>
        }
        isPending={deleteMutation.isPending}
        confirmLabel="Excluir mesmo assim"
        confirmDisabled={confirmNameInput.trim().toLowerCase() !== (deleting?.name ?? '').trim().toLowerCase()}
        onConfirm={() => void handleDelete(true, confirmNameInput)}
        onClose={() => { setReadersWarning(null); setDeleting(null); setConfirmNameInput('') }}
      />

      <KitConfirmDialog
        open={!!kitToConfirm}
        template={kitToConfirm}
        isPending={!!creatingKit}
        onConfirm={() => { if (kitToConfirm) void handleKitCreate(kitToConfirm) }}
        onClose={() => setKitToConfirm(null)}
      />
    </Box>
  )
}
