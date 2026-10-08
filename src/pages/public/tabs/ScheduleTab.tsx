import { useOutletContext } from 'react-router-dom'
import { useMemo, useState, type CSSProperties } from 'react'
import type { Match, Round } from '@/types/api'
import type { TournamentContext } from '../TournamentPage'
import { useMatches, useRounds } from '@/features/schedule/queries'
import { MatchCard } from '@/components/organisms/MatchCard'
import { EmptyState, ErrorState } from '@/components/molecules/StateView'
import { MatchesSkeleton } from '@/components/molecules/Skeletons'
import { formatDateRange } from '@/lib/format'

const dayFmt = new Intl.DateTimeFormat('es-MX', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function ScheduleTab() {
  const { tournamentId, teamsById } = useOutletContext<TournamentContext>()
  const rounds = useRounds(tournamentId)
  const matches = useMatches(tournamentId)
  const [selected, setSelected] = useState<string | null>(null)

  const sortedRounds = useMemo(
    () => [...(rounds.data ?? [])].sort((a, b) => a.number - b.number),
    [rounds.data],
  )

  const byRound = useMemo(() => {
    const map = new Map<string, Match[]>()
    for (const m of matches.data ?? []) {
      const key = m.round_id ?? 'sin-jornada'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(m)
    }
    return map
  }, [matches.data])

  // Jornada por defecto: la del próximo partido programado; si no, la última con resultados.
  const defaultRoundId = useMemo(() => {
    if (sortedRounds.length === 0) return null
    const upcoming = (matches.data ?? [])
      .filter((m) => m.status === 'scheduled' && m.scheduled_at)
      .sort((a, b) => a.scheduled_at!.localeCompare(b.scheduled_at!))[0]
    if (upcoming?.round_id) return upcoming.round_id
    const played = (matches.data ?? []).filter(
      (m) => m.status === 'finished' || m.status === 'forfeit',
    )
    if (played.length) {
      const lastRoundNumbers = new Set(played.map((m) => m.round_id))
      const last = [...sortedRounds].reverse().find((r) => lastRoundNumbers.has(r.id))
      if (last) return last.id
    }
    return sortedRounds[0].id
  }, [sortedRounds, matches.data])

  if (rounds.isLoading || matches.isLoading) return <MatchesSkeleton count={6} />
  if (rounds.isError)
    return <ErrorState error={rounds.error} onRetry={() => rounds.refetch()} resource="el rol de juegos" />
  if (matches.isError)
    return <ErrorState error={matches.error} onRetry={() => matches.refetch()} resource="el rol de juegos" />
  if (sortedRounds.length === 0)
    return (
      <EmptyState
        title="Aún no hay rol de juegos"
        message="El administrador lo publicará pronto."
      />
    )

  const activeId = selected ?? defaultRoundId
  const round: Round | undefined = sortedRounds.find((r) => r.id === activeId)
  const roundMatches = round ? byRound.get(round.id) ?? [] : []
  const byeTeam = round?.bye_team_id ? teamsById.get(round.bye_team_id) : undefined

  // Partidos de la jornada agrupados por día.
  const days = new Map<string, { title: string; matches: Match[] }>()
  for (const m of roundMatches) {
    const key = m.scheduled_at ? m.scheduled_at.slice(0, 10) : 'sin-fecha'
    if (!days.has(key)) {
      days.set(key, {
        title: m.scheduled_at ? cap(dayFmt.format(new Date(m.scheduled_at))) : 'Fecha por definir',
        matches: [],
      })
    }
    days.get(key)!.matches.push(m)
  }
  const daySections = [...days.values()]

  return (
    <>
      <nav className="round-nav" aria-label="Jornadas">
        {sortedRounds.map((r) => (
          <button
            key={r.id}
            type="button"
            className={`round-pill${r.id === activeId ? ' is-active' : ''}`}
            aria-current={r.id === activeId ? 'true' : undefined}
            onClick={() => setSelected(r.id)}
          >
            J{r.number}
          </button>
        ))}
      </nav>

      {round && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h2 className="ital" style={{ margin: 0, fontSize: 40, lineHeight: 1 }}>
            {round.name ?? `Jornada ${round.number}`}
          </h2>
          {round.start_date && (
            <span style={{ fontSize: 14, color: 'var(--color-texto-2)' }}>
              {formatDateRange(round.start_date, round.end_date)}
            </span>
          )}
          {byeTeam && (
            <span style={{ fontSize: 14, color: 'var(--color-texto-2)' }}>
              Descansa: {byeTeam.name}
            </span>
          )}
        </div>
      )}

      {daySections.length === 0 ? (
        <p style={{ color: 'var(--color-texto-2)' }}>Sin partidos en esta jornada.</p>
      ) : (
        (() => {
          let n = 0 // índice plano de la jornada para escalonar (máx. 6)
          return daySections.map((d) => (
            <section key={d.title} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 className="day-head">{d.title}</h3>
              <div className="match-grid">
                {d.matches.map((m) => {
                  const i = n++
                  return (
                    <div
                      key={m.id}
                      className="enter-up"
                      style={{ '--enter-delay': `${Math.min(i, 5) * 0.04}s` } as CSSProperties}
                    >
                      <MatchCard
                        match={m}
                        home={teamsById.get(m.home_team_id)}
                        away={teamsById.get(m.away_team_id)}
                        linkTo={`/torneos/${tournamentId}/partidos/${m.id}`}
                      />
                    </div>
                  )
                })}
              </div>
            </section>
          ))
        })()
      )}
    </>
  )
}
