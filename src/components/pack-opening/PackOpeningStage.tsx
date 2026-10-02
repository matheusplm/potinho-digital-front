import { Box, Dialog, Stack, Typography, useMediaQuery } from '@mui/material'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useBackground } from '../../context/BackgroundContext'
import { font, radius } from '../../design-system'
import { normalizeRevealEffect, useRevealEffect } from '../../effects'
import type { CollectionDailyReward, NoteTypeConfig, RarityConfig } from '../../types/note'
import { FloatingParticles } from '../FloatingParticles'
import { RewardCard } from '../collection/RewardCard'
import { Button } from '../ui'
import { cardLeave, cardRise, flash, raysSpin, riseIn, screenShake, spark, stageIn } from './motion'
import { PackPouch, type PouchState } from './PackPouch'
import { RevealCard } from './RevealCard'
import { withAlpha } from '../../utils/colorUtils'
import { CARD_WIDTH, paint, rainbowConic, raysFill, revealOrder, showPalette, vibrate, type RevealItem, type RevealStyle, type Tier } from './tiers'
import { PackIcon } from '../PackIcon'
import type { PackLook } from './packLook'

type Phase = 'intro' | 'waiting' | 'burst' | 'reveal' | 'summary'

export interface StagePack extends PackLook {
  name: string
  emoji: string
  gradient: string
  accent: string
}

const BURST_MS = 900
const SHOW_DELAY_MS = 420
const RAY_SCALE: Record<Tier, number> = { common: 0.55, rare: 0.7, epic: 0.9, legendary: 1.1 }
const RAY_ALPHA: Record<Tier, number> = { common: 16, rare: 22, epic: 34, legendary: 34 }
const FLIP_VIBRATION: Record<Tier, number | number[]> = { common: 12, rare: 18, epic: 25, legendary: [20, 40, 70] }
const SPARK_COUNT: Record<Tier, number> = { common: 0, rare: 14, epic: 22, legendary: 30 }
const FLASH_ALPHA: Record<Tier, number> = { common: 0, rare: 55, epic: 75, legendary: 90 }
const FLASH_MASK = 'radial-gradient(circle, black 30%, transparent 70%)'
const SPARKS = Array.from({ length: 30 }, (_, i) => {
  const angle = (i / 30) * Math.PI * 2 + (i % 3) * 0.2
  const distance = 150 + (i % 5) * 36
  return { dx: Math.cos(angle) * distance, dy: Math.sin(angle) * distance, size: 5 + (i % 4) * 2, delay: (i % 6) * 0.03 }
})

function FlipShow({ style }: { style: RevealStyle }) {
  const alpha = FLASH_ALPHA[style.tier]
  const anchor = { position: 'absolute', left: '50%', top: '50%', width: 0, height: 0, pointerEvents: 'none' } as const
  return (
    <>
      <Box aria-hidden sx={{ ...anchor, zIndex: -1 }}>
        <Box sx={{
          position: 'absolute', left: 0, top: 0, width: 520, height: 520, borderRadius: '50%',
          background: style.rainbow
            ? `radial-gradient(circle, #ffffff 0%, rgba(255,255,255,0.75) 18%, transparent 42%), ${rainbowConic()}`
            : `radial-gradient(circle, #ffffff 0%, ${withAlpha(style.color, alpha)} 35%, transparent 70%)`,
          ...(style.rainbow && { maskImage: FLASH_MASK, WebkitMaskImage: FLASH_MASK }),
          animation: `${flash} 1s ease-out both`,
        }} />
      </Box>
      <Box aria-hidden sx={{ ...anchor, zIndex: 3 }}>
        {SPARKS.slice(0, SPARK_COUNT[style.tier]).map((sparkItem, i) => (
          <Box key={i} sx={{
            position: 'absolute', left: 0, top: 0, width: sparkItem.size, height: sparkItem.size,
            marginLeft: `${-sparkItem.size / 2}px`, marginTop: `${-sparkItem.size / 2}px`, borderRadius: '50%',
            background: i % 3 === 0 ? '#fff' : paint(style, i), boxShadow: `0 0 10px ${paint(style, i)}`,
            '--dx': `${sparkItem.dx}px`, '--dy': `${sparkItem.dy}px`,
            animation: `${spark} 1s cubic-bezier(.15,.8,.3,1) ${sparkItem.delay}s both`,
          }} />
        ))}
      </Box>
    </>
  )
}

function Rays({ style, visible }: { style: RevealStyle | undefined; visible: boolean }) {
  if (!visible || !style?.rays) return null
  return (
    <Box aria-hidden sx={{
      position: 'absolute', left: '50%', top: '46%', width: '160vmax', height: '160vmax', pointerEvents: 'none', '--ray-scale': RAY_SCALE[style.tier],
      background: raysFill(style, RAY_ALPHA[style.tier]),
      maskImage: 'radial-gradient(circle, black 6%, transparent 38%)', WebkitMaskImage: 'radial-gradient(circle, black 6%, transparent 38%)',
      animation: `${raysSpin} ${style.tier === 'legendary' ? 9 : 14}s linear infinite`,
    }} />
  )
}

export function PackOpeningStage({ open, pack, rewards, rarities, types, onClose, onViewCollection, onOpenReward, onReplay }: {
  open: boolean
  pack: StagePack | null
  rewards: CollectionDailyReward[] | null
  rarities: RarityConfig[]
  types: NoteTypeConfig[]
  onClose: () => void
  onViewCollection?: () => void
  onReplay?: () => void
  onOpenReward?: (reward: CollectionDailyReward) => void
}) {
  const { theme } = useBackground()
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)', { noSsr: true })
  const { play, layer } = useRevealEffect()
  const [phase, setPhase] = useState<Phase>('intro')
  const [index, setIndex] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [torn, setTorn] = useState(false)
  const [showFor, setShowFor] = useState<number | null>(null)
  const [shaking, setShaking] = useState(false)
  const tiltRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])

  const accent = pack?.accent || theme.accent
  const backFill = pack?.gradient || `linear-gradient(135deg, ${accent}, ${withAlpha(accent, 55)})`
  const items = useMemo<RevealItem[]>(() => (rewards ? revealOrder(rewards, rarities, accent) : []), [rewards, rarities, accent])
  const current = items[index]

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }, [])

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
  }, [])

  const showSummary = useCallback(() => {
    clearTimers()
    setShaking(false)
    setLeaving(false)
    setPhase('summary')
  }, [clearTimers])

  const reset = useCallback(() => {
    clearTimers()
    setPhase('intro')
    setIndex(0)
    setLeaving(false)
    setTorn(false)
    setShowFor(null)
    setShaking(false)
  }, [clearTimers])

  useEffect(() => {
    if (!open) return
    reset()
    return clearTimers
  }, [open, reset, clearTimers])

  function replay() {
    reset()
    onReplay?.()
  }

  const startBurst = useCallback(() => {
    if (reducedMotion || !items.length) {
      setPhase('summary')
      return
    }
    setPhase('burst')
    later(() => setPhase('reveal'), BURST_MS)
  }, [reducedMotion, items.length, later])

  useEffect(() => {
    if (phase === 'waiting' && rewards) startBurst()
  }, [phase, rewards, startBurst])

  function handleTorn() {
    setTorn(true)
    if (rewards) later(startBurst, reducedMotion ? 0 : 380)
    else setPhase('waiting')
  }

  useEffect(() => {
    if (phase !== 'reveal') return
    const item = items[index]
    if (!item) return
    const { rarity, style } = item
    later(() => {
      setShowFor(index)
      if (style.vibrate) vibrate(FLIP_VIBRATION[style.tier])
      if (style.shake && !reducedMotion) {
        setShaking(true)
        later(() => setShaking(false), style.tier === 'legendary' ? 750 : 500)
      }
      const effect = normalizeRevealEffect(rarity?.revealEffect, rarity?.revealMedia, rarity?.revealEmoji, rarity?.emoji ?? '✨')
      play({ ...effect, palette: showPalette(style), anchor: cardRef.current?.getBoundingClientRect() ?? null })
    }, reducedMotion ? 0 : SHOW_DELAY_MS)
  }, [phase, index, items, later, play, reducedMotion])

  function next() {
    if (leaving) return
    if (index >= items.length - 1) {
      showSummary()
      return
    }
    setLeaving(true)
    later(() => {
      setIndex((value) => value + 1)
      setLeaving(false)
    }, reducedMotion ? 0 : 320)
  }

  function handleEscape() {
    if (phase === 'summary') onClose()
    else if (rewards) showSummary()
  }

  function tilt(e: React.PointerEvent) {
    if (e.pointerType !== 'mouse' || phase !== 'intro' || reducedMotion) return
    const el = tiltRef.current
    if (!el) return
    const x = e.clientX / window.innerWidth - 0.5
    const y = e.clientY / window.innerHeight - 0.5
    el.style.setProperty('--ry', `${x * 22}deg`)
    el.style.setProperty('--rx', `${-y * 16}deg`)
  }

  const pouchState: PouchState = phase === 'burst' ? 'exit' : phase === 'waiting' ? 'waiting' : torn ? 'torn' : 'idle'
  const newCount = items.filter((item) => item.reward.isNew).length
  const showSkip = !!rewards && phase !== 'summary' && torn
  const textColor = theme.textOnBg
  const mutedColor = theme.textOnBgMuted

  return (
    <Dialog
      open={open}
      fullScreen
      onClose={handleEscape}
      aria-label={pack ? `Abrindo ${pack.name}` : 'Abrindo pacotinho'}
      slotProps={{ paper: { sx: { background: theme.gradient, overflow: 'hidden' } } }}
    >
      {layer}
      <Box onPointerMove={tilt} sx={{ position: 'relative', height: '100%', overflow: 'hidden', animation: `${stageIn} 0.3s ease both` }}>
        <Box sx={{
          position: 'relative', height: '100%', display: 'flex', flexDirection: 'column',
          animation: shaking ? `${screenShake} ${current?.style.tier === 'legendary' ? 0.7 : 0.45}s ease-out both` : 'none',
        }}>
          <FloatingParticles />
          <Box aria-hidden sx={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(circle at 50% 46%, ${withAlpha(accent, theme.isDark ? 30 : 22)}, transparent 55%)`,
          }} />
          <Rays style={current?.style} visible={!reducedMotion && phase === 'reveal' && showFor === index} />

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ position: 'relative', zIndex: 2, px: 2, pt: 'max(16px, env(safe-area-inset-top))', minHeight: 56 }}>
            {pack && (
              <Box sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.8, px: 1.4, py: 0.6, borderRadius: radius.full, maxWidth: '65%',
                background: theme.surfaceBg, border: `1px solid ${theme.surfaceBorder}`, backdropFilter: 'blur(12px)',
              }}>
                <Box component="span" sx={{ fontSize: '1rem', display: 'inline-flex' }}><PackIcon emoji={pack.emoji} imageUrl={pack.imageUrl} size={20} /></Box>
                <Typography variant="md" sx={{ fontWeight: 800, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pack.name}</Typography>
              </Box>
            )}
            {showSkip && (
              <Box component="button" type="button" onClick={showSummary} sx={{
                all: 'unset', cursor: 'pointer', px: 1.4, py: 0.6, borderRadius: radius.full, fontSize: '0.8rem', fontWeight: 800, color: textColor,
                background: theme.surfaceBg, border: `1px solid ${theme.surfaceBorder}`, backdropFilter: 'blur(12px)',
                '&:focus-visible': { outline: `2px solid ${accent}` },
              }}>
                Pular ›
              </Box>
            )}
          </Stack>

          <Box sx={{ position: 'relative', zIndex: 1, flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
            {(phase === 'intro' || phase === 'waiting' || phase === 'burst') && pack && (
              <Stack alignItems="center" spacing={3}>
                <Box ref={tiltRef} sx={{ position: 'relative', transform: { md: 'scale(1.22)' }, transformOrigin: 'center', my: { md: 4.5 } }}>
                  <PackPouch
                    gradient={backFill}
                    accent={accent}
                    emoji={pack.emoji}
                    look={pack}
                    name={pack.name}
                    state={pouchState}
                    onTorn={handleTorn}
                    reducedMotion={reducedMotion}
                  />
                  {phase === 'burst' && (
                    <Box aria-hidden sx={{
                      position: 'absolute', left: '50%', top: 40, width: 260, height: 260, borderRadius: '50%', pointerEvents: 'none',
                      background: `radial-gradient(circle, rgba(255,255,255,0.7) 0%, ${withAlpha(accent, 30)} 35%, transparent 65%)`,
                      animation: `${flash} ${BURST_MS / 1000}s ease-out both`,
                    }} />
                  )}
                </Box>
                <Typography aria-live="polite" sx={{ fontFamily: font.serif, fontWeight: 800, fontSize: '1.05rem', color: textColor, textAlign: 'center', minHeight: 26 }}>
                  {phase === 'intro' ? 'Arraste na linha pra abrir ✂️' : phase === 'waiting' ? 'Sorteando seus bilhetes…' : ''}
                </Typography>
              </Stack>
            )}

            {phase === 'reveal' && current && (
              <Box sx={{ position: 'relative', zIndex: 0, width: CARD_WIDTH, transform: { md: 'scale(1.15)' }, transformOrigin: 'center' }}>
                {items.slice(index + 1, index + 3).map((item, i) => (
                  <Box key={item.reward.id + i} aria-hidden sx={{
                    position: 'absolute', inset: 0, borderRadius: '22px', background: backFill, border: '2px solid rgba(255,255,255,0.6)',
                    transform: `translate3d(${(i + 1) * 8}px, ${(i + 1) * 10}px, 0) rotate(${(i + 1) * 3}deg)`, opacity: 0.8 - i * 0.25,
                    boxShadow: '0 12px 30px rgba(15,23,42,0.18)', minHeight: 260,
                  }} />
                ))}
                <Box
                  key={index}
                  ref={cardRef}
                  sx={{ position: 'relative', animation: reducedMotion ? 'none' : leaving ? `${cardLeave} 0.32s ease-in both` : `${cardRise} 0.6s cubic-bezier(.2,.9,.3,1.1) both` }}
                >
                  <RevealCard
                    item={current}
                    flipped
                    backFill={backFill}
                    accent={accent}
                    emoji={pack?.emoji ?? '💌'}
                    imageUrl={pack?.imageUrl}
                    rarities={rarities}
                    types={types}
                    reducedMotion={reducedMotion}
                    onActivate={next}
                    label={index < items.length - 1 ? `Bilhete ${index + 1} de ${items.length}, toque pro próximo` : `Bilhete ${index + 1} de ${items.length}, toque pro resumo`}
                  />
                </Box>
                {showFor === index && !reducedMotion && SPARK_COUNT[current.style.tier] > 0 && <FlipShow key={`show-${index}`} style={current.style} />}
                {current.style.caption && (
                  <Typography variant="xl" aria-live="polite" sx={{
                    position: 'absolute', left: 0, right: 0, top: 'calc(100% + 18px)', textAlign: 'center',
                    fontFamily: font.serif, fontWeight: 800, color: textColor, animation: `${riseIn} 0.5s ease 0.4s both`,
                  }}>
                    {current.style.caption}
                  </Typography>
                )}
              </Box>
            )}

            {phase === 'summary' && (
              <Box sx={{ width: '100%', maxWidth: 530, maxHeight: '100%', overflowY: 'auto', px: 3, py: 2.5, animation: `${riseIn} 0.4s ease both` }}>
                <Typography sx={{ fontFamily: font.serif, fontWeight: 850, fontSize: '1.6rem', color: textColor, textAlign: 'center', lineHeight: 1.15 }}>
                  {items.length === 1 ? 'Você recebeu 1 bilhete 💌' : `Você recebeu ${items.length} bilhetes 💌`}
                </Typography>
                <Typography variant="lg" sx={{ mt: 0.6, mb: 2, color: mutedColor, textAlign: 'center' }}>
                  {newCount > 0 ? `${newCount} ${newCount === 1 ? 'novo' : 'novos'} na sua coleção ✨${onOpenReward ? ' · toque pra ler' : ''}` : onOpenReward ? 'Toque em um bilhete pra ler de novo' : ''}
                </Typography>
                <Stack spacing={1.2}>
                  {items.map((item, i) => (
                    <Box key={`${item.reward.id}-${i}`} sx={{ position: 'relative', animation: `${riseIn} 0.4s ease ${0.08 * i}s both` }}>
                      <RewardCard reward={{ ...item.reward, isNew: false }} rarities={rarities} types={types} onClick={onOpenReward ? () => onOpenReward(item.reward) : undefined} />
                      {item.reward.isNew && (
                        <Box sx={{ position: 'absolute', top: -8, right: 8, px: 0.9, py: 0.2, borderRadius: 99, fontSize: '0.64rem', fontWeight: 900, color: '#fff', background: 'linear-gradient(135deg, #f472b6, #fb7185)', boxShadow: '0 4px 10px rgba(244,114,182,0.4)' }}>
                          NOVO
                        </Box>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>

          <Box sx={{ position: 'relative', zIndex: 2, px: 2, pb: 'max(20px, env(safe-area-inset-bottom))', pt: 1.5, minHeight: 104 }}>
            {phase === 'reveal' && current && (
              <Stack alignItems="center" spacing={1.4} sx={{ maxWidth: 420, mx: 'auto' }}>
                {items.length > 1 && <Stack direction="row" spacing={0.7} aria-label={`Bilhete ${index + 1} de ${items.length}`}>
                  {items.map((_, i) => (
                    <Box key={i} sx={{
                      width: i === index ? 22 : 8, height: 8, borderRadius: 99, transition: 'all 0.25s',
                      background: i <= index ? accent : withAlpha(theme.textOnBg, 25),
                    }} />
                  ))}
                </Stack>}
                <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                  {items.length > 1 && (
                    <Button variant="ghost" onClick={showSummary} sx={{ flex: 1, py: 1.1 }}>
                      Ver todos
                    </Button>
                  )}
                  <Button variant="primary" onClick={next} sx={{ flex: 1.4, py: 1.1 }}>
                    {index < items.length - 1 ? `Próximo (${index + 2}/${items.length})` : 'Ver resumo'}
                  </Button>
                </Stack>
              </Stack>
            )}
            {phase === 'summary' && (
              <Stack direction="row" spacing={1} sx={{ maxWidth: 480, mx: 'auto' }}>
                <Button variant={onViewCollection || onReplay ? 'ghost' : 'primary'} onClick={onClose} sx={{ flex: 1, py: 1.1 }}>{onViewCollection ? 'Guardar' : 'Fechar'}</Button>
                {onViewCollection && <Button variant="primary" onClick={onViewCollection} sx={{ flex: 1, py: 1.1, whiteSpace: 'nowrap' }}>Ver coleção</Button>}
                {onReplay && <Button variant="primary" onClick={replay} sx={{ flex: 1, py: 1.1, whiteSpace: 'nowrap' }}>Simular de novo</Button>}
              </Stack>
            )}
          </Box>
        </Box>
      </Box>
    </Dialog>
  )
}
