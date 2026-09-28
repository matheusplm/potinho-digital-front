const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit'

export function preloadTurnstile() {
  if (!import.meta.env.VITE_TURNSTILE_SITE_KEY || window.turnstile || document.querySelector(`link[href="${TURNSTILE_SRC}"]`)) return
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'script'
  link.href = TURNSTILE_SRC
  document.head.appendChild(link)
}

export function lazyWithCaptcha<T>(load: () => Promise<T>) {
  return () => {
    preloadTurnstile()
    return load()
  }
}
