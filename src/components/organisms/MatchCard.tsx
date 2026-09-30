import { Link } from 'react-router-dom'
import type { Match, Team } from '@/types/api'
import { TeamBadge } from '@/components/molecules/TeamBadge'
import { MatchStatusPill } from '@/components/molecules/StatusPill'
import { formatDateTime, formatTime } from '@/lib/format'

type TeamLite = Pick<Team, 'id' | 'name' | 'logo_url'>

function TeamName({ team }: { team?: TeamLite }) {
  if (!team) return <span className="team-badge__name">Por definir</span>
  return <TeamBadge name={team.name} logoUrl={team.logo_url} />
}

/** Tarjeta de partido tipo marcador (RF-13/14). */
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
  // El caller puede pasar los equipos, o se toman los embebidos en MatchView.
  const homeTeam = home ?? match.home_team ?? undefined
  const awayTeam = away ?? match.away_team ?? undefined

  const body = (
    <div className="card match">
      <div className="match__top">
        <span>{match.venue ?? 'Sede por definir'}</span>
        <MatchStatusPill status={match.status} />
      </div>
      <div className="match__body">
        <div className="match__side">
          <TeamName team={homeTeam} />
        </div>
        {played ? (
          <span className="match__score tnum">
            <span className={homeWon ? 'win' : undefined}>{match.home_score}</span>
            {' – '}
            <span className={awayWon ? 'win' : undefined}>{match.away_score}</span>
          </span>
        ) : (
          <span className="match__vs">
            {match.scheduled_at ? formatTime(match.scheduled_at) : 'VS'}
          </span>
        )}
        <div className="match__side match__side--away">
          <TeamName team={awayTeam} />
        </div>
      </div>
      <div className="match__foot">
        {match.status === 'forfeit'
          ? 'Forfeit (21-0)'
          : formatDateTime(match.scheduled_at)}
        {match.notes && ` · ${match.notes}`}
      </div>
    </div>
  )

  return linkTo ? (
    <Link to={linkTo} style={{ display: 'block' }}>
      {body}
    </Link>
  ) : (
    body
  )
}
