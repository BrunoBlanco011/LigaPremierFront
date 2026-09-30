import type { MatchStatus, TournamentStatus } from '@/types/api'

const MATCH_LABELS: Record<MatchStatus, string> = {
  scheduled: 'Programado',
  in_progress: 'En juego',
  finished: 'Finalizado',
  postponed: 'Pendiente',
  cancelled: 'Cancelado',
  forfeit: 'Forfeit',
}

const TOURNAMENT_LABELS: Record<TournamentStatus, string> = {
  draft: 'Borrador',
  active: 'En curso',
  finished: 'Finalizado',
  cancelled: 'Cancelado',
}

export function MatchStatusPill({ status }: { status: MatchStatus }) {
  const live = status === 'in_progress'
  return (
    <span className={`pill pill--${status}`}>
      {live && <span className="dot" />}
      {MATCH_LABELS[status]}
    </span>
  )
}

export function TournamentStatusPill({ status }: { status: TournamentStatus }) {
  return <span className={`pill pill--${status}`}>{TOURNAMENT_LABELS[status]}</span>
}
