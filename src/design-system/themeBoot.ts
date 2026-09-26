import { backgroundThemes, defaultBackgroundKey } from './backgrounds'

export const THEME_STORAGE_KEY = 'potinho-bg-theme'

export function themeBootScript(): string {
  const themes = Object.fromEntries(backgroundThemes.map((theme) => [theme.key, [theme.gradient, theme.isDark ? 'dark' : 'light']]))
  return `(function(){var m=${JSON.stringify(themes)},k;try{k=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})}catch(e){}var t=m[k]||m[${JSON.stringify(defaultBackgroundKey)}],r=document.documentElement;r.setAttribute('data-pd-theme',t[1]);r.style.setProperty('--pd-page-bg',t[0])})()`
}
