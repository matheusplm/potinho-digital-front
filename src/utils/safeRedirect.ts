const INTERNAL_PATH = /^\/(?![/\\])[^\s\\]*$/

export function safeRedirect(path: string | null | undefined, fallback = '/home'): string {
  return path && INTERNAL_PATH.test(path) ? path : fallback
}
