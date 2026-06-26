import { Turnstile } from '@marsidev/react-turnstile'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

type CaptchaStatus = 'pending' | 'verified' | 'error'

interface CaptchaContextValue {
  token: string | null
  status: CaptchaStatus
  consume: () => string | null
  retry: () => void
}

const CaptchaContext = createContext<CaptchaContextValue | null>(null)

export function CaptchaProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [status, setStatus] = useState<CaptchaStatus>('pending')
  const widgetRef = useRef<TurnstileInstance>(null)

  useEffect(() => {
    if (!SITE_KEY) {
      setToken('bypass')
      setStatus('verified')
    }
  }, [])

  const consume = useCallback((): string | null => {
    const t = token
    setToken(null)
    setStatus('pending')
    widgetRef.current?.reset()
    return t
  }, [token])

  const retry = useCallback(() => {
    setToken(null)
    setStatus('pending')
    widgetRef.current?.reset()
  }, [])

  return (
    <CaptchaContext.Provider value={{ token, status, consume, retry }}>
      {children}
      {SITE_KEY && (
        <Turnstile
          ref={widgetRef}
          siteKey={SITE_KEY}
          onSuccess={(t) => { setToken(t); setStatus('verified') }}
          onError={() => setStatus('error')}
          onExpire={() => { setToken(null); setStatus('pending'); widgetRef.current?.reset() }}
          options={{ size: 'invisible', language: 'pt-BR' }}
        />
      )}
    </CaptchaContext.Provider>
  )
}

export function useCaptcha(): CaptchaContextValue {
  const ctx = useContext(CaptchaContext)
  if (!ctx) throw new Error('useCaptcha must be used inside CaptchaProvider')
  return ctx
}
