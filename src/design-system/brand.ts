import { colors, themeInk } from './tokens'

export const BRAND_TAGLINE = 'sua memória afetiva'

export function brandGradient(onLight = false) {
  return onLight ? themeInk.ink : colors.primary.text
}

export function brandAccent(onLight = false) {
  return {
    color: onLight ? themeInk.ink : colors.primary.text,
    fontStyle: 'italic',
    pr: '0.08em',
  }
}
