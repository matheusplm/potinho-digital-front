import { Box, Stack, Typography } from '@mui/material'
import IosShareIcon from '@mui/icons-material/IosShare'
import { useRef, useState, useEffect } from 'react'
import { toPng } from 'html-to-image'
import { GIFEncoder, quantize, applyPalette } from 'gifenc'
import { Button, toast } from '../ui'
import { colors, font, radius } from '../../design-system'
import type { BackgroundTheme } from '../../design-system'
import type { RarityConfig, NoteTypeConfig, NoteImageLayout } from '../../types/note'
import { gradientTextSx } from '../../utils/colorUtils'

interface ShareNote { title: string | null; message: string | null; rarity: string; typeId: string; imageUrl?: string | null; imageLayout?: NoteImageLayout | null }

const GIF_FRAMES = 12
const GIF_DELAY_MS = 120

async function captureAsGif(node: HTMLElement, w: number, h: number): Promise<Blob> {
  const gif = GIFEncoder()
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = w
  tempCanvas.height = h
  const ctx = tempCanvas.getContext('2d')!

  for (let i = 0; i < GIF_FRAMES; i++) {
    if (i > 0) await new Promise<void>((r) => setTimeout(r, GIF_DELAY_MS))
    const dataUrl = await toPng(node, { pixelRatio: 1 })
    await new Promise<void>((resolve) => {
      const img = new Image()
      img.onload = () => { ctx.drawImage(img, 0, 0, w, h); resolve() }
      img.src = dataUrl
    })
    const { data } = ctx.getImageData(0, 0, w, h)
    const palette = quantize(data, 256)
    const index = applyPalette(data, palette)
    gif.writeFrame(index, w, h, { palette, delay: GIF_DELAY_MS })
  }

  gif.finish()
  return new Blob([gif.bytesView().buffer as ArrayBuffer], { type: 'image/gif' })
}

export function ShareCartinha({ note, r, t, theme }: {
  note: ShareNote
  r?: RarityConfig
  t?: NoteTypeConfig
  theme: BackgroundTheme
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const storyRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState<null | 'card' | 'story'>(null)
  const [imgDataUrl, setImgDataUrl] = useState<string | null>(null)
  const [isGif, setIsGif] = useState(false)

  useEffect(() => {
    if (!note.imageUrl) { setImgDataUrl(null); setIsGif(false); return }
    let cancelled = false
    fetch(note.imageUrl, { mode: 'cors' })
      .then((res) => res.blob())
      .then((blob) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      }))
      .then((url) => {
        if (!cancelled) {
          setImgDataUrl(url)
          setIsGif(url.startsWith('data:image/gif'))
        }
      })
      .catch(() => { if (!cancelled) { setImgDataUrl(null); setIsGif(false) } })
    return () => { cancelled = true }
  }, [note.imageUrl])

  async function share(format: 'card' | 'story') {
    const node = format === 'card' ? cardRef.current : storyRef.current
    if (!node || busy) return
    setBusy(format)
    try {
      const w = 540
      const h = format === 'card' ? 540 : 960
      let blob: Blob
      let filename: string

      if (isGif) {
        blob = await captureAsGif(node, w, h)
        filename = `cartinha-${format}.gif`
      } else {
        const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true })
        blob = await (await fetch(dataUrl)).blob()
        filename = `cartinha-${format}.png`
      }

      const file = new File([blob], filename, { type: blob.type })
      const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean }
      if (nav.canShare?.({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], title: 'Uma cartinha pra você 💌' })
      } else {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = filename
        a.click()
        URL.revokeObjectURL(a.href)
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

  const isImmersive = !!(imgDataUrl && (note.imageLayout === 'hero-overlay' || note.imageLayout === 'bg-blur'))
  const showBannerImg = !!(imgDataUrl && note.imageLayout && !isImmersive)

  const inner = (story: boolean) => {
    const tc = isImmersive ? '#fff' : textColor
    const cc = isImmersive ? 'rgba(255,255,255,0.82)' : caption

    const textBlock = (
      <Box sx={{
        position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: story ? 2.4 : 1.6, maxWidth: '100%',
      }}>
        <Box sx={{
          width: story ? 96 : 72, height: story ? 96 : 72, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: story ? '2.8rem' : '2.1rem',
          background: isImmersive ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.7)',
          border: `2px solid ${isImmersive ? 'rgba(255,255,255,0.4)' : `${accent}66`}`,
        }}>
          {r?.emoji || '💌'}
        </Box>
        {r && (
          <Box sx={{
            px: 1.4, py: 0.5, borderRadius: radius.full, fontWeight: 800,
            fontSize: story ? '0.95rem' : '0.82rem',
            background: isImmersive ? 'rgba(0,0,0,0.4)' : r.chipBg,
            border: `1px solid ${isImmersive ? 'rgba(255,255,255,0.35)' : r.borderColor}`,
          }}>
            <Box component="span" sx={isImmersive ? { color: '#fff' } : gradientTextSx(r.chipColor)}>{r.emoji} {r.label}</Box>
          </Box>
        )}
        <Typography sx={{
          fontFamily: font.serif, fontWeight: 850, color: tc, lineHeight: 1.2,
          fontSize: story ? '2rem' : '1.6rem', overflowWrap: 'anywhere', wordBreak: 'break-word',
          ...(isImmersive ? { textShadow: '0 1px 8px rgba(0,0,0,0.6)' } : {}),
        }}>
          {note.title}
        </Typography>
        <Typography sx={{
          fontStyle: 'italic', color: cc, lineHeight: 1.55,
          fontSize: story ? '1.25rem' : '1.05rem', overflowWrap: 'anywhere', wordBreak: 'break-word',
          ...(isImmersive ? { textShadow: '0 1px 6px rgba(0,0,0,0.5)' } : {}),
        }}>
          &ldquo;{note.message}&rdquo;
        </Typography>
        {t && (
          <Box sx={{
            px: 1.2, py: 0.4, borderRadius: radius.full, fontWeight: 700,
            fontSize: story ? '0.85rem' : '0.74rem',
            background: isImmersive ? 'rgba(0,0,0,0.35)' : t.tagBg,
            color: isImmersive ? '#fff' : t.tagColor,
          }}>
            {t.emoji} {t.label}
          </Box>
        )}
      </Box>
    )

    const footer = (
      <Typography sx={{
        position: 'absolute', bottom: story ? 32 : 20, left: 0, right: 0, zIndex: 2,
        fontFamily: font.serif, fontWeight: 700,
        color: isImmersive ? 'rgba(255,255,255,0.7)' : accent,
        opacity: 0.75, fontSize: story ? '1rem' : '0.85rem', textAlign: 'center',
      }}>
        Potinho Digital 💌
      </Typography>
    )

    if (isImmersive) {
      const isBlur = note.imageLayout === 'bg-blur'
      return (
        <Box sx={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
          <Box component="img" src={imgDataUrl!} alt="" sx={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', display: 'block',
            ...(isBlur ? { filter: 'blur(20px) brightness(0.5) saturate(1.4)', transform: 'scale(1.12)' } : {}),
          }} />
          <Box sx={{
            position: 'absolute', inset: 0,
            background: isBlur
              ? 'rgba(0,0,0,0.28)'
              : 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.08) 100%)',
          }} />
          <Box sx={{
            position: 'relative', zIndex: 1, width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
            px: story ? 5 : 4, py: story ? 8 : 5, boxSizing: 'border-box',
          }}>
            {textBlock}
          </Box>
          {footer}
        </Box>
      )
    }

    return (
      <Box sx={{
        width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
        background: bg, display: 'flex', flexDirection: 'column',
        ...(showBannerImg ? {} : { alignItems: 'center', justifyContent: 'center', textAlign: 'center' }),
        boxSizing: 'border-box',
      }}>
        {showBannerImg && (
          <Box sx={{ width: '100%', height: story ? 300 : 195, flexShrink: 0, overflow: 'hidden' }}>
            <Box component="img" src={imgDataUrl!} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </Box>
        )}
        <Box sx={{
          flex: 1, position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          px: story ? 5 : 4,
          py: story ? (showBannerImg ? 4 : 8) : (showBannerImg ? 3 : 5),
          boxSizing: 'border-box',
        }}>
          {!showBannerImg && (
            <Box sx={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 20% 0%, rgba(255,255,255,0.6), transparent 42%), radial-gradient(circle at 90% 100%, ${accent}33, transparent 46%)`, pointerEvents: 'none' }} />
          )}
          {textBlock}
        </Box>
        {footer}
      </Box>
    )
  }

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
        <Button variant="ghost" loading={busy === 'card'} onClick={() => share('card')} sx={{ flex: 1, py: 0.7, fontSize: '0.82rem' }}>
          <IosShareIcon sx={{ fontSize: 16, mr: 0.5 }} /> Card {isGif ? '(GIF)' : ''}
        </Button>
        <Button variant="ghost" loading={busy === 'story'} onClick={() => share('story')} sx={{ flex: 1, py: 0.7, fontSize: '0.82rem' }}>
          <IosShareIcon sx={{ fontSize: 16, mr: 0.5 }} /> Story {isGif ? '(GIF)' : ''}
        </Button>
      </Stack>

      <Box aria-hidden sx={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none', opacity: 0 }}>
        <Box ref={cardRef} sx={{ width: 540, height: 540 }}>{inner(false)}</Box>
        <Box ref={storyRef} sx={{ width: 540, height: 960 }}>{inner(true)}</Box>
      </Box>
    </>
  )
}
