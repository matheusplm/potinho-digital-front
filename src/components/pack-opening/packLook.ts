import type { CollectionPack, CollectionPackPattern } from '../../types/note'

export type PackLook = Partial<Pick<CollectionPack, 'imageUrl' | 'pattern' | 'shine' | 'showName'>>

export function resolvePackLook(look?: PackLook | null) {
  return {
    imageUrl: look?.imageUrl ?? null,
    pattern: look?.pattern ?? 'dots',
    shine: look?.shine ?? true,
    showName: look?.showName ?? true,
  }
}

const tile = (size: number, shape: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>${shape}</svg>`)}") 0 0 / ${size}px ${size}px`

const HEART = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z'
const STAR = 'M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 9.5l7.1-.6z'

export const PATTERN_BACKGROUNDS: Record<Exclude<CollectionPackPattern, 'none'>, string> = {
  dots: 'radial-gradient(rgba(255,255,255,0.4) 1.2px, transparent 1.7px) 0 0 / 15px 15px',
  hearts: tile(30, `<path d='${HEART}' fill='rgba(255,255,255,0.55)' transform='translate(4 4) scale(0.5)'/><path d='${HEART}' fill='rgba(255,255,255,0.4)' transform='translate(19 18) scale(0.36)'/>`),
  stars: tile(30, `<path d='${STAR}' fill='rgba(255,255,255,0.55)' transform='translate(3 3) scale(0.5)'/><path d='${STAR}' fill='rgba(255,255,255,0.4)' transform='translate(19 18) scale(0.36)'/>`),
  stripes: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.32) 0 7px, transparent 7px 18px)',
}

export const PATTERN_OPTIONS: { id: CollectionPackPattern; label: string }[] = [
  { id: 'dots', label: '• Bolinhas' },
  { id: 'hearts', label: '♥ Corações' },
  { id: 'stars', label: '★ Estrelas' },
  { id: 'stripes', label: '⟋ Listras' },
  { id: 'none', label: 'Lisa' },
]
