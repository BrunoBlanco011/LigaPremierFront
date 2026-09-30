import { Link, useParams } from 'react-router-dom'
import { usePlayer, usePlayerStats } from '@/features/players/queries'
import { StatCard } from '@/components/molecules/StatCard'
import { ErrorState, LoadingState } from '@/components/molecules/StateView'

export function PlayerProfilePage() {
  const { id = '' } = useParams()
  const player = usePlayer(id)
  const stats = usePlayerStats(id)

  if (player.isLoading) return <div className="container page"><LoadingState /></div>
  if (player.isError || !player.data)
    return (
      <div className="container page">
        <ErrorState error={player.error} onRetry={() => player.refetch()} />
      </div>
    )

  const t = stats.data?.totals

  return (
    <div className="container page">
      <p className="eyebrow">Jugador</p>
      <h1 className="page__title" style={{ fontSize: 32 }}>
        {player.data.jersey_number != null && (
          <span style={{ color: 'var(--ink-faint)' }}>#{player.data.jersey_number} </span>
        )}
        {player.data.full_name}
      </h1>

      <div className="section-head">
        <h2>Totales</h2>
      </div>
      {stats.isLoading ? (
        <LoadingState />
      ) : t ? (
        <div className="grid grid--4">
          <StatCard num={t.games_attended} label="Asistencia" />
          <StatCard num={t.touchdowns} label="Anotaciones" />
          <StatCard num={t.td_passes} label="Pases TD" />
          <StatCard num={t.interceptions} label="Intercepciones" />
          <StatCard num={t.sacks} label="Capturas" />
          <StatCard num={t.tackles} label="Tackles" />
        </div>
      ) : (
        <p className="round__bye">Sin estadísticas registradas.</p>
      )}

      {/* Carrera: desglose por torneo */}
      {stats.data?.by_tournament && stats.data.by_tournament.length > 0 && (
        <>
          <div className="section-head"><h2>Por torneo</h2></div>
          <div className="table-wrap">
            <table className="table tnum">
              <thead>
                <tr>
                  <th>Torneo</th>
                  <th className="num">Asist.</th>
                  <th className="num">Anot.</th>
                  <th className="num">Pases TD</th>
                  <th className="num">Int</th>
                  <th className="num">Cap</th>
                  <th className="num">Tk</th>
                </tr>
              </thead>
              <tbody>
                {stats.data.by_tournament.map((bt) => (
                  <tr key={bt.tournament.id}>
                    <td>
                      <Link to={`/torneos/${bt.tournament.id}`} style={{ fontWeight: 600 }}>
                        {bt.tournament.name}
                      </Link>
                    </td>
                    <td className="num">{bt.games_attended}</td>
                    <td className="num">{bt.touchdowns}</td>
                    <td className="num">{bt.td_passes}</td>
                    <td className="num">{bt.interceptions}</td>
                    <td className="num">{bt.sacks}</td>
                    <td className="num">{bt.tackles}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
