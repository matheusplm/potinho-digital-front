import FavoriteIcon from '@mui/icons-material/Favorite'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { Box, Divider, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { Button, Input, SegmentedControl, toast } from '../components/ui'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Stack spacing={1.5}>
      <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: 1.2, color: '#94a3b8', textTransform: 'uppercase' }}>
        {title}
      </Typography>
      {children}
      <Divider sx={{ opacity: 0.4, mt: 1 }} />
    </Stack>
  )
}

export function TestPage() {
  const [seg, setSeg] = useState('a')
  const [seg2, setSeg2] = useState('criar')
  const [inputVal, setInputVal] = useState('')
  const [passVal, setPassVal] = useState('')

  return (
    <Box sx={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #dbeafe 0%, #fce7f3 55%, #ede9fe 100%)',
      px: 3, py: 4,
    }}>
      <Stack spacing={0.5} sx={{ mb: 4 }}>
        <Typography sx={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '2rem', color: '#1e3a5f' }}>
          Componentes
        </Typography>
        <Typography sx={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
          Playground — potinho-digital/ui
        </Typography>
      </Stack>

      <Stack spacing={3.5}>

        <Section title="Button">
          <Stack spacing={1.2}>
            <Button variant="primary" fullWidth>Primary</Button>
            <Button variant="rose" fullWidth>Rose</Button>
            <Button variant="purple" fullWidth>Purple</Button>
            <Button variant="ghost" fullWidth>Ghost</Button>
            <Button variant="primary" fullWidth loading>Loading...</Button>
            <Button variant="primary" fullWidth disabled>Disabled</Button>
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
              label="Código de convite"
              placeholder="Ex: AMOR01"
              fullWidth
              sx={{ '& input': { letterSpacing: '0.2em', fontWeight: 700 } }}
            />
          </Stack>
        </Section>

        <Section title="SegmentedControl">
          <Stack spacing={1.5}>
            <SegmentedControl
              value={seg}
              onChange={setSeg}
              options={[
                { id: 'a', label: 'Opção A', activeColor: '#1d4ed8' },
                { id: 'b', label: 'Opção B', activeColor: '#e11d48' },
                { id: 'c', label: 'Opção C', activeColor: '#7c3aed' },
              ]}
            />
            <SegmentedControl
              value={seg2}
              onChange={setSeg2}
              options={[
                { id: 'criar', label: 'Criar potinho', icon: <AutoAwesomeIcon />, activeColor: '#1d4ed8' },
                { id: 'convite', label: 'Tenho convite', icon: <FavoriteBorderIcon />, activeColor: '#e11d48' },
              ]}
            />
          </Stack>
        </Section>

        <Section title="Toast">
          <Stack spacing={1.2}>
            <Button variant="primary" fullWidth onClick={() => toast.success('Tudo certo!', { description: 'Operação realizada com sucesso.' })}>
              Success
            </Button>
            <Button variant="rose" fullWidth onClick={() => toast.error('Algo deu errado.', { description: 'Tente novamente em instantes.' })}>
              Error
            </Button>
            <Button variant="ghost" fullWidth onClick={() => toast.info('Informação', { description: 'Aqui vai uma mensagem informativa.' })}>
              Info
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => toast.love('Bilhete favoritado! 💙')}
              sx={{ background: 'linear-gradient(135deg,#e11d48,#fb7185)', boxShadow: '0 6px 20px rgba(225,29,72,0.32)' }}
            >
              <FavoriteIcon sx={{ fontSize: 16, mr: 0.8 }} /> Love
            </Button>
          </Stack>
        </Section>

      </Stack>
    </Box>
  )
}
