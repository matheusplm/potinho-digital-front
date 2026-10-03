import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { IconButton, InputAdornment } from '@mui/material'
import { useState, type ComponentProps } from 'react'
import { colors } from '../../design-system'
import { Input } from './Input'

export function PasswordInput(props: Omit<ComponentProps<typeof Input>, 'type'>) {
  const [visible, setVisible] = useState(false)
  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      InputProps={{
        ...props.InputProps,
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label={visible ? 'Esconder senha' : 'Mostrar senha'}
              onClick={() => setVisible((current) => !current)}
              edge="end"
              size="small"
              sx={{ color: colors.text.muted }}
            >
              {visible ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  )
}
