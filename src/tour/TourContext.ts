import { createContext, useContext } from 'react'
import type { TourStep } from './steps'

export interface TourApi {
  step: TourStep | null
  collectionId: string | null
  start: () => void
  next: () => void
  skip: () => void
  exit: () => void
}

export const TourContext = createContext<TourApi>({
  step: null,
  collectionId: null,
  start: () => {},
  next: () => {},
  skip: () => {},
  exit: () => {},
})

export function useTour() {
  return useContext(TourContext)
}
