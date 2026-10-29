import { backgroundThemes, defaultBackgroundKey, themeCssVars } from './backgrounds'

export const THEME_STORAGE_KEY = 'potinho-bg-theme'

export function themeBootScript(): string {
  const themes = Object.fromEntries(backgroundThemes.map((theme) => [theme.key, [theme.isDark ? 'dark' : 'light', themeCssVars(theme)]]))
  return `(function(){var m=${JSON.stringify(themes)},k;try{k=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})}catch(e){}var t=m[k]||m[${JSON.stringify(defaultBackgroundKey)}],r=document.documentElement;r.setAttribute('data-pd-theme',t[0]);for(var v in t[1])r.style.setProperty(v,t[1][v])})()`
}
