export function findTarget(id: string): HTMLElement | null {
  const nodes = document.querySelectorAll<HTMLElement>(`[data-tour="${CSS.escape(id)}"]`)
  for (const node of nodes) {
    const rect = node.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) return node
  }
  return null
}

export function hasTarget(id: string) {
  return findTarget(id) !== null
}

function scrollableParent(element: HTMLElement) {
  let parent = element.parentElement
  while (parent) {
    const { overflowY } = getComputedStyle(parent)
    if ((overflowY === 'auto' || overflowY === 'scroll') && parent.scrollHeight > parent.clientHeight) return parent
    parent = parent.parentElement
  }
  return null
}

export function revealVertically(element: HTMLElement) {
  const container = scrollableParent(element)
  const rect = element.getBoundingClientRect()
  const view = container ? container.getBoundingClientRect() : { top: 0, bottom: window.innerHeight }
  const viewHeight = view.bottom - view.top
  if (rect.top >= view.top + 8 && rect.bottom <= view.bottom - 8) return
  const offset = rect.height > viewHeight * 0.7
    ? rect.top - view.top - 16
    : rect.top - view.top - (viewHeight - rect.height) / 2
  if (container) container.scrollBy({ top: offset, behavior: 'smooth' })
  else window.scrollBy({ top: offset, behavior: 'smooth' })
}

export function isDialogOpen() {
  return document.querySelector('.MuiDialog-root') !== null
}
