import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import type { Tournament } from '@/types/api'
import { useStandings } from '@/features/standings/queries'
import { useRounds, useMatches } from '@/features/schedule/queries'
import { TeamBadge } from '@/components/molecules/TeamBadge'
import { SkewTag } from '@/components/atoms/SkewTag'
import { formatDateRange } from '@/lib/format'

/** Tarjeta grande de un torneo en curso (Inicio): franja de cancha + avance + líder. */
export function FeaturedTournament({ tournament: t }: { tournament: Tournament }) {
  const standings = useStandings(t.id)
  const rounds = useRounds(t.id)
  const matches = useMatches(t.id)

  const roundsTotal = rounds.data?.length ?? 0
  const roundsPlayed = useMemo(() => {
    if (!rounds.data || !matches.data) return 0
    const played = new Set(
      matches.data
        .filter((m) => m.status === 'finished' || m.status === 'forfeit')
        .map((m) => m.round_id),
    )
    return rounds.data.filter((r) => played.has(r.id)).length
  }, [rounds.data, matches.data])

  const leader = standings.data?.[0]
  const teamsCount = standings.data?.length ?? 0
  const pct = roundsTotal ? Math.round((roundsPlayed / roundsTotal) * 100) : 0

  const meta = [t.category, teamsCount ? `${teamsCount} equipos` : null]
    .filter(Boolean)
    .join(' · ')

  return (
    <Link to={`/torneos/${t.id}`} className="ftcard">
      <div className="cancha ftcard__left">
        <SkewTag>En curso</SkewTag>
        <span className="ital ftcard__name">{t.name}</span>
        {meta && <span style={{ color: 'var(--color-sobre-verde-2)' }}>{meta}</span>}
        <span style={{ marginTop: 'auto', color: 'var(--color-sobre-verde-2)', fontSize: 14 }}>
          {formatDateRange(t.start_date, t.end_date)}
        </span>
      </div>
      <div className="ftcard__right">
        {roundsTotal > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.06em',
                color: 'var(--color-texto-2)',
              }}
            >
              AVANCE
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="marc" style={{ fontSize: 32 }}>Jornada {roundsPlayed}</span>
              <span style={{ color: 'var(--color-texto-2)' }}>de {roundsTotal}</span>
            </div>
            <div
              className="ftcard__bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={roundsTotal}
              aria-valuenow={roundsPlayed}
              aria-label="Jornadas jugadas"
            >
              <span style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
        {leader && (
          <div className="ftcard__leader">
            <span className="ital" style={{ fontSize: 40, lineHeight: 1, color: 'var(--color-dorado-texto)' }}>
              1
            </span>
            <TeamBadge name={leader.team.name} logoUrl={leader.team.logo_url} showName={false} size={40} />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 700 }}>{leader.team.name}</span>
              <span className="tnum" style={{ fontSize: 14, color: 'var(--color-texto-2)' }}>
                {leader.won} ganados · {leader.lost} perdidos
              </span>
            </div>
            <span className="marc" style={{ fontSize: 28 }}>
              {leader.points}
              <span style={{ fontSize: 14, color: 'var(--color-texto-2)' }}> pts</span>
            </span>
          </div>
        )}
        <span className="ftcard__cta">Ver tabla, rol y estadísticas →</span>
      </div>
    </Link>
  )
}
