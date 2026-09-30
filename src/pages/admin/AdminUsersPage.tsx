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
import { friendlyMessage } from '@/lib/errors'

export function AdminUsersPage() {
  const users = useUsers()
  const del = useDeleteUser()
  const { user: me } = useAuth()
  const [open, setOpen] = useState(false)

  const remove = (u: User) => {
    if (u.id === me?.id) {
      window.alert('No puedes eliminar tu propia cuenta.')
      return
    }
    if (window.confirm(`¿Eliminar a ${u.full_name ?? u.email}?`)) {
      del.mutate(u.id, { onError: (e) => window.alert(friendlyMessage(e)) })
    }
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
