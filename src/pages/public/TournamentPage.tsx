import { Outlet, useParams } from 'react-router-dom'
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
        <div className="container hero__inner" style={{ padding: '40px 0 28px' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <TournamentStatusPill status={t.status} />
            {t.category && (
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
                {t.category}
              </span>
            )}
          </div>
          <h1 className="hero__title" style={{ fontSize: 'clamp(30px, 5vw, 48px)' }}>
            {t.name}
          </h1>
          {t.season && (
            <p className="hero__lead" style={{ margin: '10px 0 0' }}>
              Temporada {t.season}
            </p>
          )}
        </div>
      </section>

      <div
        style={{
          position: 'sticky',
          top: 66,
          zIndex: 40,
          background: 'var(--surface)',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <div className="container">
          <TabNav tabs={tabs} />
        </div>
      </div>

      <div className="container page">
        <Outlet context={context} />
      </div>
    </>
  )
}
