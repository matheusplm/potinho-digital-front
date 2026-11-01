export type Shape = 'sash' | 'arch' | 'round' | 'porthole' | 'submarine'
export type Horizon = 'city' | 'pines' | 'trees' | 'autumn' | 'hills' | 'castle' | 'space' | 'beach'
export type Sky = 'sun' | 'sunLow' | 'moon' | 'planets' | 'none'
type Decor = 'curtains' | 'shutters' | 'flowers' | 'plants' | null

const LOOK: Record<string, { shape: Shape; decor: Decor; horizon?: Horizon; sky?: Sky; stained?: boolean }> = {
  papel: { shape: 'sash', decor: null },
  romance: { shape: 'arch', decor: 'curtains' },
  sunset: { shape: 'sash', decor: 'shutters', horizon: 'hills', sky: 'sunLow' },
  ocean: { shape: 'porthole', decor: null, horizon: 'beach' },
  mint: { shape: 'sash', decor: 'plants', horizon: 'trees' },
  peach: { shape: 'sash', decor: 'flowers', horizon: 'autumn' },
  lavender: { shape: 'round', decor: null },
  midnight: { shape: 'sash', decor: 'curtains' },
  velvet: { shape: 'arch', decor: 'curtains', horizon: 'space', sky: 'planets' },
  'rose-night': { shape: 'arch', decor: 'flowers', horizon: 'castle', stained: true },
  'deep-ocean': { shape: 'submarine', decor: null, sky: 'none' },
  'forest-night': { shape: 'sash', decor: 'shutters', horizon: 'pines' },
}

export function sceneLook(key: string) {
  return LOOK[key] ?? LOOK.papel
}
