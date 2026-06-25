import { useState } from 'react'

export function useDialogState<T = true>() {
  const [value, setValue] = useState<T | null>(null)
  return {
    value,
    isOpen: value !== null,
    open: (v: T) => setValue(v),
    close: () => setValue(null),
  }
}
