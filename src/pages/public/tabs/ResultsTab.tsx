import { useOutletContext } from 'react-router-dom'
import { useMemo } from 'react'
import type { TournamentContext } from '../TournamentPage'
import { useMatches } from '@/features/schedule/queries'
import { MatchCard } from '@/components/organisms/MatchCard'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/molecules/StateView'

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

  if (matches.isLoading) return <LoadingState />
  if (matches.isError)
    return <ErrorState error={matches.error} onRetry={() => matches.refetch()} />
  if (finished.length === 0)
    return (
      <EmptyState
        title="Sin resultados todavía"
        message="Aquí verás los marcadores conforme se jueguen los partidos."
      />
    )

  return (
    <div className="grid grid--2">
      {finished.map((m) => (
        <MatchCard
          key={m.id}
          match={m}
          home={teamsById.get(m.home_team_id)}
          away={teamsById.get(m.away_team_id)}
          linkTo={`/torneos/${tournamentId}/partidos/${m.id}`}
        />
      ))}
    </div>
  )
}
