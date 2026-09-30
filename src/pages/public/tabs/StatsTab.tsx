import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import type { TournamentContext } from '../TournamentPage'
import {
  LEADER_LABELS,
  useLeaders,
  type LeaderSort,
} from '@/features/stats/queries'
import { TeamBadge } from '@/components/molecules/TeamBadge'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/molecules/StateView'

const CATEGORIES: LeaderSort[] = [
  'touchdowns',
  'td_passes',
  'interceptions',
  'sacks',
  'tackles',
  'games_attended',
]

const valueOf = (
  row: { touchdowns: number; td_passes: number; interceptions: number; sacks: number; tackles: number; games_attended: number },
  sort: LeaderSort,
) => row[sort]

export function StatsTab() {
  const { tournamentId } = useOutletContext<TournamentContext>()
  const [sort, setSort] = useState<LeaderSort>('touchdowns')
  const leaders = useLeaders(tournamentId, sort)

  return (
    <>
      <div className="tabs" style={{ marginBottom: 20 }}>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`tab${sort === c ? ' is-active' : ''}`}
            onClick={() => setSort(c)}
          >
            {LEADER_LABELS[c]}
          </button>
        ))}
      </div>

      {leaders.isLoading ? (
        <LoadingState />
      ) : leaders.isError ? (
        <ErrorState error={leaders.error} onRetry={() => leaders.refetch()} />
      ) : !leaders.data || leaders.data.length === 0 ? (
        <EmptyState title="Sin estadísticas" message="Aún no hay datos para esta categoría." />
      ) : (
        <div className="table-wrap">
          <table className="table tnum">
            <thead>
              <tr>
                <th>#</th>
                <th>Jugador</th>
                <th>Equipo</th>
                <th className="num">{LEADER_LABELS[sort]}</th>
              </tr>
            </thead>
            <tbody>
              {leaders.data.map((row, i) => (
                <tr key={row.player.id}>
                  <td>
                    <span className="pos">{i + 1}</span>
                  </td>
                  <td>
                    <Link to={`/jugadores/${row.player.id}`}>
                      {row.player.jersey_number != null && (
                        <b style={{ color: 'var(--ink-faint)', marginRight: 8 }}>
                          #{row.player.jersey_number}
                        </b>
                      )}
                      {row.player.full_name}
                    </Link>
                  </td>
                  <td>
                    <TeamBadge name={row.team.name} logoUrl={row.team.logo_url} />
                  </td>
                  <td className="num pts">{valueOf(row, sort)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
