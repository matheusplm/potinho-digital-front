import { colors, liftOnDark, themeInk } from './tokens'

const ACCENT = ['#1d4ed8', '#7c3aed', '#db2777']

export const BRAND_TAGLINE = 'sua memória afetiva'

export function brandGradient(onLight = false) {
  const [start, middle, end] = onLight ? ACCENT : ACCENT.map(liftOnDark)
  return `linear-gradient(100deg, ${start}, ${middle} 55%, ${end})`
}

export function brandAccent(onLight = false) {
  return {
    color: onLight ? themeInk.ink : colors.primary.text,
    fontStyle: 'italic',
    pr: '0.08em',
  }
}
