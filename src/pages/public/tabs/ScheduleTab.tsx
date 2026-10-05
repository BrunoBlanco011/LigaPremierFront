import { useOutletContext } from 'react-router-dom'
import { useMemo } from 'react'
import type { Match } from '@/types/api'
import type { TournamentContext } from '../TournamentPage'
import { useMatches, useRounds } from '@/features/schedule/queries'
import { MatchCard } from '@/components/organisms/MatchCard'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/molecules/StateView'
import { formatDateRange } from '@/lib/format'

export function ScheduleTab() {
  const { tournamentId, teamsById } = useOutletContext<TournamentContext>()
  const rounds = useRounds(tournamentId)
  const matches = useMatches(tournamentId)

  const byRound = useMemo(() => {
    const map = new Map<string, Match[]>()
    for (const m of matches.data ?? []) {
      const key = m.round_id ?? 'sin-jornada'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(m)
    }
    return map
  }, [matches.data])

  if (rounds.isLoading || matches.isLoading) return <LoadingState />
  if (rounds.isError) return <ErrorState error={rounds.error} onRetry={() => rounds.refetch()} />
  if (matches.isError) return <ErrorState error={matches.error} onRetry={() => matches.refetch()} />
  if (!rounds.data || rounds.data.length === 0)
    return (
      <EmptyState
        title="Rol de juegos no publicado"
        message="El calendario aparecerá cuando el administrador lo genere."
      />
    )

  return (
    <>
      {rounds.data.map((round) => {
        const roundMatches = byRound.get(round.id) ?? []
        const byeTeam = round.bye_team_id ? teamsById.get(round.bye_team_id) : undefined
        return (
          <div className="round" key={round.id}>
            <div className="round__head">
              <span className="round__title">
                {round.name ?? `Jornada ${round.number}`}
              </span>
              {round.start_date && (
                <span className="round__bye">{formatDateRange(round.start_date, round.end_date)}</span>
              )}
              {byeTeam && <span className="round__bye">· Descansa: {byeTeam.name}</span>}
            </div>
            {roundMatches.length > 0 ? (
              <div className="grid grid--2">
                {roundMatches.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    home={teamsById.get(m.home_team_id)}
                    away={teamsById.get(m.away_team_id)}
                    linkTo={`/torneos/${tournamentId}/partidos/${m.id}`}
                  />
                ))}
              </div>
            ) : (
              <p className="round__bye">Sin partidos en esta jornada.</p>
            )}
          </div>
        )
      })}
    </>
  )
}
