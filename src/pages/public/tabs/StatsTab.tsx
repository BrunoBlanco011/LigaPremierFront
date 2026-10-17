import { useMemo } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import type { PlayerTotals } from '@/types/api'
import type { TournamentContext } from '../TournamentPage'
import {
  LEADER_LABELS,
  useTournamentPlayerStats,
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

const TOP = 5

/** Los 5 mejores de una categoría; quien va en cero no cuenta como líder. */
function topFive(rows: PlayerTotals[], sort: LeaderSort) {
  return rows
    .filter((r) => r[sort] > 0)
    .sort((a, b) => b[sort] - a[sort] || a.full_name.localeCompare(b.full_name))
    .slice(0, TOP)
}

export function StatsTab() {
  const { tournamentId, tournamentName } = useOutletContext<TournamentContext>()
  usePageTitle(`MVP · ${tournamentName}`)
  const stats = useTournamentPlayerStats(tournamentId)
  const leaders = useMemo(
    () => CATEGORIES.map((c) => ({ category: c, rows: topFive(stats.data ?? [], c) })),
    [stats.data],
  )

  if (stats.isLoading) return <LoadingState />
  if (stats.isError) return <ErrorState error={stats.error} onRetry={() => stats.refetch()} />
  if (leaders.every((l) => l.rows.length === 0))
    return <EmptyState title="Sin estadísticas" message="Aún no hay datos en este torneo." />

  return (
    <div className="leaders-grid">
      {leaders.map(({ category, rows }) => (
        <section key={category} aria-labelledby={`mvp-${category}`}>
          <h2 id={`mvp-${category}`} className="leaders__title">{LEADER_LABELS[category]}</h2>
          {rows.length === 0 ? (
            <EmptyState title="Sin datos" />
          ) : (
            <div className="leaders tnum">
              {rows.map((row, i) => (
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
                  <span className="marc leader-row__val">{row[category]}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
