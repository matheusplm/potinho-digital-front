import FavoriteIcon from '@mui/icons-material/Favorite'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import GridViewIcon from '@mui/icons-material/GridView'
import ViewListIcon from '@mui/icons-material/ViewList'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import { Box, Chip, IconButton, Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Button, Card, LoadingState, PageTitle, ScrollablePage, ScrollHint, toast } from '../components/ui'
import { useBackground } from '../context/BackgroundContext'
import { useUser } from '../context/UserContext'
import {
  useAddPackOpensMutation,
  useCollectionPacksQuery,
  useCollectionRaritiesQuery,
  useCollectionTypesQuery,
  useCollectionsQuery,
  useReaderViewQuery,
  useRevokeAccessMutation,
} from '../hooks/useNotes'
import { colors, font, radius } from '../design-system'
import { slugify } from '../utils/slug'
import { isCollectionOwner } from '../utils/collectionAccess'
import { gradientTextSx } from '../utils/colorUtils'
import { formatRemainingTime } from '../utils/packCooldowns'
import { NoteDetailDialog } from './CollectionPlayPage'
import { NoteCard, NoteRow } from './reader/NoteCard'
import { PackOpensDialog } from './reader/PackOpensDialog'
import { RevokeAccessDialog } from './reader/RevokeAccessDialog'
import { SORT_CYCLE, SORT_LABEL, sortNotes } from './reader/readerUtils'
import type { SortKey } from './reader/readerUtils'
import type { CollectionNoteView, CollectionPack } from '../types/note'

const glassBtn = {
  width: 38, height: 38,
  background: 'rgba(255,255,255,0.5)',
  border: '1.5px solid rgba(255,255,255,0.66)',
  backdropFilter: 'blur(14px)',
  boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  transition: 'transform 0.16s ease, background 0.16s ease, box-shadow 0.16s ease',
  '&:hover': {
    background: 'rgba(255,255,255,0.76)',
    boxShadow: '0 10px 28px rgba(15,23,42,0.12)',
    transform: 'scale(1.04)',
  },
}

export function ReaderCollectionPage() {
  const { slug = '', email: encodedEmail = '' } = useParams<{ slug: string; email: string }>()
  const navigate = useNavigate()
  const { theme } = useBackground()
  const { user } = useUser()
  const queryClient = useQueryClient()
  const email = decodeURIComponent(encodedEmail)

  const { data: collections = [], isLoading: collectionsLoading } = useCollectionsQuery()
  const collection = collections.find((c) => slugify(c.name) === slug)
  const cid = collection?.id ?? ''
  const canManage = collection ? isCollectionOwner(collection, user?.id) : false

  const { data: view, isLoading: viewLoading, isError } = useReaderViewQuery(cid, canManage ? email : null)
  const { data: packs = [] } = useCollectionPacksQuery(cid)
  const { data: rarities = [] } = useCollectionRaritiesQuery(cid)
  const { data: types = [] } = useCollectionTypesQuery(cid)

  const revokeMutation = useRevokeAccessMutation(cid)
  const addPackOpensMutation = useAddPackOpensMutation(cid)

  const [rarityFilter, setRarityFilter] = useState<string | null>(null)
  const [favFilter, setFavFilter] = useState(false)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('recent')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [viewingNote, setViewingNote] = useState<CollectionNoteView | null>(null)
  const [packOpensDialog, setPackOpensDialog] = useState<{ pack: CollectionPack; currentOpens: number | undefined } | null>(null)
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)

  const rarityOrder = useMemo(() => Object.fromEntries(rarities.map((r) => [r.id, r.order])), [rarities])
  const rarityById = useMemo(() => new Map(rarities.map((r) => [r.id, r])), [rarities])

  const bonusPacks = useMemo(
    () => packs.filter((p) => p.category !== 'daily' && p.distribution !== 'all_with_access'),
    [packs],
  )

  const ownedNotes = useMemo(() => view?.items.filter((i) => i.owned) ?? [], [view])
  const completion = view && view.total > 0 ? Math.round((view.owned / view.total) * 100) : 0
  const favCount = useMemo(() => ownedNotes.filter((n) => n.favorite).length, [ownedNotes])

  const dailyPackLabel = useMemo(() => {
    if (!view?.daily) return '—'
    if (view.daily.canOpen) return '✓ disponível'
    const remainingMs = Date.parse(view.daily.availableAt) - Date.parse(view.daily.serverTime)
    return `⏳ ${formatRemainingTime(remainingMs)}`
  }, [view?.daily?.canOpen, view?.daily?.availableAt, view?.daily?.serverTime])

  const ownedRarities = useMemo(
    () => rarities.filter((r) => ownedNotes.some((n) => n.rarity === r.id)).sort((a, b) => a.order - b.order),
    [ownedNotes, rarities],
  )

  const filteredNotes = useMemo(() => {
    let notes = ownedNotes
    if (rarityFilter) notes = notes.filter((n) => n.rarity === rarityFilter)
    if (favFilter) notes = notes.filter((n) => n.favorite)
    if (search) {
      const q = search.toLowerCase()
      notes = notes.filter((n) => n.title?.toLowerCase().includes(q) || n.message?.toLowerCase().includes(q))
    }
    return sortNotes(notes, sort, rarityOrder)
  }, [ownedNotes, rarityFilter, favFilter, search, sort, rarityOrder])

  const isLoading = collectionsLoading || viewLoading

  async function handleAddPackOpens(opens: number) {
    if (!packOpensDialog) return
    try {
      await addPackOpensMutation.mutateAsync({ email, packId: packOpensDialog.pack.id, opens })
      void queryClient.invalidateQueries({ queryKey: ['reader-view', cid, email] })
      toast.success('Brindes atualizados.')
      setPackOpensDialog(null)
    } catch (e) {
      toast.error((e as Error).message || 'Erro ao atualizar brindes.')
    }
  }

  async function handleRemovePackAccess() {
    if (!packOpensDialog) return
    try {
      await addPackOpensMutation.mutateAsync({ email, packId: packOpensDialog.pack.id, opens: 0 })
      void queryClient.invalidateQueries({ queryKey: ['reader-view', cid, email] })
      toast.success('Brinde removido.')
      setPackOpensDialog(null)
    } catch (e) {
      toast.error((e as Error).message || 'Erro ao remover brinde.')
    }
  }

  async function handleRevoke() {
    try {
      await revokeMutation.mutateAsync(email)
      toast.info(`Acesso removido de ${email}`)
      navigate(`/colecoes/${slug}/gerenciar`)
    } catch (e) {
      toast.error((e as Error).message || 'Erro ao revogar acesso.')
    }
  }

  if (!collectionsLoading && (!collection || !canManage)) {
    return (
      <Box sx={{ height: '100%', position: 'relative', background: theme.gradient }}>
        <ScrollablePage sx={{ px: 2.5, py: 2.5, alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ color: theme.textOnBg }}>Coleção não encontrada.</Typography>
          <Button variant="primary" onClick={() => navigate('/home')} sx={{ mt: 2 }}>Voltar</Button>
        </ScrollablePage>
      </Box>
    )
  }

  const noFilter = !rarityFilter && !favFilter

  return (
    <Box sx={{ height: '100%', position: 'relative', background: theme.gradient }}>
      <FavoriteIcon sx={{ position: 'absolute', bottom: -60, right: -60, fontSize: 400, color: 'rgba(225,29,72,0.04)', pointerEvents: 'none' }} />

      <ScrollablePage sx={{ px: 2.5, py: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 2.5 }}>
          <IconButton size="small" aria-label="voltar" onClick={() => navigate(`/colecoes/${slug}/gerenciar`)} sx={{ ...glassBtn, color: theme.textOnBg }}>
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <PageTitle title={collection?.name ?? 'Coleção'} subtitle={email} />
          </Box>
          <IconButton size="small" aria-label="remover acesso" onClick={() => setRevokeDialogOpen(true)} sx={{ ...glassBtn, color: colors.rose.main }}>
            <PersonRemoveIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>

        {isLoading && (
          <LoadingState label="Carregando coleção..." accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} sx={{ minHeight: 300 }} />
        )}

        {isError && !isLoading && (
          <Card sx={{ p: 2, textAlign: 'center', borderColor: `${colors.rose.main}22`, background: `${colors.rose.main}06` }}>
            <Typography sx={{ fontSize: '0.85rem', color: colors.rose.main }}>
              Não foi possível carregar a coleção deste leitor.
            </Typography>
          </Card>
        )}

        {view && !isLoading && (
          <Stack spacing={2}>
            <Card sx={{ p: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                {[
                  { label: 'coletados', value: `${view.owned}/${view.total}` },
                  { label: 'conclusão', value: `${completion}%` },
                  { label: 'favoritas', value: favCount },
                  { label: 'pacote hoje', value: dailyPackLabel },
                ].map((s) => (
                  <Box key={s.label} sx={{ p: 1.2, borderRadius: radius.lg, background: 'rgba(0,0,0,0.03)', border: `1px solid ${colors.border.subtle}`, textAlign: 'center' }}>
                    <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.1rem', color: colors.text.primary }}>
                      {s.value}
                    </Typography>
                    <Typography sx={{ fontSize: '0.70rem', fontWeight: 700, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {s.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>
            {bonusPacks.length > 0 && (
              <Card sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.8, color: colors.text.muted, textTransform: 'uppercase', mb: 1 }}>
                  🎁 Brindes
                </Typography>
                <Stack direction="row" spacing={0.7} sx={{ flexWrap: 'wrap', rowGap: 0.7 }}>
                  {bonusPacks.map((pack) => {
                    const opens = view.packOpens?.[pack.id]
                    const hasOpens = opens !== undefined && opens > 0
                    return (
                      <Chip
                        key={pack.id}
                        label={hasOpens ? `${pack.emoji} ${pack.name} (${opens}x)` : `${pack.emoji} ${pack.name}`}
                        onClick={() => setPackOpensDialog({ pack, currentOpens: opens })}
                        disabled={addPackOpensMutation.isPending}
                        sx={{
                          height: 28, borderRadius: radius.full, fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                          color: hasOpens ? '#fff' : pack.accent,
                          background: hasOpens ? pack.accent : `${pack.accent}12`,
                          border: `1px solid ${pack.accent}${hasOpens ? '00' : '33'}`,
                          '& .MuiChip-label': { px: 1 },
                          '&:hover': { background: hasOpens ? pack.accent : `${pack.accent}22`, opacity: 0.9 },
                        }}
                      />
                    )
                  })}
                </Stack>
              </Card>
            )}
            <Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: theme.textOnBgMuted, mb: 1.2 }}>
                {ownedNotes.length} bilhete{ownedNotes.length !== 1 ? 's' : ''}
              </Typography>
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1, px: 1.4, py: 0.75, mb: 1,
                background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)',
                border: '1.5px solid rgba(255,255,255,0.6)', borderRadius: radius.lg,
              }}>
                <SearchIcon sx={{ fontSize: 17, color: theme.textOnBgMuted, flexShrink: 0 }} />
                <Box
                  component="input"
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  placeholder="Buscar bilhete..."
                  sx={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.86rem', color: theme.textOnBg, fontFamily: 'inherit', '&::placeholder': { color: theme.textOnBgMuted } }}
                />
                {search && (
                  <Box onClick={() => setSearch('')} sx={{ display: 'flex', cursor: 'pointer', color: theme.textOnBgMuted }}>
                    <CloseIcon sx={{ fontSize: 15 }} />
                  </Box>
                )}
                <Box sx={{ width: 1, height: 18, background: 'rgba(0,0,0,0.1)', mx: 0.5 }} />
                <IconButton
                  size="small"
                  onClick={() => setSort((s) => SORT_CYCLE[(SORT_CYCLE.indexOf(s) + 1) % SORT_CYCLE.length])}
                  title={SORT_LABEL[sort]}
                  sx={{ p: 0.5, gap: 0.3, borderRadius: radius.sm, '&:hover': { background: 'rgba(0,0,0,0.06)' } }}
                >
                  <SwapVertIcon sx={{ fontSize: 15, color: theme.textOnBgMuted }} />
                  <Typography sx={{ fontSize: '0.70rem', fontWeight: 700, color: theme.textOnBgMuted }}>{SORT_LABEL[sort]}</Typography>
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setViewMode((m) => (m === 'list' ? 'grid' : 'list'))}
                  sx={{ p: 0.5, borderRadius: radius.sm, '&:hover': { background: 'rgba(0,0,0,0.06)' } }}
                >
                  {viewMode === 'list'
                    ? <GridViewIcon sx={{ fontSize: 17, color: theme.textOnBgMuted }} />
                    : <ViewListIcon sx={{ fontSize: 17, color: theme.textOnBgMuted }} />}
                </IconButton>
              </Box>
              {(ownedRarities.length > 1 || favCount > 0) && (
                <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', mb: 1.2 }}>
                  <Chip
                    label={`Todos (${ownedNotes.length})`}
                    size="small"
                    onClick={() => { setRarityFilter(null); setFavFilter(false) }}
                    sx={{
                      height: 26, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                      bgcolor: noFilter ? theme.accent : 'rgba(255,255,255,0.5)',
                      color: noFilter ? '#fff' : theme.textOnBgMuted,
                    }}
                  />
                  {favCount > 0 && (
                    <Chip
                      label={`♥ Favoritas (${favCount})`}
                      size="small"
                      onClick={() => { setFavFilter((f) => !f); setRarityFilter(null) }}
                      sx={{
                        height: 26, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                        bgcolor: favFilter ? colors.rose.main : 'rgba(255,255,255,0.5)',
                        color: favFilter ? '#fff' : theme.textOnBgMuted,
                      }}
                    />
                  )}
                  {ownedRarities.map((r) => {
                    const active = rarityFilter === r.id
                    const count = ownedNotes.filter((n) => n.rarity === r.id).length
                    return (
                      <Chip
                        key={r.id}
                        label={`${r.emoji} ${r.label} (${count})`}
                        size="small"
                        onClick={() => { setRarityFilter(active ? null : r.id); setFavFilter(false) }}
                        sx={{
                          height: 26, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                          background: active ? r.chipBg : 'rgba(255,255,255,0.5)',
                          border: `1.5px solid ${active ? r.borderColor : 'transparent'}`,
                          '& .MuiChip-label': active ? gradientTextSx(r.chipColor) : { color: theme.textOnBgMuted },
                        }}
                      />
                    )
                  })}
                </Box>
              )}
              {filteredNotes.length === 0 ? (
                <Typography sx={{ py: 4, textAlign: 'center', fontSize: '0.85rem', color: theme.textOnBgMuted }}>
                  {search || rarityFilter || favFilter ? 'Nenhum bilhete encontrado.' : 'Ainda não coletou nenhum bilhete.'}
                </Typography>
              ) : viewMode === 'grid' ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.2 }}>
                  {filteredNotes.map((note) => (
                    <NoteCard key={note.id} note={note} rarity={rarityById.get(note.rarity)} onClick={() => setViewingNote(note)} />
                  ))}
                </Box>
              ) : (
                <Stack spacing={0.5}>
                  {filteredNotes.map((note) => (
                    <NoteRow key={note.id} note={note} rarity={rarityById.get(note.rarity)} onClick={() => setViewingNote(note)} />
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        )}
      </ScrollablePage>

      <ScrollHint />

      {viewingNote && (
        <NoteDetailDialog note={viewingNote} rarities={rarities} types={types} onClose={() => setViewingNote(null)} />
      )}

      <PackOpensDialog
        pack={packOpensDialog?.pack ?? null}
        currentOpens={packOpensDialog?.currentOpens}
        isPending={addPackOpensMutation.isPending}
        onClose={() => setPackOpensDialog(null)}
        onAdd={handleAddPackOpens}
        onRemove={handleRemovePackAccess}
      />

      <RevokeAccessDialog
        open={revokeDialogOpen}
        email={email}
        isPending={revokeMutation.isPending}
        onClose={() => setRevokeDialogOpen(false)}
        onRevoke={handleRevoke}
      />
    </Box>
  )
}
