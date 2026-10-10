import { Link } from 'react-router-dom'
import { useMyClubs } from '@/features/coach/queries'
import { TeamBadge } from '@/components/molecules/TeamBadge'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/molecules/StateView'
import { usePageTitle } from '@/lib/usePageTitle'

/** RF-40: mis clubes. */
export function CoachHomePage() {
  usePageTitle('Mis clubes')
  const clubs = useMyClubs()

  return (
    <>
      <p className="eyebrow">Panel de coach</p>
      <h1 className="page__title" style={{ fontSize: 30, marginBottom: 24 }}>
        Mis clubes
      </h1>

      {clubs.isLoading ? (
        <LoadingState />
      ) : clubs.isError ? (
        <ErrorState error={clubs.error} onRetry={() => clubs.refetch()} />
      ) : !clubs.data || clubs.data.length === 0 ? (
        <EmptyState
          title="Aún no tienes club asignado"
          message="Contacta al administrador para que te asigne a un club."
        />
      ) : (
        <div className="grid grid--3">
          {clubs.data.map((club) => (
            <Link
              key={club.id}
              to={`/coach/clubes/${club.id}`}
              className="card card--pad tcard"
            >
              <TeamBadge name={club.name} logoUrl={club.logo_url} size={44} />
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
