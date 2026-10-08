import type { ReactNode } from 'react'

/** Franja de cancha: fondo verde con líneas de yarda (firma visual "día de juego").
 *  Encabezados de Inicio, torneo, Login y Unirse. */
export function FieldBand({
  children,
  yardas = false,
  className = '',
}: {
  children: ReactNode
  /** Muestra los números de yarda decorativos (aria-hidden). */
  yardas?: boolean
  className?: string
}) {
  return (
    <section className={`cancha relative overflow-hidden ${className}`.trim()}>
      {yardas && (
        <div className="yardas" aria-hidden="true">
          <span>10</span>
          <span>20</span>
          <span>30</span>
          <span>40</span>
        </div>
      )}
      {children}
    </section>
  )
}
