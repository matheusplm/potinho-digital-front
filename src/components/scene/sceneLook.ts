export type Shape = 'sash' | 'arch' | 'round' | 'porthole' | 'submarine' | 'viewport'
export type Horizon = 'city' | 'pines' | 'trees' | 'autumn' | 'hills' | 'castle' | 'space' | 'beach' | 'lavender' | 'paris'
export type Sky = 'sun' | 'sunLow' | 'moon' | 'planets' | 'none'
type Decor = 'curtains' | 'shutters' | 'flowers' | 'plants' | 'balcony' | null

const LOOK: Record<string, { shape: Shape; decor: Decor; horizon?: Horizon; sky?: Sky; stained?: boolean; glow?: boolean; frost?: boolean }> = {
  papel: { shape: 'sash', decor: null },
  romance: { shape: 'arch', decor: 'balcony', horizon: 'paris' },
  sunset: { shape: 'sash', decor: 'shutters', horizon: 'hills', sky: 'sunLow' },
  ocean: { shape: 'sash', decor: 'shutters', horizon: 'beach' },
  mint: { shape: 'sash', decor: 'plants', horizon: 'trees' },
  peach: { shape: 'sash', decor: 'flowers', horizon: 'autumn' },
  lavender: { shape: 'round', decor: null, horizon: 'lavender' },
  midnight: { shape: 'sash', decor: 'curtains', glow: true },
  velvet: { shape: 'viewport', decor: null, horizon: 'space', sky: 'planets' },
  'rose-night': { shape: 'arch', decor: 'flowers', horizon: 'castle', stained: true },
  'deep-ocean': { shape: 'submarine', decor: null, sky: 'none' },
  'forest-night': { shape: 'sash', decor: 'shutters', horizon: 'pines', frost: true },
}

export function sceneLook(key: string) {
  return LOOK[key] ?? LOOK.papel
}
