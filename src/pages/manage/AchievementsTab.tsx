import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import { Box, Dialog, IconButton, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { Button, Card, ConfirmDeleteDialog } from '../../components/ui'
import { useCollectionAchievementsQuery, useCollectionRaritiesQuery, useCollectionTypesQuery, useCreateCollectionAchievementMutation, useDeleteCollectionAchievementMutation } from '../../hooks/useNotes'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { colors, font, radius } from '../../design-system'
import { useBackground } from '../../context/BackgroundContext'
import { AchievementEditor } from '../../components/manage/AchievementEditor'
import { uniqueConfigId } from '../../utils/slug'
import { toast } from '../../components/ui'
import type { AchievementConditionType, CollectionAchievement } from '../../types/note'
import { actionButtonSx } from './shared'

const ACHIEVEMENT_PRESETS: { emoji: string; label: string; description: string; conditionType: AchievementConditionType; count: number | null }[] = [
  { emoji: '🌱', label: 'Primeiro bilhete', description: 'Coletou o primeiro bilhetinho.', conditionType: 'collect_count', count: 1 },
  { emoji: '🎴', label: 'Colecionador(a)', description: 'Coletou 10 bilhetes.', conditionType: 'collect_count', count: 10 },
  { emoji: '🏆', label: 'Mestre', description: 'Coletou 25 bilhetes.', conditionType: 'collect_count', count: 25 },
  { emoji: '👑', label: 'Coleção completa', description: 'Coletou todos os bilhetes.', conditionType: 'complete', count: null },
  { emoji: '🌈', label: 'Arco-íris', description: 'Uma de cada raridade.', conditionType: 'rainbow', count: null },
  { emoji: '❤️', label: 'Coração cheio', description: 'Favoritou 5 bilhetes.', conditionType: 'favorite_count', count: 5 },
]

interface AchievementsTabProps { cid: string }

export function AchievementsTab({ cid }: AchievementsTabProps) {
  const { theme } = useBackground()
  const { data: achievements = [] } = useCollectionAchievementsQuery(cid)
  const { data: rarities = [] } = useCollectionRaritiesQuery(cid)
  const { data: types = [] } = useCollectionTypesQuery(cid)
  const createAchievement = useCreateCollectionAchievementMutation(cid)
  const deleteAchievement = useDeleteCollectionAchievementMutation(cid)

  const [achievementDialogOpen, setAchievementDialogOpen] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState<CollectionAchievement | null>(null)

  const achievementDelete = useConfirmDelete<CollectionAchievement>(deleteAchievement, { success: 'Conquista excluída.' })

  function addAchievementPreset(preset: typeof ACHIEVEMENT_PRESETS[number]) {
    const id = uniqueConfigId(preset.label, achievements.map((a) => a.id))
    createAchievement.mutate(
      { id, label: preset.label, emoji: preset.emoji, description: preset.description, conditionType: preset.conditionType, count: preset.count, rarityId: null, typeId: null, order: achievements.length + 1 },
      { onSuccess: () => toast.success('Conquista adicionada!'), onError: (e: Error) => toast.error(e.message || 'Erro ao adicionar.') },
    )
  }

  return (
    <>
      <Stack spacing={1.4}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontSize: '0.72rem', color: theme.textOnBgMuted, fontWeight: 600 }}>
            {achievements.length} conquista{achievements.length !== 1 ? 's' : ''}
          </Typography>
          <Button variant="primary" onClick={() => { setEditingAchievement(null); setAchievementDialogOpen(true) }} sx={{ py: 0.7, px: 1.4, fontSize: '0.78rem' }}>
            <AddIcon sx={{ fontSize: 15, mr: 0.4 }} /> Nova
          </Button>
        </Stack>

        <Box>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.5, color: theme.textOnBgMuted, textTransform: 'uppercase', mb: 0.7 }}>
            Adicionar rápido
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
            {ACHIEVEMENT_PRESETS.filter((p) => !achievements.some((a) => a.label === p.label)).slice(0, 3).map((p) => (
              <Box
                key={p.label}
                onClick={() => addAchievementPreset(p)}
                sx={{
                  flexShrink: 0, px: 1.05, py: 0.55, borderRadius: radius.full, cursor: 'pointer',
                  fontSize: '0.74rem', fontWeight: 800, color: theme.textOnBg,
                  background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.62)', backdropFilter: 'blur(10px)',
                }}
              >
                + {p.emoji} {p.label}
              </Box>
            ))}
          </Box>
        </Box>

        {achievements.length === 0 && (
          <Typography sx={{ fontSize: '0.85rem', color: theme.textOnBgMuted, textAlign: 'center', py: 3 }}>
            Nenhuma conquista. Use "Adicionar rápido" ou "Nova".
          </Typography>
        )}
        {achievements.map((a) => (
          <Card key={a.id} sx={{ p: 0, overflow: 'hidden' }}>
            <Box sx={{ py: 1.3, px: 1.8 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <Box onClick={() => { setEditingAchievement(a); setAchievementDialogOpen(true) }} sx={{ flex: 1, minWidth: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.3 }}>
                  <Box sx={{ width: 38, height: 38, flexShrink: 0, borderRadius: radius.full, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', background: `linear-gradient(135deg,${colors.primary.main}22,${colors.primary.main}44)`, border: `1px solid ${colors.primary.main}33` }}>
                    {a.emoji}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '0.92rem', color: colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.label}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: colors.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.description || a.conditionType}
                    </Typography>
                  </Box>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" aria-label="editar conquista" onClick={() => { setEditingAchievement(a); setAchievementDialogOpen(true) }} sx={actionButtonSx('primary')}>
                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton size="small" aria-label="excluir conquista" onClick={() => achievementDelete.setTarget(a)} sx={actionButtonSx('danger')}>
                    <DeleteForeverOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>
          </Card>
        ))}
      </Stack>

      <Dialog open={achievementDialogOpen} onClose={() => { setAchievementDialogOpen(false); setEditingAchievement(null) }} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: radius.xl } } }}>
        {achievementDialogOpen && (
          <AchievementEditor
            key={editingAchievement?.id ?? 'new'}
            cid={cid}
            achievement={editingAchievement}
            rarities={rarities}
            types={types}
            onClose={() => { setAchievementDialogOpen(false); setEditingAchievement(null) }}
          />
        )}
      </Dialog>

      <ConfirmDeleteDialog open={achievementDelete.isOpen} title={`Excluir a conquista "${achievementDelete.target?.label ?? ''}"?`} isPending={achievementDelete.isPending} onConfirm={achievementDelete.confirm} onClose={achievementDelete.close} />
    </>
  )
}
