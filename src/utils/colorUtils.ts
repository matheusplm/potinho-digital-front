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
