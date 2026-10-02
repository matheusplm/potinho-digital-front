import { Box } from '@mui/material'
import { useState } from 'react'

export function PackIcon({ emoji, imageUrl, size }: { emoji: string; imageUrl?: string | null; size: number }) {
  const [failed, setFailed] = useState<string | null>(null)
  if (!imageUrl || failed === imageUrl) return <>{emoji}</>
  return (
    <Box
      component="img"
      src={imageUrl}
      alt=""
      loading="lazy"
      onError={() => setFailed(imageUrl)}
      sx={{ width: size, height: size, objectFit: 'contain', display: 'block', pointerEvents: 'none', userSelect: 'none' }}
    />
  )
}
