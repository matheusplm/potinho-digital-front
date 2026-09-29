import { Box, Stack, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Button, Card, SectionLabel, toast } from '../../components/ui'
import { useBackground } from '../../context/BackgroundContext'
import { colors } from '../../design-system'
import { queryKeys } from '../../hooks/useNotes'
import { api } from '../../services/api'
import type { Todo, TodoAction } from './insights'

export function TodoSection({ todos }: { todos: Todo[] }) {
  const { theme } = useBackground()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const resend = useMutation({
    mutationFn: ({ cid, email }: { cid: string; email: string }) => api.sendInvite(cid, email),
    onSuccess: (_, { cid }) => {
      toast.success('Convite reenviado 💌')
      void queryClient.invalidateQueries({ queryKey: queryKeys.invites(cid) })
    },
    onError: (error) => toast.error((error as Error).message || 'Não deu pra reenviar o convite.'),
  })

  if (todos.length === 0) return null

  function run(action: TodoAction) {
    if (action.kind === 'link') navigate(action.to)
    else resend.mutate({ cid: action.cid, email: action.email })
  }

  const isResending = (action: TodoAction) =>
    action.kind === 'resend' && resend.isPending && resend.variables?.cid === action.cid && resend.variables.email === action.email

  return (
    <Stack spacing={1.2}>
      <SectionLabel color={theme.textOnBgMuted}>📝 Pra fazer</SectionLabel>
      <Card sx={{ py: 0.5 }}>
        {todos.map((todo, index) => (
          <Stack
            key={todo.key}
            direction="row"
            spacing={1.4}
            alignItems="center"
            sx={{ px: 1.8, py: 1.3, borderTop: index ? `1px solid ${colors.border.subtle}` : 'none' }}
          >
            <Box sx={{ fontSize: '1.25rem', lineHeight: 1, flexShrink: 0 }}>{todo.emoji}</Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="md" sx={{ fontWeight: 700, color: colors.text.primary, lineHeight: 1.3 }}>
                {todo.title}
              </Typography>
              <Typography variant="xs" sx={{ color: colors.text.muted, mt: 0.2 }}>
                {todo.detail}
              </Typography>
            </Box>
            <Button
              variant="ghost"
              loading={isResending(todo.action)}
              onClick={() => run(todo.action)}
              sx={{ flexShrink: 0, py: 0.6, px: 1.4, fontSize: '0.76rem', whiteSpace: 'nowrap' }}
            >
              {todo.action.label}
            </Button>
          </Stack>
        ))}
      </Card>
    </Stack>
  )
}
