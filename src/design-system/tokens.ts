export const colors = {
  primary:   { main: '#27408b', light: '#3d5aa8', glow: 'rgba(39,64,139,0.22)', text: 'var(--pd-primary-text)' },
  rose:      { main: '#c0392b', light: '#d9584a', glow: 'rgba(192,57,43,0.22)', text: 'var(--pd-rose-text)' },
  purple:    { main: '#5b3f8a', light: '#7a5ca8', glow: 'rgba(91,63,138,0.22)' },
  text:      { primary: 'var(--pd-text-primary)', secondary: 'var(--pd-text-secondary)', muted: 'var(--pd-text-muted)' },
  surface:   { base: 'var(--pd-surface-base)', overlay: 'var(--pd-surface-overlay)', paper: 'var(--pd-surface-paper)' },
  border:    { subtle: 'var(--pd-border-subtle)', medium: 'var(--pd-border-medium)' },
  fill:      { subtle: 'var(--pd-fill-subtle)', medium: 'var(--pd-fill-medium)' },
  glass:     {
    bg: 'var(--pd-glass-bg)', border: 'var(--pd-glass-border)', strong: 'var(--pd-glass-strong)',
    card: 'var(--pd-glass-card)', cardBorder: 'var(--pd-glass-card-border)',
    band: 'var(--pd-glass-band)', bandBorder: 'var(--pd-glass-band-border)',
  },
  success:   { main: '#15803d', bg: 'rgba(220,252,231,0.92)', border: 'rgba(21,128,61,0.2)' },
  error:     { main: '#e11d48', bg: 'rgba(255,228,230,0.92)', border: 'rgba(225,29,72,0.2)' },
  info:      { main: '#1d4ed8', bg: 'rgba(219,234,254,0.92)', border: 'rgba(29,78,216,0.2)' },
  love:      { main: '#e11d48', bg: 'rgba(255,228,236,0.95)', border: 'rgba(225,29,72,0.22)' },
  status:    { success: '#22c55e', warning: '#f59e0b', danger: '#ef4444', info: '#3b82f6' },
}

export const ink = {
  primary: '#2a241d',
  secondary: '#5e5446',
  muted: '#8a7e6c',
  surface: '#fffcf5',
  borderSubtle: 'rgba(60,42,20,0.12)',
  borderMedium: 'rgba(60,42,20,0.2)',
}

export const themeInk = {
  ink: 'var(--pd-ink)',
  accent: 'var(--pd-accent)',
  sky: 'var(--pd-sky)',
  page: 'var(--pd-page-base)',
}

export const gradients = {
  primary: 'var(--pd-ink)',
  rose:    'var(--pd-ink)',
  purple:  colors.purple.main,
  brand:   '#efe4cf',
  accent:  colors.rose.main,
  page:    'var(--pd-page-bg)',
}

export function liftOnDark(color: string) {
  return `color-mix(in srgb, ${color}, #fff var(--pd-lift))`
}

export const radius = {
  sm:   '3px',
  md:   '6px',
  lg:   '8px',
  xl:   '10px',
  full: '9999px',
}

export const shadow = {
  sm:      '1px 2px 0 rgba(60,42,20,0.12)',
  md:      '2px 3px 0 rgba(60,42,20,0.12), 0 6px 14px -8px rgba(60,42,20,0.25)',
  lg:      '3px 4px 0 rgba(60,42,20,0.14), 0 12px 24px -12px rgba(60,42,20,0.3)',
  primary: '2px 2px 0 rgba(42,36,29,0.9)',
  rose:    '2px 2px 0 rgba(42,36,29,0.9)',
  purple:  '2px 2px 0 rgba(42,36,29,0.9)',
}

export const font = {
  serif: '"Fraunces", "Georgia", serif',
  sans:  '"Libre Franklin", "Helvetica Neue", Arial, sans-serif',
  hand:  '"Caveat", "Segoe Print", cursive',
}

export const clipOverflow = {
  overflow: 'hidden',
  '@supports (overflow: clip)': { overflow: 'clip' },
} as const
