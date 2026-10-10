import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { subscribeToasts, dismissToast, type ToastItem, type ToastTone } from '@/lib/toast'

const ICON: Record<ToastTone, typeof Info> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

/** Pila de notificaciones (abajo-derecha en desktop, arriba en móvil). */
export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([])
  useEffect(() => subscribeToasts(setItems), [])

  if (items.length === 0) return null

  return (
    <div className="toaster" role="region" aria-label="Notificaciones">
      {items.map((t) => {
        const Icon = ICON[t.tone]
        return (
          <div
            key={t.id}
            className={`toast toast--${t.tone}`}
            role={t.tone === 'error' ? 'alert' : 'status'}
          >
            <Icon size={18} className="toast__icon" aria-hidden="true" />
            <span className="toast__msg">{t.message}</span>
            <button
              type="button"
              className="toast__close"
              aria-label="Cerrar notificación"
              onClick={() => dismissToast(t.id)}
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
