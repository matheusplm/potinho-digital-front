import { Box, Chip, Stack, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'
import { cardIn, font, ink, radius } from '../../design-system'
import { gradientTextSx, themedCardBg } from '../../utils/colorUtils'
import type { CollectionDailyReward, NoteImageLayout, NoteTypeConfig, RarityConfig } from '../../types/note'
import { linkifyText } from '../../utils/linkify'

export type { NoteImageLayout as ImageLayout } from '../../types/note'

const rarityShine = keyframes`0%{transform:translateX(-140%) rotate(18deg);opacity:0}20%{opacity:.55}55%,100%{transform:translateX(160%) rotate(18deg);opacity:0}`

export function rarityCardSx(r?: RarityConfig, compact = false, isDark = false) {
  const glow = r?.glowColor || r?.borderColor || 'rgba(244,63,94,0.2)'
  return {
    p: compact ? 1.8 : 2.5,
    borderRadius: compact ? radius.lg : radius.xl,
    position: 'relative',
    overflow: 'hidden',
    isolation: 'isolate',
    background: themedCardBg(r?.cardBg ?? ink.surface, isDark),
    border: `1.5px solid ${r?.borderColor ?? ink.borderSubtle}`,
    boxShadow: r ? `${r.shadow || '0 4px 20px rgba(0,0,0,0.08)'}, 0 0 34px ${glow}` : '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'transform 0.22s ease, box-shadow 0.22s ease',
    '&::before': {
      content: '""', position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
      background: compact
        ? `radial-gradient(circle at 12% 0%, rgba(255,255,255,0.42), transparent 38%), radial-gradient(circle at 92% 100%, ${glow}, transparent 34%)`
        : `radial-gradient(circle at 12% 0%, rgba(255,255,255,0.58), transparent 36%), radial-gradient(circle at 95% 105%, ${glow}, transparent 42%)`,
      opacity: compact ? 0.62 : 0.78, mixBlendMode: 'soft-light',
    },
    '&::after': {
      content: '""', position: 'absolute', top: '-35%', left: '-45%', zIndex: 0,
      width: '38%', height: '170%', pointerEvents: 'none',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.42), transparent)',
      animation: `${rarityShine} 4.4s ease-in-out infinite`,
    },
    '&:hover': {
      transform: compact ? 'translateY(-1px)' : 'translateY(-2px) scale(1.01)',
      boxShadow: r ? `${r.shadow || '0 6px 24px rgba(0,0,0,0.1)'}, 0 0 44px ${glow}` : '0 8px 28px rgba(0,0,0,0.1)',
    },
  }
}

const IMG_SX = { width: '100%', height: '100%', objectFit: 'cover' as const, display: 'block' }

function CardChips({ r, isNew }: { r?: RarityConfig; isNew: boolean }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      {r && (
        <Chip size="small" label={`${r.emoji} ${r.label}`} sx={{
          fontSize: '0.7rem', fontWeight: 800, height: 22, background: r.chipBg,
          border: `1px solid ${r.borderColor}`, '& .MuiChip-label': { px: 1, ...gradientTextSx(r.chipColor) },
        }} />
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

function CardTextBox({ title, message, children, expanded }: { title: string; message: string; children?: React.ReactNode; expanded?: boolean }) {
  const clampTitle = expanded ? {} : { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }
  const clampMsg = expanded ? {} : { display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }
  return (
    <Box sx={{ p: 1.15, borderRadius: radius.lg, background: 'rgba(255,255,255,0.68)', border: '1px solid rgba(255,255,255,0.58)', backdropFilter: 'blur(8px)', minWidth: 0 }}>
      {children}
      <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.2rem', color: ink.primary, lineHeight: 1.3, overflowWrap: 'anywhere', wordBreak: 'break-word', ...clampTitle }}>
        {title}
      </Typography>
      <Typography sx={{ mt: 0.75, fontSize: '0.9rem', color: ink.secondary, lineHeight: 1.65, fontStyle: 'italic', overflowWrap: 'anywhere', wordBreak: 'break-word', ...clampMsg }}>
        &ldquo;{linkifyText(message)}&rdquo;
      </Typography>
    </Box>
  )
}

function CardTag({ t, all }: { t?: NoteTypeConfig; all?: NoteTypeConfig[] }) {
  const list = all?.length ? all : t ? [t] : []
  if (list.length === 0) return null
  return (
    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
      {list.map((item) => (
        <Box key={item.id} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.3, borderRadius: radius.full, background: item.tagBg, color: item.tagColor, fontSize: '0.68rem', fontWeight: 700, alignSelf: 'flex-start' }}>
          {item.emoji} {item.label}
        </Box>
      ))}
    </Stack>
  )
}

function ImgArea({ src, alt, previewMode, sx }: { src?: string | null; alt: string; previewMode?: boolean; sx?: object }) {
  if (src) return <Box component="img" src={src} alt={alt} sx={{ ...IMG_SX, ...sx }} />
  if (previewMode) return (
    <Box sx={{ ...IMG_SX, background: 'rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...sx }}>
      <Typography sx={{ fontSize: '1.8rem', opacity: 0.18, userSelect: 'none' }}>🖼️</Typography>
    </Box>
  )
  return null
}

export function RewardCard({ reward, rarities, types, onClick, imageLayout: imageLayoutProp, previewMode, expanded }: {
  reward: CollectionDailyReward; rarities: RarityConfig[]; types: NoteTypeConfig[]
  onClick?: () => void; imageLayout?: NoteImageLayout; previewMode?: boolean; expanded?: boolean
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
          <ImgArea src={img} alt={reward.title} previewMode={previewMode} sx={{ position: 'absolute', inset: 0 }} />
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }} />
          <Stack spacing={0.8} sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2 }}>
            <CardChips r={r} isNew={reward.isNew} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.25rem', color: '#fff', lineHeight: 1.25, textShadow: '0 1px 6px rgba(0,0,0,0.5)', ...clampT }}>
              {reward.title}
            </Typography>
          </Stack>
        </Box>
        <Stack spacing={1} sx={{ p: 2, position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontSize: '0.9rem', color: ink.secondary, lineHeight: 1.65, fontStyle: 'italic', ...clampM }}>
            &ldquo;{linkifyText(reward.message)}&rdquo;
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
          <Box sx={{ p: 1.15, borderRadius: radius.lg, background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.7)' }}>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.2rem', color: ink.primary, lineHeight: 1.3 }}>{reward.title}</Typography>
            <Typography sx={{ mt: 0.75, fontSize: '0.9rem', color: ink.secondary, lineHeight: 1.65, fontStyle: 'italic' }}>&ldquo;{linkifyText(reward.message)}&rdquo;</Typography>
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
          <ImgArea src={img} alt={reward.title} previewMode={previewMode} />
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
            <ImgArea src={img} alt={reward.title} previewMode={previewMode} sx={{ height: '100%' }} />
          </Box>
          <Stack spacing={1.2} sx={{ flex: 1, p: 1.8, minWidth: 0 }}>
            <CardChips r={r} isNew={reward.isNew} />
            <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.05rem', color: ink.primary, lineHeight: 1.3, overflowWrap: 'anywhere', wordBreak: 'break-word', ...clampT }}>{reward.title}</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: ink.secondary, lineHeight: 1.55, fontStyle: 'italic', overflowWrap: 'anywhere', wordBreak: 'break-word', ...clampM }}>&ldquo;{linkifyText(reward.message)}&rdquo;</Typography>
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
            <ImgArea src={img} alt={reward.title} previewMode={previewMode} />
          </Box>
        )}

        {isThumb && showImg ? (
          <Box sx={{ p: 1.15, borderRadius: radius.lg, background: 'rgba(255,255,255,0.68)', border: '1px solid rgba(255,255,255,0.58)', backdropFilter: 'blur(8px)', minWidth: 0 }}>
            <Stack direction={imageLayout.endsWith('right') ? 'row-reverse' : 'row'} spacing={1.2} alignItems="flex-start">
              <Box sx={{ flexShrink: 0, width: imageLayout.startsWith('circle') ? 56 : 64, height: imageLayout.startsWith('circle') ? 56 : 64, borderRadius: imageLayout.startsWith('circle') ? '50%' : radius.md, overflow: 'hidden' }}>
                <ImgArea src={img} alt={reward.title} previewMode={previewMode} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: '1.05rem', color: ink.primary, lineHeight: 1.3, overflowWrap: 'anywhere', wordBreak: 'break-word', ...clampT }}>
                  {reward.title}
                </Typography>
                <Typography sx={{ mt: 0.5, fontSize: '0.83rem', color: ink.secondary, lineHeight: 1.55, fontStyle: 'italic', overflowWrap: 'anywhere', wordBreak: 'break-word', ...clampM }}>
                  &ldquo;{linkifyText(reward.message)}&rdquo;
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
