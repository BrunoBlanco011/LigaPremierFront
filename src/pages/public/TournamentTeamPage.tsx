import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Shield } from 'lucide-react'
import {
  useTeam,
  useTeamPlayers,
  useTournamentTeams,
} from '@/features/teams/queries'
import { useMatches } from '@/features/schedule/queries'
import { indexById } from '@/lib/collections'
import { MatchCard } from '@/components/organisms/MatchCard'
import { TeamBadge } from '@/components/molecules/TeamBadge'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/molecules/StateView'
import { usePageTitle } from '@/lib/usePageTitle'

/** Perfil de un equipo (inscripción) dentro de un torneo (RF-17). */
export function TournamentTeamPage() {
  const { id = '', teamId = '' } = useParams()
  const team = useTeam(teamId)
  usePageTitle(team.data?.name ?? null)
  const players = useTeamPlayers(teamId)
  const matches = useMatches(id, { teamId })
  const allTeams = useTournamentTeams(id)
  const teamsById = useMemo(() => indexById(allTeams.data), [allTeams.data])

  if (team.isLoading) return <div className="container page"><LoadingState /></div>
  if (team.isError || !team.data)
    return (
      <div className="container page">
        <ErrorState error={team.error} onRetry={() => team.refetch()} />
      </div>
    )

  const roster = (players.data ?? []).filter((p) => p.is_active)

  return (
    <div className="container page">
      <Link to={`/torneos/${id}/equipos`} className="link-more" style={{ marginBottom: 12 }}>
        ← Equipos del torneo
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        <TeamBadge name={team.data.name} logoUrl={team.data.logo_url} showName={false} size={56} />
        <div>
          <h1 className="page__title" style={{ fontSize: 32 }}>{team.data.name}</h1>
          <Link to={`/clubes/${team.data.club_id}`} className="link-more">
            <Shield size={14} /> Ver club e historial
          </Link>
        </div>
      </div>

      <div className="section-head"><h2>Plantilla</h2></div>
      {players.isLoading ? (
        <LoadingState />
      ) : roster.length === 0 ? (
        <EmptyState title="Sin jugadores activos" />
      ) : (
        <div className="table-wrap">
          <table className="table tnum">
            <thead>
              <tr>
                <th className="num">#</th>
                <th>Jugador</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((p) => (
                <tr key={p.id}>
                  <td className="num">{p.jersey_number ?? '—'}</td>
                  <td><Link to={`/jugadores/${p.id}`}>{p.full_name}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="section-head"><h2>Partidos</h2></div>
      {matches.isLoading ? (
        <LoadingState />
      ) : !matches.data || matches.data.length === 0 ? (
        <EmptyState title="Sin partidos" />
      ) : (
        <div className="grid grid--2">
          {matches.data.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              home={teamsById.get(m.home_team_id)}
              away={teamsById.get(m.away_team_id)}
              linkTo={`/torneos/${id}/partidos/${m.id}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
