export function gradientTextSx(color: string) {
  if (color.includes('gradient')) {
    return {
      background: color,
      WebkitBackgroundClip: 'text' as const,
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text' as const,
    }
  }
  return { color }
}

export function themedCardBg(cardBg: string, isDark: boolean): string {
  if (!isDark) return cardBg
  return `linear-gradient(rgba(15,18,28,0.15), rgba(15,18,28,0.15)), ${cardBg}`
}
