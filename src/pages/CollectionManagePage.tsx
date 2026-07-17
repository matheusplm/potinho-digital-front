import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { Box, IconButton, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LoadingState, PageTitle, ScrollablePage, SegmentedControl, toast } from '../components/ui'
import { useCollectionsQuery } from '../hooks/useNotes'
import { useBackground } from '../context/BackgroundContext'
import { FloatingParticles } from '../components/FloatingParticles'
import { useUser } from '../context/UserContext'
import { fadeIn } from '../design-system'
import { isCollectionOwner } from '../utils/collectionAccess'
import { slugify } from '../utils/slug'
import { NotesTab } from './manage/NotesTab'
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
              '&:hover': { background: 'rgba(255,255,255,0.76)', transform: 'translateX(-2px) scale(1.04)', boxShadow: '0 10px 28px rgba(15,23,42,0.12)' },
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
          <SegmentedControl options={TABS} value={tab} onChange={setTab} />
        </Box>

        {tab === 'notes' && <NotesTab cid={cid} />}
        {tab === 'rarities' && <RaritiesTab cid={cid} />}
        {tab === 'types' && <TypesTab cid={cid} />}
        {tab === 'packs' && <PacksTab cid={cid} />}
        {tab === 'achievements' && <AchievementsTab cid={cid} />}
        {tab === 'access' && <AccessTab cid={cid} />}
      </ScrollablePage>
    </Box>
  )
}
