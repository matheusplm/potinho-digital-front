import { useReward } from 'partycles'
import type { RefObject } from 'react'
import { PARTYCLES_EFFECT_IDS, type PartyclesEffectId } from '../utils/celebrations'

export function usePartyclesRewards(targetRef: RefObject<HTMLElement | null>) {
  const ref = targetRef as RefObject<HTMLElement>
  const coins = useReward(ref, 'coins')
  const crystals = useReward(ref, 'crystals')
  const galaxy = useReward(ref, 'galaxy')
  const petals = useReward(ref, 'petals')
  const aurora = useReward(ref, 'aurora')
  const fireflies = useReward(ref, 'fireflies')

  const rewards: Record<PartyclesEffectId, () => void> = {
    coins: () => { void coins.reward() },
    crystals: () => { void crystals.reward() },
    galaxy: () => { void galaxy.reward() },
    petals: () => { void petals.reward() },
    aurora: () => { void aurora.reward() },
    fireflies: () => { void fireflies.reward() },
  }

  return (id: string | undefined): boolean => {
    if (!id || !(PARTYCLES_EFFECT_IDS as readonly string[]).includes(id)) return false
    rewards[id as PartyclesEffectId]()
    return true
  }
}
