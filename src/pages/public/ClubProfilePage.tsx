import { Link, useParams } from 'react-router-dom'
import {
  useClub,
  useClubHistory,
  useClubPlayers,
} from '@/features/clubs/queries'
import { TeamBadge } from '@/components/molecules/TeamBadge'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/molecules/StateView'

/** Perfil e historial de un club (RF-17b). */
export function ClubProfilePage() {
  const { id = '' } = useParams()
  const club = useClub(id)
  const players = useClubPlayers(id)
  const history = useClubHistory(id)

  if (club.isLoading) return <div className="container page"><LoadingState /></div>
  if (club.isError || !club.data)
    return (
      <div className="container page">
        <ErrorState error={club.error} onRetry={() => club.refetch()} />
      </div>
    )

  const roster = (players.data ?? []).filter((p) => p.is_active)

  return (
    <div className="container page">
      <p className="eyebrow">Club</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        <TeamBadge name={club.data.name} logoUrl={club.data.logo_url} showName={false} size={56} />
        <div>
          <h1 className="page__title" style={{ fontSize: 32 }}>{club.data.name}</h1>
          {club.data.coach_name && (
            <p className="page__sub" style={{ marginTop: 4 }}>
              Entrenador: {club.data.coach_name}
            </p>
          )}
        </div>
      </div>

      {/* Historial */}
      <div className="section-head"><h2>Historial</h2></div>
      {history.isLoading ? (
        <LoadingState />
      ) : !history.data || history.data.length === 0 ? (
        <EmptyState title="Sin historial" message="Aún no ha participado en torneos." />
      ) : (
        <div className="table-wrap">
          <table className="table tnum">
            <thead>
              <tr>
                <th>Torneo</th>
                <th className="num">Pos</th>
                <th className="num">JG</th>
                <th className="num">JP</th>
                <th className="num">Pts</th>
              </tr>
            </thead>
            <tbody>
              {history.data.map((h) => (
                <tr key={h.tournament.id}>
                  <td>
                    <Link to={`/torneos/${h.tournament.id}`} style={{ fontWeight: 600 }}>
                      {h.tournament.name}
                    </Link>
                    {h.standing && (
                      <span style={{ color: 'var(--ink-faint)' }}>
                        {' '}· {h.standing.position}.º de {h.teams_count}
                      </span>
                    )}
                  </td>
                  <td className="num">{h.standing?.position ?? '—'}</td>
                  <td className="num">{h.standing?.won ?? '—'}</td>
                  <td className="num">{h.standing?.lost ?? '—'}</td>
                  <td className="num pts">{h.standing?.points ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Plantilla */}
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
                  <td>
                    <Link to={`/jugadores/${p.id}`}>{p.full_name}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
