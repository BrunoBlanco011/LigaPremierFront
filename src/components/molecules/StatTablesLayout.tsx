import { useState, type ReactNode } from 'react'

/** Dos tablas de equipo: lado a lado solo cuando el contenedor mide ≥1100px
 *  (container query, no viewport). Más angosto → pestañas Local/Visitante, así
 *  nunca se recortan columnas sin aviso (MEJORAS §5). */
export function StatTablesLayout({
  homeLabel,
  awayLabel,
  home,
  away,
}: {
  homeLabel: string
  awayLabel: string
  home: ReactNode
  away: ReactNode
}) {
  const [side, setSide] = useState<'home' | 'away'>('home')
  return (
    <div className="stat-pair">
      <div className="stat-pair__inner">
        <div className="stat-pair__tabs" role="tablist" aria-label="Equipo">
          <button
            type="button"
            role="tab"
            aria-selected={side === 'home'}
            className={`stat-pair__tab${side === 'home' ? ' is-active' : ''}`}
            onClick={() => setSide('home')}
          >
            {homeLabel}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={side === 'away'}
            className={`stat-pair__tab${side === 'away' ? ' is-active' : ''}`}
            onClick={() => setSide('away')}
          >
            {awayLabel}
          </button>
        </div>
        <div className={`stat-pair__col${side === 'home' ? ' is-shown' : ''}`}>{home}</div>
        <div className={`stat-pair__col${side === 'away' ? ' is-shown' : ''}`}>{away}</div>
      </div>
    </div>
  )
}
