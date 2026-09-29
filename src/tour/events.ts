export type TourEventName = 'collection-created' | 'note-created' | 'notes-released' | 'invite-sent'

export interface TourEventDetail {
  name: TourEventName
  collectionId?: string
}

const EVENT = 'pd-tour'

export function emitTour(name: TourEventName, collectionId?: string) {
  window.dispatchEvent(new CustomEvent<TourEventDetail>(EVENT, { detail: { name, collectionId } }))
}

export function onTour(listener: (detail: TourEventDetail) => void) {
  const handler = (event: Event) => listener((event as CustomEvent<TourEventDetail>).detail)
  window.addEventListener(EVENT, handler)
  return () => window.removeEventListener(EVENT, handler)
}
