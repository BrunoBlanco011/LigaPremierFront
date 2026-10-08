import { Outlet, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import type { Team } from '@/types/api'
import { useTournament } from '@/features/tournaments/queries'
import { useTournamentTeams } from '@/features/teams/queries'
import { useRounds, useMatches } from '@/features/schedule/queries'
import { indexById } from '@/lib/collections'
import { TabNav } from '@/components/organisms/TabNav'
import type { TabItem } from '@/components/organisms/TabNav'
import { TournamentHeader } from '@/components/organisms/TournamentHeader'
import { ErrorState, LoadingState } from '@/components/molecules/StateView'

export interface TournamentContext {
  tournamentId: string
  teamsById: Map<string, Team>
}

export function TournamentPage() {
  const { id = '' } = useParams()
  const tournament = useTournament(id)
  const teams = useTournamentTeams(id)
  const rounds = useRounds(id)
  const matches = useMatches(id)

  const teamsById = useMemo(() => indexById(teams.data), [teams.data])

  const roundsPlayed = useMemo(() => {
    if (!rounds.data || !matches.data) return 0
    const played = new Set(
      matches.data
        .filter((m) => m.status === 'finished' || m.status === 'forfeit')
        .map((m) => m.round_id),
    )
    return rounds.data.filter((r) => played.has(r.id)).length
  }, [rounds.data, matches.data])

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
      <div className="pub">
        <LoadingState />
      </div>
    )
  }
  if (tournament.isError || !tournament.data) {
    return (
      <div className="pub">
        <ErrorState error={tournament.error} onRetry={() => tournament.refetch()} />
      </div>
    )
  }

  const t = tournament.data
  const context: TournamentContext = { tournamentId: id, teamsById }

  return (
    <>
      <TournamentHeader
        tournament={t}
        teamsCount={teams.data?.length}
        roundsPlayed={roundsPlayed}
        roundsTotal={rounds.data?.length}
      />

      <div className="tabbar">
        <div className="tabbar__inner">
          <TabNav tabs={tabs} />
        </div>
      </div>

      <main className="pub" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Outlet context={context} />
      </main>
    </>
  )
}
