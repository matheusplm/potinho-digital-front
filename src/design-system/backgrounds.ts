export interface BackgroundTheme {
  key: string
  label: string
  emoji: string
  gradient: string
  accent: string
  textOnBg: string
  textOnBgMuted: string
  isDark: true
}

export const backgroundThemes: BackgroundTheme[] = [
  {
    key: 'midnight',
    label: 'Meia-noite',
    emoji: '🌙',
    gradient: 'linear-gradient(160deg, #0d0f1a 0%, #111827 50%, #0d0f1a 100%)',
    accent: '#818cf8',
    textOnBg: 'rgba(255,255,255,0.92)',
    textOnBgMuted: 'rgba(255,255,255,0.45)',
    isDark: true,
  },
  {
    key: 'velvet',
    label: 'Veludo',
    emoji: '💜',
    gradient: 'linear-gradient(160deg, #13071e 0%, #1e0a38 55%, #130718 100%)',
    accent: '#c084fc',
    textOnBg: 'rgba(255,255,255,0.92)',
    textOnBgMuted: 'rgba(255,255,255,0.45)',
    isDark: true,
  },
  {
    key: 'rose-night',
    label: 'Rosa noturno',
    emoji: '🌹',
    gradient: 'linear-gradient(160deg, #18080f 0%, #2d0a1a 55%, #18080f 100%)',
    accent: '#fb7185',
    textOnBg: 'rgba(255,255,255,0.92)',
    textOnBgMuted: 'rgba(255,255,255,0.45)',
    isDark: true,
  },
  {
    key: 'deep-ocean',
    label: 'Oceano',
    emoji: '🌊',
    gradient: 'linear-gradient(160deg, #050d1a 0%, #0c1f3d 55%, #050d1a 100%)',
    accent: '#38bdf8',
    textOnBg: 'rgba(255,255,255,0.92)',
    textOnBgMuted: 'rgba(255,255,255,0.45)',
    isDark: true,
  },
  {
    key: 'forest-night',
    label: 'Floresta',
    emoji: '🌿',
    gradient: 'linear-gradient(160deg, #05110a 0%, #0a2116 55%, #05110a 100%)',
    accent: '#4ade80',
    textOnBg: 'rgba(255,255,255,0.92)',
    textOnBgMuted: 'rgba(255,255,255,0.45)',
    isDark: true,
  },
]

export const defaultBackgroundKey = 'midnight'

export function getBackgroundTheme(key: string): BackgroundTheme {
  return backgroundThemes.find((t) => t.key === key) ?? backgroundThemes[0]
}
