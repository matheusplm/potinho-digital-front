export const colors = {
  primary:   { main: '#1d4ed8', light: '#3b82f6', glow: 'rgba(29,78,216,0.32)', text: 'var(--pd-primary-text)' },
  rose:      { main: '#e11d48', light: '#fb7185', glow: 'rgba(225,29,72,0.32)', text: 'var(--pd-rose-text)' },
  purple:    { main: '#4f46e5', light: '#7c3aed', glow: 'rgba(79,70,229,0.32)' },
  text:      { primary: 'var(--pd-text-primary)', secondary: 'var(--pd-text-secondary)', muted: 'var(--pd-text-muted)' },
  surface:   { base: 'var(--pd-surface-base)', overlay: 'var(--pd-surface-overlay)', paper: 'var(--pd-surface-paper)' },
  border:    { subtle: 'var(--pd-border-subtle)', medium: 'var(--pd-border-medium)' },
  glass:     { bg: 'var(--pd-glass-bg)', border: 'var(--pd-glass-border)', strong: 'var(--pd-glass-strong)' },
  success:   { main: '#15803d', bg: 'rgba(220,252,231,0.92)', border: 'rgba(21,128,61,0.2)' },
  error:     { main: '#e11d48', bg: 'rgba(255,228,230,0.92)', border: 'rgba(225,29,72,0.2)' },
  info:      { main: '#1d4ed8', bg: 'rgba(219,234,254,0.92)', border: 'rgba(29,78,216,0.2)' },
  love:      { main: '#e11d48', bg: 'rgba(255,228,236,0.95)', border: 'rgba(225,29,72,0.22)' },
}

export const ink = {
  primary: '#1e3a5f',
  secondary: '#64748b',
  muted: '#94a3b8',
  surface: 'rgba(255,253,251,0.95)',
  borderSubtle: 'rgba(0,0,0,0.07)',
  borderMedium: 'rgba(0,0,0,0.1)',
}

export const gradients = {
  primary: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.light} 100%)`,
  rose:    `linear-gradient(135deg, ${colors.rose.main} 0%, ${colors.rose.light} 100%)`,
  purple:  `linear-gradient(135deg, ${colors.purple.main} 0%, ${colors.purple.light} 100%)`,
  brand:   'linear-gradient(160deg, #dbeafe 0%, #fce7f3 55%, #ede9fe 100%)',
  accent:  `linear-gradient(90deg, ${colors.primary.main}, ${colors.rose.main})`,
}

export const radius = {
  sm:   '6px',
  md:   '10px',
  lg:   '12px',
  xl:   '16px',
  full: '9999px',
}

export const shadow = {
  sm:      '0 2px 8px rgba(0,0,0,0.08)',
  md:      '0 4px 20px rgba(0,0,0,0.06)',
  lg:      '0 8px 32px rgba(0,0,0,0.1)',
  primary: `0 6px 20px ${colors.primary.glow}`,
  rose:    `0 6px 20px ${colors.rose.glow}`,
  purple:  `0 6px 20px ${colors.purple.glow}`,
}

export const font = {
  serif: '"Playfair Display", "Georgia", serif',
  sans:  '"Nunito", "Roboto", sans-serif',
}

export const typography = {
  hero:     { fontSize: '2.8rem', fontWeight: 700, lineHeight: 1,   letterSpacing: '-0.5px' },
  title:    { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2 },
  subtitle: { fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.4 },
  body:     { fontSize: '0.95rem', fontWeight: 400, lineHeight: 1.5 },
  caption:  { fontSize: '0.85rem', fontWeight: 400, lineHeight: 1.4 },
  label:    { fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.5px' },
}

export const zIndex = {
  base:    0,
  card:    1,
  dropdown: 10,
  header:  100,
  footer:  100,
  overlay: 200,
  modal:   300,
  toast:   400,
}

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  '2xl': 48,
  '3xl': 64,
}
