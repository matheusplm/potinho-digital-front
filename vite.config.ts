import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { themeBootScript } from './src/design-system/themeBoot'

function themeBoot(): Plugin {
  return {
    name: 'potinho-theme-boot',
    transformIndexHtml: () => [{ tag: 'script', children: themeBootScript(), injectTo: 'head-prepend' }],
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), themeBoot()],
  server: {
    port: 4564,
    strictPort: true,
  },
})
