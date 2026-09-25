import { Box, Stack, Typography } from '@mui/material'
import IosShareIcon from '@mui/icons-material/IosShare'
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { toCanvas } from 'html-to-image'
import { parseGIF, decompressFrame, type ParsedGif } from 'gifuct-js'
import { GIFEncoder, quantize, applyPalette } from 'gifenc'
import { Button, toast } from '../ui'
import { font } from '../../design-system'
import type { BackgroundTheme } from '../../design-system'
import type { CollectionDailyReward, NoteImageLayout, NoteTypeConfig, RarityConfig } from '../../types/note'
import { RewardCard } from '../collection/RewardCard'

type Format = 'card' | 'story'
type Mode = 'full' | 'base' | 'shell' | 'content'
interface Rect { x: number; y: number; w: number; h: number }
interface Job { format: Format; imageSrc: string | null }
type GifImageFrame = Extract<ParsedGif['frames'][number], { image: unknown }>

const FRAME: Record<Format, { w: number; h: number; top: number }> = {
  card: { w: 540, h: 540, top: 28 },
  story: { w: 540, h: 960, top: 64 },
}
const SIDE_PAD = 28
const BRAND_SPACE = 70
const MAX_SCALE = 1.7
const MIN_CARD_W = 340
const MAX_CARD_W = 760
const CARD_W_STEP = 20
const KEEP_SCREEN_WIDTH = 0.85
const PNG_SCALE = 2
const GIF_SCALE = 4 / 3
const MAX_GIF_FRAMES = 150
const PALETTE_SAMPLES = 16
const BAYER_4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
const DITHER_STRENGTH = 12
const IMAGE_UNDER_CONTENT: NoteImageLayout[] = ['hero-overlay', 'bg-blur']

let fontCssPromise: Promise<string> | null = null

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function loadFontCss(): Promise<string> {
  fontCssPromise ??= (async () => {
    const link = document.querySelector<HTMLLinkElement>('link[href*="fonts.googleapis.com/css"]')
    if (!link) return ''
    const css = await (await fetch(link.href)).text()
    const latin = (css.match(/@font-face\s*{[^}]*}/g) ?? []).filter((block) => /U\+0000-00FF/i.test(block))
    const embedded = await Promise.all(latin.map(async (block) => {
      const url = block.match(/url\((https:[^)]+)\)/)?.[1]
      if (!url) return ''
      return block.replace(url, await blobToDataUrl(await (await fetch(url)).blob()))
    }))
    return embedded.join('\n')
  })().catch(() => {
    fontCssPromise = null
    return ''
  })
  return fontCssPromise
}

function nextPaint(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
}

function relRect(el: Element, origin: DOMRect, k: number): Rect {
  const r = el.getBoundingClientRect()
  return { x: (r.left - origin.left) * k, y: (r.top - origin.top) * k, w: r.width * k, h: r.height * k }
}

function findClip(img: HTMLElement, cardRoot: HTMLElement, origin: DOMRect, k: number, cardScale: number) {
  let el: HTMLElement | null = img.parentElement
  while (el) {
    const cs = getComputedStyle(el)
    if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
      const rect = relRect(el, origin, k)
      const raw = cs.borderTopLeftRadius
      const radius = raw.endsWith('%') ? (parseFloat(raw) / 100) * Math.min(rect.w, rect.h) : (parseFloat(raw) || 0) * cardScale * k
      return { rect, radius: Math.min(radius, rect.w / 2, rect.h / 2) }
    }
    if (el === cardRoot) break
    el = el.parentElement
  }
  return null
}

function roundedPath(ctx: CanvasRenderingContext2D, r: Rect, radius: number) {
  const rad = Math.max(0, radius)
  ctx.beginPath()
  ctx.moveTo(r.x + rad, r.y)
  ctx.arcTo(r.x + r.w, r.y, r.x + r.w, r.y + r.h, rad)
  ctx.arcTo(r.x + r.w, r.y + r.h, r.x, r.y + r.h, rad)
  ctx.arcTo(r.x, r.y + r.h, r.x, r.y, rad)
  ctx.arcTo(r.x, r.y, r.x + r.w, r.y, rad)
  ctx.closePath()
}

function drawCover(ctx: CanvasRenderingContext2D, src: CanvasImageSource, sw: number, sh: number, r: Rect) {
  const scale = Math.max(r.w / sw, r.h / sh)
  const cw = r.w / scale
  const ch = r.h / scale
  ctx.drawImage(src, (sw - cw) / 2, (sh - ch) / 2, cw, ch, r.x, r.y, r.w, r.h)
}

function buildImageDrawer(frameEl: HTMLElement, k: number, cardScale: number) {
  const img = frameEl.querySelector<HTMLImageElement>('[data-share-card] img')
  const cardRoot = frameEl.querySelector<HTMLElement>('[data-share-card] > *')
  if (!img || !cardRoot) return null
  const origin = frameEl.getBoundingClientRect()
  const rect = relRect(img, origin, k)
  const clip = findClip(img, cardRoot, origin, k, cardScale)
  const rawFilter = getComputedStyle(img).filter
  const filter = rawFilter === 'none' ? 'none' : rawFilter.replace(/blur\(([\d.]+)px\)/g, (_, v: string) => `blur(${parseFloat(v) * cardScale * k}px)`)
  const brightness = parseFloat(rawFilter.match(/brightness\(([\d.]+)\)/)?.[1] ?? '1')
  const blurred = /blur\(/.test(filter)

  return (ctx: CanvasRenderingContext2D, src: CanvasImageSource, sw: number, sh: number) => {
    ctx.save()
    if (clip) {
      roundedPath(ctx, clip.rect, clip.radius)
      ctx.clip()
    }
    if (filter === 'none') {
      drawCover(ctx, src, sw, sh, rect)
    } else if (typeof ctx.filter === 'string') {
      ctx.filter = filter
      drawCover(ctx, src, sw, sh, rect)
      ctx.filter = 'none'
    } else {
      const small = document.createElement('canvas')
      small.width = Math.max(1, Math.round(rect.w / (blurred ? 14 : 1)))
      small.height = Math.max(1, Math.round(rect.h / (blurred ? 14 : 1)))
      drawCover(small.getContext('2d')!, src, sw, sh, { x: 0, y: 0, w: small.width, h: small.height })
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(small, rect.x, rect.y, rect.w, rect.h)
      if (brightness < 1) {
        ctx.fillStyle = `rgba(0,0,0,${1 - brightness})`
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
      }
    }
    ctx.restore()
  }
}

async function capture(frameEl: HTMLElement, mode: Mode, scale: number, fontEmbedCSS: string) {
  frameEl.dataset.mode = mode
  const { w, h } = { w: frameEl.offsetWidth, h: frameEl.offsetHeight }
  return toCanvas(frameEl, { pixelRatio: scale, width: w, height: h, fontEmbedCSS, skipAutoScale: true })
}

function fitCard(cardBox: HTMLElement, screenWidth: number, availW: number, availH: number) {
  const measure = (w: number) => {
    cardBox.style.width = `${w}px`
    const h = cardBox.offsetHeight
    return { w, h, scale: Math.min(availW / w, availH / h, MAX_SCALE) }
  }
  const screen = measure(screenWidth)
  let best = screen
  for (let w = MIN_CARD_W; w <= MAX_CARD_W; w += CARD_W_STEP) {
    const candidate = measure(w)
    if (candidate.scale > best.scale) best = candidate
  }
  const pick = screen.scale >= best.scale * KEEP_SCREEN_WIDTH ? screen : best
  cardBox.style.width = `${pick.w}px`
  return pick
}

function orderedDither(data: Uint8ClampedArray, width: number) {
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const x = p % width
    const y = (p - x) / width
    const offset = (BAYER_4[(y & 3) * 4 + (x & 3)] / 16 - 0.47) * DITHER_STRENGTH
    data[i] += offset
    data[i + 1] += offset
    data[i + 2] += offset
  }
  return data
}

function normalizedDelay(ms: number) {
  return ms < 20 ? 100 : ms
}

async function renderGif(
  frameEl: HTMLElement,
  gifDataUrl: string,
  layout: NoteImageLayout,
  cardScale: number,
  fontEmbedCSS: string,
  onProgress: (pct: number) => void,
): Promise<Blob> {
  const W = Math.round(frameEl.offsetWidth * GIF_SCALE)
  const H = Math.round(frameEl.offsetHeight * GIF_SCALE)
  const drawImage = buildImageDrawer(frameEl, GIF_SCALE, cardScale)
  if (!drawImage) throw new Error('imagem do card não encontrada')

  const under = IMAGE_UNDER_CONTENT.includes(layout)
  const [bottom, top] = under
    ? [await capture(frameEl, 'shell', GIF_SCALE, fontEmbedCSS), await capture(frameEl, 'content', GIF_SCALE, fontEmbedCSS)]
    : [await capture(frameEl, 'base', GIF_SCALE, fontEmbedCSS), null]
  frameEl.dataset.mode = 'full'

  const buffer = await (await fetch(gifDataUrl)).arrayBuffer()
  const gifData = parseGIF(buffer)
  const gifW = gifData.lsd.width
  const gifH = gifData.lsd.height
  const imageFrames = gifData.frames.filter((f): f is GifImageFrame => 'image' in f)
  const total = imageFrames.length
  const step = Math.max(1, Math.ceil(total / MAX_GIF_FRAMES))

  const gifCanvas = document.createElement('canvas')
  gifCanvas.width = gifW
  gifCanvas.height = gifH
  const gifCtx = gifCanvas.getContext('2d', { willReadFrequently: true })!
  const patchCanvas = document.createElement('canvas')
  const out = document.createElement('canvas')
  out.width = W
  out.height = H
  const outCtx = out.getContext('2d', { willReadFrequently: true })!

  const compose = () => {
    outCtx.clearRect(0, 0, W, H)
    outCtx.drawImage(bottom, 0, 0, W, H)
    drawImage(outCtx, gifCanvas, gifW, gifH)
    if (top) outCtx.drawImage(top, 0, 0, W, H)
    return outCtx.getImageData(0, 0, W, H).data
  }

  async function walk(onFrame: (delay: number, index: number) => Promise<void> | void) {
    gifCtx.clearRect(0, 0, gifW, gifH)
    let pendingDelay = 0
    for (let i = 0; i < total; i++) {
      const frame = decompressFrame(imageFrames[i], gifData.gct, true)
      const saved = frame.disposalType === 3 ? gifCtx.getImageData(0, 0, gifW, gifH) : null
      patchCanvas.width = frame.dims.width
      patchCanvas.height = frame.dims.height
      patchCanvas.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(frame.patch), frame.dims.width, frame.dims.height), 0, 0)
      gifCtx.drawImage(patchCanvas, frame.dims.left, frame.dims.top)
      pendingDelay += normalizedDelay(frame.delay)
      if (i % step === step - 1 || i === total - 1) {
        await onFrame(pendingDelay, i)
        pendingDelay = 0
      }
      if (frame.disposalType === 2) gifCtx.clearRect(frame.dims.left, frame.dims.top, frame.dims.width, frame.dims.height)
      else if (saved) gifCtx.putImageData(saved, 0, 0)
    }
  }

  const sampleEvery = Math.max(1, Math.floor(total / PALETTE_SAMPLES))
  const samples: Uint8ClampedArray[] = []
  await walk((_, i) => {
    if (i % sampleEvery === 0 || samples.length === 0) samples.push(new Uint8ClampedArray(compose()))
  })
  const merged = new Uint8ClampedArray(samples.reduce((sum, s) => sum + s.length, 0))
  samples.reduce((offset, s) => { merged.set(s, offset); return offset + s.length }, 0)
  const palette = quantize(merged, 255)
  const transparentIndex = palette.length

  const gif = GIFEncoder()
  let previous: Uint8Array | null = null
  let written = 0
  const outputs = Math.ceil(total / step)
  await walk(async (delay) => {
    const index = applyPalette(orderedDither(compose(), W), palette)
    if (previous) {
      const diff = new Uint8Array(index.length)
      for (let p = 0; p < index.length; p++) diff[p] = index[p] === previous[p] ? transparentIndex : index[p]
      gif.writeFrame(diff, W, H, { delay, transparent: true, transparentIndex, dispose: 1 })
    } else {
      gif.writeFrame(index, W, H, { palette: [...palette, [0, 0, 0]], delay, dispose: 1 })
    }
    previous = index
    written++
    onProgress(Math.round((written / outputs) * 100))
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
  gif.finish()
  return new Blob([gif.bytes().buffer as ArrayBuffer], { type: 'image/gif' })
}

export function ShareCartinha({ reward, rarities, types, theme, sourceRef }: {
  reward: CollectionDailyReward
  rarities: RarityConfig[]
  types: NoteTypeConfig[]
  theme: BackgroundTheme
  sourceRef?: RefObject<HTMLElement>
}) {
  const [busy, setBusy] = useState<Format | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [job, setJob] = useState<Job | null>(null)
  const [media, setMedia] = useState<{ url: string; dataUrl: string | null; isGif: boolean } | null>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const cardBoxRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const url = reward.imageUrl
    if (!url) { setMedia(null); return }
    let cancelled = false
    fetch(url, { mode: 'cors' })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status))
        return res.blob()
      })
      .then(blobToDataUrl)
      .then((dataUrl) => { if (!cancelled) setMedia({ url, dataUrl, isGif: dataUrl.startsWith('data:image/gif') }) })
      .catch(() => { if (!cancelled) setMedia({ url, dataUrl: null, isGif: false }) })
    return () => { cancelled = true }
  }, [reward.imageUrl])

  useLayoutEffect(() => {
    if (job && mountedRef.current) {
      mountedRef.current()
      mountedRef.current = null
    }
  }, [job])

  const hasImage = !!(reward.imageUrl && reward.imageLayout)
  const isGif = hasImage && !!media?.isGif

  async function share(format: Format) {
    if (busy) return
    setBusy(format)
    setProgress(null)
    try {
      const imageSrc = hasImage ? media?.dataUrl ?? null : null
      const imageDropped = hasImage && !imageSrc
      const screenWidth = Math.round(sourceRef?.current?.getBoundingClientRect().width || 360)
      await new Promise<void>((resolve) => {
        mountedRef.current = resolve
        setJob({ format, imageSrc })
      })
      const [fontEmbedCSS] = await Promise.all([loadFontCss(), document.fonts.ready])
      await nextPaint()
      const frameEl = frameRef.current
      const cardBox = cardBoxRef.current
      if (!frameEl || !cardBox) throw new Error('moldura não montada')
      await Promise.all(Array.from(frameEl.querySelectorAll('img')).map((img) => img.decode().catch(() => undefined)))

      const spec = FRAME[format]
      const availW = spec.w - SIDE_PAD * 2
      const availH = spec.h - spec.top - BRAND_SPACE
      const { w: cardWidth, h: naturalH, scale } = fitCard(cardBox, screenWidth, availW, availH)
      cardBox.style.transform = `scale(${scale})`
      cardBox.style.left = `${(spec.w - cardWidth * scale) / 2}px`
      cardBox.style.top = `${spec.top + (availH - naturalH * scale) / 2}px`
      await nextPaint()

      let blob: Blob
      let filename: string
      if (isGif && imageSrc) {
        blob = await renderGif(frameEl, imageSrc, reward.imageLayout ?? 'banner', scale, fontEmbedCSS, setProgress)
        filename = `cartinha-${format}.gif`
      } else {
        const canvas = await capture(frameEl, 'full', PNG_SCALE, fontEmbedCSS)
        blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('png vazio'))), 'image/png'))
        filename = `cartinha-${format}.png`
      }
      setJob(null)

      const file = new File([blob], filename, { type: blob.type })
      const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean }
      if (nav.canShare?.({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], title: 'Uma cartinha pra você 💌' })
      } else {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = filename
        a.click()
        setTimeout(() => URL.revokeObjectURL(a.href), 1000)
        toast.success(isGif ? 'GIF baixado! 💌' : 'Imagem baixada! 💌')
      }
      if (imageDropped) toast.info('A imagem desse bilhete vem de um site que não permite cópia, então ela ficou de fora.')
    } catch (error) {
      console.error('[ShareCartinha]', error)
      if ((error as Error).name !== 'AbortError') toast.error('Não consegui gerar a imagem.')
    } finally {
      setJob(null)
      setBusy(null)
      setProgress(null)
    }
  }

  const label = (format: Format, text: string) => (busy === format && progress !== null ? `Gerando ${progress}%` : `${text}${isGif ? ' (GIF)' : ''}`)
  const spec = job ? FRAME[job.format] : null

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
        <Button variant="ghost" loading={busy === 'card' && progress === null} disabled={!!busy} onClick={() => share('card')} sx={{ flex: 1, py: 0.7, fontSize: '0.82rem' }}>
          <IosShareIcon sx={{ fontSize: 16, mr: 0.5 }} /> {label('card', 'Card')}
        </Button>
        <Button variant="ghost" loading={busy === 'story' && progress === null} disabled={!!busy} onClick={() => share('story')} sx={{ flex: 1, py: 0.7, fontSize: '0.82rem' }}>
          <IosShareIcon sx={{ fontSize: 16, mr: 0.5 }} /> {label('story', 'Story')}
        </Button>
      </Stack>

      {job && spec && createPortal(
        <Box aria-hidden sx={{ position: 'fixed', left: -100000, top: 0, pointerEvents: 'none' }}>
          <Box
            ref={frameRef}
            data-mode="full"
            sx={{
              width: spec.w,
              height: spec.h,
              position: 'relative',
              overflow: 'hidden',
              background: theme.gradient,
              '& *, & *::before, & *::after': { animation: 'none !important', transition: 'none !important' },
              '&[data-mode="base"] [data-share-card] img': { visibility: 'hidden' },
              '&[data-mode="shell"] [data-share-card] > * > *': { visibility: 'hidden' },
              '&[data-mode="content"]': { background: 'transparent !important' },
              '&[data-mode="content"] [data-share-brand]': { visibility: 'hidden' },
              '&[data-mode="content"] [data-share-card] img': { visibility: 'hidden' },
              '&[data-mode="content"] [data-share-card] > *': { background: 'transparent !important', borderColor: 'transparent !important', boxShadow: 'none !important' },
              '&[data-mode="content"] [data-share-card] > *::before, &[data-mode="content"] [data-share-card] > *::after': { display: 'none' },
            }}
          >
            <Box ref={cardBoxRef} data-share-card sx={{ position: 'absolute', left: 0, top: 0, transformOrigin: 'top left' }}>
              <RewardCard reward={{ ...reward, imageUrl: job.imageSrc, isNew: false }} rarities={rarities} types={types} expanded />
            </Box>
            <Stack data-share-brand alignItems="center" spacing={0.2} sx={{ position: 'absolute', left: 0, right: 0, bottom: 22 }}>
              <Typography sx={{ fontFamily: font.serif, fontWeight: 700, fontSize: 17, color: theme.textOnBg, opacity: 0.9 }}>
                Potinho Digital 💌
              </Typography>
              <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, color: theme.textOnBgMuted }}>
                potinhodigital.com.br
              </Typography>
            </Stack>
          </Box>
        </Box>,
        document.body,
      )}
    </>
  )
}
