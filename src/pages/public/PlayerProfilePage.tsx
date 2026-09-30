import { useParams } from 'react-router-dom'
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
    </div>
  )
}
