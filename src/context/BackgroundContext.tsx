import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { defaultBackgroundKey, getBackgroundTheme, type BackgroundTheme } from '../design-system'

interface BackgroundContextValue {
  theme: BackgroundTheme
  themeKey: string
  setThemeKey: (key: string) => void
}

const BackgroundContext = createContext<BackgroundContextValue | null>(null)
const STORAGE_KEY = 'potinho-bg-theme'

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [themeKey, setThemeKeyState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? defaultBackgroundKey
    } catch {
      return defaultBackgroundKey
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, themeKey)
    } catch {
      void 0
    }
  }, [themeKey])

  const value: BackgroundContextValue = {
    theme: getBackgroundTheme(themeKey),
    themeKey,
    setThemeKey: setThemeKeyState,
  }

  return <BackgroundContext.Provider value={value}>{children}</BackgroundContext.Provider>
}

export function useBackground() {
  const ctx = useContext(BackgroundContext)
  if (!ctx) throw new Error('useBackground must be used within BackgroundProvider')
  return ctx
}
