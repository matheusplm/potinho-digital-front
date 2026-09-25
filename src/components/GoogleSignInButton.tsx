import { useEffect, useRef, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { colors, font, radius, shadow } from '../design-system'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const GIS_SRC = 'https://accounts.google.com/gsi/client?hl=pt-BR'

interface CredentialResponse {
  credential?: string
}

interface GoogleIdApi {
  initialize(config: { client_id: string; callback: (response: CredentialResponse) => void }): void
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdApi } }
  }
}

let gisPromise: Promise<void> | null = null

function loadGis(): Promise<void> {
  if (gisPromise) return gisPromise
  gisPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve()
    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => { gisPromise = null; reject(new Error('Falha ao carregar o Google')) }
    document.head.appendChild(script)
  })
  return gisPromise
}

function GoogleGlyph() {
  return (
    <Box component="svg" viewBox="0 0 48 48" sx={{ width: 20, height: 20, flexShrink: 0 }} aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </Box>
  )
}

export function GoogleSignInButton({ onCredential, disabled, dividerLabel = 'ou entre com email' }: {
  onCredential: (idToken: string) => void
  disabled?: boolean
  dividerLabel?: string
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const callbackRef = useRef(onCredential)
  callbackRef.current = onCredential
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (!CLIENT_ID || !wrapRef.current) return
    const measure = () => {
      const w = wrapRef.current?.offsetWidth ?? 0
      if (w > 0) setWidth(Math.min(400, Math.max(200, Math.round(w))))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!CLIENT_ID || !width) return
    let cancelled = false
    loadGis().then(() => {
      if (cancelled || !hostRef.current || !window.google) return
      hostRef.current.innerHTML = ''
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response) => { if (response.credential) callbackRef.current(response.credential) },
      })
      window.google.accounts.id.renderButton(hostRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width,
      })
    }).catch(() => {})
    return () => { cancelled = true }
  }, [width])

  if (!CLIENT_ID) return null

  return (
    <Box sx={{ width: '100%', maxWidth: 320 }}>
      <Box
        ref={wrapRef}
        sx={{
          position: 'relative',
          minHeight: 46,
          opacity: disabled ? 0.55 : 1,
          transition: 'opacity 0.16s ease',
          '&:hover .pd-google-face': disabled ? {} : {
            boxShadow: '0 8px 24px rgba(30,58,95,0.16)',
            borderColor: 'rgba(30,58,95,0.24)',
            transform: 'translateY(-1px)',
          },
          '&:active .pd-google-face': disabled ? {} : { transform: 'translateY(0)' },
        }}
      >
        <Box ref={hostRef} sx={{ opacity: 0, display: 'flex', justifyContent: 'center', pointerEvents: disabled ? 'none' : 'auto', colorScheme: 'light' }} />
        <Box
          className="pd-google-face"
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.2,
            borderRadius: radius.full,
            background: '#ffffff',
            border: '1.5px solid rgba(30,58,95,0.16)',
            boxShadow: shadow.sm,
            transition: 'box-shadow 0.16s ease, border-color 0.16s ease, transform 0.16s ease',
          }}
        >
          <GoogleGlyph />
          <Typography sx={{ fontFamily: font.sans, fontWeight: 700, fontSize: '0.95rem', color: '#1e3a5f', letterSpacing: '0.01em' }}>
            Continuar com o Google
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 2.5 }}>
        <Box sx={{ flex: 1, height: '1px', background: `linear-gradient(90deg, transparent, ${colors.border.medium})` }} />
        <Typography sx={{ fontFamily: font.sans, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.text.muted }}>{dividerLabel}</Typography>
        <Box sx={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${colors.border.medium}, transparent)` }} />
      </Box>
    </Box>
  )
}
