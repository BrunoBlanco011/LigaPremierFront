import { useOutletContext } from 'react-router-dom'
import type { TournamentContext } from '../TournamentPage'
import { useStandings } from '@/features/standings/queries'
import { StandingsTable } from '@/components/organisms/StandingsTable'
import { StandingsPodium } from '@/components/organisms/StandingsPodium'
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

  return (
    <>
      <StandingsPodium rows={standings.data} />
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 8,
          }}
        >
          <h2 className="ital" style={{ margin: 0, fontSize: 32, lineHeight: 1 }}>
            Tabla de posiciones
          </h2>
          <span style={{ fontSize: 14, color: 'var(--color-texto-2)' }}>
            Victoria 2 pts · Derrota 0 pts · Sin empates
          </span>
        </div>
        <StandingsTable rows={standings.data} tournamentId={tournamentId} />
      </section>
    </>
  )
}
