import type { SxProps, Theme } from '@mui/material'

export function mergeSx(...parts: (SxProps<Theme> | false | undefined)[]): SxProps<Theme> {
  return parts.flatMap((part) => (!part ? [] : Array.isArray(part) ? part : [part])) as SxProps<Theme>
}
