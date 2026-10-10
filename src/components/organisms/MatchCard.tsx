import { Link } from 'react-router-dom'
import type { Match, Team } from '@/types/api'
import { TeamBadge } from '@/components/molecules/TeamBadge'
import { MatchStatusPill } from '@/components/molecules/StatusPill'
import { formatTime } from '@/lib/format'

type TeamLite = Pick<Team, 'id' | 'name' | 'logo_url'>

function TeamRow({
  team,
  score,
  played,
  isWinner,
}: {
  team?: TeamLite
  score: number | null
  played: boolean
  isWinner: boolean
}) {
  return (
    <div className="mcard__row">
      <span
        className={`mcard__team${played && !isWinner ? ' is-loser' : ''}`}
        style={played && isWinner ? { fontWeight: 700 } : undefined}
      >
        {team ? (
          <TeamBadge name={team.name} logoUrl={team.logo_url} size={28} />
        ) : (
          <span className="team-badge__name">Por definir</span>
        )}
      </span>
      {played && (
        <span className={`mcard__score${isWinner ? '' : ' is-loser'}`}>{score ?? 0}</span>
      )}
    </div>
  )
}

/** Tarjeta de partido tipo marcador, en dos renglones (RF-13/14).
 *  Una sola línea meta (hora · sede); el día va en el encabezado del grupo.
 *  Sin badge en `scheduled` ni `finished`; sí en forfeit/pospuesto/cancelado. */
export function MatchCard({
  match,
  home,
  away,
  linkTo,
}: {
  match: Match
  home?: TeamLite
  away?: TeamLite
  linkTo?: string
}) {
  const played = match.status === 'finished' || match.status === 'forfeit'
  const homeWon = match.winner_team_id === match.home_team_id
  const awayWon = match.winner_team_id === match.away_team_id
  const homeTeam = home ?? match.home_team ?? undefined
  const awayTeam = away ?? match.away_team ?? undefined

  const showBadge = match.status !== 'scheduled' && match.status !== 'finished'

  // Línea meta: hora (si está programado) · sede.
  const time = !played && match.scheduled_at ? formatTime(match.scheduled_at) : ''
  const meta = [time || (match.status === 'scheduled' ? 'Horario por definir' : ''), match.venue]
    .filter(Boolean)
    .join(' · ')

  const foot =
    match.status === 'forfeit'
      ? `Forfeit (21-0)${match.notes ? ` · ${match.notes}` : ''}`
      : match.notes || ''

  const inner = (
    <>
      {(meta || showBadge) && (
        <div className="mcard__top">
          <span className="mcard__meta">{meta}</span>
          {showBadge && <MatchStatusPill status={match.status} />}
        </div>
      )}
      <TeamRow team={homeTeam} score={match.home_score} played={played} isWinner={homeWon} />
      <TeamRow team={awayTeam} score={match.away_score} played={played} isWinner={awayWon} />
      {foot && <div className="mcard__foot">{foot}</div>}
    </>
  )

  return linkTo ? (
    <Link to={linkTo} className="mcard">
      {inner}
    </Link>
  ) : (
    <div className="mcard">{inner}</div>
  )
}
