import { useState } from 'react'
import { toast } from '../components/ui'

interface ImportMutation<R> {
  mutateAsync: (json: string) => Promise<R>
}

export function useJsonImport<R>(
  mutation: ImportMutation<R>,
  buildMessage: (result: R) => string,
  onSuccess: () => void,
  initialJson = '',
) {
  const [json, setJson] = useState(initialJson)

  const execute = async () => {
    try {
      JSON.parse(json)
    } catch {
      toast.error('JSON inválido. Revise vírgulas, aspas e colchetes.')
      return
    }
    try {
      const result = await mutation.mutateAsync(json)
      toast.success(buildMessage(result))
      onSuccess()
    } catch (e) {
      toast.error((e as Error).message || 'Erro ao importar.')
    }
  }

  return { json, setJson, execute }
}
