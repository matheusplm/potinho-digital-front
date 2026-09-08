import { useCallback, useEffect, useRef, useState } from 'react'
import { RevealEffectLayer } from './RevealEffectLayer'
import { REVEAL_EFFECT_MAP } from './registry'
import { prefersReducedMotion } from './media'
import type { RevealEffectPlayback } from './types'

export function useRevealEffect() {
  const [active, setActive] = useState<{ id: number; playback: RevealEffectPlayback } | null>(null)
  const timerRef = useRef<number | null>(null)
  const idRef = useRef(0)

  const play = useCallback((playback: RevealEffectPlayback) => {
    if (playback.kind === 'none' || prefersReducedMotion()) return
    if (timerRef.current) window.clearTimeout(timerRef.current)
    idRef.current += 1
    setActive({ id: idRef.current, playback })
    const duration = REVEAL_EFFECT_MAP[playback.kind]?.durationMs ?? 2500
    timerRef.current = window.setTimeout(() => setActive(null), duration)
  }, [])

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
  }, [])

  const layer = active ? <RevealEffectLayer key={active.id} playback={active.playback} /> : null

  return { play, layer }
}
