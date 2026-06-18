import { useState, useCallback, useRef } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { Grid } from '@giphy/react-components'
import { GiphyFetch } from '@giphy/js-fetch-api'
import type { IGif } from '@giphy/js-types'
import { colors, radius } from '../design-system'
import { Input } from './ui'

const gf = new GiphyFetch(import.meta.env.VITE_GIPHY_API_KEY ?? '')

// ── URL validation ────────────────────────────────────────────────────────────

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'bmp', 'svg']
const SAFE_HOSTS = [
  'images.unsplash.com', 'plus.unsplash.com',
  'images.pexels.com',
  'media.giphy.com', 'media0.giphy.com', 'media1.giphy.com',
  'media2.giphy.com', 'media3.giphy.com', 'media4.giphy.com',
  'i.giphy.com',
  'i.imgur.com',
  'cdn.discordapp.com', 'media.discordapp.net',
  'pbs.twimg.com',
]

export function validateImageUrl(raw: string): string | null {
  const url = raw.trim()
  if (!url) return null

  let parsed: URL
  try { parsed = new URL(url) } catch { return 'URL inválida' }

  if (parsed.protocol !== 'https:') return 'Use apenas URLs HTTPS'

  // bloqueia esquemas perigosos que podem escapar via encoding
  const lower = url.toLowerCase()
  if (['javascript', 'data:', 'vbscript', 'file:'].some((d) => lower.includes(d))) {
    return 'URL inválida'
  }

  const ext = parsed.pathname.split('.').pop()?.toLowerCase() ?? ''
  const hasImageExt = IMAGE_EXTS.includes(ext)
  const isSafeHost = SAFE_HOSTS.some((h) => parsed.hostname === h || parsed.hostname.endsWith('.' + h))

  if (!hasImageExt && !isSafeHost) {
    return 'A URL deve terminar em .jpg, .png, .gif, .webp ou vir de um serviço de imagem conhecido'
  }

  return null
}

// ── ImagePicker ───────────────────────────────────────────────────────────────

type Mode = 'giphy' | 'url'

interface Props {
  value: string | null
  onChange: (url: string | null) => void
}

export function ImagePicker({ value, onChange }: Props) {
  const [mode, setMode] = useState<Mode | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [urlInput, setUrlInput] = useState(value ?? '')
  const [urlError, setUrlError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchGifs = useCallback(
    (offset: number) =>
      debouncedSearch
        ? gf.search(debouncedSearch, { offset, limit: 9, rating: 'g' })
        : gf.trending({ offset, limit: 9, rating: 'g' }),
    [debouncedSearch],
  )

  function handleSearchChange(q: string) {
    setSearch(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(q), 500)
  }

  function handleGifClick(gif: IGif, e: React.SyntheticEvent) {
    e.preventDefault()
    const url = gif.images.downsized_medium?.url || gif.images.original.url
    onChange(url)
    setMode(null)
  }

  function handleUrlChange(raw: string) {
    setUrlInput(raw)
    const err = validateImageUrl(raw)
    setUrlError(err)
    if (!err) onChange(raw.trim() || null)
  }

  function handleUrlBlur() {
    if (urlError) onChange(null)
  }

  function switchMode(m: Mode) {
    setMode((prev) => (prev === m ? null : m))
    if (m === 'url') setUrlInput(value ?? '')
  }

  const tabSx = (active: boolean) => ({
    px: 1.4, py: 0.5, borderRadius: radius.full, cursor: 'pointer',
    fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.15s',
    background: active ? colors.primary.main : 'rgba(0,0,0,0.05)',
    color: active ? '#fff' : colors.text.secondary,
    border: `1.5px solid ${active ? colors.primary.main : 'transparent'}`,
    userSelect: 'none' as const,
  })

  return (
    <Stack spacing={1.2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: colors.text.secondary }}>
          Imagem{' '}
          <Typography component="span" sx={{ fontSize: '0.68rem', fontWeight: 400, color: colors.text.muted }}>
            (opcional)
          </Typography>
        </Typography>
        <Stack direction="row" spacing={0.6}>
          <Box onClick={() => switchMode('giphy')} sx={tabSx(mode === 'giphy')}>🔍 GIF</Box>
          <Box onClick={() => switchMode('url')} sx={tabSx(mode === 'url')}>🔗 URL</Box>
          {value && (
            <Box onClick={() => { onChange(null); setUrlInput(''); setMode(null) }}
              sx={{ ...tabSx(false), color: colors.error?.main ?? '#ef4444' }}>
              ✕
            </Box>
          )}
        </Stack>
      </Stack>

      {/* preview da imagem selecionada */}
      {value && (
        <Box sx={{ borderRadius: radius.lg, overflow: 'hidden', width: '100%', height: 80, background: 'rgba(0,0,0,0.06)' }}>
          <Box component="img" src={value} alt="preview" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </Box>
      )}

      {/* Giphy */}
      {mode === 'giphy' && (
        <Stack spacing={1}>
          <Input
            placeholder="Buscar GIF..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            autoFocus
          />
          {!import.meta.env.VITE_GIPHY_API_KEY ? (
            <Typography sx={{ fontSize: '0.75rem', color: colors.text.muted, p: 1 }}>
              Adicione VITE_GIPHY_API_KEY no .env para ativar a busca de GIFs.
            </Typography>
          ) : (
            <Box sx={{ borderRadius: radius.lg, overflow: 'hidden', '& .giphy-grid': { gap: '4px' } }}>
              <Grid
                key={debouncedSearch}
                width={312}
                columns={3}
                fetchGifs={fetchGifs}
                onGifClick={handleGifClick}
                noLink
                hideAttribution
              />
            </Box>
          )}
        </Stack>
      )}

      {/* URL manual */}
      {mode === 'url' && (
        <Stack spacing={0.5}>
          <Input
            placeholder="https://exemplo.com/imagem.jpg"
            value={urlInput}
            onChange={(e) => handleUrlChange(e.target.value)}
            onBlur={handleUrlBlur}
            error={!!urlError}
            helperText={urlError ?? undefined}
            autoFocus
          />
          <Typography sx={{ fontSize: '0.65rem', color: colors.text.muted, pl: 0.5 }}>
            Aceito: .jpg .png .gif .webp .avif — apenas HTTPS
          </Typography>
        </Stack>
      )}
    </Stack>
  )
}
