import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import EditIcon from '@mui/icons-material/Edit'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { Card } from '../../components/ui'
import { backgroundThemes, colors, font, radius } from '../../design-system'
import { isCollectionOwner } from '../../utils/collectionAccess'
import { useUser } from '../../context/UserContext'
import type { Collection } from '../../types/note'

const cardIn = (i: number) => keyframes`
  from { opacity: 0; transform: translateY(${14 + i * 4}px); }
  to   { opacity: 1; transform: translateY(0); }
`

const overlayBtn = {
  width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
  background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'transform 0.15s, box-shadow 0.15s',
  '&:hover': { transform: 'scale(1.1)', boxShadow: '0 4px 16px rgba(0,0,0,0.26)' },
}

interface CardProps {
  col: Collection
  i: number
  onClick: () => void
  onEdit: (col: Collection) => void
  onDelete: (col: Collection) => void
}

function CardActions({ col, variant, onEdit, onDelete }: {
  col: Collection
  variant: 'overlay' | 'inline'
  onEdit: (col: Collection) => void
  onDelete: (col: Collection) => void
}) {
  const handle = (fn: (col: Collection) => void) => (e: React.MouseEvent) => {
    e.stopPropagation()
    fn(col)
  }

  if (variant === 'inline') {
    return (
      <Stack direction="row" spacing={0.2} sx={{ flexShrink: 0 }}>
        <IconButton size="small" aria-label="editar coleção" onClick={handle(onEdit)} sx={{ color: colors.primary.main, p: 0.7 }}>
          <EditIcon sx={{ fontSize: 17 }} />
        </IconButton>
        <IconButton size="small" aria-label="excluir coleção" onClick={handle(onDelete)} sx={{ color: colors.rose.main, p: 0.7 }}>
          <DeleteForeverOutlinedIcon sx={{ fontSize: 17 }} />
        </IconButton>
      </Stack>
    )
  }

  return (
    <Stack direction="row" spacing={0.7}>
      <Box onClick={handle(onEdit)} aria-label="editar coleção" sx={overlayBtn}>
        <EditIcon sx={{ fontSize: 15, color: colors.primary.main }} />
      </Box>
      <Box onClick={handle(onDelete)} aria-label="excluir coleção" sx={overlayBtn}>
        <DeleteForeverOutlinedIcon sx={{ fontSize: 15, color: colors.rose.main }} />
      </Box>
    </Stack>
  )
}

export function CollectionCardView({ col, i, onClick, onEdit, onDelete }: CardProps) {
  const { user } = useUser()
  const bg = backgroundThemes.find((t) => t.key === col.theme) ?? backgroundThemes[0]
  const isOwner = isCollectionOwner(col, user?.id)
  return (
    <Card
      onClick={onClick}
      sx={{
        p: 0, overflow: 'hidden', cursor: 'pointer',
        animation: `${cardIn(i)} ${0.28 + i * 0.05}s cubic-bezier(0.16,1,0.3,1) both`,
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 28px ${bg.accent}28` },
        '&:active': { transform: 'scale(0.985)' },
      }}
    >
      <Box sx={{ height: 84, background: bg.gradient, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.18) 0%, transparent 68%)', pointerEvents: 'none' }} />
        <Typography sx={{ fontSize: '2.2rem', lineHeight: 1, zIndex: 1, filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.2))' }}>
          {col.emoji}
        </Typography>
        {isOwner && (
          <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
            <CardActions col={col} variant="overlay" onEdit={onEdit} onDelete={onDelete} />
          </Box>
        )}
      </Box>
      <Box sx={{ px: 1.6, pt: 1.4, pb: 1.5 }}>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: col.description ? 0.5 : 0 }}>
          <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1rem', color: colors.text.primary, lineHeight: 1.25, flex: 1, minWidth: 0, mr: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {col.name}
          </Typography>
          <Box sx={{
            px: 0.9, py: 0.3, borderRadius: radius.full, flexShrink: 0, mt: 0.1,
            background: isOwner ? `${colors.primary.main}15` : `${colors.rose.main}15`,
            border: `1px solid ${isOwner ? colors.primary.main : colors.rose.main}30`,
            fontSize: '0.68rem', fontWeight: 800, letterSpacing: 0.5,
            color: isOwner ? colors.primary.main : colors.rose.main,
            textTransform: 'uppercase',
          }}>
            {isOwner ? 'minha' : 'convidada'}
          </Box>
        </Stack>
        {col.description && (
          <Typography sx={{ fontSize: '0.78rem', color: colors.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {col.description}
          </Typography>
        )}
        <Box sx={{ height: '2.5px', borderRadius: 2, background: bg.gradient, mt: 1.3, opacity: 0.5 }} />
      </Box>
    </Card>
  )
}

export function CollectionGridItem({ col, i, onClick, onEdit, onDelete }: CardProps) {
  const { user } = useUser()
  const bg = backgroundThemes.find((t) => t.key === col.theme) ?? backgroundThemes[0]
  const isOwner = isCollectionOwner(col, user?.id)
  return (
    <Box
      onClick={onClick}
      sx={{
        borderRadius: radius.xl, overflow: 'hidden', cursor: 'pointer',
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        animation: `${cardIn(i)} ${0.28 + i * 0.04}s cubic-bezier(0.16,1,0.3,1) both`,
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 10px 28px ${bg.accent}30` },
        '&:active': { transform: 'scale(0.96)' },
      }}
    >
      <Box sx={{ aspectRatio: '4/3', background: bg.gradient, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 40% 35%, rgba(255,255,255,0.22) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <Typography sx={{ fontSize: '2.2rem', lineHeight: 1, filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.22))' }}>
          {col.emoji}
        </Typography>
        {isOwner && (
          <Box sx={{ position: 'absolute', top: 6, right: 6, zIndex: 2 }}>
            <CardActions col={col} variant="overlay" onEdit={onEdit} onDelete={onDelete} />
          </Box>
        )}
      </Box>
      <Box sx={{ px: 1.3, py: 1.1, display: 'flex', flexDirection: 'column', gap: 0.35 }}>
        <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '0.88rem', color: colors.text.primary, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
          {col.name}
        </Typography>
        <Box sx={{
          alignSelf: 'flex-start', px: 0.7, py: 0.15, borderRadius: radius.full,
          background: isOwner ? `${colors.primary.main}15` : `${colors.rose.main}15`,
          fontSize: '0.68rem', fontWeight: 800, letterSpacing: 0.4,
          color: isOwner ? colors.primary.main : colors.rose.main,
          textTransform: 'uppercase',
        }}>
          {isOwner ? 'minha' : 'convidada'}
        </Box>
      </Box>
    </Box>
  )
}

export function CollectionListItem({ col, i, onClick, onEdit, onDelete }: CardProps) {
  const { user } = useUser()
  const bg = backgroundThemes.find((t) => t.key === col.theme) ?? backgroundThemes[0]
  const isOwner = isCollectionOwner(col, user?.id)
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.4,
        px: 1.5, py: 1.3,
        borderRadius: radius.xl, cursor: 'pointer',
        background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.5)',
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
        animation: `${cardIn(i)} ${0.25 + i * 0.04}s cubic-bezier(0.16,1,0.3,1) both`,
        transition: 'background 0.15s, box-shadow 0.15s',
        '&:hover': { background: 'rgba(255,255,255,0.92)', boxShadow: `0 3px 14px ${bg.accent}22` },
        '&:active': { transform: 'scale(0.99)' },
      }}
    >
      <Box sx={{
        width: 44, height: 44, borderRadius: radius.lg, flexShrink: 0,
        background: bg.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.4rem', boxShadow: `0 3px 10px ${bg.accent}40`,
      }}>
        {col.emoji}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '0.92rem', color: colors.text.primary, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
          {col.name}
        </Typography>
        {col.description && (
          <Typography sx={{ fontSize: '0.72rem', color: colors.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mt: 0.1 }}>
            {col.description}
          </Typography>
        )}
      </Box>
      {isOwner
        ? <CardActions col={col} variant="inline" onEdit={onEdit} onDelete={onDelete} />
        : (
          <Box sx={{
            px: 0.8, py: 0.2, borderRadius: radius.full, flexShrink: 0,
            background: `${colors.rose.main}15`,
            fontSize: '0.68rem', fontWeight: 800, letterSpacing: 0.4,
            color: colors.rose.main, textTransform: 'uppercase',
          }}>
            convidada
          </Box>
        )
      }
    </Box>
  )
}
