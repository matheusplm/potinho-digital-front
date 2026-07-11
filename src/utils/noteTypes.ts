export function noteTypeIdList(note: { typeId: string; typeIds?: string[] }): string[] {
  return note.typeIds?.length ? note.typeIds : [note.typeId]
}
