import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import createCache, { type EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { appTheme } from './theme'
import { LandingPage } from './pages/LandingPage'
import { BackgroundProvider } from './context/BackgroundContext'

function renderVariant(cache: EmotionCache, desktop: boolean, withBaseline: boolean) {
  const theme = createTheme(appTheme, {
    components: { MuiUseMediaQuery: { defaultProps: { ssrMatchMedia: () => ({ matches: desktop }) } } },
  })
  return renderToString(
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        {withBaseline && <CssBaseline />}
        <StaticRouter location="/">
          <BackgroundProvider>
            <LandingPage />
          </BackgroundProvider>
        </StaticRouter>
      </ThemeProvider>
    </CacheProvider>,
  )
}

export function renderLanding() {
  const cache = createCache({ key: 'css' })
  cache.compat = true
  const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(cache)
  const mobile = renderVariant(cache, false, true)
  const desktop = renderVariant(cache, true, false)
  return { mobile, desktop, styles: constructStyleTagsFromChunks(extractCriticalToChunks(mobile + desktop)) }
}
