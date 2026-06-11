import { useEffect } from 'react'
import { toast } from '../components/ui'
import { computeAchievements } from '../utils/achievements'
import type { CollectionPlayView, RarityConfig, NoteTypeConfig } from '../types/note'

/**
 * Dispara um toast comemorativo quando uma conquista nova destrava.
 * Client-only: usa o localStorage `potinho-ach-<cid>` como baseline por coleção
 * (não floda na 1ª visita) e é seguro chamar em várias telas — o "já visto"
 * deduplica entre elas.
 */
export function useAchievementUnlocks(
  play: CollectionPlayView | undefined,
  rarities: RarityConfig[],
  types: NoteTypeConfig[],
  collectionId: string,
  enabled: boolean,
) {
  const achievements = play ? computeAchievements(play, rarities, types) : []
  const unlockedKey = achievements.filter((a) => a.unlocked).map((a) => a.id).join(',')

  useEffect(() => {
    if (!enabled || !collectionId || !play) return
    const key = `potinho-ach-${collectionId}`
    const unlockedIds = unlockedKey ? unlockedKey.split(',') : []
    let seen: unknown
    try { seen = JSON.parse(localStorage.getItem(key) ?? 'null') } catch { seen = null }
    if (!Array.isArray(seen)) {
      localStorage.setItem(key, JSON.stringify(unlockedIds))
      return
    }
    const newly = unlockedIds.filter((id) => !(seen as string[]).includes(id))
    if (newly.length > 0) {
      const byId = Object.fromEntries(achievements.map((a) => [a.id, a]))
      newly.forEach((id) => {
        const a = byId[id]
        if (a) toast.love('Conquista desbloqueada! 🏆', { description: `${a.emoji} ${a.label}` })
      })
      localStorage.setItem(key, JSON.stringify([...new Set([...(seen as string[]), ...unlockedIds])]))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlockedKey, enabled, collectionId])
}
