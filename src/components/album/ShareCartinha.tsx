import { Box, Stack, Typography } from '@mui/material'
import IosShareIcon from '@mui/icons-material/IosShare'
import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Button, toast } from '../ui'
import { colors, font, radius } from '../../design-system'
import type { BackgroundTheme } from '../../design-system'
import type { RarityConfig, NoteTypeConfig } from '../../types/note'

interface ShareNote { title: string; message: string; rarity: string; typeId: string }

export function ShareCartinha({ note, r, t, theme }: {
  note: ShareNote
  r?: RarityConfig
  t?: NoteTypeConfig
  theme: BackgroundTheme
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const storyRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState<null | 'card' | 'story'>(null)

  async function share(format: 'card' | 'story') {
    const node = format === 'card' ? cardRef.current : storyRef.current
    if (!node || busy) return
    setBusy(format)
    try {
      const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true })
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], `cartinha-${format}.png`, { type: 'image/png' })
      const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean }
      if (nav.canShare?.({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], title: 'Uma cartinha pra você 💌' })
      } else {
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = file.name
        a.click()
        toast.success('Imagem baixada! 💌')
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') toast.error('Não consegui gerar a imagem.')
    } finally {
      setBusy(null)
    }
  }

  const accent = r?.borderColor || theme.accent
  const bg = r?.cardBg || 'linear-gradient(135deg,#fff7ed,#fff1f2,#eef2ff)'
  const textColor = r?.textColor || colors.text.primary
  const caption = r?.captionColor || colors.text.secondary

  const inner = (story: boolean) => (
    <Box sx={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: bg, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      px: story ? 5 : 4, py: story ? 8 : 5, boxSizing: 'border-box',
    }}>
      <Box sx={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 20% 0%, rgba(255,255,255,0.6), transparent 42%), radial-gradient(circle at 90% 100%, ${accent}33, transparent 46%)`, pointerEvents: 'none' }} />
      <Box sx={{
        position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: story ? 2.4 : 1.6, maxWidth: '100%',
      }}>
        <Box sx={{
          width: story ? 96 : 72, height: story ? 96 : 72, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: story ? '2.8rem' : '2.1rem',
          background: 'rgba(255,255,255,0.7)', border: `2px solid ${accent}66`,
        }}>
          {r?.emoji || '💌'}
        </Box>
        {r && (
          <Box sx={{
            px: 1.4, py: 0.5, borderRadius: radius.full, fontWeight: 800,
            fontSize: story ? '0.95rem' : '0.82rem',
            background: r.chipBg, color: r.chipColor, border: `1px solid ${r.borderColor}`,
          }}>
            {r.emoji} {r.label}
          </Box>
        )}
        <Typography sx={{
          fontFamily: font.serif, fontWeight: 850, color: textColor, lineHeight: 1.2,
          fontSize: story ? '2rem' : '1.6rem', overflowWrap: 'anywhere', wordBreak: 'break-word',
        }}>
          {note.title}
        </Typography>
        <Typography sx={{
          fontStyle: 'italic', color: caption, lineHeight: 1.55,
          fontSize: story ? '1.25rem' : '1.05rem', overflowWrap: 'anywhere', wordBreak: 'break-word',
        }}>
          &ldquo;{note.message}&rdquo;
        </Typography>
        {t && (
          <Box sx={{
            px: 1.2, py: 0.4, borderRadius: radius.full, fontWeight: 700,
            fontSize: story ? '0.85rem' : '0.74rem', background: t.tagBg, color: t.tagColor,
          }}>
            {t.emoji} {t.label}
          </Box>
        )}
      </Box>
      <Typography sx={{
        position: 'absolute', bottom: story ? 32 : 20, left: 0, right: 0, zIndex: 1,
        fontFamily: font.serif, fontWeight: 700, color: accent, opacity: 0.75,
        fontSize: story ? '1rem' : '0.85rem',
      }}>
        Potinho Digital 💌
      </Typography>
    </Box>
  )

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
        <Button variant="ghost" loading={busy === 'card'} onClick={() => share('card')} sx={{ flex: 1, py: 0.7, fontSize: '0.82rem' }}>
          <IosShareIcon sx={{ fontSize: 16, mr: 0.5 }} /> Card
        </Button>
        <Button variant="ghost" loading={busy === 'story'} onClick={() => share('story')} sx={{ flex: 1, py: 0.7, fontSize: '0.82rem' }}>
          <IosShareIcon sx={{ fontSize: 16, mr: 0.5 }} /> Story
        </Button>
      </Stack>

      <Box aria-hidden sx={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none', opacity: 0 }}>
        <Box ref={cardRef} sx={{ width: 540, height: 540 }}>{inner(false)}</Box>
        <Box ref={storyRef} sx={{ width: 540, height: 960 }}>{inner(true)}</Box>
      </Box>
    </>
  )
}
