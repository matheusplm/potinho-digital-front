import { readableOn } from './contrast'

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
  onAccent: string
}

const GRAIN_LIGHT = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .35 0 0 0 0 .25 0 0 0 0 .12 0 0 0 .09 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
const GRAIN_DARK = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 .96 0 0 0 0 .9 0 0 0 .07 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

function paper(color: string, dark = false) {
  return `${dark ? GRAIN_DARK : GRAIN_LIGHT}, ${color}`
}

const THEMES: Omit<BackgroundTheme, 'onAccent'>[] = [
  {
    key: 'papel',
    label: 'Papel',
    emoji: '📜',
    particle: '',
    gradient: paper('#f4ede0'),
    accent: '#c0392b',
    textOnBg: '#2a241d',
    textOnBgMuted: '#6b6052',
    surfaceBg: '#fffcf5',
    surfaceBorder: 'rgba(60,42,20,0.16)',
    isDark: false,
  },
  {
    key: 'romance',
    label: 'Romance',
    emoji: '💗',
    particle: '💗',
    gradient: paper('#f5e4e4'),
    accent: '#b0325f',
    textOnBg: '#4a1c2c',
    textOnBgMuted: '#7a4f5c',
    surfaceBg: '#fffaf8',
    surfaceBorder: 'rgba(110,40,60,0.16)',
    isDark: false,
  },
  {
    key: 'sunset',
    label: 'Pôr do sol',
    emoji: '🌅',
    particle: '🧡',
    gradient: paper('#f5e1c8'),
    accent: '#b8501a',
    textOnBg: '#4d2a12',
    textOnBgMuted: '#7d5a40',
    surfaceBg: '#fffaf2',
    surfaceBorder: 'rgba(110,60,20,0.17)',
    isDark: false,
  },
  {
    key: 'ocean',
    label: 'Oceano',
    emoji: '🌊',
    particle: '🫧',
    gradient: paper('#e0eaee'),
    accent: '#1f6a8f',
    textOnBg: '#14313f',
    textOnBgMuted: '#4f6a76',
    surfaceBg: '#fbfdfd',
    surfaceBorder: 'rgba(20,60,80,0.15)',
    isDark: false,
  },
  {
    key: 'mint',
    label: 'Menta',
    emoji: '🌿',
    particle: '🌿',
    gradient: paper('#e0ecdf'),
    accent: '#2f7a55',
    textOnBg: '#173326',
    textOnBgMuted: '#4f6a5a',
    surfaceBg: '#fbfdf9',
    surfaceBorder: 'rgba(30,70,45,0.15)',
    isDark: false,
  },
  {
    key: 'peach',
    label: 'Pêssego',
    emoji: '🍑',
    particle: '🌸',
    gradient: paper('#f6e3d5'),
    accent: '#c05a2a',
    textOnBg: '#4f2a16',
    textOnBgMuted: '#7f5c48',
    surfaceBg: '#fffaf5',
    surfaceBorder: 'rgba(110,60,30,0.16)',
    isDark: false,
  },
  {
    key: 'lavender',
    label: 'Lavanda',
    emoji: '💜',
    particle: '💜',
    gradient: paper('#e8e2ef'),
    accent: '#5f45a0',
    textOnBg: '#2c2142',
    textOnBgMuted: '#615775',
    surfaceBg: '#fdfbff',
    surfaceBorder: 'rgba(60,40,100,0.15)',
    isDark: false,
  },
  {
    key: 'midnight',
    label: 'Meia-noite',
    emoji: '🌙',
    particle: '⭐',
    gradient: paper('#18202e', true),
    accent: '#8fb4e8',
    textOnBg: 'rgba(250,246,238,0.94)',
    textOnBgMuted: 'rgba(250,246,238,0.62)',
    surfaceBg: '#212b3c',
    surfaceBorder: 'rgba(250,246,238,0.12)',
    isDark: true,
  },
  {
    key: 'velvet',
    label: 'Veludo',
    emoji: '💜',
    particle: '✨',
    gradient: paper('#221a2e', true),
    accent: '#d2a2e6',
    textOnBg: 'rgba(250,246,238,0.94)',
    textOnBgMuted: 'rgba(250,246,238,0.62)',
    surfaceBg: '#2d233b',
    surfaceBorder: 'rgba(250,246,238,0.12)',
    isDark: true,
  },
  {
    key: 'rose-night',
    label: 'Rosa noturno',
    emoji: '🌹',
    particle: '🌹',
    gradient: paper('#28151b', true),
    accent: '#ee9aa6',
    textOnBg: 'rgba(250,246,238,0.94)',
    textOnBgMuted: 'rgba(250,246,238,0.62)',
    surfaceBg: '#341e25',
    surfaceBorder: 'rgba(250,246,238,0.12)',
    isDark: true,
  },
  {
    key: 'deep-ocean',
    label: 'Mar profundo',
    emoji: '🌊',
    particle: '🫧',
    gradient: paper('#102128', true),
    accent: '#7cc3dc',
    textOnBg: 'rgba(250,246,238,0.94)',
    textOnBgMuted: 'rgba(250,246,238,0.62)',
    surfaceBg: '#182c34',
    surfaceBorder: 'rgba(250,246,238,0.12)',
    isDark: true,
  },
  {
    key: 'forest-night',
    label: 'Floresta',
    emoji: '🌲',
    particle: '🍃',
    gradient: paper('#14231a', true),
    accent: '#8fcf9f',
    textOnBg: 'rgba(250,246,238,0.94)',
    textOnBgMuted: 'rgba(250,246,238,0.62)',
    surfaceBg: '#1d2e23',
    surfaceBorder: 'rgba(250,246,238,0.12)',
    isDark: true,
  },
]

export const backgroundThemes: BackgroundTheme[] = THEMES.map((theme) => ({ ...theme, onAccent: readableOn(theme.accent) }))

export const defaultBackgroundKey = 'papel'

export function pageBaseColor(theme: BackgroundTheme) {
  return theme.gradient.slice(theme.gradient.lastIndexOf(' ') + 1)
}

export function getBackgroundTheme(key: string): BackgroundTheme {
  return backgroundThemes.find((t) => t.key === key) ?? backgroundThemes[0]
}
