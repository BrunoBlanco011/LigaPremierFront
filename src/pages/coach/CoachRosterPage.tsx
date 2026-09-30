import { useParams } from 'react-router-dom'
import { useTeam, useTeamPlayers } from '@/features/teams/queries'
import { Placeholder } from '@/components/molecules/Placeholder'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/molecules/StateView'

/**
 * Roster del coach (RF-41). La lectura del roster ya funciona; el CRUD
 * (alta / edición / baja / eliminar) entra en el siguiente incremento.
 */
export function CoachRosterPage() {
  const { id = '' } = useParams()
  const team = useTeam(id)
  const players = useTeamPlayers(id)

  if (team.isLoading) return <LoadingState />
  if (team.isError || !team.data)
    return <ErrorState error={team.error} onRetry={() => team.refetch()} />

  const roster = players.data ?? []

  return (
    <>
      <p className="eyebrow">Mi equipo</p>
      <h1 className="page__title" style={{ fontSize: 28, marginBottom: 20 }}>
        {team.data.name}
      </h1>

      {players.isLoading ? (
        <LoadingState />
      ) : roster.length === 0 ? (
        <EmptyState title="Sin jugadores" message="Agrega jugadores a tu roster." />
      ) : (
        <div className="table-wrap" style={{ marginBottom: 24 }}>
          <table className="table tnum">
            <thead>
              <tr>
                <th className="num">#</th>
                <th>Jugador</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((p) => (
                <tr key={p.id}>
                  <td className="num">{p.jersey_number ?? '—'}</td>
                  <td>{p.full_name}</td>
                  <td>{p.is_active ? 'Activo' : 'Baja'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Placeholder title="Alta / edición / baja de jugadores" rf="RF-41" />
    </>
  )
}
