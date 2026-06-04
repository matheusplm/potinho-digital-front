export function slugify(value: string): string {
  const base = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base || 'colecao'
}

export function toConfigId(value: string): string {
  const base = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return base || 'item'
}

export function uniqueConfigId(label: string, existingIds: string[]): string {
  const base = toConfigId(label)
  if (!existingIds.includes(base)) return base
  let suffix = 2
  while (existingIds.includes(`${base}_${suffix}`)) suffix += 1
  return `${base}_${suffix}`
}

export function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)
}
