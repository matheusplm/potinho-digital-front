const DARK_INK = '#0f172a'

function luminance(hex: string): number {
  const channels = hex.replace('#', '').match(/\w\w/g)?.map((value) => parseInt(value, 16) / 255) ?? [0, 0, 0]
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

export function readableOn(background: string): string {
  return contrastRatio('#ffffff', background) >= 3.5 ? '#fff' : DARK_INK
}
