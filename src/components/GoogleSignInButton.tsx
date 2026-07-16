import { useEffect, useRef } from 'react'
import { Box } from '@mui/material'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const GIS_SRC = 'https://accounts.google.com/gsi/client'

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
    script.onerror = () => reject(new Error('Falha ao carregar o Google'))
    document.head.appendChild(script)
  })
  return gisPromise
}

export function GoogleSignInButton({ onCredential, disabled }: {
  onCredential: (idToken: string) => void
  disabled?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const callbackRef = useRef(onCredential)
  callbackRef.current = onCredential

  useEffect(() => {
    if (!CLIENT_ID) return
    let cancelled = false
    loadGis().then(() => {
      if (cancelled || !containerRef.current || !window.google) return
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response) => { if (response.credential) callbackRef.current(response.credential) },
      })
      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        logo_alignment: 'center',
        width: 320,
      })
    }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  if (!CLIENT_ID) return null

  return (
    <Box
      ref={containerRef}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        minHeight: 44,
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        colorScheme: 'light',
      }}
    />
  )
}
