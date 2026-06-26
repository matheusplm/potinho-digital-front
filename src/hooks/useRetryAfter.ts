import { useEffect, useState } from 'react'
import { ApiRequestError } from '../services/api'

function fmtSec(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  if (m > 0 && sec > 0) return `${m}min ${sec}s`
  if (m > 0) return `${m}min`
  return `${sec}s`
}

export function useRetryAfter() {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (remaining <= 0) return
    const id = setInterval(() => setRemaining((r) => (r > 1 ? r - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [remaining > 0])

  function captureFromError(err: unknown) {
    if (err instanceof ApiRequestError && err.retryAfterSec && err.retryAfterSec > 0) {
      setRemaining(err.retryAfterSec)
    }
  }

  return {
    blocked: remaining > 0,
    label: remaining > 0 ? fmtSec(remaining) : '',
    captureFromError,
  }
}
