export function isImageMedia(value: string): boolean {
  return /^https?:\/\//i.test(value.trim())
}

export function accentPalette(accent: string): string[] {
  const base = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(accent.trim()) ? accent.trim() : '#f43f5e'
  return [base, '#ffffff', '#fde68a', '#fca5a5', '#a5b4fc', '#86efac']
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}
