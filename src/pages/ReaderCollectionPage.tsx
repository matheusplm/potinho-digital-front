import FavoriteIcon from '@mui/icons-material/Favorite'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import GridViewIcon from '@mui/icons-material/GridView'
import ViewListIcon from '@mui/icons-material/ViewList'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import {
  Box, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Stack, TextField, Typography,
} from '@mui/material'
import { keyframes } from '@emotion/react'
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
import { NoteDetailDialog } from './CollectionPlayPage'
import type { CollectionNoteView, CollectionPack, RarityConfig } from '../types/note'

type SortKey = 'recent' | 'rarity' | 'az'
const SORT_LABEL: Record<SortKey, string> = { recent: 'Recentes', rarity: 'Raridade', az: 'A-Z' }
const SORT_CYCLE: SortKey[] = ['recent', 'rarity', 'az']

const rarityShine = keyframes`
  0%   { left: -45%; opacity: 0 }
  20%  { opacity: 1 }
  100% { left: 105%; opacity: 0 }
`

function rarityCardSx(r?: RarityConfig, compact = false) {
  const glow = r?.glowColor || r?.borderColor || 'rgba(244,63,94,0.2)'
  return {
    p: compact ? 1.4 : 2,
    borderRadius: compact ? radius.lg : radius.xl,
    position: 'relative',
    overflow: 'hidden',
    isolation: 'isolate',
    background: r?.cardBg ?? colors.surface.base,
    border: `1.5px solid ${r?.borderColor ?? colors.border.subtle}`,
    boxShadow: r
      ? `${r.shadow || '0 4px 20px rgba(0,0,0,0.08)'}, 0 0 28px ${glow}`
      : '0 2px 10px rgba(0,0,0,0.05)',
    transition: 'transform 0.22s ease, box-shadow 0.22s ease',
    cursor: 'pointer',
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
      background: compact
        ? `radial-gradient(circle at 12% 0%, rgba(255,255,255,0.42), transparent 38%), radial-gradient(circle at 92% 100%, ${glow}, transparent 34%)`
        : `radial-gradient(circle at 12% 0%, rgba(255,255,255,0.58), transparent 36%), radial-gradient(circle at 95% 105%, ${glow}, transparent 42%)`,
      opacity: compact ? 0.62 : 0.78,
      mixBlendMode: 'soft-light',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '-35%',
      left: '-45%',
      zIndex: 0,
      width: '38%',
      height: '170%',
      pointerEvents: 'none',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.42), transparent)',
      animation: `${rarityShine} 4.4s ease-in-out infinite`,
    },
    '&:hover': {
      transform: compact ? 'translateY(-1px)' : 'translateY(-2px) scale(1.01)',
      boxShadow: r
        ? `${r.shadow || '0 6px 24px rgba(0,0,0,0.1)'}, 0 0 40px ${glow}`
        : '0 6px 20px rgba(0,0,0,0.1)',
    },
  }
}

function sortNotes(notes: CollectionNoteView[], sort: SortKey, rarityOrder: Record<string, number>) {
  const arr = [...notes]
  if (sort === 'az') return arr.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
  if (sort === 'rarity') return arr.sort((a, b) => (rarityOrder[b.rarity] ?? 0) - (rarityOrder[a.rarity] ?? 0) || a.title.localeCompare(b.title, 'pt-BR'))
  return arr.sort((a, b) => (b.obtainedAt ?? '').localeCompare(a.obtainedAt ?? ''))
}

function NoteCard({ note, rarity, onClick }: { note: CollectionNoteView; rarity?: RarityConfig; onClick: () => void }) {
  return (
    <Box onClick={onClick} sx={rarityCardSx(rarity)}>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={0.8}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={0.5}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: rarity?.textColor ?? colors.text.primary, lineHeight: 1.3, flex: 1 }}>
              {note.title}
            </Typography>
            {note.favorite && <FavoriteIcon sx={{ fontSize: 13, color: colors.rose.main, flexShrink: 0, mt: 0.1 }} />}
          </Stack>
          {rarity && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: radius.full, background: rarity.cardBg, flexShrink: 0, boxShadow: `0 0 5px ${rarity.glowColor ?? rarity.borderColor}` }} />
              <Typography sx={{ fontSize: '0.58rem', fontWeight: 800, color: rarity.captionColor ?? colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {rarity.emoji} {rarity.label}
              </Typography>
            </Box>
          )}
          {note.message && (
            <Typography sx={{
              fontSize: '0.68rem', color: rarity?.textColor ? `${rarity.textColor}99` : colors.text.secondary,
              lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {note.message}
            </Typography>
          )}
        </Stack>
      </Box>
    </Box>
  )
}

function NoteRow({ note, rarity, onClick }: { note: CollectionNoteView; rarity?: RarityConfig; onClick: () => void }) {
  return (
    <Box onClick={onClick} sx={{ ...rarityCardSx(rarity, true), py: 1, px: 1.4 }}>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.2}>
          {rarity && (
            <Box sx={{ width: 9, height: 9, borderRadius: radius.full, background: rarity.cardBg, flexShrink: 0, boxShadow: `0 0 7px ${rarity.glowColor ?? rarity.borderColor}88` }} />
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: rarity?.textColor ?? colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {note.title}
            </Typography>
            {rarity && (
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: rarity.captionColor ?? colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                {rarity.emoji} {rarity.label}
              </Typography>
            )}
          </Box>
          {note.favorite && <FavoriteIcon sx={{ fontSize: 13, color: colors.rose.main, flexShrink: 0 }} />}
        </Stack>
      </Box>
    </Box>
  )
}

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
  const [packOpensInput, setPackOpensInput] = useState(1)

  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [revokeInput, setRevokeInput] = useState('')

  const rarityOrder = useMemo(() => Object.fromEntries(rarities.map((r) => [r.id, r.order])), [rarities])
  const rarityById = useMemo(() => new Map(rarities.map((r) => [r.id, r])), [rarities])

  const bonusPacks = useMemo(
    () => packs.filter((p) => p.category !== 'daily' && p.distribution !== 'all_with_access'),
    [packs],
  )

  const ownedNotes = useMemo(() => view?.items.filter((i) => i.owned) ?? [], [view])
  const completion = view && view.total > 0 ? Math.round((view.owned / view.total) * 100) : 0
  const favCount = useMemo(() => ownedNotes.filter((n) => n.favorite).length, [ownedNotes])

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
      notes = notes.filter((n) => n.title.toLowerCase().includes(q) || n.message?.toLowerCase().includes(q))
    }
    return sortNotes(notes, sort, rarityOrder)
  }, [ownedNotes, rarityFilter, favFilter, search, sort, rarityOrder])

  const isLoading = collectionsLoading || viewLoading

  function openPackOpensDialog(pack: CollectionPack, currentOpens: number | undefined) {
    setPackOpensInput(1)
    setPackOpensDialog({ pack, currentOpens })
  }

  async function handleConfirmPackOpens() {
    if (!packOpensDialog) return
    const { pack } = packOpensDialog
    try {
      await addPackOpensMutation.mutateAsync({ email, packId: pack.id, opens: packOpensInput })
      void queryClient.invalidateQueries({ queryKey: ['reader-view', cid, email] })
      toast.success('Brindes atualizados.')
      setPackOpensDialog(null)
    } catch (e) {
      toast.error((e as Error).message || 'Erro ao atualizar brindes.')
    }
  }

  async function handleRemovePackAccess() {
    if (!packOpensDialog) return
    const { pack } = packOpensDialog
    try {
      await addPackOpensMutation.mutateAsync({ email, packId: pack.id, opens: 0 })
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
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 2.5 }}>
          <IconButton
            size="small"
            aria-label="voltar"
            onClick={() => navigate(`/colecoes/${slug}/gerenciar`)}
            sx={{ ...glassBtn, color: theme.textOnBg }}
          >
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <PageTitle title={collection?.name ?? 'Coleção'} subtitle={email} />
          </Box>
          <IconButton
            size="small"
            aria-label="remover acesso"
            onClick={() => { setRevokeInput(''); setRevokeDialogOpen(true) }}
            sx={{ ...glassBtn, color: colors.rose.main }}
          >
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

            {/* Stats */}
            <Card sx={{ p: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                {[
                  { label: 'coletados', value: `${view.owned}/${view.total}` },
                  { label: 'conclusão', value: `${completion}%` },
                  { label: 'favoritas', value: favCount },
                  { label: 'pacote hoje', value: view.daily.canOpen ? '✓ disponível' : '⏳ aberto' },
                ].map((s) => (
                  <Box key={s.label} sx={{ p: 1.2, borderRadius: radius.lg, background: 'rgba(0,0,0,0.03)', border: `1px solid ${colors.border.subtle}`, textAlign: 'center' }}>
                    <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.1rem', color: colors.text.primary }}>
                      {s.value}
                    </Typography>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {s.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>

            {/* Brindes */}
            {bonusPacks.length > 0 && (
              <Card sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, letterSpacing: 0.8, color: colors.text.muted, textTransform: 'uppercase', mb: 1 }}>
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
                        onClick={() => openPackOpensDialog(pack, opens)}
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

            {/* Bilhetes */}
            <Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: theme.textOnBgMuted, mb: 1.2 }}>
                {ownedNotes.length} bilhete{ownedNotes.length !== 1 ? 's' : ''}
              </Typography>

              {/* Search bar - frosted glass */}
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1, px: 1.4, py: 0.75, mb: 1,
                background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)',
                border: '1.5px solid rgba(255,255,255,0.6)', borderRadius: radius.lg,
              }}>
                <SearchIcon sx={{ fontSize: 17, color: colors.text.muted, flexShrink: 0 }} />
                <Box
                  component="input"
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  placeholder="Buscar bilhete..."
                  sx={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.86rem', color: colors.text.primary, fontFamily: 'inherit', '&::placeholder': { color: colors.text.muted } }}
                />
                {search && (
                  <Box onClick={() => setSearch('')} sx={{ display: 'flex', cursor: 'pointer', color: colors.text.muted }}>
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
                  <SwapVertIcon sx={{ fontSize: 15, color: colors.text.secondary }} />
                  <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: colors.text.secondary }}>{SORT_LABEL[sort]}</Typography>
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setViewMode((m) => (m === 'list' ? 'grid' : 'list'))}
                  sx={{ p: 0.5, borderRadius: radius.sm, '&:hover': { background: 'rgba(0,0,0,0.06)' } }}
                >
                  {viewMode === 'list'
                    ? <GridViewIcon sx={{ fontSize: 17, color: colors.text.secondary }} />
                    : <ViewListIcon sx={{ fontSize: 17, color: colors.text.secondary }} />}
                </IconButton>
              </Box>

              {/* Filter chips */}
              {(ownedRarities.length > 1 || favCount > 0) && (
                <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', mb: 1.2 }}>
                  <Chip
                    label={`Todos (${ownedNotes.length})`}
                    size="small"
                    onClick={() => { setRarityFilter(null); setFavFilter(false) }}
                    sx={{
                      height: 26, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                      bgcolor: noFilter ? theme.accent : 'rgba(255,255,255,0.5)',
                      color: noFilter ? '#fff' : colors.text.secondary,
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
                        color: favFilter ? '#fff' : colors.text.secondary,
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
                          color: active ? r.chipColor : colors.text.secondary,
                          border: `1.5px solid ${active ? r.borderColor : 'transparent'}`,
                        }}
                      />
                    )
                  })}
                </Box>
              )}

              {/* Notes */}
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

      {/* Pack opens dialog */}
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
              label="Aberturas para adicionar"
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
            <Button variant="ghost" loading={addPackOpensMutation.isPending} onClick={handleRemovePackAccess} sx={{ flex: '1 1 100%', color: colors.rose.main }}>
              Remover brinde
            </Button>
          )}
          <Button variant="ghost" onClick={() => setPackOpensDialog(null)} sx={{ flex: 1 }}>Cancelar</Button>
          <Button variant="primary" loading={addPackOpensMutation.isPending} disabled={packOpensInput < 1} onClick={handleConfirmPackOpens} sx={{ flex: 1 }}>
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Revoke confirmation dialog */}
      <Dialog
        open={revokeDialogOpen}
        onClose={() => setRevokeDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: radius.xl, mx: 2, background: 'rgba(255,253,251,0.98)' } } }}
      >
        <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 800, color: colors.rose.main, pb: 0.5 }}>
          Remover acesso
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={1.5}>
            <Typography sx={{ fontSize: '0.84rem', color: colors.text.secondary }}>
              Para confirmar, digite o email do leitor:
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: colors.text.primary, px: 1.2, py: 0.6, borderRadius: radius.md, background: 'rgba(0,0,0,0.04)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {email}
            </Typography>
            <TextField
              placeholder={email}
              value={revokeInput}
              onChange={(e) => setRevokeInput(e.target.value)}
              fullWidth
              size="small"
              autoComplete="off"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: radius.lg } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="ghost" onClick={() => setRevokeDialogOpen(false)} sx={{ flex: 1 }}>Cancelar</Button>
          <Button
            variant="ghost"
            loading={revokeMutation.isPending}
            disabled={revokeInput.trim() !== email}
            onClick={handleRevoke}
            sx={{ flex: 1, color: colors.rose.main, background: `${colors.rose.main}15`, border: `1px solid ${colors.rose.main}30`, '&:hover': { background: `${colors.rose.main}25` } }}
          >
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
