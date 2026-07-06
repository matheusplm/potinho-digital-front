import { Turnstile } from '@marsidev/react-turnstile'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
const CHALLENGE_TIMEOUT_MS = 12000

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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearChallengeTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  function startChallengeTimeout() {
    clearChallengeTimeout()
    timeoutRef.current = setTimeout(() => {
      setStatus('error')
    }, CHALLENGE_TIMEOUT_MS)
  }

  useEffect(() => {
    if (!SITE_KEY && token === null) {
      setToken('bypass')
      setStatus('verified')
    }
  }, [token])

  useEffect(() => {
    if (!SITE_KEY) return
    if (status === 'pending') {
      startChallengeTimeout()
    } else {
      clearChallengeTimeout()
    }
    return clearChallengeTimeout
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

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
          injectScript={false}
          onSuccess={(t) => { setToken(t); setStatus('verified') }}
          onError={() => setStatus('error')}
          onTimeout={() => setStatus('error')}
          onExpire={() => { setToken(null); setStatus('pending'); widgetRef.current?.reset() }}
          options={{ size: 'invisible', language: 'pt-br' }}
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
