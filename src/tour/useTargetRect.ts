import { useEffect, useState } from 'react'
import { findTarget, isDialogOpen, revealVertically } from './dom'

export interface TargetBox {
  left: number
  top: number
  right: number
  bottom: number
}

function sameBox(a: TargetBox | null, b: TargetBox | null) {
  if (!a || !b) return a === b
  return Math.abs(a.left - b.left) < 0.5 && Math.abs(a.top - b.top) < 0.5 && Math.abs(a.right - b.right) < 0.5 && Math.abs(a.bottom - b.bottom) < 0.5
}

export function useTargetRect(targetId: string | undefined) {
  const [box, setBox] = useState<TargetBox | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    let frame = 0
    let last: TargetBox | null = null
    let lastDialog = false
    let scrolled = false
    const loop = () => {
      const element = targetId ? findTarget(targetId) : null
      const rect = element?.getBoundingClientRect()
      const next = rect ? { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom } : null
      if (!sameBox(next, last)) {
        last = next
        setBox(next)
      }
      if (element && !scrolled) {
        scrolled = true
        revealVertically(element)
      }
      const dialog = isDialogOpen()
      if (dialog !== lastDialog) {
        lastDialog = dialog
        setDialogOpen(dialog)
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [targetId])

  return { box, dialogOpen }
}
