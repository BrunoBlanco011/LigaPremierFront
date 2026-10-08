import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { UserRole } from '@/types/api'
import { useAuth } from './useAuth'
import { FootballSpinner } from '@/components/atoms/FootballSpinner'

/** Guard por rol: bloquea /admin/* y /coach/* (RF §1.1). */
export function ProtectedRoute({ role }: { role: UserRole }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          gap: 12,
          minHeight: '60vh',
          color: 'var(--color-texto-2)',
        }}
      >
        <FootballSpinner size="xl" label="" />
        <span style={{ fontSize: 14 }}>Cargando…</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user.role !== role) {
    // Con sesión pero rol equivocado: mandarlo a su panel.
    return <Navigate to={user.role === 'admin' ? '/admin' : '/coach'} replace />
  }

  return <Outlet />
}
