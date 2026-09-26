import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CssBaseline, ThemeProvider } from '@mui/material'
import App from './App.tsx'
import './index.css'
import { appTheme } from './theme.ts'

const queryClient = new QueryClient()

async function enableMocking() {
  if (import.meta.env.VITE_API_URL) {
    return
  }
  if (!import.meta.env.DEV) {
    return
  }

  const isMockWorker = (url?: string) => !!url?.endsWith('/mockServiceWorker.js')
  const registrations = await navigator.serviceWorker?.getRegistrations() ?? []
  await Promise.all(registrations
    .filter((registration) => !isMockWorker((registration.active ?? registration.waiting ?? registration.installing)?.scriptURL))
    .map((registration) => registration.unregister()))

  const { worker } = await import('./mocks/browser.ts')
  await worker.start({
    onUnhandledRequest: 'bypass',
  })

  const reloadKey = 'pd-mock-reload'
  if (!isMockWorker(navigator.serviceWorker?.controller?.scriptURL) && sessionStorage.getItem(reloadKey) !== '1') {
    sessionStorage.setItem(reloadKey, '1')
    window.location.reload()
    await new Promise(() => {})
  }
  sessionStorage.removeItem(reloadKey)
}

enableMocking().then(() => {
  const root = document.getElementById('root')!
  if (root.hasAttribute('data-prerendered')) document.documentElement.classList.add('pd-prerendered')
  createRoot(root).render(
    <StrictMode>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>,
  )
})
