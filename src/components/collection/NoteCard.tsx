import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { Card } from '../ui'
import { colors, font, ink, radius } from '../../design-system'
import { linkifyText } from '../../utils/linkify'
import { useBackground } from '../../context/BackgroundContext'
import { RewardCard, rarityCardSx } from './RewardCard'
import { RarityChip } from './RarityChip'
import type { CollectionNoteView, NoteTypeConfig, RarityConfig } from '../../types/note'

export function NoteCard({ note, r, ts = [], unread, variant, onSelect, onToggleFavorite }: {
  note: CollectionNoteView; r?: RarityConfig; ts?: NoteTypeConfig[]
  unread: boolean; variant: 'list' | 'grid'
  onSelect: (note: CollectionNoteView) => void
  onToggleFavorite: (note: CollectionNoteView) => void
}) {
  const { theme, maskLightCards } = useBackground()
  const grid = variant === 'grid'

  const [listExpanded, setListExpanded] = useState(false)
  const [textOverflowing, setTextOverflowing] = useState(false)
  const titleRef = useRef<HTMLElement>(null)
  const messageRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (variant !== 'list' || listExpanded || note.imageUrl) return
    const titleOverflows = !!titleRef.current && titleRef.current.scrollHeight > titleRef.current.clientHeight + 1
    const messageOverflows = !!messageRef.current && messageRef.current.scrollHeight > messageRef.current.clientHeight + 1
    setTextOverflowing(titleOverflows || messageOverflows)
  }, [variant, listExpanded, note.title, note.message, note.imageUrl])

  const toggleExpand = (e: React.MouseEvent) => { e.stopPropagation(); setListExpanded((v) => !v) }

  if (!note.owned) {
    return (
      <Card accent={r?.borderColor} sx={{ ...(rarityCardSx(r, true, theme.isDark && maskLightCards) as object), height: grid ? '100%' : undefined, opacity: 0.72, cursor: 'default' }}>
        <Box sx={{ position: 'relative', minWidth: 0, height: '100%', p: 1, borderRadius: radius.lg, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 52 }}>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.4, flexWrap: 'wrap', rowGap: 0.4 }}>
            {r && <RarityChip rarity={r} bordered />}
          </Stack>
          <Typography sx={{ fontSize: grid ? '0.74rem' : '0.8rem', color: ink.muted, fontStyle: 'italic' }}>
            🔒 Ainda não coletado
          </Typography>
        </Box>
      </Card>
    )
  }

  if (note.imageUrl && note.imageLayout) {
    return (
      <Box sx={{ position: 'relative', cursor: 'pointer', height: grid ? '100%' : undefined }} onClick={() => onSelect(note)}>
        <RewardCard
          reward={{ id: note.id, title: note.title ?? '', message: note.message ?? '', rarity: note.rarity, typeId: note.typeId, typeIds: note.typeIds, imageUrl: note.imageUrl, imageLayout: note.imageLayout, isNew: false }}
          rarities={r ? [r] : []}
          types={ts}
          expanded={variant === 'list' && listExpanded}
        />
        {unread && (
          <Box sx={{ position: 'absolute', top: 2, left: 2, width: 11, height: 11, zIndex: 5, borderRadius: radius.full, background: colors.rose.main, boxShadow: '0 0 0 2px #fffdf7', pointerEvents: 'none' }} />
        )}
        <IconButton size="small" aria-label={note.favorite ? "desfavoritar bilhete" : "favoritar bilhete"} onClick={(event) => { event.stopPropagation(); onToggleFavorite(note) }} sx={{ position: 'absolute', top: 8, right: 8, p: 0.5, borderRadius: radius.md, zIndex: 5, color: note.favorite ? colors.rose.main : (r?.captionColor ?? ink.muted), background: note.favorite ? '#fbefc4' : '#fffdf7', border: `1px solid ${note.favorite ? 'rgba(160,120,20,0.45)' : 'rgba(42,36,29,0.22)'}`, boxShadow: '1px 2px 0 rgba(42,36,29,0.12)', '&::after': { content: '""', position: 'absolute', inset: -8 } }}>
          {note.favorite ? <StarIcon sx={{ fontSize: 16, color: '#eab308' }} /> : <StarBorderIcon sx={{ fontSize: 16 }} />}
        </IconButton>
        {variant === 'list' && (
          <IconButton size="small" aria-label={listExpanded ? 'recolher bilhete' : 'expandir bilhete'} onClick={toggleExpand} sx={{ position: 'absolute', bottom: 8, right: 8, p: 0.5, borderRadius: radius.md, zIndex: 5, color: r?.captionColor ?? ink.muted, background: '#fffdf7', border: '1px solid rgba(42,36,29,0.22)', boxShadow: '1px 2px 0 rgba(42,36,29,0.12)' }}>
            <ExpandMoreIcon sx={{ fontSize: 16, transform: listExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </IconButton>
        )}
      </Box>
    )
  }

  return (
    <Card accent={r?.borderColor} onClick={() => onSelect(note)} sx={{ ...(rarityCardSx(r, true, theme.isDark && maskLightCards) as object), cursor: 'pointer', height: grid ? '100%' : undefined }}>
      <Box sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
        {unread && (
          <Box sx={{ position: 'absolute', top: -2, left: -2, width: 11, height: 11, zIndex: 3, borderRadius: radius.full, background: colors.rose.main, boxShadow: '0 0 0 2px #fffdf7' }} />
        )}
        <Box sx={{ position: 'relative', minWidth: 0, height: '100%', p: 1, pr: grid ? 3.4 : 4.4, borderRadius: radius.lg, display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.55, flexWrap: 'wrap', rowGap: 0.4 }}>
            {r && (
              <RarityChip rarity={r} bordered />
            )}
            {!grid && ts.map((t) => (
              <Box key={t.id} component="span" sx={{ fontSize: '0.72rem', fontWeight: 600, color: t.tagColor, ml: 0.4 }}>{t.emoji} {t.label}</Box>
            ))}
          </Stack>
          <Typography
            ref={titleRef}
            sx={{
              fontFamily: font.serif, fontWeight: 600, fontSize: grid ? '0.95rem' : '1.05rem', color: ink.primary, mb: 0.3,
              overflowWrap: 'anywhere', wordBreak: 'break-word',
              ...(variant === 'list' && listExpanded ? {} : { display: '-webkit-box', WebkitLineClamp: grid ? 2 : 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }),
            }}
          >
            {note.title ?? ''}
          </Typography>
          <Typography
            ref={messageRef}
            sx={{
              fontFamily: font.hand, fontSize: grid ? '1.02rem' : '1.12rem', color: ink.primary, lineHeight: 1.25,
              overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'pre-line',
              ...(variant === 'list' && listExpanded ? {} : { display: '-webkit-box', WebkitLineClamp: grid ? 3 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }),
            }}
          >
            {linkifyText(note.message ?? '')}
          </Typography>
          <IconButton size="small" aria-label={note.favorite ? "desfavoritar bilhete" : "favoritar bilhete"} onClick={(event) => { event.stopPropagation(); onToggleFavorite(note) }} sx={{ position: 'absolute', top: 6, right: 6, p: 0.5, borderRadius: radius.md, color: note.favorite ? colors.rose.main : (r?.captionColor ?? ink.muted), background: note.favorite ? '#fbefc4' : '#fffdf7', border: `1px solid ${note.favorite ? 'rgba(160,120,20,0.45)' : 'rgba(42,36,29,0.22)'}`, boxShadow: '1px 2px 0 rgba(42,36,29,0.12)', '&::after': { content: '""', position: 'absolute', inset: -8 } }}>
            {note.favorite ? <StarIcon sx={{ fontSize: 16, color: '#eab308' }} /> : <StarBorderIcon sx={{ fontSize: 16 }} />}
          </IconButton>
          {variant === 'list' && textOverflowing && (
            <IconButton size="small" aria-label={listExpanded ? 'recolher bilhete' : 'expandir bilhete'} onClick={toggleExpand} sx={{ position: 'absolute', bottom: 6, right: 6, p: 0.5, borderRadius: radius.md, color: r?.captionColor ?? ink.muted, background: '#fffdf7', border: '1px solid rgba(42,36,29,0.22)', boxShadow: '1px 2px 0 rgba(42,36,29,0.12)' }}>
              <ExpandMoreIcon sx={{ fontSize: 16, transform: listExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </IconButton>
          )}
        </Box>
      </Box>
    </Card>
  )
}
