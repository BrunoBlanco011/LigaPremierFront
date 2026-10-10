import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Shield } from 'lucide-react'
import {
  useTeam,
  useTeamPlayers,
  useTournamentTeams,
} from '@/features/teams/queries'
import { useMatches } from '@/features/schedule/queries'
import { useStandings } from '@/features/standings/queries'
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
  const standings = useStandings(id)
  const allTeams = useTournamentTeams(id)
  const teamsById = useMemo(() => indexById(allTeams.data), [allTeams.data])

  const teamRow = useMemo(
    () => (standings.data ?? []).find((r) => r.team.id === teamId),
    [standings.data, teamId],
  )
  const { nextMatch, finished } = useMemo(() => {
    const all = matches.data ?? []
    const isPlayed = (m: typeof all[number]) => m.status === 'finished' || m.status === 'forfeit'
    const fin = all
      .filter(isPlayed)
      .sort((a, b) => (b.scheduled_at ?? '').localeCompare(a.scheduled_at ?? ''))
    const next = all
      .filter((m) => m.status === 'scheduled' && m.scheduled_at)
      .sort((a, b) => a.scheduled_at!.localeCompare(b.scheduled_at!))[0]
    return { nextMatch: next, finished: fin }
  }, [matches.data])
  const streak = finished.slice(0, 5).map((m) => (m.winner_team_id === teamId ? 'G' : 'P'))

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

      {teamRow && (
        <div className="team-summary">
          <div className="team-summary__stat">
            <span className="marc team-summary__num">{teamRow.position}º</span>
            <span className="team-summary__label">posición</span>
          </div>
          <div className="team-summary__stat">
            <span className="marc team-summary__num">{teamRow.won}–{teamRow.lost}</span>
            <span className="team-summary__label">ganados–perdidos</span>
          </div>
          <div className="team-summary__stat">
            <span className="marc team-summary__num">{teamRow.points}</span>
            <span className="team-summary__label">puntos</span>
          </div>
          {streak.length > 0 && (
            <div
              className="streak"
              aria-label={`Últimos resultados: ${streak
                .map((s) => (s === 'G' ? 'ganado' : 'perdido'))
                .join(', ')}`}
            >
              {streak.map((s, i) => (
                <span key={i} className={`streak__dot streak__dot--${s === 'G' ? 'g' : 'p'}`} aria-hidden="true">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

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

      {matches.isLoading ? (
        <LoadingState />
      ) : !matches.data || matches.data.length === 0 ? (
        <>
          <div className="section-head"><h2>Partidos</h2></div>
          <EmptyState title="Sin partidos" />
        </>
      ) : (
        <>
          {nextMatch && (
            <>
              <div className="section-head"><h2>Próximo partido</h2></div>
              <div style={{ maxWidth: 420 }}>
                <MatchCard
                  match={nextMatch}
                  home={teamsById.get(nextMatch.home_team_id)}
                  away={teamsById.get(nextMatch.away_team_id)}
                  linkTo={`/torneos/${id}/partidos/${nextMatch.id}`}
                />
              </div>
            </>
          )}
          {finished.length > 0 && (
            <>
              <div className="section-head"><h2>Resultados</h2></div>
              <div className="match-grid">
                {finished.map((m) => {
                  const won = m.winner_team_id === teamId
                  return (
                    <div key={m.id} style={{ position: 'relative' }}>
                      <span
                        className={`gp gp--${won ? 'g' : 'p'}`}
                        aria-label={won ? 'Ganado' : 'Perdido'}
                      >
                        {won ? 'G' : 'P'}
                      </span>
                      <MatchCard
                        match={m}
                        home={teamsById.get(m.home_team_id)}
                        away={teamsById.get(m.away_team_id)}
                        linkTo={`/torneos/${id}/partidos/${m.id}`}
                      />
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
