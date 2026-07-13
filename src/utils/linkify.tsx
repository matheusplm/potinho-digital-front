import { Box } from '@mui/material'

const URL_REGEX = /https?:\/\/[^\s<>"']+/g
const TRAILING_PUNCT = /[.,!?;:'")\]]+$/

export function linkifyText(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  const regex = new RegExp(URL_REGEX)
  let match: RegExpExecArray | null
  while ((match = regex.exec(text))) {
    const url = match[0].replace(TRAILING_PUNCT, '')
    if (!url) continue
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index))
    nodes.push(
      <Box
        key={match.index}
        component="a"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        sx={{ color: 'inherit', textDecoration: 'underline', fontWeight: 700, wordBreak: 'break-all' }}
      >
        {url}
      </Box>,
    )
    lastIndex = match.index + url.length
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes.length ? nodes : [text]
}
