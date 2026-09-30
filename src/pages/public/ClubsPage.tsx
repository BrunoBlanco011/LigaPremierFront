import { Link } from 'react-router-dom'
import { useClubs } from '@/features/clubs/queries'
import { TeamBadge } from '@/components/molecules/TeamBadge'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/molecules/StateView'

/** Clubes de la liga (RF-17b). */
export function ClubsPage() {
  const clubs = useClubs()

  return (
    <div className="container page">
      <div className="page__head">
        <p className="eyebrow">La liga</p>
        <h1 className="page__title">Clubes</h1>
        <p className="page__sub">Los equipos permanentes de la liga y su historial.</p>
      </div>

      {clubs.isLoading ? (
        <LoadingState />
      ) : clubs.isError ? (
        <ErrorState error={clubs.error} onRetry={() => clubs.refetch()} />
      ) : !clubs.data || clubs.data.length === 0 ? (
        <EmptyState title="Sin clubes" message="Aún no hay clubes registrados." />
      ) : (
        <div className="grid grid--3">
          {clubs.data.map((c) => (
            <Link key={c.id} to={`/clubes/${c.id}`} className="card card--pad tcard">
              <TeamBadge name={c.name} logoUrl={c.logo_url} size={44} />
              {c.coach_name && (
                <span className="tcard__meta">Entrenador: {c.coach_name}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
