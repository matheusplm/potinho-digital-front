import type { SxProps, Theme } from '@mui/material'
import { CoachCard } from './CoachCard'
import type { StepId } from './steps'
import { useTour } from './TourContext'

export function TourHint({ id, sx }: { id: StepId; sx?: SxProps<Theme> }) {
  const tour = useTour()
  if (tour.step?.id !== id) return null
  const { step } = tour
  return (
    <CoachCard
      step={step}
      mode="inline"
      secondary={step.optional ? { label: step.optional, onClick: tour.skip } : undefined}
      onExit={tour.exit}
      sx={sx}
    />
  )
}
