import { useMemo } from 'react'
import { PackOpeningStage } from '../../components/pack-opening/PackOpeningStage'
import type { CollectionDailyReward, NoteTypeConfig, RarityConfig } from '../../types/note'
import type { PackSimulation } from './packData'

export function PackSimulationDialog({ simulation, rarities, types, onClose, onSimulateAgain }: {
  simulation: PackSimulation | null; rarities: RarityConfig[]; types: NoteTypeConfig[]; onClose: () => void; onSimulateAgain: () => void
}) {
  const rewards = useMemo<CollectionDailyReward[] | null>(() => simulation?.rewards.map((note, i) => ({
    id: `${note.id}#${i}`,
    title: note.title,
    message: note.message,
    rarity: note.rarity,
    typeId: note.typeId,
    typeIds: note.typeIds,
    imageUrl: note.imageUrl,
    imageLayout: note.imageLayout,
    isNew: true,
  })) ?? null, [simulation])

  return (
    <PackOpeningStage
      open={!!simulation}
      pack={simulation?.pack ?? null}
      rewards={rewards}
      rarities={rarities}
      types={types}
      onClose={onClose}
      onReplay={onSimulateAgain}
    />
  )
}
