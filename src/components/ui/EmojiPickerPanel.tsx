import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'

export default function EmojiPickerPanel({ onSelect }: { onSelect: (emoji: string) => void }) {
  return (
    <Picker
      data={data}
      onEmojiSelect={(emoji: { native: string }) => onSelect(emoji.native)}
      locale="pt"
      theme="light"
      previewPosition="none"
      skinTonePosition="search"
      perLine={8}
    />
  )
}
