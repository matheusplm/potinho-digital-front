import { Box, Stack, Typography, type SxProps, type Theme } from '@mui/material'
import { BRAND_TAGLINE, brandAccent, colors, font, liftOnDark } from '../design-system'
import { mergeSx } from './ui/sx'
import { PotinhoMark } from './PotinhoMark'

const COPYRIGHT_YEAR = new Date().getFullYear()
export const APOTHEOSYS_URL = 'https://www.apotheosys.com.br/'

export function BrandLogo({ size = 36, sx }: { size?: number; sx?: SxProps<Theme> }) {
  return (
    <Box sx={mergeSx({ width: size, height: size, flexShrink: 0, display: 'block' }, sx)}>
      <PotinhoMark size={size} />
    </Box>
  )
}

type BrandNameProps = {
  size?: number | string
  color?: string
  onLight?: boolean
  sx?: SxProps<Theme>
}

export function BrandName({ size = '1.15rem', color = colors.text.primary, onLight, sx }: BrandNameProps) {
  return (
    <Typography
      component="span"
      sx={mergeSx({
        display: 'block', fontFamily: font.serif, fontWeight: 600, fontSize: size,
        lineHeight: 1.15, letterSpacing: '-0.015em', color, whiteSpace: 'nowrap',
      }, sx)}
    >
      Potinho{' '}
      <Box component="span" sx={{
        ...brandAccent(onLight), fontFamily: font.hand, fontStyle: 'normal', fontWeight: 700, fontSize: '1.22em',
        display: 'inline-block', transform: 'rotate(-5deg) translateY(-0.06em)', letterSpacing: 0, pr: 0,
      }}>
        digital
      </Box>
    </Typography>
  )
}

type BrandMarkProps = BrandNameProps & {
  logo?: number
  tagline?: boolean
  mutedColor?: string
}

export function BrandMark({ logo = 36, size, color, mutedColor = colors.text.muted, onLight, tagline, sx }: BrandMarkProps) {
  return (
    <Stack direction="row" spacing={1.3} sx={mergeSx({ alignItems: 'center', minWidth: 0 }, sx)}>
      <BrandLogo size={logo} />
      <Box sx={{ minWidth: 0, textAlign: 'left' }}>
        <BrandName size={size} color={color} onLight={onLight} />
        {tagline && (
          <Typography variant="xs" sx={{ color: mutedColor, fontWeight: 600, mt: 0.3 }}>
            {BRAND_TAGLINE}
          </Typography>
        )}
      </Box>
    </Stack>
  )
}

export function ApotheosysCredit({ sx }: { sx?: SxProps<Theme> }) {
  return (
    <Box
      component="a"
      href={APOTHEOSYS_URL}
      target="_blank"
      rel="noopener noreferrer"
      sx={mergeSx({ display: 'inline-flex', alignItems: 'center', gap: 0.8, textDecoration: 'none', color: colors.text.muted, fontSize: '0.8rem' }, sx)}
    >
      um produto
      <Box component="span" sx={{ width: 32, height: 32, borderRadius: '50%', background: '#2b2340', border: '1.5px solid color-mix(in srgb, var(--pd-text-primary) 30%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Box component="img" src="/apotheosys-mark.webp" alt="" width={24} height={24} loading="lazy" sx={{ width: 24, height: 'auto', display: 'block' }} />
      </Box>
      <Box component="span" sx={{ fontWeight: 700, letterSpacing: '0.08em', color: colors.text.primary }}>
        APOTHEO<Box component="span" sx={{ color: liftOnDark('#0b7c8a') }}>SYS</Box>
      </Box>
    </Box>
  )
}

export function Copyright({ color = colors.text.muted, sx }: { color?: string; sx?: SxProps<Theme> }) {
  return (
    <Typography variant="xs" sx={mergeSx({ color, textAlign: 'center', lineHeight: 1.5 }, sx)}>
      © {COPYRIGHT_YEAR}{' '}
      <Box component="a" href={APOTHEOSYS_URL} target="_blank" rel="noopener noreferrer" sx={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: 2 }}>Apotheosys</Box>.{' '}
      <Box component="span" sx={{ whiteSpace: 'nowrap' }}>Todos os direitos reservados.</Box>
    </Typography>
  )
}
