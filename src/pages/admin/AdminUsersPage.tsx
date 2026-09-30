import { Placeholder } from '@/components/molecules/Placeholder'

export function AdminUsersPage() {
  return (
    <>
      <p className="eyebrow">Administración</p>
      <h1 className="page__title" style={{ fontSize: 30, marginBottom: 24 }}>
        Usuarios
      </h1>
      <Placeholder title="Gestión de usuarios y roles" rf="RF-32" />
    </>
  )
}
