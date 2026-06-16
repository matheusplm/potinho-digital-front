import FavoriteIcon from '@mui/icons-material/Favorite'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { Box, Divider, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { Button, Card, Input, LoadingState, SegmentedControl, toast } from '../components/ui'
import { colors, font, gradients, radius, shadow } from '../design-system'

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
    </Box>
  )
}
