import { AdminShell } from './AdminShell'
import { CollectionsPanel } from './CollectionsPanel'

export function AdminCollectionsPage() {
  return (
    <AdminShell title="Coleções">
      {(data) => <CollectionsPanel collections={data.collections} />}
    </AdminShell>
  )
}
