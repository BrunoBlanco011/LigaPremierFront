import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import type { PlayerTotals } from '@/types/api'
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
import { usePageTitle } from '@/lib/usePageTitle'

const CATEGORIES: LeaderSort[] = [
  'touchdowns',
  'td_passes',
  'interceptions',
  'sacks',
  'tackles',
  'games_attended',
]

const valueOf = (row: PlayerTotals, sort: LeaderSort) => row[sort]

export function StatsTab() {
  const { tournamentId, tournamentName } = useOutletContext<TournamentContext>()
  usePageTitle(`Estadísticas · ${tournamentName}`)
  const [sort, setSort] = useState<LeaderSort>('touchdowns')
  const leaders = useLeaders(tournamentId, sort)

  return (
    <>
      <div className="seg" role="tablist" aria-label="Categoría de líderes">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={sort === c}
            className={`seg__btn${sort === c ? ' is-active' : ''}`}
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
        <div className="leaders tnum">
          {leaders.data.map((row, i) => (
            <div className="leader-row" key={row.player_id}>
              <span className="leader-row__pos" aria-hidden="true">{i + 1}</span>
              <TeamBadge name={row.team_name} logoUrl={null} showName={false} size={32} />
              <div className="leader-row__who">
                <Link to={`/jugadores/${row.player_id}`} className="leader-row__name">
                  {row.jersey_number != null && <span className="leader-row__num">#{row.jersey_number}</span>}
                  {row.full_name}
                </Link>
                <span className="leader-row__team">{row.team_name}</span>
              </div>
              <span className="marc leader-row__val">{valueOf(row, sort)}</span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
