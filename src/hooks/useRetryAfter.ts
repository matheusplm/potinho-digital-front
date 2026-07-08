import { useEffect, useRef, useState } from 'react'
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
  const [epoch, setEpoch] = useState(0)
  const remainingRef = useRef(0)
  remainingRef.current = remaining

  useEffect(() => {
    if (remaining <= 0) return
    const id = setInterval(() => {
      if (remainingRef.current <= 0) { clearInterval(id); return }
      setRemaining((r) => (r > 1 ? r - 1 : 0))
    }, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só epoch: remaining muda a cada tick via remainingRef e recriaria o interval a cada segundo
  }, [epoch])

  function captureFromError(err: unknown) {
    if (err instanceof ApiRequestError && err.retryAfterSec && err.retryAfterSec > 0) {
      setRemaining(err.retryAfterSec)
      setEpoch((e) => e + 1)
    }
  }

  return {
    blocked: remaining > 0,
    label: remaining > 0 ? fmtSec(remaining) : '',
    captureFromError,
  }
}
