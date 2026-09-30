import { useParams } from 'react-router-dom'
import { useMemo } from 'react'
import type { Player, PlayerStat } from '@/types/api'
import { useMatch, useMatchStats } from '@/features/matches/queries'
import { useTeam, useTeamPlayers } from '@/features/teams/queries'
import { MatchCard } from '@/components/organisms/MatchCard'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/molecules/StateView'

const STAT_COLS: { key: keyof PlayerStat; label: string }[] = [
  { key: 'touchdowns', label: 'TD' },
  { key: 'td_passes', label: 'Pases TD' },
  { key: 'interceptions', label: 'Int' },
  { key: 'sacks', label: 'Cap' },
  { key: 'tackles', label: 'Tk' },
]

function TeamStats({
  title,
  players,
  statsByPlayer,
}: {
  title: string
  players: Player[]
  statsByPlayer: Map<string, PlayerStat>
}) {
  const rows = players.filter((p) => statsByPlayer.has(p.id))
  return (
    <div>
      <h3 style={{ fontSize: 18, marginBottom: 12 }}>{title}</h3>
      {rows.length === 0 ? (
        <p className="round__bye">Sin estadísticas capturadas.</p>
      ) : (
        <div className="table-wrap">
          <table className="table tnum">
            <thead>
              <tr>
                <th>Jugador</th>
                {STAT_COLS.map((c) => (
                  <th key={c.key} className="num">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const s = statsByPlayer.get(p.id)!
                return (
                  <tr key={p.id}>
                    <td>
                      {p.jersey_number != null && (
                        <b style={{ color: 'var(--ink-faint)', marginRight: 6 }}>
                          #{p.jersey_number}
                        </b>
                      )}
                      {p.full_name}
                    </td>
                    {STAT_COLS.map((c) => (
                      <td key={c.key} className="num">{s[c.key]}</td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function MatchDetailPage() {
  const { mid = '' } = useParams()
  const match = useMatch(mid)
  const stats = useMatchStats(mid)
  const home = useTeam(match.data?.home_team_id ?? '')
  const away = useTeam(match.data?.away_team_id ?? '')
  const homePlayers = useTeamPlayers(match.data?.home_team_id ?? '')
  const awayPlayers = useTeamPlayers(match.data?.away_team_id ?? '')

  const statsByPlayer = useMemo(
    () => new Map((stats.data ?? []).map((s) => [s.player_id, s])),
    [stats.data],
  )

  if (match.isLoading) return <div className="container page"><LoadingState /></div>
  if (match.isError || !match.data)
    return (
      <div className="container page">
        <ErrorState error={match.error} onRetry={() => match.refetch()} />
      </div>
    )

  return (
    <div className="container page">
      <p className="eyebrow">Detalle de partido</p>
      <div style={{ maxWidth: 560, marginBottom: 32 }}>
        <MatchCard
          match={match.data}
          home={home.data ?? undefined}
          away={away.data ?? undefined}
        />
      </div>

      {stats.isLoading ? (
        <LoadingState />
      ) : statsByPlayer.size === 0 ? (
        <EmptyState
          title="Sin estadísticas"
          message="Las estadísticas de los jugadores aparecerán cuando se capturen."
        />
      ) : (
        <div className="grid grid--2">
          <TeamStats
            title={home.data?.name ?? 'Local'}
            players={homePlayers.data ?? []}
            statsByPlayer={statsByPlayer}
          />
          <TeamStats
            title={away.data?.name ?? 'Visitante'}
            players={awayPlayers.data ?? []}
            statsByPlayer={statsByPlayer}
          />
        </div>
      )}
    </div>
  )
}
