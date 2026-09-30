import type { ReactNode } from 'react'
import { AlertCircle, Inbox } from 'lucide-react'
import { Spinner } from '@/components/atoms/Spinner'
import { friendlyMessage } from '@/lib/errors'

/** Estado de carga. */
export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="state">
      <Spinner />
      <span>{label}</span>
    </div>
  )
}

/** Estado vacío: invita a actuar. */
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
    <div className="state">
      <Inbox className="state__icon" size={32} />
      <p className="state__title">{title}</p>
      {message && <p>{message}</p>}
      {action}
    </div>
  )
}

/** Estado de error: explica y ofrece reintentar. */
export function ErrorState({
  error,
  onRetry,
}: {
  error: unknown
  onRetry?: () => void
}) {
  return (
    <div className="state">
      <AlertCircle className="state__icon" size={32} color="var(--loss)" />
      <p className="state__title">No pudimos cargar la información</p>
      <p>{friendlyMessage(error)}</p>
      {onRetry && (
        <button className="btn btn--outline btn--sm" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  )
}
