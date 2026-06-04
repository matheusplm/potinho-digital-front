import CloseIcon from '@mui/icons-material/Close'
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, toast } from './ui'
import { useSimulation, type SimulationPreset } from '../context/SimulationContext'
import { useCollectionsQuery } from '../hooks/useNotes'
import { colors, font, radius } from '../design-system'
import { slugify } from '../utils/slug'
import type { Collection } from '../types/note'

const PRESETS: { id: SimulationPreset; label: string; description: string; emoji: string }[] = [
  {
    id: 'new_reader',
    label: 'Leitor novo',
    description: 'Coleção zerada, pacotinho liberado para testar a primeira abertura.',
    emoji: '🌱',
  },
  {
    id: 'new_reader_with_bonus',
    label: 'Leitor novo com bônus',
    description: 'Coleção zerada com todos os pacotinhos bônus/especiais visíveis na lateral.',
    emoji: '🎁',
  },
]

interface SimulateReaderSheetProps {
  open: boolean
  onClose: () => void
}

export function SimulateReaderSheet({ open, onClose }: SimulateReaderSheetProps) {
  const navigate = useNavigate()
  const { startSimulation } = useSimulation()
  const { data: collections = [] } = useCollectionsQuery()
  const ownedCollections = useMemo(
    () => collections.filter((collection) => collection.access === 'owner'),
    [collections],
  )

  const [selectedId, setSelectedId] = useState<string>('')
  const [preset, setPreset] = useState<SimulationPreset>('new_reader')

  const selected = ownedCollections.find((collection) => collection.id === selectedId) ?? ownedCollections[0]

  function handleStart() {
    const collection = selected ?? ownedCollections[0]
    if (!collection) {
      toast.info('Crie uma coleção antes de simular a visão do leitor.')
      return
    }

    const slug = slugify(collection.name)
    startSimulation({
      collectionId: collection.id,
      collectionSlug: slug,
      collectionName: collection.name,
      collectionEmoji: collection.emoji,
      preset,
    })
    onClose()
    navigate('/home')
    toast.success('Simulação iniciada', {
      description: preset === 'new_reader_with_bonus'
        ? 'Você está vendo um leitor novo com bônus disponíveis.'
        : 'Você está vendo como um leitor novo.',
    })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { borderRadius: `${radius.xl} ${radius.xl} 0 0`, mx: 0, maxWidth: 480, width: '100%', position: 'fixed', bottom: 0, m: 0 } } }}
    >
      <DialogTitle sx={{ fontFamily: font.serif, fontWeight: 800, color: colors.text.primary, pr: 6, pb: 0.5 }}>
        Simular leitor
        <IconButton aria-label="fechar" onClick={onClose} sx={{ position: 'absolute', right: 12, top: 12 }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 1.5, pb: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, letterSpacing: 0.8, color: colors.text.muted, textTransform: 'uppercase', mb: 0.8 }}>
              Coleção
            </Typography>
            {ownedCollections.length === 0 ? (
              <Typography sx={{ fontSize: '0.82rem', color: colors.text.secondary }}>
                Você ainda não tem coleções para simular.
              </Typography>
            ) : (
              <Stack spacing={0.8}>
                {ownedCollections.map((collection) => (
                  <CollectionOption
                    key={collection.id}
                    collection={collection}
                    active={(selected?.id ?? ownedCollections[0]?.id) === collection.id}
                    onSelect={() => setSelectedId(collection.id)}
                  />
                ))}
              </Stack>
            )}
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, letterSpacing: 0.8, color: colors.text.muted, textTransform: 'uppercase', mb: 0.8 }}>
              Configuração
            </Typography>
            <Stack spacing={0.8}>
              {PRESETS.map((item) => (
                <Box
                  key={item.id}
                  onClick={() => setPreset(item.id)}
                  sx={{
                    p: 1.2,
                    borderRadius: radius.lg,
                    cursor: 'pointer',
                    border: `1.5px solid ${preset === item.id ? colors.primary.main : colors.border.subtle}`,
                    background: preset === item.id ? `${colors.primary.main}10` : colors.surface.overlay,
                    transition: 'border-color 0.16s ease, background 0.16s ease',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Typography sx={{ fontSize: '1.2rem', lineHeight: 1 }}>{item.emoji}</Typography>
                    <Box>
                      <Typography sx={{ fontSize: '0.86rem', fontWeight: 800, color: colors.text.primary }}>
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.74rem', color: colors.text.secondary, lineHeight: 1.4 }}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>

          <Button variant="primary" onClick={handleStart} disabled={ownedCollections.length === 0} sx={{ py: 0.95 }}>
            Iniciar simulação
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

function CollectionOption({ collection, active, onSelect }: {
  collection: Collection
  active: boolean
  onSelect: () => void
}) {
  return (
    <Box
      onClick={onSelect}
      sx={{
        p: 1.1,
        borderRadius: radius.lg,
        cursor: 'pointer',
        border: `1.5px solid ${active ? colors.rose.main : colors.border.subtle}`,
        background: active ? `${colors.rose.main}10` : 'rgba(255,255,255,0.72)',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box sx={{
        width: 38,
        height: 38,
        borderRadius: radius.md,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.8)',
        fontSize: '1.2rem',
      }}>
        {collection.emoji}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '0.9rem', color: colors.text.primary }}>
          {collection.name}
        </Typography>
        <Typography sx={{ fontSize: '0.72rem', color: colors.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {collection.description || 'Sem descrição'}
        </Typography>
      </Box>
    </Box>
  )
}
