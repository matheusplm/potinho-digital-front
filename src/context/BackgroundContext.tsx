import { createContext, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from 'react'
import { defaultBackgroundKey, getBackgroundTheme, THEME_STORAGE_KEY, type BackgroundTheme } from '../design-system'

interface BackgroundContextValue {
  theme: BackgroundTheme
  themeKey: string
  setThemeKey: (key: string) => void
  maskLightCards: boolean
  setMaskLightCards: (value: boolean) => void
}

const BackgroundContext = createContext<BackgroundContextValue | null>(null)
const MASK_KEY = 'potinho-mask-cards'
const useIsomorphicLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [themeKey, setThemeKeyState] = useState<string>(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) ?? defaultBackgroundKey
    } catch {
      return defaultBackgroundKey
    }
  })
  const [maskLightCards, setMaskLightCardsState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(MASK_KEY) !== 'false'
    } catch {
      return true
    }
  })

  const setMaskLightCards = (value: boolean) => {
    setMaskLightCardsState(value)
    try {
      localStorage.setItem(MASK_KEY, String(value))
    } catch {
      void 0
    }
  }

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeKey)
    } catch {
      void 0
    }
  }, [themeKey])

  useIsomorphicLayoutEffect(() => {
    const theme = getBackgroundTheme(themeKey)
    const root = document.documentElement
    root.setAttribute('data-pd-theme', theme.isDark ? 'dark' : 'light')
    root.style.setProperty('--pd-page-bg', theme.gradient)
  }, [themeKey])

  const value: BackgroundContextValue = {
    theme: getBackgroundTheme(themeKey),
    themeKey,
    setThemeKey: setThemeKeyState,
    maskLightCards,
    setMaskLightCards,
  }

  return <BackgroundContext.Provider value={value}>{children}</BackgroundContext.Provider>
}

export function useBackground() {
  const ctx = useContext(BackgroundContext)
  if (!ctx) throw new Error('useBackground must be used within BackgroundProvider')
  return ctx
}
