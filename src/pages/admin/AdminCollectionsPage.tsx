import { AdminShell } from './AdminShell'
import { CollectionsBrowser } from './CollectionsBrowser'

export function AdminCollectionsPage() {
  return (
    <AdminShell title="Coleções" subtitle="Todas as coleções criadas no Potinho">
      {(data) => <CollectionsBrowser collections={data.collections} />}
    </AdminShell>
  )
}
