import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { User } from '@/types/api'
import { useUsers } from '@/features/users/queries'
import { useDeleteUser } from '@/features/users/mutations'
import { useAuth } from '@/auth/useAuth'
import { UserForm } from '@/components/organisms/UserForm'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/molecules/StateView'
import { useConfirm } from '@/components/molecules/ConfirmDialog'
import { alertOnError } from '@/lib/mutationHelpers'
import { usePageTitle } from '@/lib/usePageTitle'

export function AdminUsersPage() {
  usePageTitle('Usuarios · Admin')
  const users = useUsers()
  const del = useDeleteUser()
  const { user: me } = useAuth()
  const confirm = useConfirm()
  const [open, setOpen] = useState(false)

  const remove = async (u: User) => {
    if (u.id === me?.id) return
    const ok = await confirm({
      title: `¿Eliminar a ${u.full_name ?? u.email}?`,
      body: 'Perderá el acceso al panel. Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar usuario',
      danger: true,
    })
    if (ok) del.mutate(u.id, { onError: alertOnError })
  }

  return (
    <>
      <div className="dash__topbar">
        <div>
          <p className="eyebrow">Administración</p>
          <h1 className="page__title" style={{ fontSize: 30 }}>Usuarios</h1>
        </div>
        <Button variant="flag" onClick={() => setOpen(true)}>
          <Plus size={16} /> Nuevo usuario
        </Button>
      </div>

      {users.isLoading ? (
        <LoadingState />
      ) : users.isError ? (
        <ErrorState error={users.error} onRetry={() => users.refetch()} />
      ) : !users.data || users.data.length === 0 ? (
        <EmptyState title="Sin usuarios" message="Crea coaches y administradores." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {users.data.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.full_name ?? '—'}</td>
                  <td>{u.email}</td>
                  <td>
                    <Badge tone={u.role === 'admin' ? 'brand' : 'muted'}>
                      {u.role === 'admin' ? 'Administrador' : 'Coach'}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => remove(u)}
                        disabled={del.isPending || u.id === me?.id}
                        aria-label={`Eliminar ${u.email}`}
                      >
                        <Trash2 size={14} color="var(--loss)" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && <UserForm onClose={() => setOpen(false)} />}
    </>
  )
}
