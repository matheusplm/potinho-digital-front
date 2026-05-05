import LocalMallIcon from '@mui/icons-material/LocalMall'
import { Alert, Button, Paper, Snackbar, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { PackOpenDialog } from '../components/PackOpenDialog'
import { useOpenPackMutation } from '../hooks/useNotes'
import type { OpenPackResponse } from '../types/note'

export function PackPage() {
  const openPackMutation = useOpenPackMutation()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [packResult, setPackResult] = useState<OpenPackResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleOpenPack() {
    openPackMutation.mutate(undefined, {
      onSuccess: (response) => {
        setPackResult(response)
        setDialogOpen(true)
      },
      onError: (mutationError) => {
        setError(mutationError.message)
      },
    })
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Abrir pacotinho</Typography>

      <Paper
        sx={{
          p: 2.5,
          background: 'linear-gradient(120deg, #ffebf5 0%, #efe7ff 100%)',
        }}
      >
        <Stack spacing={1.5}>
          <Typography variant="body1">
            Cada abertura traz 3 bilhetinhos com chance de raridade especial.
          </Typography>
          <Button
            variant="contained"
            startIcon={<LocalMallIcon />}
            onClick={handleOpenPack}
            disabled={openPackMutation.isPending}
          >
            {openPackMutation.isPending ? 'Abrindo...' : 'Abrir agora'}
          </Button>
        </Stack>
      </Paper>

      <PackOpenDialog open={dialogOpen} result={packResult} onClose={() => setDialogOpen(false)} />

      <Snackbar open={Boolean(error)} autoHideDuration={3000} onClose={() => setError(null)}>
        <Alert severity="error" variant="filled" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Stack>
  )
}
