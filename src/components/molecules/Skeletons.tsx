import type { ReactNode } from 'react'
import { Skeleton } from '@/components/atoms/Skeleton'

/** Envoltura accesible: marca la región como ocupada y anuncia "Cargando…". */
function Busy({ children }: { children: ReactNode }) {
  return (
    <div aria-busy="true">
      <span className="sr-only">Cargando…</span>
      {children}
    </div>
  )
}

/** Skeleton con la forma de la tabla de posiciones. */
export function StandingsSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <Busy>
      <div className="sk-table">
        <div className="sk-table__head" />
        {Array.from({ length: rows }).map((_, i) => (
          <div className="sk-table__row" key={i}>
            <Skeleton width={26} height={26} circle />
            <Skeleton width={150} height={14} />
            <span style={{ flex: 1 }} />
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} width={22} height={14} />
            ))}
            <Skeleton width={28} height={18} />
          </div>
        ))}
      </div>
    </Busy>
  )
}

/** Skeleton de una rejilla de tarjetas (torneos, clubes). */
export function CardsSkeleton({
  count = 3,
  className = 'grid grid--3',
  lines = 3,
}: {
  count?: number
  className?: string
  lines?: number
}) {
  return (
    <Busy>
      <div className={className}>
        {Array.from({ length: count }).map((_, i) => (
          <div className="sk-card" key={i}>
            <Skeleton width="60%" height={16} />
            {Array.from({ length: lines }).map((_, j) => (
              <Skeleton key={j} width={j === lines - 1 ? '40%' : '80%'} height={12} />
            ))}
          </div>
        ))}
      </div>
    </Busy>
  )
}

/** Skeleton de una rejilla de tarjetas de partido. */
export function MatchesSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Busy>
      <div className="match-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div className="sk-card" key={i} style={{ gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Skeleton width={90} height={12} />
              <Skeleton width={64} height={16} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Skeleton width={28} height={28} circle />
              <Skeleton width="55%" height={14} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Skeleton width={28} height={28} circle />
              <Skeleton width="45%" height={14} />
            </div>
          </div>
        ))}
      </div>
    </Busy>
  )
}

/** Skeleton de la rejilla de clubes (escudo + nombre). */
export function ChipsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Busy>
      <div className="clubs-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div className="club-chip" key={i}>
            <Skeleton width={56} height={56} circle />
            <Skeleton width="70%" height={12} />
          </div>
        ))}
      </div>
    </Busy>
  )
}
