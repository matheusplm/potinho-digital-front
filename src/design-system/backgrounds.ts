export interface BackgroundTheme {
  key: string
  label: string
  emoji: string
  gradient: string
  accent: string
  textOnBg: string
  textOnBgMuted: string
  isDark: boolean
}

export const backgroundThemes: BackgroundTheme[] = [
  {
    key: 'romance',
    label: 'Romance',
    emoji: '💗',
    gradient: 'linear-gradient(160deg, #dbeafe 0%, #fce7f3 55%, #ede9fe 100%)',
    accent: '#e11d48',
    textOnBg: '#1e3a5f',
    textOnBgMuted: '#64748b',
    isDark: false,
  },
  {
    key: 'sunset',
    label: 'Pôr do sol',
    emoji: '🌅',
    gradient: 'linear-gradient(160deg, #fef3c7 0%, #fed7aa 50%, #fecaca 100%)',
    accent: '#ea580c',
    textOnBg: '#431407',
    textOnBgMuted: '#92400e',
    isDark: false,
  },
  {
    key: 'ocean',
    label: 'Oceano',
    emoji: '🌊',
    gradient: 'linear-gradient(160deg, #cffafe 0%, #bae6fd 50%, #ddd6fe 100%)',
    accent: '#0891b2',
    textOnBg: '#0c4a6e',
    textOnBgMuted: '#0369a1',
    isDark: false,
  },
  {
    key: 'midnight',
    label: 'Meia-noite',
    emoji: '🌙',
    gradient: 'linear-gradient(160deg, #020817 0%, #1e3a8a 50%, #020817 100%)',
    accent: '#60a5fa',
    textOnBg: 'rgba(255,255,255,0.92)',
    textOnBgMuted: 'rgba(255,255,255,0.45)',
    isDark: true,
  },
  {
    key: 'velvet',
    label: 'Veludo',
    emoji: '💜',
    gradient: 'linear-gradient(160deg, #080412 0%, #581c87 55%, #080412 100%)',
    accent: '#e879f9',
    textOnBg: 'rgba(255,255,255,0.92)',
    textOnBgMuted: 'rgba(255,255,255,0.45)',
    isDark: true,
  },
  {
    key: 'rose-night',
    label: 'Rosa noturno',
    emoji: '🌹',
    gradient: 'linear-gradient(160deg, #0a0205 0%, #881337 55%, #0a0205 100%)',
    accent: '#fb7185',
    textOnBg: 'rgba(255,255,255,0.92)',
    textOnBgMuted: 'rgba(255,255,255,0.45)',
    isDark: true,
  },
]

export const defaultBackgroundKey = 'romance'

export function getBackgroundTheme(key: string): BackgroundTheme {
  return backgroundThemes.find((t) => t.key === key) ?? backgroundThemes[0]
}
