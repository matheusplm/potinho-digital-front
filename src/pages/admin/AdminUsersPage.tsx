import { AdminShell } from './AdminShell'
import { UsersPanel } from './UsersPanel'

export function AdminUsersPage() {
  return (
    <AdminShell title="Usuários">
      {(data) => <UsersPanel users={data.users} />}
    </AdminShell>
  )
}
