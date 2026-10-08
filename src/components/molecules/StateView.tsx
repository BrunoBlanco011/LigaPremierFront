import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { FootballSpinner } from '@/components/atoms/FootballSpinner'
import { ApiError, friendlyMessage } from '@/lib/errors'

/** Estado de carga para secciones sin forma predecible: el balón (xl) con
 *  "Cargando…" debajo. Aparece solo si la carga pasa de 300ms, para no
 *  parpadear. Para tablas y listas, usa un skeleton (ver molecules/Skeletons). */
export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 300)
    return () => clearTimeout(t)
  }, [])
  if (!shown) return <div className="state" aria-busy="true" />
  return (
    <div className="state" aria-busy="true">
      <FootballSpinner size="xl" label="" />
      <span>{label}</span>
    </div>
  )
}

/** Estado vacío: caja punteada con título, una línea y acción opcional. */
export function EmptyState({
  title,
  message,
  action,
}: {
  title: string
  message?: string
  action?: ReactNode
}) {
  return (
    <div className="empty2">
      <p className="empty2__title">{title}</p>
      {message && <p className="empty2__msg">{message}</p>}
      {action}
    </div>
  )
}

/** Estado de error: alerta con fondo claro y botón Reintentar.
 *  Un 404 se muestra como "no encontrado" con enlace a Inicio. */
export function ErrorState({
  error,
  onRetry,
  resource = 'la información',
}: {
  error: unknown
  onRetry?: () => void
  /** Qué no se pudo cargar: "la tabla", "el rol de juegos"… */
  resource?: string
}) {
  if (error instanceof ApiError && error.status === 404) {
    return <NotFoundState />
  }
  return (
    <div className="errbox" role="alert">
      <div>
        <p className="errbox__msg">No pudimos cargar {resource}.</p>
        <p className="errbox__hint">{friendlyMessage(error)}</p>
      </div>
      {onRetry && (
        <button className="btn btn--secondary" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  )
}

/** No encontrado (404): título + enlace a Inicio. */
export function NotFoundState({
  title = 'No encontramos esta página',
  to = '/',
  linkLabel = 'Ir a Inicio',
}: {
  title?: string
  to?: string
  linkLabel?: string
}) {
  return (
    <div className="notfound">
      <h3 className="notfound__title">{title}</h3>
      <Link to={to} style={{ fontWeight: 600, color: 'var(--color-premier)' }}>
        {linkLabel}
      </Link>
    </div>
  )
}
