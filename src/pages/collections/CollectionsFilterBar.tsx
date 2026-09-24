import CloseIcon from '@mui/icons-material/Close'
import GridViewIcon from '@mui/icons-material/GridView'
import SearchIcon from '@mui/icons-material/Search'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda'
import ViewListIcon from '@mui/icons-material/ViewList'
import { Box, Stack, Typography } from '@mui/material'
import type { ElementType } from 'react'
import { colors, radius } from '../../design-system'

type ViewMode = 'cards' | 'grid' | 'list'
type SortType = 'name-asc' | 'name-desc'

const VIEW_ICONS: { mode: ViewMode; Icon: ElementType }[] = [
  { mode: 'cards', Icon: ViewAgendaIcon },
  { mode: 'grid',  Icon: GridViewIcon },
  { mode: 'list',  Icon: ViewListIcon },
]

export function CollectionsFilterBar({ sort, setSort, search, setSearch, view, changeView, accent, textOnBg, textOnBgMuted }: {
  sort: SortType;       setSort: (s: SortType) => void
  search: string;       setSearch: (s: string) => void
  view: ViewMode;       changeView: (v: ViewMode) => void
  accent: string;       textOnBg: string;  textOnBgMuted: string
}) {
  const chipBase = {
    px: 1.1, py: 0.5, borderRadius: radius.full, flexShrink: 0,
    cursor: 'pointer', transition: 'all 0.16s',
    backdropFilter: 'blur(8px)',
  }

  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        px: 1.4, py: 0.85,
        background: colors.glass.bg, backdropFilter: 'blur(12px)',
        border: `1.5px solid ${colors.glass.border}`,
        borderRadius: radius.xl, mb: 1.2,
        transition: 'border-color 0.15s, background 0.15s',
        '&:focus-within': {
          border: `1.5px solid ${accent}66`,
          background: colors.glass.strong,
        },
      }}>
        <SearchIcon sx={{ fontSize: 17, color: textOnBgMuted, flexShrink: 0 }} />
        <Box
          component="input"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder="Buscar coleção..."
          sx={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontSize: '0.88rem', color: textOnBg, fontFamily: 'inherit',
            '&::placeholder': { color: textOnBgMuted },
          }}
        />
        {search && (
          <Box onClick={() => setSearch('')} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: textOnBgMuted, '&:hover': { color: textOnBg } }}>
            <CloseIcon sx={{ fontSize: 15 }} />
          </Box>
        )}
      </Box>

      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Box onClick={() => setSort(sort === 'name-asc' ? 'name-desc' : 'name-asc')} sx={{
          ...chipBase, display: 'flex', alignItems: 'center', gap: 0.3,
          background: sort !== 'name-asc' ? `${accent}1a` : colors.glass.bg,
          border: `1.5px solid ${sort !== 'name-asc' ? accent : colors.glass.border}`,
          color: sort !== 'name-asc' ? accent : textOnBgMuted,
        }}>
          <SwapVertIcon sx={{ fontSize: 13 }} />
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700 }}>
            {sort === 'name-asc' ? 'A-Z' : 'Z-A'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.8 }}>
          {VIEW_ICONS.map(({ mode, Icon }) => (
            <Box key={mode} onClick={() => changeView(mode)} sx={{
              width: 34, height: 34, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.15s', backdropFilter: 'blur(8px)',
              background: view === mode ? colors.glass.strong : colors.glass.bg,
              border: `1.5px solid ${view === mode ? accent : colors.glass.border}`,
              boxShadow: view === mode ? `0 2px 8px ${accent}22` : 'none',
              color: view === mode ? accent : textOnBgMuted,
              '&:hover': { background: colors.glass.strong },
            }}>
              <Icon sx={{ fontSize: 15 }} />
            </Box>
          ))}
        </Box>
      </Stack>
    </Box>
  )
}
