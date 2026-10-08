import { Link } from 'react-router-dom'
import type { Match } from '@/types/api'

/** Franja horizontal con los últimos resultados (ganador en blanco, perdedor atenuado). */
export function ResultsTicker({
  label,
  matches,
  hrefBase,
}: {
  label: string
  matches: Match[]
  hrefBase?: string
}) {
  if (matches.length === 0) return null
  return (
    <section className="ticker" aria-label="Últimos resultados">
      <div className="ticker__inner">
        <span className="ticker__label">{label}</span>
        {matches.map((m) => {
          const homeWon = m.winner_team_id === m.home_team_id
          const awayWon = m.winner_team_id === m.away_team_id
          const item = (
            <>
              <span className={homeWon ? undefined : 'dim'}>{m.home_team?.name ?? '—'}</span>
              <span className={`marc score${homeWon ? '' : ' dim'}`}>{m.home_score ?? 0}</span>
              <span className={awayWon ? undefined : 'dim'}>{m.away_team?.name ?? '—'}</span>
              <span className={`marc score${awayWon ? '' : ' dim'}`}>{m.away_score ?? 0}</span>
            </>
          )
          return hrefBase ? (
            <Link
              key={m.id}
              to={`${hrefBase}/${m.id}`}
              className="ticker__item"
              style={{ color: '#fff', textDecoration: 'none' }}
            >
              {item}
            </Link>
          ) : (
            <div key={m.id} className="ticker__item">
              {item}
            </div>
          )
        })}
      </div>
    </section>
  )
}
