import { Link } from 'react-router-dom'
import type { Match, Team } from '@/types/api'
import { TeamBadge } from '@/components/molecules/TeamBadge'
import { MatchStatusPill } from '@/components/molecules/StatusPill'
import { formatDateTime, formatTime, formatDate } from '@/lib/format'

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

/** Tarjeta de partido tipo marcador, en dos renglones (RF-13/14). */
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

  const topLeft = match.venue
    ?? match.round?.name
    ?? (match.scheduled_at && !played ? formatDate(match.scheduled_at) : 'Sede por definir')

  let foot: string
  if (match.status === 'forfeit') foot = 'Forfeit (21-0)'
  else if (played) foot = formatDateTime(match.scheduled_at)
  else if (match.status === 'scheduled')
    foot = match.scheduled_at ? `${formatDateTime(match.scheduled_at)}` : 'Horario por definir'
  else foot = formatDate(match.scheduled_at)

  const inner = (
    <>
      <div className="mcard__top">
        <span>{topLeft}</span>
        <MatchStatusPill status={match.status} />
      </div>
      <TeamRow team={homeTeam} score={match.home_score} played={played} isWinner={homeWon} />
      <TeamRow team={awayTeam} score={match.away_score} played={played} isWinner={awayWon} />
      {!played && match.scheduled_at && match.status === 'scheduled' && (
        <div
          className="marc"
          style={{ textAlign: 'center', marginTop: 8, fontSize: 20, color: 'var(--color-texto-2)' }}
        >
          {formatTime(match.scheduled_at)}
        </div>
      )}
      {(match.notes || foot) && (
        <div className="mcard__foot">
          {foot}
          {match.notes && ` · ${match.notes}`}
        </div>
      )}
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
