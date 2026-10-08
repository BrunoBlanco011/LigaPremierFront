import { Link, useOutletContext } from 'react-router-dom'
import type { TournamentContext } from '../TournamentPage'
import { useTournamentTeams } from '@/features/teams/queries'
import { TeamBadge } from '@/components/molecules/TeamBadge'
import { EmptyState, ErrorState } from '@/components/molecules/StateView'
import { CardsSkeleton } from '@/components/molecules/Skeletons'

export function TeamsTab() {
  const { tournamentId } = useOutletContext<TournamentContext>()
  const teams = useTournamentTeams(tournamentId)

  if (teams.isLoading) return <CardsSkeleton count={6} />
  if (teams.isError)
    return <ErrorState error={teams.error} onRetry={() => teams.refetch()} resource="los equipos" />
  if (!teams.data || teams.data.length === 0)
    return (
      <EmptyState
        title="Aún no hay equipos inscritos"
        message="Los equipos del torneo aparecerán aquí."
      />
    )

  return (
    <div className="grid grid--3">
      {teams.data.map((team) => (
        <Link
          key={team.id}
          to={`/torneos/${tournamentId}/equipos/${team.id}`}
          className="card card--pad tcard"
        >
          <TeamBadge name={team.name} logoUrl={team.logo_url} size={44} />
          {team.coach_name && (
            <span className="tcard__meta">Entrenador: {team.coach_name}</span>
          )}
        </Link>
      ))}
    </div>
  )
}
