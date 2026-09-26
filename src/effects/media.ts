export function isImageMedia(value: string): boolean {
  return /^https?:\/\//i.test(value.trim())
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}
