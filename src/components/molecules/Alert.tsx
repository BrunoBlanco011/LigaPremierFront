import type { ReactNode } from 'react'

type Tone = 'info' | 'success' | 'warning' | 'danger'

/** Aviso en línea (sesión expirada, conflicto 409, error de login, etc.). */
export function Alert({
  tone = 'info',
  title,
  children,
  actions,
}: {
  tone?: Tone
  title?: string
  children?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className={`alert alert--${tone}`} role={tone === 'danger' ? 'alert' : 'status'}>
      {title && <p className="alert__title">{title}</p>}
      {children && <p>{children}</p>}
      {actions && <div className="alert__actions">{actions}</div>}
    </div>
  )
}
