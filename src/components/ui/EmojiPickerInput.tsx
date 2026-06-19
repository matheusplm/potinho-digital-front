import { useState } from 'react'
import { Box, Popover, Stack, Typography } from '@mui/material'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import { colors, radius } from '../../design-system'

interface EmojiPickerInputProps {
  label?: string
  value: string
  onChange: (emoji: string) => void
}

export function EmojiPickerInput({ label, value, onChange }: EmojiPickerInputProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  return (
    <Stack spacing={0.6}>
      {label && (
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: colors.text.secondary, pl: 0.5 }}>
          {label}
        </Typography>
      )}
      <Box
        component="button"
        type="button"
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget)}
        sx={{
          width: 52,
          height: 44,
          borderRadius: radius.lg,
          border: `1.5px solid ${colors.border.subtle}`,
          bgcolor: colors.surface.base,
          backdropFilter: 'blur(10px)',
          cursor: 'pointer',
          fontSize: '1.35rem',
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          '&:hover': { borderColor: 'rgba(29,78,216,0.4)' },
          '&:focus': {
            outline: 'none',
            borderColor: colors.primary.main,
            boxShadow: `0 0 0 3px rgba(29,78,216,0.1)`,
          },
        }}
      >
        {value || '✨'}
      </Box>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        marginThreshold={8}
        slotProps={{
          paper: {
            sx: {
              borderRadius: radius.xl, overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(15,23,42,0.14)', mt: 0.5,
              maxWidth: 'min(352px, calc(100vw - 16px))',
            },
          },
        }}
      >
        <Picker
          data={data}
          onEmojiSelect={(emoji: { native: string }) => {
            onChange(emoji.native)
            setAnchorEl(null)
          }}
          locale="pt"
          theme="light"
          previewPosition="none"
          skinTonePosition="search"
          perLine={8}
        />
      </Popover>
    </Stack>
  )
}
