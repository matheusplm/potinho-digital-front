import { readFileSync, writeFileSync } from 'node:fs'
import { createServer } from 'vite'

const dist = new URL('../dist/', import.meta.url)
const shell = readFileSync(new URL('index.html', dist), 'utf8')
if (!shell.includes('<div id="root"></div>')) {
  throw new Error('prerender: dist/index.html não é o shell limpo do vite build; rode o build de novo antes')
}

const vite = await createServer({
  server: { middlewareMode: true, hmr: false, ws: false },
  appType: 'custom',
  logLevel: 'error',
  ssr: {
    noExternal: [/^@mui\//, /^@emotion\//, 'react-router', 'react-router-dom'],
    resolve: { conditions: ['module-sync'] },
  },
})

try {
  const { renderLanding } = await vite.ssrLoadModule('/src/entry-prerender.tsx')
  const { mobile, desktop, styles } = renderLanding()

  const variantCss = '<style>@media (min-width:900px){[data-prerender=mobile]{display:none}}@media (max-width:899.98px){[data-prerender=desktop]{display:none}}.pd-authed [data-prerender]{display:none}</style>'
  const authScript = "<script>try{if(localStorage.getItem('potinho-auth'))document.documentElement.classList.add('pd-authed')}catch(e){}</script>"

  const html = shell
    .replace('</head>', `${styles}${variantCss}${authScript}</head>`)
    .replace('<div id="root"></div>', `<div id="root" data-prerendered><div data-prerender="mobile">${mobile}</div><div data-prerender="desktop">${desktop}</div></div>`)

  if (!html.includes('data-prerendered') || !html.includes('<h1')) {
    throw new Error('prerender: não consegui injetar a landing no dist/index.html')
  }

  writeFileSync(new URL('app.html', dist), shell)
  writeFileSync(new URL('index.html', dist), html)
  console.log(`prerender: landing injetada (${(html.length / 1024).toFixed(0)}kB) e app.html gerado`)
} finally {
  await vite.close()
}
