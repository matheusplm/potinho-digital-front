export type Shape = 'sash' | 'arch' | 'round' | 'porthole' | 'submarine'
type Decor = 'curtains' | 'shutters' | 'flowers' | 'plants' | null

const LOOK: Record<string, { shape: Shape; decor: Decor; horizon?: 'pines' | 'trees' }> = {
  papel: { shape: 'sash', decor: null },
  romance: { shape: 'arch', decor: 'curtains' },
  sunset: { shape: 'sash', decor: 'shutters' },
  ocean: { shape: 'porthole', decor: null },
  mint: { shape: 'sash', decor: 'plants', horizon: 'trees' },
  peach: { shape: 'sash', decor: 'flowers' },
  lavender: { shape: 'round', decor: null },
  midnight: { shape: 'sash', decor: 'curtains' },
  velvet: { shape: 'arch', decor: 'curtains' },
  'rose-night': { shape: 'arch', decor: 'flowers' },
  'deep-ocean': { shape: 'submarine', decor: null },
  'forest-night': { shape: 'sash', decor: 'shutters', horizon: 'pines' },
}

export function sceneLook(key: string) {
  return LOOK[key] ?? LOOK.papel
}
