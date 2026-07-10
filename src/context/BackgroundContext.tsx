import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { defaultBackgroundKey, getBackgroundTheme, type BackgroundTheme } from '../design-system'

interface BackgroundContextValue {
  theme: BackgroundTheme
  themeKey: string
  setThemeKey: (key: string) => void
  maskLightCards: boolean
  setMaskLightCards: (value: boolean) => void
}

const BackgroundContext = createContext<BackgroundContextValue | null>(null)
const STORAGE_KEY = 'potinho-bg-theme'
const MASK_KEY = 'potinho-mask-cards'

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [themeKey, setThemeKeyState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? defaultBackgroundKey
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
      localStorage.setItem(STORAGE_KEY, themeKey)
    } catch {
      void 0
    }
  }, [themeKey])

  useEffect(() => {
    document.documentElement.setAttribute('data-pd-theme', getBackgroundTheme(themeKey).isDark ? 'dark' : 'light')
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
