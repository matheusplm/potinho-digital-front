import { useState } from 'react'
import { toast } from '../components/ui'

interface DeleteMutation {
  mutate(id: string, options?: { onSuccess?: () => void; onError?: (e: unknown) => void }): void
  isPending: boolean
}

export function useConfirmDelete<T extends { id: string }>(
  mutation: DeleteMutation,
  messages: { success: string; error?: string },
) {
  const [target, setTarget] = useState<T | null>(null)

  const confirm = () => {
    if (!target) return
    mutation.mutate(target.id, {
      onSuccess: () => { toast.success(messages.success); setTarget(null) },
      onError: (e) => toast.error(e instanceof Error ? e.message : (messages.error || 'Erro ao excluir.')),
    })
  }

  return {
    target,
    setTarget,
    confirm,
    isOpen: target !== null,
    isPending: mutation.isPending,
    close: () => setTarget(null),
  }
}
