export interface BackgroundTheme {
  key: string
  label: string
  emoji: string
  gradient: string
  accent: string
}

export const backgroundThemes: BackgroundTheme[] = [
  { key: 'romance', label: 'Romance',   emoji: '💗', gradient: 'linear-gradient(160deg, #dbeafe 0%, #fce7f3 55%, #ede9fe 100%)', accent: '#e11d48' },
  { key: 'sunset',  label: 'Pôr do sol', emoji: '🌅', gradient: 'linear-gradient(160deg, #fef3c7 0%, #fed7aa 50%, #fecaca 100%)', accent: '#ea580c' },
  { key: 'ocean',   label: 'Oceano',     emoji: '🌊', gradient: 'linear-gradient(160deg, #cffafe 0%, #bae6fd 50%, #ddd6fe 100%)', accent: '#0891b2' },
  { key: 'forest',  label: 'Floresta',   emoji: '🌿', gradient: 'linear-gradient(160deg, #dcfce7 0%, #d9f99d 50%, #a7f3d0 100%)', accent: '#16a34a' },
  { key: 'night',   label: 'Noite',      emoji: '🌙', gradient: 'linear-gradient(160deg, #e0e7ff 0%, #c7d2fe 50%, #ddd6fe 100%)', accent: '#6366f1' },
]

export const defaultBackgroundKey = 'romance'

export function getBackgroundTheme(key: string): BackgroundTheme {
  return backgroundThemes.find((t) => t.key === key) ?? backgroundThemes[0]
}
