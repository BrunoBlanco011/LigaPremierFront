import { useOutletContext } from 'react-router-dom'
import type { TournamentContext } from '../TournamentPage'
import { useStandings } from '@/features/standings/queries'
import { StandingsTable } from '@/components/organisms/StandingsTable'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/molecules/StateView'

export function StandingsTab() {
  const { tournamentId } = useOutletContext<TournamentContext>()
  const standings = useStandings(tournamentId)

  if (standings.isLoading) return <LoadingState />
  if (standings.isError)
    return <ErrorState error={standings.error} onRetry={() => standings.refetch()} />
  if (!standings.data || standings.data.length === 0)
    return (
      <EmptyState
        title="Aún no hay tabla"
        message="La tabla aparecerá cuando se jueguen los primeros partidos."
      />
    )

  return <StandingsTable rows={standings.data} />
}
