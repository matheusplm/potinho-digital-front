import FavoriteIcon from '@mui/icons-material/Favorite'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import { Box, Chip, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, LoadingState, ScrollablePage } from '../components/ui'
import { useBackground } from '../context/BackgroundContext'
import { useUser } from '../context/UserContext'
import {
  useCollectionPacksQuery,
  useCollectionRaritiesQuery,
  useCollectionTypesQuery,
  useCollectionsQuery,
  useReaderViewQuery,
} from '../hooks/useNotes'
import { colors, font, radius } from '../design-system'
import { slugify } from '../utils/slug'
import { isCollectionOwner } from '../utils/collectionAccess'
import { NoteDetailDialog } from './CollectionPlayPage'
import type { CollectionNoteView, RarityConfig } from '../types/note'

type SortKey = 'recent' | 'rarity' | 'az'
const SORT_LABEL: Record<SortKey, string> = { recent: 'Recentes', rarity: 'Raridade', az: 'A-Z' }
const SORT_CYCLE: SortKey[] = ['recent', 'rarity', 'az']

function sortNotes(notes: CollectionNoteView[], sort: SortKey, rarityOrder: Record<string, number>) {
  const arr = [...notes]
  if (sort === 'az') return arr.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
  if (sort === 'rarity') return arr.sort((a, b) => (rarityOrder[b.rarity] ?? 0) - (rarityOrder[a.rarity] ?? 0) || a.title.localeCompare(b.title, 'pt-BR'))
  return arr.sort((a, b) => (b.obtainedAt ?? '').localeCompare(a.obtainedAt ?? ''))
}

function NoteRow({ note, rarity, onClick }: { note: CollectionNoteView; rarity?: RarityConfig; onClick: () => void }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        px: 1.4, py: 1.1, borderRadius: radius.lg, cursor: 'pointer',
        background: rarity ? `${rarity.cardBg}22` : 'rgba(0,0,0,0.02)',
        border: `1.5px solid ${rarity ? rarity.borderColor + '55' : 'rgba(0,0,0,0.06)'}`,
        transition: 'background 0.14s, border-color 0.14s',
        '&:hover': { background: rarity ? `${rarity.cardBg}44` : 'rgba(0,0,0,0.04)' },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.2}>
        {rarity && (
          <Box sx={{ width: 9, height: 9, borderRadius: radius.full, background: rarity.cardBg, flexShrink: 0, boxShadow: `0 0 6px ${rarity.glowColor ?? rarity.borderColor}88` }} />
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: rarity?.textColor ?? colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {note.title}
          </Typography>
          {rarity && (
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: rarity.captionColor ?? colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              {rarity.emoji} {rarity.label}
            </Typography>
          )}
        </Box>
        {note.favorite && <FavoriteIcon sx={{ fontSize: 12, color: colors.rose.main, flexShrink: 0 }} />}
      </Stack>
    </Box>
  )
}

export function ReaderCollectionPage() {
  const { slug = '', email: encodedEmail = '' } = useParams<{ slug: string; email: string }>()
  const navigate = useNavigate()
  const { theme } = useBackground()
  const { user } = useUser()
  const email = decodeURIComponent(encodedEmail)

  const { data: collections = [], isLoading: collectionsLoading } = useCollectionsQuery()
  const collection = collections.find((c) => slugify(c.name) === slug)
  const cid = collection?.id ?? ''
  const canManage = collection ? isCollectionOwner(collection, user?.id) : false

  const { data: view, isLoading: viewLoading, isError } = useReaderViewQuery(cid, canManage ? email : null)
  const { data: packs = [] } = useCollectionPacksQuery(cid)
  const { data: rarities = [] } = useCollectionRaritiesQuery(cid)
  const { data: types = [] } = useCollectionTypesQuery(cid)

  const [rarityFilter, setRarityFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('recent')
  const [viewingNote, setViewingNote] = useState<CollectionNoteView | null>(null)

  const rarityOrder = useMemo(() => Object.fromEntries(rarities.map((r) => [r.id, r.order])), [rarities])
  const rarityById = useMemo(() => new Map(rarities.map((r) => [r.id, r])), [rarities])

  const bonusPacks = useMemo(
    () => packs.filter((p) => p.distribution !== 'all_with_access' && view?.packOpens?.[p.id] !== undefined),
    [packs, view],
  )

  const ownedNotes = useMemo(() => view?.items.filter((i) => i.owned) ?? [], [view])
  const completion = view && view.total > 0 ? Math.round((view.owned / view.total) * 100) : 0

  const ownedRarities = useMemo(
    () => rarities.filter((r) => ownedNotes.some((n) => n.rarity === r.id)).sort((a, b) => a.order - b.order),
    [ownedNotes, rarities],
  )

  const filteredNotes = useMemo(() => {
    let notes = rarityFilter ? ownedNotes.filter((n) => n.rarity === rarityFilter) : ownedNotes
    if (search) {
      const q = search.toLowerCase()
      notes = notes.filter((n) => n.title.toLowerCase().includes(q) || n.message?.toLowerCase().includes(q))
    }
    return sortNotes(notes, sort, rarityOrder)
  }, [ownedNotes, rarityFilter, search, sort, rarityOrder])

  const isLoading = collectionsLoading || viewLoading

  if (!collectionsLoading && (!collection || !canManage)) {
    return (
      <ScrollablePage>
        <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
          <Typography sx={{ color: colors.text.muted }}>Coleção não encontrada.</Typography>
          <Button variant="primary" onClick={() => navigate('/home')} sx={{ mt: 2 }}>Voltar</Button>
        </Stack>
      </ScrollablePage>
    )
  }

  return (
    <ScrollablePage>
      <Stack spacing={0} sx={{ maxWidth: 680, mx: 'auto', px: 2, pb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ pt: 2, pb: 1.5 }}>
          <IconButton size="small" onClick={() => navigate(`/colecoes/${slug}/gerenciar`)} sx={{ mr: 0.5 }}>
            <ArrowBackIcon sx={{ fontSize: 20, color: colors.text.secondary }} />
          </IconButton>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.1rem', color: colors.text.primary, lineHeight: 1.2 }}>
              Coleção do leitor
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: colors.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {email}
            </Typography>
          </Box>
        </Stack>

        {isLoading && <LoadingState label="Carregando coleção..." />}

        {isError && !isLoading && (
          <Box sx={{ p: 3, borderRadius: radius.xl, background: `${colors.rose.main}0e`, border: `1px solid ${colors.rose.main}22`, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.85rem', color: colors.rose.main }}>
              Não foi possível carregar a coleção deste leitor.
            </Typography>
          </Box>
        )}

        {view && !isLoading && (
          <Stack spacing={2.5}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 1 }}>
              {[
                { label: 'coletados', value: `${view.owned}/${view.total}` },
                { label: 'conclusão', value: `${completion}%` },
                { label: 'favoritas', value: view.items.filter((i) => i.favorite).length },
                { label: 'pacote hoje', value: view.daily.canOpen ? '✓ disponível' : '⏳ aberto' },
              ].map((s) => (
                <Box key={s.label} sx={{ p: 1.2, borderRadius: radius.lg, background: 'rgba(0,0,0,0.025)', border: '1px solid rgba(0,0,0,0.06)', textAlign: 'center' }}>
                  <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1rem', color: colors.text.primary }}>
                    {s.value}
                  </Typography>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {s.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            {bonusPacks.length > 0 && (
              <Box>
                <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, letterSpacing: 0.7, color: colors.text.muted, textTransform: 'uppercase', mb: 0.8 }}>
                  Brindes
                </Typography>
                <Stack direction="row" spacing={0.7} sx={{ flexWrap: 'wrap', rowGap: 0.6 }}>
                  {bonusPacks.map((pack) => {
                    const opens = view.packOpens?.[pack.id] ?? 0
                    const active = opens > 0
                    return (
                      <Box key={pack.id} sx={{ px: 1, py: 0.5, borderRadius: radius.full, background: active ? `${pack.accent}14` : 'rgba(0,0,0,0.04)', border: `1px solid ${active ? pack.accent + '33' : 'rgba(0,0,0,0.08)'}` }}>
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: active ? pack.accent : colors.text.muted }}>
                          {pack.emoji} {pack.name} ({opens}x)
                        </Typography>
                      </Box>
                    )
                  })}
                </Stack>
              </Box>
            )}

            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.2 }}>
                <TextField
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar bilhete..."
                  size="small"
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: colors.text.muted }} /></InputAdornment>,
                      endAdornment: search ? (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setSearch('')}>
                            <CloseIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </InputAdornment>
                      ) : undefined,
                      sx: {
                        borderRadius: radius.lg, fontSize: '0.82rem',
                        background: 'rgba(0,0,0,0.03)',
                        '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' },
                        '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.18)' },
                      },
                    },
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => setSort((s) => SORT_CYCLE[(SORT_CYCLE.indexOf(s) + 1) % SORT_CYCLE.length])}
                  title={`Ordenar: ${SORT_LABEL[sort]}`}
                  sx={{ flexShrink: 0, border: '1px solid rgba(0,0,0,0.1)', borderRadius: radius.md, px: 1, gap: 0.4, background: 'rgba(0,0,0,0.02)' }}
                >
                  <SwapVertIcon sx={{ fontSize: 15, color: colors.text.secondary }} />
                  <Typography sx={{ fontSize: '0.66rem', fontWeight: 700, color: colors.text.secondary }}>
                    {SORT_LABEL[sort]}
                  </Typography>
                </IconButton>
              </Stack>

              {ownedRarities.length > 1 && (
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', rowGap: 0.5, mb: 1.4 }}>
                  <Chip
                    label={`Todos (${ownedNotes.length})`}
                    size="small"
                    onClick={() => setRarityFilter(null)}
                    sx={{
                      fontSize: '0.66rem', fontWeight: 700, height: 24, cursor: 'pointer',
                      background: !rarityFilter ? `${theme.accent}18` : 'rgba(0,0,0,0.05)',
                      color: !rarityFilter ? theme.accent : colors.text.secondary,
                      border: `1px solid ${!rarityFilter ? theme.accent + '44' : 'transparent'}`,
                    }}
                  />
                  {ownedRarities.map((r) => {
                    const count = ownedNotes.filter((n) => n.rarity === r.id).length
                    const active = rarityFilter === r.id
                    return (
                      <Chip
                        key={r.id}
                        label={`${r.emoji} ${r.label} (${count})`}
                        size="small"
                        onClick={() => setRarityFilter(active ? null : r.id)}
                        sx={{
                          fontSize: '0.66rem', fontWeight: 700, height: 24, cursor: 'pointer',
                          background: active ? `${r.cardBg}44` : 'rgba(0,0,0,0.05)',
                          color: active ? r.textColor : colors.text.secondary,
                          border: `1px solid ${active ? r.cardBg + '88' : 'transparent'}`,
                        }}
                      />
                    )
                  })}
                </Stack>
              )}

              {filteredNotes.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.85rem', color: colors.text.muted }}>
                    {search || rarityFilter ? 'Nenhum bilhete encontrado com esse filtro.' : 'Ainda não coletou nenhum bilhete.'}
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={0.6}>
                  {filteredNotes.map((note) => (
                    <NoteRow
                      key={note.id}
                      note={note}
                      rarity={rarityById.get(note.rarity)}
                      onClick={() => setViewingNote(note)}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        )}
      </Stack>

      {viewingNote && (
        <NoteDetailDialog
          note={viewingNote}
          rarities={rarities}
          types={types}
          onClose={() => setViewingNote(null)}
        />
      )}
    </ScrollablePage>
  )
}
