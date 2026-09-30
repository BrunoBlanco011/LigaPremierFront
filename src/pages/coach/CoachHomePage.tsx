import { Link } from 'react-router-dom'
import { useMyTeams } from '@/features/coach/queries'
import { TeamBadge } from '@/components/molecules/TeamBadge'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/molecules/StateView'

export function CoachHomePage() {
  const teams = useMyTeams()

  return (
    <>
      <p className="eyebrow">Panel de coach</p>
      <h1 className="page__title" style={{ fontSize: 30, marginBottom: 24 }}>
        Mis equipos
      </h1>

      {teams.isLoading ? (
        <LoadingState />
      ) : teams.isError ? (
        <ErrorState error={teams.error} onRetry={() => teams.refetch()} />
      ) : !teams.data || teams.data.length === 0 ? (
        <EmptyState
          title="Aún no tienes equipo asignado"
          message="Contacta al administrador para que te asigne a un equipo."
        />
      ) : (
        <div className="grid grid--3">
          {teams.data.map((team) => (
            <Link
              key={team.id}
              to={`/coach/equipos/${team.id}`}
              className="card card--pad tcard"
            >
              <TeamBadge name={team.name} logoUrl={team.logo_url} size={44} />
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
