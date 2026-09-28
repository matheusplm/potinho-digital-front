import { Box, Stack, Typography, type SxProps, type Theme } from '@mui/material'
import { BRAND_TAGLINE, brandAccent, colors, font } from '../design-system'
import { mergeSx } from './ui/sx'

const COPYRIGHT_YEAR = new Date().getFullYear()

export function BrandLogo({ size = 36, sx }: { size?: number; sx?: SxProps<Theme> }) {
  return (
    <Box
      component="img"
      src="/potinho-icon.svg"
      alt=""
      aria-hidden
      width={size}
      height={size}
      sx={mergeSx({
        width: size, height: size, flexShrink: 0, display: 'block',
        filter: 'drop-shadow(0 4px 12px rgba(139,92,246,0.28))',
      }, sx)}
    />
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
        display: 'block', fontFamily: font.serif, fontWeight: 700, fontSize: size,
        lineHeight: 1.15, letterSpacing: '-0.01em', color, whiteSpace: 'nowrap',
      }, sx)}
    >
      Potinho <Box component="span" sx={brandAccent(onLight)}>Digital</Box>
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

export function Copyright({ color = colors.text.muted, sx }: { color?: string; sx?: SxProps<Theme> }) {
  return (
    <Typography variant="xs" sx={mergeSx({ color, textAlign: 'center', lineHeight: 1.5 }, sx)}>
      © {COPYRIGHT_YEAR} Potinho Digital.{' '}
      <Box component="span" sx={{ whiteSpace: 'nowrap' }}>Todos os direitos reservados.</Box>
    </Typography>
  )
}
