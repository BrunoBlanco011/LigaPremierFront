import { Link } from 'react-router-dom'
import type { StandingRow } from '@/types/api'
import { TeamBadge } from '@/components/molecules/TeamBadge'

const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0')

/** Tabla de posiciones v2 (RF-12): cabecera noche, columna PTS en premier,
 *  fila del líder en dorado. Con `tournamentId`, cada equipo enlaza a su perfil. */
export function StandingsTable({
  rows,
  tournamentId,
}: {
  rows: StandingRow[]
  tournamentId?: string
}) {
  const teamHref = (teamId: string) =>
    tournamentId ? `/torneos/${tournamentId}/equipos/${teamId}` : undefined

  return (
    <>
      <div className="stable-wrap">
        <div className="stable" role="table" aria-label="Tabla de posiciones">
          <div className="stable__head" role="row">
            <span className="st-pos" role="columnheader">POS.</span>
            <span className="st-team" role="columnheader">EQUIPO</span>
            <span role="columnheader" title="Juegos jugados">JJ</span>
            <span role="columnheader" title="Juegos ganados">JG</span>
            <span role="columnheader" title="Juegos perdidos">JP</span>
            <span role="columnheader" title="Puntos a favor">PF</span>
            <span role="columnheader" title="Puntos en contra">PC</span>
            <span role="columnheader" title="Diferencia">DIF.</span>
            <span className="st-pts" role="columnheader">PTS</span>
          </div>
          {rows.map((r) => {
            const href = teamHref(r.team.id)
            return (
              <div
                className={`stable__row${r.position === 1 ? ' is-leader' : ''}`}
                role="row"
                key={r.team.id}
              >
                <span
                  className="ital st-pos"
                  role="cell"
                  style={{ color: r.position <= 3 ? 'var(--color-premier)' : 'var(--color-texto-2)' }}
                >
                  {r.position}
                </span>
                <span className="st-team" role="cell">
                  {href ? (
                    <Link to={href} style={{ color: 'inherit', textDecoration: 'none' }}>
                      <TeamBadge name={r.team.name} logoUrl={r.team.logo_url} size={24} />
                    </Link>
                  ) : (
                    <TeamBadge name={r.team.name} logoUrl={r.team.logo_url} size={24} />
                  )}
                </span>
                <span className="st-num" role="cell">{r.played}</span>
                <span className="st-num" role="cell">{r.won}</span>
                <span className="st-num" role="cell">{r.lost}</span>
                <span className="st-num" role="cell">{r.points_for}</span>
                <span className="st-num" role="cell">{r.points_against}</span>
                <span
                  className="st-num"
                  role="cell"
                  style={{
                    fontWeight: 600,
                    color:
                      r.point_difference > 0
                        ? 'var(--color-premier)'
                        : r.point_difference < 0
                          ? 'var(--color-error)'
                          : 'var(--color-texto-2)',
                  }}
                >
                  {signed(r.point_difference)}
                </span>
                <span className="marc st-pts" role="cell">
                  {r.points}
                  {r.adjustment_points !== 0 && (
                    <sup
                      title={r.adjustment_reasons.join(', ')}
                      style={{ color: 'var(--color-advertencia)', fontSize: 12, cursor: 'help' }}
                    >
                      *
                    </sup>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </div>
      <p className="table__note" style={{ marginTop: 12, fontSize: 14, color: 'var(--color-texto-2)' }}>
        Desempate: puntos, diferencia de puntos, puntos a favor y menos puntos en contra.
        {rows.some((r) => r.adjustment_points !== 0) && ' * Incluye ajuste manual de puntos.'}
      </p>
    </>
  )
}
