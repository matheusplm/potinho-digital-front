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
  const isCircleLayout = layout.startsWith('circle')
  const isThumbLayout = layout === 'thumb-left' || layout === 'thumb-right' || layout === 'circle-left' || layout === 'circle-right'
  const isStripeLayout = layout === 'stripe-left'

  function measureSlot(baseNode: HTMLElement, W: number, H: number) {
    const slotEl = baseNode.querySelector('[data-img-slot]') as HTMLElement | null
    if (!slotEl || !hasImg) return { x: 0, y: 0, w: W, h: H }
    const cardRect = baseNode.getBoundingClientRect()
    const slotRect = slotEl.getBoundingClientRect()
    return {
      x: slotRect.left - cardRect.left,
      y: slotRect.top - cardRect.top,
      w: slotRect.width,
      h: slotRect.height,
    }
  }

  function drawAtSlot(
    ctx: CanvasRenderingContext2D,
    src: HTMLImageElement | HTMLCanvasElement,
    slot: { x: number; y: number; w: number; h: number }
  ) {
    const { x, y, w, h } = slot
    if (layout === 'bg-blur') {
      ctx.filter = 'blur(20px) brightness(0.5) saturate(1.4)'
      ctx.drawImage(src, x - BLUR_PAD, y - BLUR_PAD, w + BLUR_PAD * 2, h + BLUR_PAD * 2)
      ctx.filter = 'none'
    } else if (isCircleLayout) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(src, x, y, w, h)
      ctx.restore()
    } else {
      ctx.drawImage(src, x, y, w, h)
    }
  }

  async function share(format: 'card' | 'story') {
    const baseNode = format === 'card' ? cardRef.current : storyRef.current
    if (!baseNode || busy) return
    setBusy(format)
    try {
      const W = 540
      const H = format === 'story' ? 960 : 540
      const slot = measureSlot(baseNode, W, H)

      const baseDataUrl = await toPng(baseNode, { pixelRatio: 2, cacheBust: true })

      let blob: Blob
      let filename: string

      if (hasImg && isGif && imgDataUrl) {
        const parsedGif = parseGIF(dataUrlToBuffer(imgDataUrl))
        const frames = decompressFrames(parsedGif, true)
        const gifW = parsedGif.lsd.width
        const gifH = parsedGif.lsd.height

        const baseImg = await loadImgEl(baseDataUrl)
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
          const patchCanvas = document.createElement('canvas')
          patchCanvas.width = frame.dims.width
          patchCanvas.height = frame.dims.height
          patchCanvas.getContext('2d')!.putImageData(
            new ImageData(new Uint8ClampedArray(frame.patch), frame.dims.width, frame.dims.height), 0, 0
          )
          gifStateCtx.drawImage(patchCanvas, frame.dims.left, frame.dims.top)

          outCtx.clearRect(0, 0, W, H)
          if (isImmersive) {
            drawAtSlot(outCtx, gifStateCanvas, slot)
            outCtx.drawImage(baseImg, 0, 0, W, H)
          } else {
            outCtx.drawImage(baseImg, 0, 0, W, H)
            drawAtSlot(outCtx, gifStateCanvas, slot)
          }

          const { data } = outCtx.getImageData(0, 0, W, H)
          const palette = quantize(data, 256)
          const index = applyPalette(data, palette)
          gif.writeFrame(index, W, H, { palette, delay: Math.max(frame.delay ?? 10, 2) })

          if (frame.disposalType === 2) {
            gifStateCtx.clearRect(frame.dims.left, frame.dims.top, frame.dims.width, frame.dims.height)
          }
        }

        gif.finish()
        blob = new Blob([gif.bytesView().buffer as ArrayBuffer], { type: 'image/gif' })
        filename = `cartinha-${format}.gif`

      } else if (hasImg) {
        const srcImg = await loadImgEl(note.imageUrl!, true)
        const baseImg = await loadImgEl(baseDataUrl)
        const canvas = document.createElement('canvas')
        canvas.width = W * 2
        canvas.height = H * 2
        const ctx = canvas.getContext('2d')!
        ctx.scale(2, 2)

        if (isImmersive) {
          drawAtSlot(ctx, srcImg, slot)
          ctx.drawImage(baseImg, 0, 0, W, H)
        } else {
          ctx.drawImage(baseImg, 0, 0, W, H)
          drawAtSlot(ctx, srcImg, slot)
        }

        blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png'))
        filename = `cartinha-${format}.png`

      } else {
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
    const thumbSize = layout.startsWith('circle') ? 56 : 64
    const thumbRight = layout === 'thumb-right' || layout === 'circle-right'

    const emojiSz    = story ? 52 : 42
    const emojiFsz   = story ? '1.8rem' : '1.5rem'
    const titleFsz   = story ? '3.8rem' : '3.1rem'
    const msgFsz     = story ? '2.2rem' : '1.7rem'
    const chipFsz    = story ? '1.1rem' : '0.96rem'
    const chipTypFsz = story ? '1rem'   : '0.88rem'
    const padX       = story ? 3.5 : 2.5
    const padY       = story ? 4   : 3
    const footerFsz  = story ? '1rem' : '0.88rem'
    const midPy      = story ? 2.5 : 1.5

    const emojiCircle = (
      <Box sx={{ width: emojiSz, height: emojiSz, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: emojiFsz, flexShrink: 0, background: isImmersive ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.7)', border: `2px solid ${isImmersive ? 'rgba(255,255,255,0.4)' : `${accent}66`}` }}>
        {r?.emoji || '💌'}
      </Box>
    )
    const rarityChip = r && (
      <Box sx={{ px: 1.6, py: 0.6, borderRadius: radius.full, fontWeight: 800, fontSize: chipFsz, background: isImmersive ? 'rgba(0,0,0,0.4)' : r.chipBg, border: `1px solid ${isImmersive ? 'rgba(255,255,255,0.35)' : r.borderColor}` }}>
        <Box component="span" sx={isImmersive ? { color: '#fff' } : gradientTextSx(r.chipColor)}>{r.emoji} {r.label}</Box>
      </Box>
    )
    const typeChip = t && (
      <Box sx={{ px: 1.4, py: 0.5, borderRadius: radius.full, fontWeight: 700, fontSize: chipTypFsz, background: isImmersive ? 'rgba(0,0,0,0.35)' : t.tagBg, color: isImmersive ? '#fff' : t.tagColor }}>
        {t.emoji} {t.label}
      </Box>
    )
    const radialBg = (
      <Box sx={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 20% 0%, rgba(255,255,255,0.6), transparent 42%), radial-gradient(circle at 90% 100%, ${accent}33, transparent 46%)`, pointerEvents: 'none' }} />
    )
    const brand = (
      <Typography sx={{ fontFamily: font.serif, fontWeight: 700, color: isImmersive ? 'rgba(255,255,255,0.7)' : accent, opacity: 0.75, fontSize: footerFsz }}>
        Potinho Digital 💌
      </Typography>
    )

    if (isImmersive) {
      return (
        <Box sx={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
          <Box data-img-slot="true" sx={{ position: 'absolute', inset: 0 }} />
          <Box sx={{ position: 'absolute', inset: 0, background: layout === 'bg-blur' ? 'rgba(0,0,0,0.28)' : 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.08) 100%)' }} />
          <Box sx={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', px: padX, pt: padY, pb: padY, boxSizing: 'border-box' }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexShrink: 0 }}>
              {emojiCircle}{rarityChip}
            </Stack>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: midPy, minHeight: 0 }}>
              <Typography sx={{ fontFamily: font.serif, fontWeight: 850, color: '#fff', lineHeight: 1.18, fontSize: titleFsz, overflowWrap: 'anywhere', wordBreak: 'break-word', textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>{note.title}</Typography>
              <Typography sx={{ mt: story ? 2 : 1.5, fontStyle: 'italic', color: 'rgba(255,255,255,0.82)', lineHeight: 1.5, fontSize: msgFsz, overflowWrap: 'anywhere', wordBreak: 'break-word', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>&ldquo;{note.message}&rdquo;</Typography>
            </Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flexShrink: 0 }}>
              {typeChip ?? <Box />}
              {brand}
            </Stack>
          </Box>
        </Box>
      )
    }

    if (isStripeLayout) {
      return (
        <Box sx={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: bg, display: 'flex', flexDirection: 'row', boxSizing: 'border-box' }}>
          <Box data-img-slot="true" sx={{ width: 90, flexShrink: 0, alignSelf: 'stretch' }} />
          <Box sx={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', px: 2, pt: story ? 2.5 : 1.8, pb: story ? 2.5 : 1.8, minWidth: 0, boxSizing: 'border-box' }}>
            {radialBg}
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexShrink: 0, zIndex: 1 }}>
              {emojiCircle}{rarityChip}
            </Stack>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1, py: story ? 2 : 1.2, minHeight: 0 }}>
              <Typography sx={{ fontFamily: font.serif, fontWeight: 850, color: textColor, lineHeight: 1.18, fontSize: story ? '3rem' : '2rem', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{note.title}</Typography>
              <Typography sx={{ mt: story ? 1.8 : 1.2, fontStyle: 'italic', color: caption, lineHeight: 1.5, fontSize: story ? '1.8rem' : '1.3rem', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>&ldquo;{note.message}&rdquo;</Typography>
            </Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flexShrink: 0, zIndex: 1 }}>
              {typeChip ?? <Box />}
              {brand}
            </Stack>
          </Box>
        </Box>
      )
    }

    if (isThumbLayout) {
      return (
        <Box sx={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: bg, display: 'flex', flexDirection: 'column', px: padX, pt: padY, pb: padY, boxSizing: 'border-box' }}>
          {radialBg}
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexShrink: 0, zIndex: 1 }}>
            {emojiCircle}{rarityChip}
          </Stack>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1, py: midPy, minHeight: 0 }}>
            <Box sx={{ p: 1.15, borderRadius: radius.lg, background: 'rgba(255,255,255,0.68)', border: '1px solid rgba(255,255,255,0.58)', backdropFilter: 'blur(8px)' }}>
              <Stack direction={thumbRight ? 'row-reverse' : 'row'} spacing={1.2} alignItems="flex-start">
                <Box data-img-slot="true" sx={{ flexShrink: 0, width: thumbSize, height: thumbSize, borderRadius: layout.startsWith('circle') ? '50%' : radius.md }} />
                <Box sx={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
                  <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: story ? '2rem' : '1.5rem', color: textColor, lineHeight: 1.25, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{note.title}</Typography>
                  <Typography sx={{ mt: 0.5, fontSize: story ? '1.4rem' : '1.1rem', color: caption, lineHeight: 1.5, fontStyle: 'italic', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>&ldquo;{note.message}&rdquo;</Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flexShrink: 0, zIndex: 1 }}>
            {typeChip ?? <Box />}
            {brand}
          </Stack>
        </Box>
      )
    }

    return (
      <Box sx={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: bg, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        {showBannerImg && <Box data-img-slot="true" sx={{ width: '100%', height: story ? 300 : 195, flexShrink: 0 }} />}
        {radialBg}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', px: padX, pt: showBannerImg ? 1.5 : padY, pb: padY, boxSizing: 'border-box', minHeight: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexShrink: 0, zIndex: 1 }}>
            {!showBannerImg && emojiCircle}
            {rarityChip}
          </Stack>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1, py: midPy, minHeight: 0 }}>
            <Typography sx={{ fontFamily: font.serif, fontWeight: 850, color: textColor, lineHeight: 1.18, fontSize: titleFsz, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
              {note.title}
            </Typography>
            <Typography sx={{ mt: story ? 2 : 1.5, fontStyle: 'italic', color: caption, lineHeight: 1.5, fontSize: msgFsz, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
              &ldquo;{note.message}&rdquo;
            </Typography>
          </Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flexShrink: 0, zIndex: 1 }}>
            {typeChip ?? <Box />}
            {brand}
          </Stack>
        </Box>
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
