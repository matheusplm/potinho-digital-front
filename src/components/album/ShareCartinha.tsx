import { Box, Stack, Typography } from '@mui/material'
import IosShareIcon from '@mui/icons-material/IosShare'
import { useRef, useState, useEffect } from 'react'
import { toPng } from 'html-to-image'
import { parseGIF, decompressFrames } from 'gifuct-js'
import { GIFEncoder, quantize, applyPalette } from 'gifenc'
import { Button, toast } from '../ui'
import { colors, font, radius } from '../../design-system'
import type { BackgroundTheme } from '../../design-system'
import type { RarityConfig, NoteTypeConfig, NoteImageLayout } from '../../types/note'
import { gradientTextSx } from '../../utils/colorUtils'

interface ShareNote {
  title: string | null
  message: string | null
  rarity: string
  typeId: string
  imageUrl?: string | null
  imageLayout?: NoteImageLayout | null
}

const BLUR_PAD = 32

function loadImgEl(src: string, cors?: boolean): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const el = new Image()
    if (cors) el.crossOrigin = 'anonymous'
    el.onload = () => resolve(el)
    el.onerror = reject
    el.src = src
  })
}

function dataUrlToBuffer(dataUrl: string): ArrayBuffer {
  const binary = atob(dataUrl.split(',')[1])
  const buf = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i)
  return buf.buffer
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
        if (!cancelled) { setImgDataUrl(url); setIsGif(url.startsWith('data:image/gif')) }
      })
      .catch(() => { if (!cancelled) { setImgDataUrl(null); setIsGif(false) } })
    return () => { cancelled = true }
  }, [note.imageUrl])

  const hasImg = !!(note.imageUrl && note.imageLayout)
  const layout = (note.imageLayout ?? 'banner') as NoteImageLayout
  const isImmersive = hasImg && (layout === 'hero-overlay' || layout === 'bg-blur')
  const showBannerImg = hasImg && !isImmersive

  async function share(format: 'card' | 'story') {
    const baseNode = format === 'card' ? cardRef.current : storyRef.current
    if (!baseNode || busy) return
    setBusy(format)

    try {
      const W = 540
      const H = format === 'story' ? 960 : 540

      // Capture base card (no image element – avoids SVG size limits in Chrome)
      const baseDataUrl = await toPng(baseNode, { pixelRatio: 2, cacheBust: true })

      let blob: Blob
      let filename: string

      if (hasImg && isGif && imgDataUrl) {
        // ── Animated GIF output ──────────────────────────────────────────
        const parsedGif = parseGIF(dataUrlToBuffer(imgDataUrl))
        const frames = decompressFrames(parsedGif, true)
        const gifW = parsedGif.lsd.width
        const gifH = parsedGif.lsd.height

        const baseImg = await loadImgEl(baseDataUrl)

        // Canvas that accumulates the current GIF state (handles partial frames)
        const gifStateCanvas = document.createElement('canvas')
        gifStateCanvas.width = gifW
        gifStateCanvas.height = gifH
        const gifStateCtx = gifStateCanvas.getContext('2d')!

        const gif = GIFEncoder()
        const outCanvas = document.createElement('canvas')
        outCanvas.width = W
        outCanvas.height = H
        const outCtx = outCanvas.getContext('2d')!

        for (const frame of frames) {
          // Patch the GIF state canvas with this frame
          const patchCanvas = document.createElement('canvas')
          patchCanvas.width = frame.dims.width
          patchCanvas.height = frame.dims.height
          patchCanvas.getContext('2d')!.putImageData(
            new ImageData(new Uint8ClampedArray(frame.patch), frame.dims.width, frame.dims.height), 0, 0
          )
          gifStateCtx.drawImage(patchCanvas, frame.dims.left, frame.dims.top)

          // Composite: GIF state → base card overlay
          outCtx.clearRect(0, 0, W, H)
          if (isImmersive) {
            if (layout === 'bg-blur') {
              outCtx.filter = 'blur(20px) brightness(0.5) saturate(1.4)'
              outCtx.drawImage(gifStateCanvas, -BLUR_PAD, -BLUR_PAD, W + BLUR_PAD * 2, H + BLUR_PAD * 2)
              outCtx.filter = 'none'
            } else {
              outCtx.drawImage(gifStateCanvas, 0, 0, W, H)
            }
            outCtx.drawImage(baseImg, 0, 0, W, H)
          } else {
            const bannerH = format === 'story' ? 300 : 195
            outCtx.drawImage(baseImg, 0, 0, W, H)
            outCtx.drawImage(gifStateCanvas, 0, 0, W, bannerH)
          }

          const { data } = outCtx.getImageData(0, 0, W, H)
          const palette = quantize(data, 256)
          const index = applyPalette(data, palette)
          gif.writeFrame(index, W, H, { palette, delay: Math.max((frame.delay ?? 10) * 10, 20) })

          // Handle disposal
          if (frame.disposalType === 2) {
            gifStateCtx.clearRect(frame.dims.left, frame.dims.top, frame.dims.width, frame.dims.height)
          }
        }

        gif.finish()
        blob = new Blob([gif.bytesView().buffer as ArrayBuffer], { type: 'image/gif' })
        filename = `cartinha-${format}.gif`

      } else if (hasImg) {
        // ── Static image card ────────────────────────────────────────────
        const srcImg = await loadImgEl(note.imageUrl!, true)
        const baseImg = await loadImgEl(baseDataUrl)

        const canvas = document.createElement('canvas')
        canvas.width = W * 2
        canvas.height = H * 2
        const ctx = canvas.getContext('2d')!
        ctx.scale(2, 2)

        if (isImmersive) {
          if (layout === 'bg-blur') {
            ctx.filter = 'blur(20px) brightness(0.5) saturate(1.4)'
            ctx.drawImage(srcImg, -BLUR_PAD, -BLUR_PAD, W + BLUR_PAD * 2, H + BLUR_PAD * 2)
            ctx.filter = 'none'
          } else {
            ctx.drawImage(srcImg, 0, 0, W, H)
          }
          ctx.drawImage(baseImg, 0, 0, W, H)
        } else {
          const bannerH = format === 'story' ? 300 : 195
          ctx.drawImage(baseImg, 0, 0, W, H)
          ctx.drawImage(srcImg, 0, 0, W, bannerH)
        }

        const compositeUrl = canvas.toDataURL('image/png')
        blob = await (await fetch(compositeUrl)).blob()
        filename = `cartinha-${format}.png`

      } else {
        // ── No image ─────────────────────────────────────────────────────
        blob = await (await fetch(baseDataUrl)).blob()
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
      console.error('[ShareCartinha]', error)
      if ((error as Error).name !== 'AbortError') toast.error('Não consegui gerar a imagem.')
    } finally {
      setBusy(null)
    }
  }

  const accent = r?.borderColor || theme.accent
  const bg = r?.cardBg || 'linear-gradient(135deg,#fff7ed,#fff1f2,#eef2ff)'
  const textColor = r?.textColor || colors.text.primary
  const caption = r?.captionColor || colors.text.secondary

  const inner = (story: boolean) => {
    // Renders WITHOUT the image — image is composited on canvas separately
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
            <Box component="span" sx={isImmersive ? { color: '#fff' } : gradientTextSx(r.chipColor)}>
              {r.emoji} {r.label}
            </Box>
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

    // Immersive: transparent bg + dark overlay + text (image goes behind in canvas step)
    if (isImmersive) {
      return (
        <Box sx={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
          <Box sx={{
            position: 'absolute', inset: 0,
            background: layout === 'bg-blur'
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

    // Banner / other: card bg + empty image slot (image drawn on canvas) + text below
    return (
      <Box sx={{
        width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
        background: bg, display: 'flex', flexDirection: 'column',
        ...(showBannerImg ? {} : { alignItems: 'center', justifyContent: 'center', textAlign: 'center' }),
        boxSizing: 'border-box',
      }}>
        {showBannerImg && (
          <Box sx={{ width: '100%', height: story ? 300 : 195, flexShrink: 0 }} />
        )}
        <Box sx={{
          flex: 1, position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          px: story ? 5 : 4,
          py: story ? (showBannerImg ? 4 : 8) : (showBannerImg ? 3 : 5),
          boxSizing: 'border-box',
        }}>
          <Box sx={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 20% 0%, rgba(255,255,255,0.6), transparent 42%), radial-gradient(circle at 90% 100%, ${accent}33, transparent 46%)`, pointerEvents: 'none' }} />
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
