import FavoriteIcon from '@mui/icons-material/Favorite'
import SettingsIcon from '@mui/icons-material/Settings'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, LoadingState, ScrollablePage } from '../components/ui'
import { NoteDetailDialog } from '../components/collection/NoteDetailDialog'
import { useCollectionPlayQuery, useCollectionRaritiesQuery, useCollectionTypesQuery, useCollectionsQuery, useCollectionNotesQuery, useToggleCollectionFavoriteMutation } from '../hooks/useNotes'
import { useBackground } from '../context/BackgroundContext'
import { useUser } from '../context/UserContext'
import { useSimulation } from '../context/SimulationContext'
import { useReader } from '../context/ReaderContext'
import { colors, fadeIn, font, radius } from '../design-system'
import { slugify } from '../utils/slug'
import { isCollectionOwner } from '../utils/collectionAccess'
import { CollectionPanel } from '../components/album/CollectionPanel'
import { AlbumSection, ALBUM_VIEW_KEY } from './play/AlbumSection'
import type { AlbumView, AlbumSort, AlbumGroup, AlbumFilter } from './play/AlbumSection'
import type { CollectionNoteView } from '../types/note'

export type { ReadableNote } from '../components/collection/NoteDetailDialog'
export type { AlbumView, AlbumSort } from './play/AlbumSection'
export { ALBUM_VIEW_KEY } from './play/AlbumSection'
export { RewardCard } from '../components/collection/RewardCard'
export type { ImageLayout } from '../components/collection/RewardCard'
export { NoteDetailDialog } from '../components/collection/NoteDetailDialog'
export { NoteCard } from '../components/collection/NoteCard'
export { PackOpeningDialog, PACK_OPEN_ANIMATION_MS, wait } from '../components/collection/PackOpeningDialog'

export function CollectionPlayPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user, persona } = useUser()
  const { theme } = useBackground()
  const reader = useReader()

  const { data: collections = [], isLoading: collectionsLoading } = useCollectionsQuery()
  const collection = collections.find((item) => slugify(item.name) === slug)
  const cid = collection?.id ?? ''
  const collectionName = collection?.name
  const notFound = !collectionsLoading && !collection

  const simulation = useSimulation()
  const isSimulating = simulation.isSimulatingCollection(cid)
  const { data: playFromApi, isLoading: playLoading } = useCollectionPlayQuery(cid, { enabled: !isSimulating })
  const { data: notes = [], isLoading: notesLoading } = useCollectionNotesQuery(cid, { enabled: isSimulating })
  const play = isSimulating ? simulation.getPlayView(notes) : playFromApi

  const [albumFilter, setAlbumFilter] = useState<AlbumFilter>('all')
  const [albumSearch, setAlbumSearch] = useState('')
  const [albumRarity, setAlbumRarity] = useState('all')
  const [albumType, setAlbumType] = useState('all')
  const [albumView, setAlbumView] = useState<AlbumView>(() => (localStorage.getItem(ALBUM_VIEW_KEY) as AlbumView) || 'list')
  const [albumSort, setAlbumSort] = useState<AlbumSort>('recent')
  const [albumGroup, setAlbumGroup] = useState<AlbumGroup>('rarity')
  const [selectedNote, setSelectedNote] = useState<CollectionNoteView | null>(null)

  const isLoading = collectionsLoading || (!!cid && (isSimulating ? notesLoading : playLoading))
  const { data: rarities = [] } = useCollectionRaritiesQuery(cid)
  const { data: types = [] } = useCollectionTypesQuery(cid)
  const favoriteMutation = useToggleCollectionFavoriteMutation(cid)

  const isCollectionOwnerUser = collection ? isCollectionOwner(collection, user?.id) : false
  const isReaderView = !isSimulating && (persona === 'reader' || !isCollectionOwnerUser)
  const isWriter = isCollectionOwnerUser && persona === 'writer' && !isSimulating

  function changeAlbumView(v: AlbumView) {
    setAlbumView(v)
    localStorage.setItem(ALBUM_VIEW_KEY, v)
  }

  function handleSelectNote(note: CollectionNoteView) {
    if (isSimulating) simulation.markNoteViewed(note.id)
    else if (isReaderView && cid) reader.markViewed(cid, note.id)
    setSelectedNote(note)
  }

  useEffect(() => {
    if (isReaderView && cid) reader.setActiveCollectionId(cid)
  }, [isReaderView, cid, reader])

  useEffect(() => {
    setAlbumSearch('')
    setAlbumRarity('all')
    setAlbumType('all')
    setSelectedNote(null)
  }, [cid, isSimulating])

  const discoveredItems = useMemo(() => (play?.items ?? []).filter((item) => item.owned), [play?.items])
  const discoveredRarityIds = useMemo(() => new Set(discoveredItems.map((item) => item.rarity)), [discoveredItems])
  const discoveredTypeIds = useMemo(() => new Set(discoveredItems.map((item) => item.typeId)), [discoveredItems])
  const hasFavorites = useMemo(() => discoveredItems.some((item) => item.favorite), [discoveredItems])
  const discoveredRarities = useMemo(() => rarities.filter((rarity) => discoveredRarityIds.has(rarity.id)), [discoveredRarityIds, rarities])
  const discoveredTypes = useMemo(() => types.filter((type) => discoveredTypeIds.has(type.id)), [discoveredTypeIds, types])
  const albumItems = useMemo(() => {
    const q = albumSearch.trim().toLowerCase()
    return discoveredItems.filter((item) => {
      const matchesStatus = albumFilter === 'all' || (albumFilter === 'favorites' && item.favorite)
      const matchesRarity = albumRarity === 'all' || item.rarity === albumRarity
      const matchesType = albumType === 'all' || item.typeId === albumType
      const matchesSearch = q === '' || (item.title?.toLowerCase().includes(q) ?? false) || (item.message?.toLowerCase().includes(q) ?? false)
      return matchesStatus && matchesRarity && matchesType && matchesSearch
    })
  }, [albumFilter, albumRarity, albumSearch, albumType, discoveredItems])

  useEffect(() => {
    if (albumFilter === 'favorites' && !hasFavorites) setAlbumFilter('all')
  }, [albumFilter, hasFavorites])

  return (
    <Box sx={{ height: '100%', position: 'relative', background: theme.gradient }}>
      <FavoriteIcon sx={{ position: 'absolute', bottom: -60, right: -60, fontSize: 400, color: 'rgba(225,29,72,0.04)', pointerEvents: 'none' }} />

      <ScrollablePage sx={{ px: 2.5, py: 2.5, animation: `${fadeIn} 0.35s ease` }}>
        <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 3 }}>
          {!isSimulating && (
            <IconButton size="small" aria-label={isReaderView ? 'voltar para o início' : 'voltar para coleções'} onClick={() => navigate(isReaderView ? '/home' : '/colecoes')} sx={{ width: 38, height: 38, color: theme.textOnBg, background: 'rgba(255,255,255,0.5)', border: '1.5px solid rgba(255,255,255,0.66)', backdropFilter: 'blur(14px)', boxShadow: '0 8px 24px rgba(15,23,42,0.08)', transition: 'transform 0.16s ease, background 0.16s ease, box-shadow 0.16s ease', '&:hover': { background: 'rgba(255,255,255,0.76)', transform: 'translateX(-2px) scale(1.04)', boxShadow: '0 10px 28px rgba(15,23,42,0.12)' }, '&:active': { transform: 'translateX(-1px) scale(0.98)' } }}>
              <ArrowBackIcon sx={{ fontSize: 20, filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.6))' }} />
            </IconButton>
          )}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.15rem', color: theme.textOnBg }}>
              {isLoading ? 'Carregando...' : collectionName ?? (play ? 'Coleção' : '—')}
            </Typography>
            {isSimulating && (
              <Typography sx={{ mt: 0.15, fontSize: '0.72rem', color: theme.textOnBgMuted, fontWeight: 700 }}>
                visão do leitor · coleção ativa
              </Typography>
            )}
          </Box>
          {isWriter && slug && (
            <IconButton size="small" aria-label="gerenciar coleção" onClick={() => navigate(`/colecoes/${slug}/gerenciar`)} sx={{ color: theme.textOnBgMuted }}>
              <SettingsIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
        </Stack>

        {isLoading && (
          <LoadingState label="Preparando coleção" accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} sx={{ minHeight: 320 }} />
        )}

        {notFound && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.1rem', color: theme.textOnBg, mb: 1 }}>
              Coleção não encontrada
            </Typography>
            <Button variant="primary" onClick={() => navigate('/colecoes')}>Voltar às coleções</Button>
          </Box>
        )}

        {!isLoading && !notFound && play && (
          <Stack spacing={2.5}>
            {isSimulating && (
              <Card sx={{ p: 1.6, background: 'rgba(255,255,255,0.62)', backdropFilter: 'blur(14px)', border: `1.5px solid ${theme.accent}26`, boxShadow: `0 8px 24px ${theme.accent}12` }}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Box sx={{ width: 40, height: 40, borderRadius: radius.lg, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${theme.accent}14`, color: theme.accent, fontSize: '1.25rem', flexShrink: 0 }}>
                    {collection?.emoji ?? '💌'}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, letterSpacing: 0.8, color: theme.accent, textTransform: 'uppercase' }}>
                      Simulando leitor novo
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: colors.text.secondary, lineHeight: 1.35 }}>
                      Abra pacotinhos, veja as cartinhas coletadas e favorite bilhetes como quem recebeu acesso.
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            )}

            <CollectionPanel play={play} rarities={rarities} />

            {(isSimulating || discoveredItems.length > 0) && (
              <AlbumSection
                search={albumSearch} setSearch={setAlbumSearch}
                filter={albumFilter} setFilter={setAlbumFilter}
                rarity={albumRarity} setRarity={setAlbumRarity}
                type={albumType} setType={setAlbumType}
                view={albumView} setView={changeAlbumView}
                sort={albumSort} setSort={setAlbumSort}
                group={albumGroup} setGroup={setAlbumGroup}
                hasFavorites={hasFavorites}
                discoveredRarities={discoveredRarities}
                discoveredTypes={discoveredTypes}
                items={albumItems}
                rarities={rarities}
                types={types}
                theme={theme}
                onSelect={handleSelectNote}
                onToggleFavorite={(note) => {
                  if (isSimulating) { simulation.toggleFavorite(note.id, !note.favorite); return }
                  favoriteMutation.mutate({ id: note.id, favorite: !note.favorite })
                }}
                unreadIds={isSimulating ? simulation.unreadNoteIds : (cid ? reader.unreadFor(cid) : [])}
                emptyHint={isSimulating ? 'Abra pacotinhos na tela inicial ou ajuste os filtros.' : 'Abra um pacotinho ou ajuste os filtros.'}
              />
            )}

            {!isSimulating && play.total > 0 && play.items.filter((n) => !n.owned).length > 0 && (
              <Stack spacing={1}>
                <Box>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: 1.2, color: theme.textOnBgMuted, textTransform: 'uppercase' }}>
                    Ainda por descobrir — {play.items.filter((n) => !n.owned).length}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: theme.textOnBgMuted, mt: 0.3, fontStyle: 'italic' }}>
                    Continue abrindo pacotinhos para descobrir estas cartinhas 💌
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {play.items.filter((n) => !n.owned).map((note) => {
                    const r = rarities.find((x) => x.id === note.rarity)
                    return (
                      <Box key={note.id} sx={{ px: 1, py: 0.5, borderRadius: radius.full, background: 'rgba(255,255,255,0.08)', fontSize: '0.68rem', fontWeight: 700, color: theme.textOnBgMuted, display: 'flex', alignItems: 'center', gap: 0.4 }}>
                        {r?.emoji ?? '📝'} ???
                      </Box>
                    )
                  })}
                </Box>
              </Stack>
            )}
          </Stack>
        )}
      </ScrollablePage>

      <NoteDetailDialog note={selectedNote} rarities={rarities} types={types} onClose={() => setSelectedNote(null)} />
    </Box>
  )
}
