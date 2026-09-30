import { Link } from 'react-router-dom'
import type { StandingRow } from '@/types/api'
import { TeamBadge } from '@/components/molecules/TeamBadge'

/** Tabla de posiciones (RF-12). Reutilizable en público y admin. */
export function StandingsTable({
  rows,
  topZone = 4,
}: {
  rows: StandingRow[]
  topZone?: number
}) {
  return (
    <>
      <div className="table-wrap">
        <table className="table tnum">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Equipo</th>
              <th className="num" title="Juegos jugados">JJ</th>
              <th className="num" title="Juegos ganados">JG</th>
              <th className="num" title="Juegos perdidos">JP</th>
              <th className="num" title="Puntos a favor">PF</th>
              <th className="num" title="Puntos en contra">PC</th>
              <th className="num" title="Diferencia">Dif</th>
              <th className="num">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.team.id} data-zone={r.position <= topZone ? 'top' : undefined}>
                <td>
                  <span className="pos">{r.position}</span>
                </td>
                <td>
                  <Link to={`/equipos/${r.team.id}`}>
                    <TeamBadge name={r.team.name} logoUrl={r.team.logo_url} />
                  </Link>
                </td>
                <td className="num">{r.played}</td>
                <td className="num">{r.won}</td>
                <td className="num">{r.lost}</td>
                <td className="num">{r.points_for}</td>
                <td className="num">{r.points_against}</td>
                <td className="num">{r.point_difference}</td>
                <td className="num pts">
                  {r.points}
                  {r.adjustment_points !== 0 && (
                    <sup
                      title={r.adjustment_reasons.join(', ')}
                      style={{ color: 'var(--warn)', marginLeft: 2, cursor: 'help' }}
                    >
                      {r.adjustment_points > 0 ? `+${r.adjustment_points}` : r.adjustment_points}*
                    </sup>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="table__note">
        Orden: puntos → diferencia → puntos a favor → menos puntos en contra.
        {rows.some((r) => r.adjustment_points !== 0) && ' * Incluye ajuste manual de puntos.'}
      </p>
    </>
  )
}
