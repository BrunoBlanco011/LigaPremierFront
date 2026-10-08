import { useOutletContext } from 'react-router-dom'
import { useMemo, type CSSProperties } from 'react'
import type { TournamentContext } from '../TournamentPage'
import { useMatches } from '@/features/schedule/queries'
import { MatchCard } from '@/components/organisms/MatchCard'
import { EmptyState, ErrorState } from '@/components/molecules/StateView'
import { MatchesSkeleton } from '@/components/molecules/Skeletons'

export function ResultsTab() {
  const { tournamentId, teamsById } = useOutletContext<TournamentContext>()
  const matches = useMatches(tournamentId)

  const finished = useMemo(
    () =>
      (matches.data ?? [])
        .filter((m) => m.status === 'finished' || m.status === 'forfeit')
        .sort((a, b) =>
          (b.scheduled_at ?? '').localeCompare(a.scheduled_at ?? ''),
        ),
    [matches.data],
  )

  if (matches.isLoading) return <MatchesSkeleton count={6} />
  if (matches.isError)
    return <ErrorState error={matches.error} onRetry={() => matches.refetch()} resource="los resultados" />
  if (finished.length === 0)
    return (
      <EmptyState
        title="Aún no hay resultados"
        message="Aquí verás los partidos finalizados."
      />
    )

  return (
    <div className="match-grid">
      {finished.map((m, i) => (
        <div
          key={m.id}
          className="enter-up"
          style={{ '--enter-delay': `${Math.min(i, 5) * 0.04}s` } as CSSProperties}
        >
          <MatchCard
            match={m}
            home={teamsById.get(m.home_team_id)}
            away={teamsById.get(m.away_team_id)}
            linkTo={`/torneos/${tournamentId}/partidos/${m.id}`}
          />
        </div>
      ))}
    </div>
  )
}
