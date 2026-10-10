import { useOutletContext } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Check } from 'lucide-react'
import type { Match, Round } from '@/types/api'
import type { TournamentContext } from '../TournamentPage'
import { useMatches, useRounds } from '@/features/schedule/queries'
import { MatchCard } from '@/components/organisms/MatchCard'
import { EmptyState, ErrorState } from '@/components/molecules/StateView'
import { MatchesSkeleton } from '@/components/molecules/Skeletons'
import { usePageTitle } from '@/lib/usePageTitle'
import { formatDateRange } from '@/lib/format'

const LEAGUE_TZ = 'America/Mexico_City'
const dayFmt = new Intl.DateTimeFormat('es-MX', {
  timeZone: LEAGUE_TZ,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const dayKeyFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: LEAGUE_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const isPlayed = (m: Match) => m.status === 'finished' || m.status === 'forfeit'

export function ScheduleTab() {
  const { tournamentId, tournamentName, teamsById } = useOutletContext<TournamentContext>()
  usePageTitle(`Rol de juegos · ${tournamentName}`)
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

  // Jornadas completas (todos sus partidos jugados), para marcarlas con un check.
  const completed = useMemo(() => {
    const set = new Set<string>()
    for (const r of sortedRounds) {
      const ms = byRound.get(r.id) ?? []
      if (ms.length > 0 && ms.every(isPlayed)) set.add(r.id)
    }
    return set
  }, [sortedRounds, byRound])

  const activeKey = selected ?? defaultRoundId
  const activeRef = useRef<HTMLButtonElement>(null)
  // Al montar o cambiar de jornada, centra la jornada activa en el selector.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: 'center', block: 'nearest' })
  }, [activeKey])

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

  const activeId = activeKey
  const round: Round | undefined = sortedRounds.find((r) => r.id === activeId)
  const roundMatches = round ? byRound.get(round.id) ?? [] : []
  const byeTeam = round?.bye_team_id ? teamsById.get(round.bye_team_id) : undefined

  // Partidos de la jornada agrupados por día (en hora de la liga).
  const days = new Map<string, { title: string; matches: Match[] }>()
  for (const m of roundMatches) {
    const d = m.scheduled_at ? new Date(m.scheduled_at) : null
    const key = d ? dayKeyFmt.format(d) : 'sin-fecha'
    if (!days.has(key)) {
      days.set(key, {
        title: d ? cap(dayFmt.format(d)) : 'Fecha por definir',
        matches: [],
      })
    }
    days.get(key)!.matches.push(m)
  }
  const daySections = [...days.values()]

  return (
    <>
      <div className="round-nav-wrap">
        <nav className="round-nav" aria-label="Jornadas">
          {sortedRounds.map((r) => {
            const done = completed.has(r.id)
            return (
              <button
                key={r.id}
                ref={r.id === activeId ? activeRef : undefined}
                type="button"
                className={`round-pill${r.id === activeId ? ' is-active' : ''}${done ? ' is-done' : ''}`}
                aria-current={r.id === activeId ? 'true' : undefined}
                aria-label={`Jornada ${r.number}${done ? ' (completa)' : ''}`}
                onClick={() => setSelected(r.id)}
              >
                {done && <Check size={12} aria-hidden="true" />}
                J{r.number}
              </button>
            )
          })}
        </nav>
      </div>

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
