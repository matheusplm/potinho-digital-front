import { AdminShell } from './AdminShell'
import { UsersBrowser } from './UsersBrowser'

export function AdminUsersPage() {
  return (
    <AdminShell title="Usuários" subtitle="Todo mundo que já criou conta">
      {(data) => <UsersBrowser users={data.users} />}
    </AdminShell>
  )
}
