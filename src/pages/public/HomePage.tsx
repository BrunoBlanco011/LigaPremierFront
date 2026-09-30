import { Trophy } from 'lucide-react'
import { useTournaments } from '@/features/tournaments/queries'
import { TournamentCard } from '@/components/organisms/TournamentCard'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/molecules/StateView'

export function HomePage() {
  const active = useTournaments('active')
  const all = useTournaments()

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container hero__inner">
          <p className="eyebrow">Liga de flag football</p>
          <h1 className="hero__title">
            Todo el torneo,<br />
            en <em>una jugada</em>.
          </h1>
          <p className="hero__lead">
            Tabla de posiciones, rol de juegos, resultados y líderes de
            estadísticas de la liga, siempre al día.
          </p>
        </div>
      </section>

      <div className="container page">
        <div className="page__head">
          <p className="eyebrow">En curso</p>
          <h2 className="page__title">Torneos activos</h2>
        </div>

        {active.isLoading ? (
          <LoadingState />
        ) : active.isError ? (
          <ErrorState error={active.error} onRetry={() => active.refetch()} />
        ) : active.data && active.data.length > 0 ? (
          <div className="grid grid--3">
            {active.data.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No hay torneos activos"
            message="Cuando la liga abra un torneo, aparecerá aquí."
          />
        )}

        {/* Todos los torneos */}
        {all.data && all.data.length > 0 && (
          <>
            <div className="section-head">
              <h2>
                <Trophy
                  size={20}
                  style={{ display: 'inline', verticalAlign: '-3px', marginRight: 8 }}
                />
                Todos los torneos
              </h2>
            </div>
            <div className="grid grid--3">
              {all.data.map((t) => (
                <TournamentCard key={t.id} tournament={t} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
