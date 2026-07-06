import { Box, Typography } from '@mui/material'
import { colors } from '../design-system'
import type { CollectionTemplate } from '../services/collectionTemplates'

export function TemplateKitRow({ template, busy, dimmed, onClick }: {
  template: CollectionTemplate
  busy?: boolean
  dimmed?: boolean
  onClick: () => void
}) {
  const inactive = busy || dimmed
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.1, p: 1.2, borderRadius: '14px',
        cursor: inactive ? 'default' : 'pointer', background: template.gradient,
        border: '1.5px solid rgba(255,255,255,0.75)', boxShadow: `0 5px 16px ${template.accent}22`,
        opacity: dimmed ? 0.45 : 1,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.2s ease',
        '&:hover': inactive ? {} : { transform: 'translateY(-1px)', boxShadow: `0 8px 22px ${template.accent}33` },
      }}
    >
      <Box sx={{ width: 38, height: 38, borderRadius: '11px', flexShrink: 0, background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontSize: '1.15rem', lineHeight: 1 }}>{template.emoji}</Typography>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 900, color: colors.text.primary, lineHeight: 1.2 }}>
          {template.title}
        </Typography>
        <Typography sx={{ fontSize: '0.66rem', color: colors.text.secondary, lineHeight: 1.35, mt: 0.2 }}>
          {busy ? '✨ Preparando sua coleção...' : template.tagline}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: '0.9rem', color: template.accent, flexShrink: 0, fontWeight: 900 }}>→</Typography>
    </Box>
  )
}
