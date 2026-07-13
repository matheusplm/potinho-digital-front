import { useState, useCallback, useRef, useEffect } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { Grid } from '@giphy/react-components'
import { GiphyFetch } from '@giphy/js-fetch-api'
import type { IGif } from '@giphy/js-types'
import { colors, radius } from '../design-system'
import { Input } from './ui'

const gf = new GiphyFetch(import.meta.env.VITE_GIPHY_API_KEY ?? '')

const TENOR_KEY = import.meta.env.VITE_TENOR_API_KEY ?? ''
const GIF_PROVIDER: 'tenor' | 'giphy' = TENOR_KEY ? 'tenor' : 'giphy'

interface TenorGif {
  id: string
  media_formats: { gif?: { url: string }; tinygif?: { url: string } }
}

async function tenorFetch(query: string, pos: string): Promise<{ results: TenorGif[]; next: string }> {
  const base = query
    ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}`
    : 'https://tenor.googleapis.com/v2/featured?'
  const url = `${base}&key=${TENOR_KEY}&limit=18&media_filter=gif,tinygif&contentfilter=high&locale=pt_BR&country=BR${pos ? `&pos=${pos}` : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Tenor indisponível')
  return res.json() as Promise<{ results: TenorGif[]; next: string }>
}

function TenorGrid({ query, onPick }: { query: string; onPick: (url: string) => void }) {
  const [results, setResults] = useState<TenorGif[]>([])
  const [next, setNext] = useState('')
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  const load = useCallback(async (pos: string, append: boolean) => {
    setLoading(true)
    try {
      const data = await tenorFetch(query, pos)
      setResults((current) => append ? [...current, ...data.results] : data.results)
      setNext(data.next ?? '')
      setFailed(false)
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }, [query])

  useEffect(() => {
    void load('', false)
  }, [load])

  if (failed) {
    return (
      <Typography sx={{ fontSize: '0.74rem', color: colors.text.muted, textAlign: 'center', py: 2 }}>
        Não deu pra carregar os GIFs agora. Tenta de novo ou cola uma URL.
      </Typography>
    )
  }

  return (
    <Stack spacing={0.8}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.6 }}>
        {results.map((gif) => {
          const thumb = gif.media_formats.tinygif?.url ?? gif.media_formats.gif?.url
          const full = gif.media_formats.gif?.url ?? gif.media_formats.tinygif?.url
          if (!thumb || !full) return null
          return (
            <Box key={gif.id} onClick={() => onPick(full)} sx={{
              borderRadius: radius.sm, overflow: 'hidden', cursor: 'pointer', height: 88,
              '&:hover': { outline: `2px solid ${colors.primary.main}` },
            }}>
              <Box component="img" src={thumb} alt="" loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </Box>
          )
        })}
      </Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography sx={{ fontSize: '0.6rem', color: colors.text.muted }}>via Tenor</Typography>
        {next && (
          <Typography onClick={() => !loading && void load(next, true)} sx={{
            fontSize: '0.72rem', fontWeight: 800, color: colors.primary.main,
            cursor: 'pointer', userSelect: 'none', opacity: loading ? 0.5 : 1, '&:hover': { opacity: 0.75 },
          }}>
            {loading ? 'Carregando...' : 'Carregar mais'}
          </Typography>
        )}
      </Stack>
    </Stack>
  )
}

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'bmp', 'svg']
const SAFE_HOSTS = [
  'images.unsplash.com', 'plus.unsplash.com',
  'images.pexels.com',
  'media.giphy.com', 'media0.giphy.com', 'media1.giphy.com',
  'media2.giphy.com', 'media3.giphy.com', 'media4.giphy.com',
  'i.giphy.com',
  'media.tenor.com', 'c.tenor.com',
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
  const gridRef = useRef<HTMLDivElement>(null)
  const [gridWidth, setGridWidth] = useState(0)

  useEffect(() => {
    if (!gridRef.current) return
    const ro = new ResizeObserver((entries) => setGridWidth(entries[0].contentRect.width))
    ro.observe(gridRef.current)
    return () => ro.disconnect()
  }, [mode]) // re-run when mode opens the grid

  const fetchGifs = useCallback(
    (offset: number) =>
      debouncedSearch
        ? gf.search(debouncedSearch, { offset, limit: 12, rating: 'g' })
        : gf.trending({ offset, limit: 12, rating: 'g' }),
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

  function toggleMode(m: Mode) {
    setMode((prev) => (prev === m ? null : m))
    if (m === 'url') setUrlInput(value ?? '')
  }

  function handleClear() {
    onChange(null)
    setUrlInput('')
    setUrlError(null)
    setMode(null)
  }

  const btnSx = (active: boolean) => ({
    flex: 1,
    py: 0.9,
    px: 1,
    borderRadius: radius.md,
    cursor: 'pointer',
    textAlign: 'center' as const,
    fontSize: '0.78rem',
    fontWeight: 700,
    transition: 'all 0.15s',
    userSelect: 'none' as const,
    background: active ? colors.primary.main : 'rgba(0,0,0,0.04)',
    color: active ? '#fff' : colors.text.secondary,
    border: `1.5px solid ${active ? colors.primary.main : colors.border.subtle}`,
    '&:hover': {
      background: active ? colors.primary.light : 'rgba(0,0,0,0.08)',
      borderColor: active ? colors.primary.light : colors.border.medium,
    },
  })

  return (
    <Stack spacing={1.5}>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: colors.text.secondary }}>
        Imagem{' '}
        <Typography component="span" sx={{ fontSize: '0.68rem', fontWeight: 400, color: colors.text.muted }}>
          (opcional)
        </Typography>
      </Typography>

      {/* Preview */}
      {value && (
        <Box sx={{ position: 'relative', borderRadius: radius.lg, overflow: 'hidden', height: 88 }}>
          <Box
            component="img"
            src={value}
            alt="preview"
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <Box
            onClick={handleClear}
            title="Remover imagem"
            sx={{
              position: 'absolute', top: 6, right: 6,
              width: 24, height: 24, borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '0.65rem', fontWeight: 800,
              backdropFilter: 'blur(4px)',
              '&:hover': { background: 'rgba(0,0,0,0.8)' },
              transition: 'background 0.15s',
            }}
          >
            ✕
          </Box>
        </Box>
      )}

      {/* Toggle buttons */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box onClick={() => toggleMode('giphy')} sx={btnSx(mode === 'giphy')}>
          🔍 GIF
        </Box>
        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: colors.text.muted, flexShrink: 0 }}>
          ou
        </Typography>
        <Box onClick={() => toggleMode('url')} sx={btnSx(mode === 'url')}>
          🔗 URL
        </Box>
      </Stack>

      {/* GIF panel */}
      {mode === 'giphy' && (
        <Stack spacing={1}>
          <Input
            placeholder="Pesquise um GIF..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            autoFocus
          />
          {GIF_PROVIDER === 'tenor' ? (
            <TenorGrid query={debouncedSearch} onPick={(url) => { onChange(url); setMode(null) }} />
          ) : (
            <Box
              ref={gridRef}
              sx={{
                borderRadius: radius.md,
                overflow: 'hidden',
                background: 'rgba(0,0,0,0.03)',
                '& *': { boxSizing: 'border-box' },
              }}
            >
              {gridWidth > 0 && (
                <Grid
                  key={debouncedSearch}
                  width={gridWidth}
                  columns={4}
                  fetchGifs={fetchGifs}
                  onGifClick={handleGifClick}
                  noLink
                  hideAttribution
                />
              )}
            </Box>
          )}
        </Stack>
      )}

      {/* URL panel */}
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
          <Typography sx={{ fontSize: '0.62rem', color: colors.text.muted, pl: 0.5 }}>
            .jpg · .png · .gif · .webp · .avif · apenas HTTPS
          </Typography>
        </Stack>
      )}
    </Stack>
  )
}
