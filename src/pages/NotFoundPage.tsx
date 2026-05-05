import { Button, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <Stack spacing={2} sx={{ py: 8, alignItems: 'center' }}>
      <Typography variant="h6">Tela nao encontrada</Typography>
      <Button component={RouterLink} to="/" variant="contained">
        Voltar para inicio
      </Button>
    </Stack>
  )
}
