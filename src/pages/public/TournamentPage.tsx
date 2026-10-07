import { Outlet, useLocation, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import type { Team } from '@/types/api'
import { useTournament } from '@/features/tournaments/queries'
import { useTournamentTeams } from '@/features/teams/queries'
import { TabNav } from '@/components/organisms/TabNav'
import type { TabItem } from '@/components/organisms/TabNav'
import { TournamentStatusPill } from '@/components/molecules/StatusPill'
import { ErrorState, LoadingState } from '@/components/molecules/StateView'

export interface TournamentContext {
  tournamentId: string
  teamsById: Map<string, Team>
}

export function TournamentPage() {
  const { id = '' } = useParams()
  const { pathname } = useLocation()
  const tournament = useTournament(id)
  const teams = useTournamentTeams(id)

  const teamsById = useMemo(
    () => new Map((teams.data ?? []).map((t) => [t.id, t])),
    [teams.data],
  )

  const base = `/torneos/${id}`
  const tabs: TabItem[] = [
    { to: base, label: 'Tabla', end: true },
    { to: `${base}/rol`, label: 'Rol de juegos' },
    { to: `${base}/resultados`, label: 'Resultados' },
    { to: `${base}/equipos`, label: 'Equipos' },
    { to: `${base}/estadisticas`, label: 'Estadísticas' },
  ]

  if (tournament.isLoading) {
    return (
      <div className="container page">
        <LoadingState />
      </div>
    )
  }
  if (tournament.isError || !tournament.data) {
    return (
      <div className="container page">
        <ErrorState error={tournament.error} onRetry={() => tournament.refetch()} />
      </div>
    )
  }

  const t = tournament.data
  const context: TournamentContext = { tournamentId: id, teamsById }

  return (
    <>
      <section className="hero">
        <span className="hero__glow hero__glow--green" aria-hidden="true" />
        <span className="hero__flag" aria-hidden="true" />
        <div className="container hero__inner hero__inner--compact">
          <div className="hero__meta">
            <TournamentStatusPill status={t.status} />
            {t.category && <span>{t.category}</span>}
          </div>
          <h1 className="hero__title">{t.name}</h1>
          {t.season && (
            <p className="hero__lead" style={{ margin: '10px 0 0' }}>
              Temporada {t.season}
            </p>
          )}
        </div>
      </section>

      <div className="subnav">
        <div className="container">
          <TabNav tabs={tabs} />
        </div>
      </div>

      {/* key: al cambiar de pestaña el contenido se vuelve a montar y entra animado */}
      <div className="container page" key={pathname}>
        <Outlet context={context} />
      </div>
    </>
  )
}
