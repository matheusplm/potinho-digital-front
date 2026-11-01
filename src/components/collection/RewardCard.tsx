import { Box, Chip, Stack, Typography } from '@mui/material'
import { cardIn, font, ink, radius } from '../../design-system'
import type { CollectionDailyReward, NoteImageLayout, NoteTypeConfig, RarityConfig } from '../../types/note'
import { RarityChip } from './RarityChip'
import { linkifyText } from '../../utils/linkify'

export type { NoteImageLayout as ImageLayout } from '../../types/note'

export function rarityCardSx(r?: RarityConfig, compact = false, isDark = false) {
  const tone = r?.borderColor || 'rgba(60,42,20,0.3)'
  return {
    p: compact ? 1.8 : 2.4,
    pt: compact ? 2.2 : 2.8,
    borderRadius: radius.md,
    position: 'relative',
    overflow: 'hidden',
    isolation: 'isolate',
    background: isDark ? '#2b2620' : `linear-gradient(color-mix(in srgb, ${tone} 7%, transparent), color-mix(in srgb, ${tone} 7%, transparent)), #fffdf7`,
    border: `1px solid color-mix(in srgb, ${tone} 45%, rgba(60,42,20,0.18))`,
    boxShadow: '2px 3px 0 rgba(60,42,20,0.10), 0 10px 18px -12px rgba(60,42,20,0.35)',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
    '&::before': {
      content: '""', position: 'absolute', top: 0, left: '50%', zIndex: 2, pointerEvents: 'none',
      width: compact ? 54 : 72, height: compact ? 12 : 15,
      transform: 'translateX(-50%) rotate(-1.5deg)',
      background: `color-mix(in srgb, ${tone} 55%, transparent)`,
      opacity: 0.8,
      clipPath: 'polygon(3% 0, 97% 0, 100% 20%, 98% 50%, 100% 80%, 97% 100%, 3% 100%, 0 80%, 2% 50%, 0 20%)',
    },
    '&:hover': {
      transform: compact ? 'translateY(-1px)' : 'translateY(-2px) rotate(-0.4deg)',
      boxShadow: '3px 5px 0 rgba(60,42,20,0.12), 0 14px 22px -12px rgba(60,42,20,0.4)',
    },
  }
}

const IMG_SX = { width: '100%', height: '100%', objectFit: 'cover' as const, display: 'block' }

function CardChips({ r, isNew }: { r?: RarityConfig; isNew: boolean }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      {r && (
        <RarityChip rarity={r} size="md" bordered />
      )}
      {isNew && (
        <Chip size="small" label="✨ Novo!" sx={{
          fontSize: '0.68rem', fontWeight: 800, height: 22, bgcolor: '#dcfce7', color: '#15803d',
          '& .MuiChip-label': { px: 1 },
        }} />
      )}
    </Stack>
  )
}

export const HAND_MESSAGE_SX = { fontFamily: font.hand, fontWeight: 600, fontSize: '1.36rem', color: ink.primary, lineHeight: 1.25, fontStyle: 'normal' } as const

function CardTextBox({ title, message, children, expanded }: { title: string; message: string; children?: React.ReactNode; expanded?: boolean }) {
  const clampTitle = expanded ? {} : { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }
  const clampMsg = expanded ? {} : { display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }
  return (
    <Box sx={{ minWidth: 0 }}>
      {children}
      <Typography sx={{ fontFamily: font.serif, fontWeight: 600, fontSize: '1.22rem', color: ink.primary, lineHeight: 1.25, letterSpacing: '-0.01em', overflowWrap: 'anywhere', wordBreak: 'break-word', ...clampTitle }}>
        {title}
      </Typography>
      <Typography sx={{ mt: 0.6, ...HAND_MESSAGE_SX, overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'pre-line', ...clampMsg }}>
        {linkifyText(message)}
      </Typography>
    </Box>
  )
}

function CardTag({ t, all }: { t?: NoteTypeConfig; all?: NoteTypeConfig[] }) {
  const list = all?.length ? all : t ? [t] : []
  if (list.length === 0) return null
  return (
    <Stack direction="row" spacing={1.2} sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
      {list.map((item) => (
        <Box key={item.id} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: item.tagColor, fontSize: '0.74rem', fontWeight: 600, letterSpacing: '0.02em', alignSelf: 'flex-start' }}>
          {item.emoji} {item.label}
        </Box>
      ))}
    </Stack>
  )
}

function ImgArea({ src, alt, previewMode, sx, lazy }: { src?: string | null; alt: string; previewMode?: boolean; sx?: object; lazy?: boolean }) {
  if (src) return <Box component="img" src={src} alt={alt} loading={lazy ? 'lazy' : undefined} sx={{ ...IMG_SX, ...sx }} />
  if (previewMode) return (
    <Box sx={{ ...IMG_SX, background: 'rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...sx }}>
      <Typography sx={{ fontSize: '1.8rem', opacity: 0.18, userSelect: 'none' }}>🖼️</Typography>
    </Box>
  )
  return null
}

export function RewardCard({ reward, rarities, types, onClick, imageLayout: imageLayoutProp, previewMode, expanded, lazyImage }: {
  reward: CollectionDailyReward; rarities: RarityConfig[]; types: NoteTypeConfig[]
  onClick?: () => void; imageLayout?: NoteImageLayout; previewMode?: boolean; expanded?: boolean; lazyImage?: boolean
}) {
  const r = rarities.find((x) => x.id === reward.rarity)
  const rewardTypes = (reward.typeIds?.length ? reward.typeIds : [reward.typeId]).map((id) => types.find((x) => x.id === id)).filter((x): x is NoteTypeConfig => !!x)
  const t = rewardTypes[0]
  const img = reward.imageUrl
  const imageLayout: NoteImageLayout = imageLayoutProp ?? reward.imageLayout ?? 'banner'
  const showImg = !!(img || (previewMode && (imageLayoutProp ?? reward.imageLayout)))

  const clampT = expanded ? {} : { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }
  const clampM = expanded ? {} : { display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }

  if (showImg && imageLayout === 'hero-overlay') {
    return (
      <Box onClick={onClick} sx={{ ...rarityCardSx(r), animation: `${cardIn} 0.55s cubic-bezier(0.16,1,0.3,1)`, cursor: onClick ? 'pointer' : 'default', p: 0, overflow: 'hidden', position: 'relative' }}>
        <Box sx={{ position: 'relative', width: '100%', height: 74 }}>
          <ImgArea lazy={lazyImage} src={img} alt={reward.title} previewMode={previewMode} sx={{ position: 'absolute', inset: 0 }} />
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }} />
          <Stack spacing={0.8} sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2 }}>
            <CardChips r={r} isNew={reward.isNew} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.25rem', color: '#fff', lineHeight: 1.25, textShadow: '0 1px 6px rgba(0,0,0,0.5)', ...clampT }}>
              {reward.title}
            </Typography>
          </Stack>
        </Box>
        <Stack spacing={1} sx={{ p: 2, position: 'relative', zIndex: 1 }}>
          <Typography sx={{ ...HAND_MESSAGE_SX, whiteSpace: 'pre-line', ...clampM }}>
            {linkifyText(reward.message)}
          </Typography>
          <CardTag t={t} all={rewardTypes} />
        </Stack>
      </Box>
    )
  }

  if (showImg && imageLayout === 'bg-blur') {
    return (
      <Box onClick={onClick} sx={{ ...rarityCardSx(r), animation: `${cardIn} 0.55s cubic-bezier(0.16,1,0.3,1)`, cursor: onClick ? 'pointer' : 'default', position: 'relative', overflow: 'hidden' }}>
        {img
          ? <Box component="img" src={img} alt={reward.title} sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(9px) brightness(0.6) saturate(1.35)', transform: 'scale(1.1)', zIndex: 0 }} />
          : <Box sx={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.08)', zIndex: 0 }} />
        }
        <Box sx={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.22)', zIndex: 0 }} />
        <Stack spacing={1.5} sx={{ position: 'relative', zIndex: 1 }}>
          <CardChips r={r} isNew={reward.isNew} />
          <Box sx={{ p: 1.15, borderRadius: radius.lg, background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(255,255,255,0.7)' }}>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.2rem', color: ink.primary, lineHeight: 1.3 }}>{reward.title}</Typography>
            <Typography sx={{ mt: 0.6, ...HAND_MESSAGE_SX, whiteSpace: 'pre-line' }}>{linkifyText(reward.message)}</Typography>
          </Box>
          <CardTag t={t} all={rewardTypes} />
        </Stack>
      </Box>
    )
  }

  if (showImg && imageLayout === 'split') {
    return (
      <Box onClick={onClick} sx={{ ...rarityCardSx(r), animation: `${cardIn} 0.55s cubic-bezier(0.16,1,0.3,1)`, cursor: onClick ? 'pointer' : 'default', p: 0, overflow: 'hidden' }}>
        <Box sx={{ width: '100%', height: 130, overflow: 'hidden' }}>
          <ImgArea lazy={lazyImage} src={img} alt={reward.title} previewMode={previewMode} />
        </Box>
        <Stack spacing={1.5} sx={{ p: 2, position: 'relative', zIndex: 1 }}>
          <CardChips r={r} isNew={reward.isNew} />
          <CardTextBox title={reward.title} message={reward.message} expanded={expanded} />
          <CardTag t={t} all={rewardTypes} />
        </Stack>
      </Box>
    )
  }

  if (showImg && imageLayout === 'stripe-left') {
    return (
      <Box onClick={onClick} sx={{ ...rarityCardSx(r), animation: `${cardIn} 0.55s cubic-bezier(0.16,1,0.3,1)`, cursor: onClick ? 'pointer' : 'default', p: 0, overflow: 'hidden' }}>
        <Stack direction="row" sx={{ minHeight: 140 }}>
          <Box sx={{ width: 90, flexShrink: 0, overflow: 'hidden' }}>
            <ImgArea lazy={lazyImage} src={img} alt={reward.title} previewMode={previewMode} sx={{ height: '100%' }} />
          </Box>
          <Stack spacing={1.2} sx={{ flex: 1, p: 1.8, minWidth: 0 }}>
            <CardChips r={r} isNew={reward.isNew} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 600, fontSize: '1.08rem', color: ink.primary, lineHeight: 1.25, overflowWrap: 'anywhere', wordBreak: 'break-word', ...clampT }}>{reward.title}</Typography>
            <Typography sx={{ ...HAND_MESSAGE_SX, fontSize: '1.15rem', overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'pre-line', ...clampM }}>{linkifyText(reward.message)}</Typography>
            <CardTag t={t} all={rewardTypes} />
          </Stack>
        </Stack>
      </Box>
    )
  }

  const isThumb = imageLayout === 'thumb-left' || imageLayout === 'thumb-right' || imageLayout === 'circle-left' || imageLayout === 'circle-right'

  return (
    <Box onClick={onClick} sx={{ ...rarityCardSx(r), animation: `${cardIn} 0.55s cubic-bezier(0.16,1,0.3,1)`, cursor: onClick ? 'pointer' : 'default', position: 'relative' }}>
      <Stack spacing={1.5} sx={{ position: 'relative', zIndex: 1 }}>
        <CardChips r={r} isNew={reward.isNew} />

        {showImg && imageLayout === 'banner' && (
          <Box sx={{ borderRadius: radius.lg, overflow: 'hidden', width: '100%', height: 110 }}>
            <ImgArea lazy={lazyImage} src={img} alt={reward.title} previewMode={previewMode} />
          </Box>
        )}

        {isThumb && showImg ? (
          <Box sx={{ minWidth: 0 }}>
            <Stack direction={imageLayout.endsWith('right') ? 'row-reverse' : 'row'} spacing={1.2} alignItems="flex-start">
              <Box sx={{ flexShrink: 0, width: imageLayout.startsWith('circle') ? 56 : 64, height: imageLayout.startsWith('circle') ? 56 : 64, borderRadius: imageLayout.startsWith('circle') ? '50%' : radius.md, overflow: 'hidden' }}>
                <ImgArea lazy={lazyImage} src={img} alt={reward.title} previewMode={previewMode} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontFamily: font.serif, fontWeight: 600, fontSize: '1.08rem', color: ink.primary, lineHeight: 1.25, overflowWrap: 'anywhere', wordBreak: 'break-word', ...clampT }}>
                  {reward.title}
                </Typography>
                <Typography sx={{ mt: 0.4, ...HAND_MESSAGE_SX, fontSize: '1.18rem', overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'pre-line', ...clampM }}>
                  {linkifyText(reward.message)}
                </Typography>
              </Box>
            </Stack>
          </Box>
        ) : (
          <CardTextBox title={reward.title} message={reward.message} expanded={expanded} />
        )}

        <CardTag t={t} all={rewardTypes} />
      </Stack>
    </Box>
  )
}
