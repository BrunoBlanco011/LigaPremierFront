import type { ReactNode } from 'react'

/** Aviso breve de confirmación (p. ej. "Jugador agregado"). */
export function Toast({ children }: { children: ReactNode }) {
  return (
    <div className="toast" role="status">
      {children}
    </div>
  )
}
