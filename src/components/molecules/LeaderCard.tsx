import type { StandingRow } from '@/types/api'
import { TeamBadge } from '@/components/molecules/TeamBadge'

const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0')

/** Tarjeta del líder de la tabla (vista móvil de posiciones). */
export function LeaderCard({ row }: { row: StandingRow }) {
  return (
    <div
      className="ital-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        background: 'var(--color-dorado-claro)',
        border: '2px solid var(--color-dorado)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <span
        className="ital"
        aria-hidden="true"
        style={{ fontSize: 44, lineHeight: 1, color: 'var(--color-dorado-texto)' }}
      >
        {row.position}
      </span>
      <TeamBadge name={row.team.name} logoUrl={row.team.logo_url} showName={false} size={40} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <span
          className="ital"
          style={{ fontSize: 24, lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {row.team.name}
        </span>
        <span className="tnum" style={{ fontSize: 13, color: 'var(--color-texto-2)' }}>
          Líder · {row.won}–{row.lost} · {signed(row.point_difference)}
        </span>
      </div>
      <span className="marc" style={{ fontSize: 30 }}>{row.points}</span>
    </div>
  )
}
