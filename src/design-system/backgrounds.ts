export interface BackgroundTheme {
  key: string
  label: string
  emoji: string
  particle: string
  gradient: string
  accent: string
  textOnBg: string
  textOnBgMuted: string
  surfaceBg: string
  surfaceBorder: string
  isDark: boolean
}

export const backgroundThemes: BackgroundTheme[] = [
  {
    key: 'romance',
    label: 'Romance',
    emoji: '💗',
    particle: '💗',
    gradient: 'linear-gradient(165deg, #fdf4f6 0%, #fce7f0 40%, #eae9fc 100%)',
    accent: '#db2777',
    textOnBg: '#521c3d',
    textOnBgMuted: '#7d4a63',
    surfaceBg: 'rgba(255,255,255,0.82)',
    surfaceBorder: 'rgba(0,0,0,0.07)',
    isDark: false,
  },
  {
    key: 'sunset',
    label: 'Pôr do sol',
    emoji: '🌅',
    particle: '🧡',
    gradient: 'linear-gradient(165deg, #fff7ec 0%, #ffe4c2 45%, #ffd2c0 100%)',
    accent: '#ea580c',
    textOnBg: '#5c2a0e',
    textOnBgMuted: '#8f5432',
    surfaceBg: 'rgba(255,255,255,0.82)',
    surfaceBorder: 'rgba(0,0,0,0.07)',
    isDark: false,
  },
  {
    key: 'ocean',
    label: 'Oceano',
    emoji: '🌊',
    particle: '🫧',
    gradient: 'linear-gradient(165deg, #eefafd 0%, #d3eefa 45%, #dbe4fc 100%)',
    accent: '#0284c7',
    textOnBg: '#0d3c5b',
    textOnBgMuted: '#41708f',
    surfaceBg: 'rgba(255,255,255,0.82)',
    surfaceBorder: 'rgba(0,0,0,0.07)',
    isDark: false,
  },
  {
    key: 'mint',
    label: 'Menta',
    emoji: '🌿',
    particle: '🌿',
    gradient: 'linear-gradient(165deg, #f2fcf6 0%, #d9f3e5 45%, #cfeedd 100%)',
    accent: '#059669',
    textOnBg: '#134737',
    textOnBgMuted: '#48745f',
    surfaceBg: 'rgba(255,255,255,0.82)',
    surfaceBorder: 'rgba(0,0,0,0.07)',
    isDark: false,
  },
  {
    key: 'peach',
    label: 'Pêssego',
    emoji: '🍑',
    particle: '🌸',
    gradient: 'linear-gradient(165deg, #fff9f1 0%, #ffe6cf 45%, #ffd8ce 100%)',
    accent: '#f97316',
    textOnBg: '#63300f',
    textOnBgMuted: '#96603a',
    surfaceBg: 'rgba(255,255,255,0.82)',
    surfaceBorder: 'rgba(0,0,0,0.07)',
    isDark: false,
  },
  {
    key: 'lavender',
    label: 'Lavanda',
    emoji: '💜',
    particle: '💜',
    gradient: 'linear-gradient(165deg, #faf8ff 0%, #ebe4fc 45%, #f6e3f6 100%)',
    accent: '#7c3aed',
    textOnBg: '#3c2373',
    textOnBgMuted: '#6f58a8',
    surfaceBg: 'rgba(255,255,255,0.82)',
    surfaceBorder: 'rgba(0,0,0,0.07)',
    isDark: false,
  },
  {
    key: 'midnight',
    label: 'Meia-noite',
    emoji: '🌙',
    particle: '⭐',
    gradient: 'linear-gradient(165deg, #0b1322 0%, #1b2d4f 52%, #0e1930 100%)',
    accent: '#60a5fa',
    textOnBg: 'rgba(255,255,255,0.95)',
    textOnBgMuted: 'rgba(255,255,255,0.72)',
    surfaceBg: 'rgba(19,29,51,0.72)',
    surfaceBorder: 'rgba(255,255,255,0.14)',
    isDark: true,
  },
  {
    key: 'velvet',
    label: 'Veludo',
    emoji: '💜',
    particle: '✨',
    gradient: 'linear-gradient(165deg, #150b24 0%, #45206b 52%, #1b0f2e 100%)',
    accent: '#e879f9',
    textOnBg: 'rgba(255,255,255,0.95)',
    textOnBgMuted: 'rgba(255,255,255,0.72)',
    surfaceBg: 'rgba(36,20,58,0.72)',
    surfaceBorder: 'rgba(255,255,255,0.14)',
    isDark: true,
  },
  {
    key: 'rose-night',
    label: 'Rosa noturno',
    emoji: '🌹',
    particle: '🌹',
    gradient: 'linear-gradient(165deg, #1c0810 0%, #5c1631 52%, #250b16 100%)',
    accent: '#fb7185',
    textOnBg: 'rgba(255,255,255,0.95)',
    textOnBgMuted: 'rgba(255,255,255,0.72)',
    surfaceBg: 'rgba(48,15,29,0.72)',
    surfaceBorder: 'rgba(255,255,255,0.14)',
    isDark: true,
  },
  {
    key: 'deep-ocean',
    label: 'Mar profundo',
    emoji: '🌊',
    particle: '🫧',
    gradient: 'linear-gradient(165deg, #06141f 0%, #0e4059 52%, #09202f 100%)',
    accent: '#38bdf8',
    textOnBg: 'rgba(255,255,255,0.95)',
    textOnBgMuted: 'rgba(255,255,255,0.72)',
    surfaceBg: 'rgba(10,34,48,0.72)',
    surfaceBorder: 'rgba(255,255,255,0.14)',
    isDark: true,
  },
  {
    key: 'forest-night',
    label: 'Floresta',
    emoji: '🌲',
    particle: '🍃',
    gradient: 'linear-gradient(165deg, #071309 0%, #175031 52%, #0b2114 100%)',
    accent: '#4ade80',
    textOnBg: 'rgba(255,255,255,0.95)',
    textOnBgMuted: 'rgba(255,255,255,0.72)',
    surfaceBg: 'rgba(13,38,24,0.72)',
    surfaceBorder: 'rgba(255,255,255,0.14)',
    isDark: true,
  },
]

export const defaultBackgroundKey = 'romance'

export function getBackgroundTheme(key: string): BackgroundTheme {
  return backgroundThemes.find((t) => t.key === key) ?? backgroundThemes[0]
}
