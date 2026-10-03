import FavoriteIcon from '@mui/icons-material/Favorite'
import { Box, Menu, MenuItem, Skeleton, Stack, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { Button, EmptyState, LoadingState, ScrollablePage, SectionLabel } from '../components/ui'
import { SendGiftDialog, type GiftTarget } from '../components/manage/SendGiftDialog'
import { colors, fadeIn, font, clipOverflow } from '../design-system'
import { useBackground } from '../context/BackgroundContext'
import { FloatingParticles } from '../components/FloatingParticles'
import { queryKeys } from '../hooks/useNotes'
import type { CollectionPack } from '../types/note'
import { managePath, type ReaderSummary } from './writer-home/insights'
import { useWriterHome } from './writer-home/useWriterHome'
import { ReaderCard } from './writer-home/ReaderCard'
import { TouchedSection } from './writer-home/TouchedSection'
import { TodoSection } from './writer-home/TodoSection'

export function WriterHomePage() {
  const { user } = useUser()
  const { theme } = useBackground()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const home = useWriterHome()
  const [giftMenu, setGiftMenu] = useState<{ reader: ReaderSummary; anchor: HTMLElement } | null>(null)
  const [gift, setGift] = useState<{ reader: ReaderSummary; target: GiftTarget } | null>(null)
  const [writeMenu, setWriteMenu] = useState<HTMLElement | null>(null)

  const firstName = user?.name?.split(' ')[0] ?? ''
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const hasCollections = home.collections.length > 0
  const settled = !home.loading

  function chooseGift(reader: ReaderSummary, pack: CollectionPack) {
    setGiftMenu(null)
    setGift({ reader, target: { email: reader.email, pack, currentOpens: reader.packOpens[pack.id] } })
  }

  function startGift(reader: ReaderSummary, anchor: HTMLElement) {
    if (reader.bonusPacks.length === 1) chooseGift(reader, reader.bonusPacks[0])
    else setGiftMenu({ reader, anchor })
  }

  function startWriting(anchor: HTMLElement) {
    if (home.collections.length === 1) navigate(managePath(home.collections[0].slug, { aba: 'bilhetes', novo: '1' }))
    else setWriteMenu(anchor)
  }

  return (
    <Box sx={{ height: '100%', position: 'relative', ...clipOverflow, background: theme.gradient }}>
      <FloatingParticles />
      <FavoriteIcon sx={{
        position: 'absolute', bottom: -80, right: -80,
        fontSize: 500, color: 'rgba(29,78,216,0.05)', pointerEvents: 'none',
      }} />

      <ScrollablePage sx={{ px: 2.5, py: 2.5, animation: `${fadeIn} 0.4s ease` }}>
        <Stack spacing={3} sx={{ width: '100%', maxWidth: 760, mx: 'auto', pb: 3 }}>
          <Stack spacing={0.3}>
            <Typography variant="md" sx={{ color: theme.textOnBgMuted, fontWeight: 500 }}>
              {greeting},
            </Typography>
            <Typography sx={{
              fontFamily: font.serif, fontWeight: 700, fontSize: '2rem',
              color: theme.textOnBg, lineHeight: 1.1, letterSpacing: '-0.5px',
              wordBreak: 'break-word',
            }}>
              {firstName} 💙
            </Typography>
            {settled ? (
              <Typography variant="lg" sx={{ color: theme.textOnBgMuted, fontStyle: 'italic', mt: 0.5 }}>
                {home.greeting}
              </Typography>
            ) : (
              <Skeleton variant="text" width={240} sx={{ bgcolor: colors.fill.medium, mt: 0.5 }} />
            )}
          </Stack>

          {!settled && (
            <LoadingState compact label="Preparando seu potinho" accent={theme.accent} textColor={theme.textOnBg} mutedColor={theme.textOnBgMuted} />
          )}

          {settled && !hasCollections && (
            <EmptyState
              emoji="🫙"
              title="Seu primeiro potinho"
              description="Crie uma coleção, escreva os bilhetes e convide quem você ama pra abrir os pacotinhos."
              action={<Button variant="primary" onClick={() => navigate('/colecoes')} sx={{ mt: 1.5 }}>Criar minha coleção</Button>}
            />
          )}

          {settled && hasCollections && (
            <>
              <TouchedSection readers={home.readers} raritiesByCollection={home.raritiesByCollection} />

              <Stack spacing={1.2}>
                <SectionLabel color={theme.textOnBgMuted}>🫶 Seus leitores</SectionLabel>
                {home.readers.length > 0 ? (
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 1.5 }}>
                    {home.readers.map((reader) => <ReaderCard key={reader.key} reader={reader} onGift={startGift} />)}
                  </Box>
                ) : (
                  <EmptyState
                    emoji="💌"
                    title="Ninguém lendo ainda"
                    description="Quando alguém aceitar seu convite, o progresso aparece aqui."
                  />
                )}
                {home.hiddenReaders > 0 && (
                  <Typography variant="sm" sx={{ color: theme.textOnBgMuted, textAlign: 'center' }}>
                    e mais {home.hiddenReaders} {home.hiddenReaders === 1 ? 'leitor' : 'leitores'} nas suas coleções
                  </Typography>
                )}
              </Stack>

              <TodoSection todos={home.todos} />

              <Stack direction="row" spacing={1}>
                <Button variant="primary" onClick={(event) => startWriting(event.currentTarget)} sx={{ flex: 1.4, py: 1.1 }}>
                  ✍️ Escrever bilhete
                </Button>
                <Button variant="ghost" onClick={() => navigate('/colecoes')} sx={{ flex: 1, py: 1.1 }}>
                  📚 Coleções
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </ScrollablePage>

      <Menu anchorEl={writeMenu} open={!!writeMenu} onClose={() => setWriteMenu(null)}>
        {home.collections.map(({ collection, slug }) => (
          <MenuItem key={collection.id} onClick={() => { setWriteMenu(null); navigate(managePath(slug, { aba: 'bilhetes', novo: '1' })) }}>
            {collection.emoji} {collection.name}
          </MenuItem>
        ))}
      </Menu>

      <Menu anchorEl={giftMenu?.anchor} open={!!giftMenu} onClose={() => setGiftMenu(null)}>
        {giftMenu?.reader.bonusPacks.map((pack) => (
          <MenuItem key={pack.id} onClick={() => chooseGift(giftMenu.reader, pack)}>
            {pack.emoji} {pack.name}
          </MenuItem>
        ))}
      </Menu>

      <SendGiftDialog
        cid={gift?.reader.collection.id ?? ''}
        target={gift?.target ?? null}
        onClose={() => setGift(null)}
        onSuccess={() => {
          if (!gift) return
          void queryClient.invalidateQueries({ queryKey: queryKeys.readerView(gift.reader.collection.id, gift.reader.email) })
        }}
      />
    </Box>
  )
}
