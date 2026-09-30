import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button, LoadingState, PageTitle, ScrollablePage, SegmentedControl, toast } from '../components/ui'
import { useCollectionsQuery } from '../hooks/useNotes'
import { useBackground } from '../context/BackgroundContext'
import { FloatingParticles } from '../components/FloatingParticles'
import { useUser } from '../context/UserContext'
import { fadeIn, colors, font } from '../design-system'
import { isCollectionOwner } from '../utils/collectionAccess'
import { findCollectionBySlug } from '../utils/slug'
import { NotesTab, type NotesIntent } from './manage/NotesTab'
import { RaritiesTab } from './manage/RaritiesTab'
import { TypesTab } from './manage/TypesTab'
import { PacksTab } from './manage/PacksTab'
import { AchievementsTab } from './manage/AchievementsTab'
import { AccessTab } from './manage/AccessTab'

type Tab = 'notes' | 'rarities' | 'types' | 'packs' | 'achievements' | 'access'

const TABS = [
  { id: 'notes' as Tab, label: 'Bilhetes' },
  { id: 'rarities' as Tab, label: 'Raridades' },
  { id: 'types' as Tab, label: 'Tipos' },
  { id: 'packs' as Tab, label: 'Pacotinhos' },
  { id: 'achievements' as Tab, label: 'Conquistas' },
  { id: 'access' as Tab, label: 'Acesso' },
]

const TAB_PARAM: Record<string, Tab> = {
  bilhetes: 'notes', raridades: 'rarities', tipos: 'types', pacotinhos: 'packs', conquistas: 'achievements', acesso: 'access',
}

const TAB_SLUG = Object.fromEntries(Object.entries(TAB_PARAM).map(([param, id]) => [id, param])) as Record<Tab, string>

function notesIntentFrom(params: URLSearchParams): NotesIntent | undefined {
  if (params.get('novo') === '1') return 'new'
  if (params.get('ver') === 'rascunhos') return 'drafts'
  return undefined
}

export function CollectionManagePage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { theme } = useBackground()
  const { user } = useUser()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>(() => TAB_PARAM[searchParams.get('aba') ?? ''] ?? 'notes')
  const [notesIntent] = useState(() => notesIntentFrom(searchParams))

  const tabFromUrl = TAB_PARAM[searchParams.get('aba') ?? '']

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== tab) setTab(tabFromUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFromUrl])

  useEffect(() => {
    if (!searchParams.has('novo') && !searchParams.has('ver')) return
    const next = new URLSearchParams(searchParams)
    next.delete('novo')
    next.delete('ver')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  const changeTab = (next: Tab) => {
    setTab(next)
    setSearchParams(next === 'notes' ? {} : { aba: TAB_SLUG[next] }, { replace: true })
  }

  const { data: collections = [], isLoading: collectionsLoading } = useCollectionsQuery()
  const collection = findCollectionBySlug(collections, slug)
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

  if (collectionsLoading || (collection && !canManage)) {
    return (
      <Box sx={{ height: '100%', position: 'relative', background: theme.gradient }}>
        <FloatingParticles />
        <ScrollablePage sx={{ px: 2.5, py: 2.5 }}>
          <LoadingState label="Carregando coleção" accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} sx={{ minHeight: 360 }} />
        </ScrollablePage>
      </Box>
    )
  }

  if (!collection) {
    return (
      <Box sx={{ height: '100%', position: 'relative', background: theme.gradient }}>
        <FloatingParticles />
        <ScrollablePage sx={{ px: 2.5, py: 2.5 }}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.1rem', color: theme.textOnBg, mb: 1 }}>
              Coleção não encontrada
            </Typography>
            <Button variant="primary" onClick={() => navigate('/colecoes')}>Voltar às coleções</Button>
          </Box>
        </ScrollablePage>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100%', position: 'relative', background: theme.gradient }}>
      <FloatingParticles />
      <FavoriteIcon sx={{ position: 'absolute', bottom: -60, right: -60, fontSize: 400, color: 'rgba(225,29,72,0.04)', pointerEvents: 'none' }} />

      <ScrollablePage sx={{ px: 2.5, py: 2.5, animation: `${fadeIn} 0.35s ease` }}>
        <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 2.5 }}>
          <IconButton
            size="small"
            aria-label="voltar para coleções"
            onClick={() => navigate('/colecoes')}
            sx={{
              width: 38, height: 38, color: theme.textOnBg,
              background: theme.surfaceBg, border: `1.5px solid ${theme.surfaceBorder}`,
              backdropFilter: 'blur(14px)', boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
              transition: 'transform 0.16s ease, background 0.16s ease, box-shadow 0.16s ease',
              '&:hover': { background: colors.glass.strong, transform: 'translateX(-2px) scale(1.04)', boxShadow: '0 10px 28px rgba(15,23,42,0.12)' },
              '&:active': { transform: 'translateX(-1px) scale(0.98)' },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 20, filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.6))' }} />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <PageTitle title={collection?.name ?? 'Gerenciar'} subtitle="Bilhetes, raridades, tipos, pacotinhos e acessos" />
          </Box>
        </Stack>

        <Box sx={{ mb: 2 }}>
          <SegmentedControl options={TABS} value={tab} onChange={changeTab} />
        </Box>

        {tab === 'notes' && <NotesTab cid={cid} intent={notesIntent} />}
        {tab === 'rarities' && <RaritiesTab cid={cid} />}
        {tab === 'types' && <TypesTab cid={cid} />}
        {tab === 'packs' && <PacksTab cid={cid} />}
        {tab === 'achievements' && <AchievementsTab cid={cid} />}
        {tab === 'access' && <AccessTab cid={cid} />}
      </ScrollablePage>
    </Box>
  )
}
