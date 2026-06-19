import FavoriteIcon from '@mui/icons-material/Favorite'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { Box, Divider, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { Button, Card, Input, LoadingState, OnboardingOverlay, SegmentedControl, toast } from '../components/ui'
import { colors, font, gradients, radius, shadow } from '../design-system'
import { RewardCard } from './CollectionPlayPage'
import type { ImageLayout } from './CollectionPlayPage'
import type { CollectionDailyReward, RarityConfig, NoteTypeConfig, NoteImageLayout } from '../types/note'

const IMAGE_LAYOUTS: { value: NoteImageLayout; label: string }[] = [
  { value: 'banner', label: 'Banner' },
  { value: 'thumb-left', label: 'Thumb esq' },
  { value: 'thumb-right', label: 'Thumb dir' },
  { value: 'circle-left', label: 'Círculo esq' },
  { value: 'circle-right', label: 'Círculo dir' },
  { value: 'split', label: 'Split' },
  { value: 'stripe-left', label: 'Stripe' },
  { value: 'hero-overlay', label: 'Hero' },
  { value: 'bg-blur', label: 'Blur' },
]

const MOCK_RARITY: RarityConfig = {
  id: 'r1', label: 'Raro', emoji: '💜', odds: 20, order: 1,
  cardBg: 'linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%)',
  textColor: '#6b21a8', captionColor: '#9333ea', borderColor: '#c084fc',
  shadow: '0 4px 24px #a855f740', glowColor: '#a855f7',
  chipBg: 'linear-gradient(90deg,#f3e8ff,#ede9fe)', chipColor: '#7c3aed',
}

const MOCK_TYPE: NoteTypeConfig = {
  id: 't1', label: 'Especial', emoji: '✨', order: 1,
  accentColor: '#a855f7', tagBg: '#f3e8ff', tagColor: '#7c3aed',
}

const REWARD_COM_IMAGEM: CollectionDailyReward = {
  id: '1', title: 'Você é incrível', isNew: true,
  message: 'Cada dia ao seu lado é um presente. Obrigado por existir na minha vida.',
  rarity: 'r1', typeId: 't1',
  imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&q=80',
}


function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Stack spacing={1.5}>
      <Typography sx={{ fontSize: '0.66rem', fontWeight: 900, letterSpacing: 1.4, color: colors.text.muted, textTransform: 'uppercase' }}>
        {title}
      </Typography>
      {children}
      <Divider sx={{ opacity: 0.3, mt: 0.5 }} />
    </Stack>
  )
}

function LayoutSelectorPreview() {
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&q=80')
  const [selected, setSelected] = useState<NoteImageLayout>('banner')

  return (
    <Stack spacing={2} sx={{ background: 'rgba(255,255,255,0.6)', borderRadius: radius.xl, p: 2.5, backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)' }}>
      <Typography sx={{ fontSize: '0.66rem', fontWeight: 900, letterSpacing: 1.4, color: colors.text.muted, textTransform: 'uppercase' }}>Seletor de layout</Typography>

      <Stack spacing={0.5}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: colors.text.secondary }}>
          Imagem <Typography component="span" sx={{ fontSize: '0.68rem', fontWeight: 400, color: colors.text.muted }}>(opcional)</Typography>
        </Typography>
        <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://exemplo.com/imagem.jpg" />
      </Stack>

      {imageUrl && (
        <Stack spacing={0.8}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: colors.text.secondary }}>Layout da imagem</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
            {IMAGE_LAYOUTS.map((opt) => (
              <Box key={opt.value} onClick={() => setSelected(opt.value)} sx={{
                px: 1.4, py: 0.5, borderRadius: radius.full, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
                background: selected === opt.value ? colors.primary.main : 'rgba(0,0,0,0.05)',
                color: selected === opt.value ? '#fff' : colors.text.secondary,
                border: `1.5px solid ${selected === opt.value ? colors.primary.main : 'transparent'}`,
                transition: 'all 0.15s',
              }}>
                {opt.label}
              </Box>
            ))}
          </Box>
        </Stack>
      )}
    </Stack>
  )
}

const SWATCHES = [
  { label: 'Primary', bg: colors.primary.main },
  { label: 'Rose', bg: colors.rose.main },
  { label: 'Purple', bg: colors.purple.main },
  { label: 'Success', bg: colors.success.main },
  { label: 'Text', bg: colors.text.primary },
  { label: 'Muted', bg: colors.text.muted },
]

export function TestPage() {
  const [seg, setSeg] = useState('a')
  const [seg2, setSeg2] = useState('create')
  const [onboardingKey, setOnboardingKey] = useState(0)
  const [inputVal, setInputVal] = useState('')
  const [passVal, setPassVal] = useState('')
  const [errorVal, setErrorVal] = useState('valor inválido')

  return (
    <Box sx={{
      minHeight: '100dvh',
      background: gradients.brand,
      px: 3, py: 4,
      maxWidth: 480,
      mx: 'auto',
    }}>
      <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 0.6 }}>
        <Box sx={{
          width: 38, height: 38, borderRadius: radius.lg, flexShrink: 0,
          background: gradients.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FavoriteIcon sx={{ fontSize: 18, color: '#fff' }} />
        </Box>
        <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.7rem', color: colors.text.primary, lineHeight: 1 }}>
          Componentes
        </Typography>
      </Stack>
      <Typography sx={{ fontSize: '0.8rem', color: colors.text.muted, pl: 0.5, mb: 4.5, fontStyle: 'italic' }}>
        Design system · potinho-digital/ui
      </Typography>

      <Stack spacing={3.5}>

        <Section title="Cores">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2 }}>
            {SWATCHES.map((s) => (
              <Stack key={s.label} spacing={0.7} alignItems="center">
                <Box sx={{ width: 44, height: 44, borderRadius: radius.md, background: s.bg, boxShadow: shadow.sm }} />
                <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: colors.text.muted, textAlign: 'center' }}>
                  {s.label}
                </Typography>
              </Stack>
            ))}
          </Box>
        </Section>

        <Section title="Tipografia">
          <Stack spacing={0.8}>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.9rem', color: colors.text.primary, lineHeight: 1.1 }}>
              Serif · Heading
            </Typography>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.2rem', color: colors.text.primary }}>
              Serif · Subheading
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: colors.text.primary }}>
              Sans · Body bold
            </Typography>
            <Typography sx={{ fontSize: '0.86rem', color: colors.text.secondary }}>
              Sans · Body regular
            </Typography>
            <Typography sx={{ fontSize: '0.74rem', color: colors.text.muted }}>
              Sans · Caption / muted
            </Typography>
          </Stack>
        </Section>

        <Section title="Button">
          <Stack spacing={1}>
            <Stack direction="row" spacing={1}>
              <Button variant="primary" sx={{ flex: 1 }}>Primary</Button>
              <Button variant="rose" sx={{ flex: 1 }}>Rose</Button>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button variant="purple" sx={{ flex: 1 }}>Purple</Button>
              <Button variant="ghost" sx={{ flex: 1 }}>Ghost</Button>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button variant="primary" sx={{ flex: 1 }} loading>Loading</Button>
              <Button variant="primary" sx={{ flex: 1 }} disabled>Disabled</Button>
            </Stack>
          </Stack>
        </Section>

        <Section title="Input">
          <Stack spacing={1.5}>
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              fullWidth
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={passVal}
              onChange={(e) => setPassVal(e.target.value)}
              fullWidth
            />
            <Input
              label="Com erro"
              placeholder="Valor inválido"
              value={errorVal}
              onChange={(e) => setErrorVal(e.target.value)}
              error
              helperText="Mínimo de 6 caracteres"
              fullWidth
            />
          </Stack>
        </Section>

        <Section title="Card">
          <Stack spacing={1.2}>
            <Card sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 700, color: colors.text.primary, mb: 0.3 }}>Card padrão</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: colors.text.secondary }}>Sem accent · borda e sombra neutras</Typography>
            </Card>
            <Card accent={colors.primary.main} sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 700, color: colors.primary.main, mb: 0.3 }}>Card accent · Primary</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: colors.text.secondary }}>Borda e glow no accent passado</Typography>
            </Card>
            <Card accent={colors.rose.main} sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 700, color: colors.rose.main, mb: 0.3 }}>Card accent · Rose</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: colors.text.secondary }}>Borda e glow no accent passado</Typography>
            </Card>
          </Stack>
        </Section>

        <Section title="LoadingState">
          <Stack spacing={1.2}>
            <Card sx={{ p: 1 }}>
              <LoadingState label="Carregando algo" compact />
            </Card>
            <Card sx={{ p: 1 }}>
              <LoadingState label="Carregando coleção" />
            </Card>
          </Stack>
        </Section>

        <Section title="SegmentedControl">
          <Stack spacing={1.5}>
            <SegmentedControl
              value={seg}
              onChange={setSeg}
              options={[
                { id: 'a', label: 'Opção A', activeColor: colors.primary.main },
                { id: 'b', label: 'Opção B', activeColor: colors.rose.main },
                { id: 'c', label: 'Opção C', activeColor: colors.purple.main },
              ]}
            />
            <SegmentedControl
              value={seg2}
              onChange={setSeg2}
              options={[
                { id: 'create', label: 'Criar potinho', icon: <AutoAwesomeIcon />, activeColor: colors.primary.main },
                { id: 'reader', label: 'Sou leitor', icon: <FavoriteBorderIcon />, activeColor: colors.rose.main },
              ]}
            />
          </Stack>
        </Section>

        <Section title="Onboarding">
          <Button variant="primary" onClick={() => setOnboardingKey((k) => k + 1)}>
            Abrir Onboarding
          </Button>
          {onboardingKey > 0 && <OnboardingOverlay key={onboardingKey} />}
        </Section>

        <Section title="Toast">
          <Stack spacing={1}>
            <Stack direction="row" spacing={1}>
              <Button variant="primary" sx={{ flex: 1 }} onClick={() => toast.success('Tudo certo!', { description: 'Operação realizada com sucesso.' })}>
                Success
              </Button>
              <Button variant="rose" sx={{ flex: 1 }} onClick={() => toast.error('Algo deu errado.', { description: 'Tente novamente em instantes.' })}>
                Error
              </Button>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button variant="ghost" sx={{ flex: 1 }} onClick={() => toast.info('Informação', { description: 'Aqui vai uma mensagem informativa.' })}>
                Info
              </Button>
              <Button
                variant="primary"
                sx={{ flex: 1, background: gradients.rose, boxShadow: shadow.rose }}
                onClick={() => toast.love('Bilhete favoritado! 💙')}
              >
                <FavoriteIcon sx={{ fontSize: 15, mr: 0.6 }} /> Love
              </Button>
            </Stack>
          </Stack>
        </Section>

      </Stack>

      <Box sx={{ height: 48 }} />

      <Box sx={{ background: gradients.brand, px: 3, py: 4, maxWidth: 480, mx: 'auto' }}>
        <Stack spacing={3}>
          <LayoutSelectorPreview />
        </Stack>
      </Box>

      <Box sx={{ height: 48 }} />

        {([
          ['1 — banner', 'banner'],
          ['2 — banner fino', 'banner-slim'],
          ['3 — banner base', 'banner-bottom'],
          ['4 — gradient fade', 'gradient-fade'],
          ['5 — thumb esquerda', 'thumb-left'],
          ['6 — thumb direita', 'thumb-right'],
          ['7 — círculo esquerda', 'circle-left'],
          ['8 — círculo direita', 'circle-right'],
          ['9 — corner sup dir', 'corner-tr'],
          ['10 — corner sup esq', 'corner-tl'],
          ['11 — corner inf dir', 'corner-br'],
          ['12 — corner inf esq', 'corner-bl'],
          ['13 — círculo topo', 'circle-top'],
          ['14 — polaroid', 'polaroid'],
          ['15 — centralizado', 'centered'],
          ['16 — stamp', 'stamp'],
          ['17 — split', 'split'],
          ['18 — stripe lateral', 'stripe-left'],
          ['19 — hero overlay', 'hero-overlay'],
          ['20 — bg blur', 'bg-blur'],
        ] as [string, ImageLayout][]).map(([label, layout]) => (
          <Section key={layout} title={`Bilhete — ${label}`}>
            <RewardCard reward={REWARD_COM_IMAGEM} rarities={[MOCK_RARITY]} types={[MOCK_TYPE]} imageLayout={layout} />
          </Section>
        ))}

      <Box sx={{ height: 48 }} />
    </Box>
  )
}
