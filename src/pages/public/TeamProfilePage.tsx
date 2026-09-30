import { useParams } from 'react-router-dom'
import { useTeam, useTeamPlayers } from '@/features/teams/queries'
import { TeamBadge } from '@/components/molecules/TeamBadge'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/molecules/StateView'

export function TeamProfilePage() {
  const { id = '' } = useParams()
  const team = useTeam(id)
  const players = useTeamPlayers(id)

  if (team.isLoading) return <div className="container page"><LoadingState /></div>
  if (team.isError || !team.data)
    return (
      <div className="container page">
        <ErrorState error={team.error} onRetry={() => team.refetch()} />
      </div>
    )

  const activePlayers = (players.data ?? []).filter((p) => p.is_active)

  return (
    <div className="container page">
      <p className="eyebrow">Equipo</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        <TeamBadge name={team.data.name} logoUrl={team.data.logo_url} showName={false} size={56} />
        <div>
          <h1 className="page__title" style={{ fontSize: 32 }}>{team.data.name}</h1>
          {team.data.coach_name && (
            <p className="page__sub" style={{ marginTop: 4 }}>
              Entrenador: {team.data.coach_name}
            </p>
          )}
        </div>
      </div>

      <div className="section-head">
        <h2>Roster</h2>
      </div>
      {players.isLoading ? (
        <LoadingState />
      ) : activePlayers.length === 0 ? (
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
              {activePlayers.map((p) => (
                <tr key={p.id}>
                  <td className="num">{p.jersey_number ?? '—'}</td>
                  <td>{p.full_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
