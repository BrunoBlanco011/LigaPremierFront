import { useOutletContext } from 'react-router-dom'
import { useMemo, type CSSProperties } from 'react'
import type { Match } from '@/types/api'
import type { TournamentContext } from '../TournamentPage'
import { useMatches, useRounds } from '@/features/schedule/queries'
import { MatchCard } from '@/components/organisms/MatchCard'
import { EmptyState, ErrorState } from '@/components/molecules/StateView'
import { MatchesSkeleton } from '@/components/molecules/Skeletons'
import { usePageTitle } from '@/lib/usePageTitle'
import { formatDateRange } from '@/lib/format'

export function ResultsTab() {
  const { tournamentId, tournamentName, teamsById } = useOutletContext<TournamentContext>()
  usePageTitle(`Resultados · ${tournamentName}`)
  const rounds = useRounds(tournamentId)
  const matches = useMatches(tournamentId)

  // Partidos finalizados agrupados por jornada, de la más reciente a la más antigua.
  const groups = useMemo(() => {
    const finished = (matches.data ?? []).filter(
      (m) => m.status === 'finished' || m.status === 'forfeit',
    )
    const byRound = new Map<string, Match[]>()
    for (const m of finished) {
      const key = m.round_id ?? 'sin-jornada'
      if (!byRound.has(key)) byRound.set(key, [])
      byRound.get(key)!.push(m)
    }
    const sortedRounds = [...(rounds.data ?? [])].sort((a, b) => b.number - a.number)
    const out = sortedRounds
      .filter((r) => byRound.has(r.id))
      .map((r) => ({
        key: r.id,
        title: r.name ?? `Jornada ${r.number}`,
        dates: formatDateRange(r.start_date, r.end_date),
        matches: byRound.get(r.id)!,
      }))
    if (byRound.has('sin-jornada'))
      out.push({ key: 'sin-jornada', title: 'Sin jornada', dates: '', matches: byRound.get('sin-jornada')! })
    return out
  }, [matches.data, rounds.data])

  if (rounds.isLoading || matches.isLoading) return <MatchesSkeleton count={6} />
  if (matches.isError)
    return <ErrorState error={matches.error} onRetry={() => matches.refetch()} resource="los resultados" />
  if (groups.length === 0)
    return (
      <EmptyState title="Aún no hay resultados" message="Aquí verás los partidos finalizados." />
    )

  const renderGrid = (list: Match[]) => (
    <div className="match-grid" style={{ marginTop: 12 }}>
      {list.map((m, i) => (
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
      ))}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {groups.map((g, idx) =>
        idx === 0 ? (
          // La jornada más reciente queda expandida.
          <section key={g.key}>
            <h2 className="results-group__title">
              {g.title}
              {g.dates && <span className="results-group__dates"> · {g.dates}</span>}
            </h2>
            {renderGrid(g.matches)}
          </section>
        ) : (
          <details key={g.key} className="results-group">
            <summary className="results-group__title">
              {g.title}
              {g.dates && <span className="results-group__dates"> · {g.dates}</span>}
              <span className="results-group__count">{g.matches.length} partidos</span>
            </summary>
            {renderGrid(g.matches)}
          </details>
        ),
      )}
    </div>
  )
}
