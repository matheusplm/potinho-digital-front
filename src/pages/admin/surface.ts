import { useBackground } from '../../context/BackgroundContext'

export function useSurface() {
  const { theme } = useBackground()
  return {
    background: theme.surfaceBg,
    border: `1px solid ${theme.surfaceBorder}`,
    backdropFilter: 'blur(14px)',
    boxShadow: theme.isDark ? '0 10px 30px rgba(0,0,0,0.25)' : '0 10px 30px rgba(30,41,59,0.06)',
  }
}
