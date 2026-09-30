// Tipos de dominio del backend LigaPremier (FastAPI + Supabase).
// Reflejan RequerimientosFuncionales.md; verificar contra openapi.json al integrar.

export type UUID = string
export type UserRole = 'admin' | 'coach'

export type TournamentStatus = 'draft' | 'active' | 'finished' | 'cancelled'
export type MatchStatus =
  | 'scheduled'
  | 'in_progress'
  | 'finished'
  | 'postponed'
  | 'cancelled'
  | 'forfeit'
export type FinanceMovementType =
  | 'registration_fee'
  | 'fine'
  | 'other_charge'
  | 'payment'

export interface User {
  id: UUID
  email: string
  full_name: string | null
  role: UserRole
}

export interface Tournament {
  id: UUID
  name: string
  season: string | null
  category: string | null
  description: string | null
  start_date: string | null
  end_date: string | null
  status: TournamentStatus
  points_win: number
  points_loss: number
}

/** Club: equipo permanente de la liga; conserva plantilla e historial. */
export interface Club {
  id: UUID
  name: string
  coach_name: string | null
  coach_user_id: UUID | null
  logo_url: string | null
}

/** Team: inscripción de un club a un torneo (a él se ligan tabla, partidos, finanzas). */
export interface Team {
  id: UUID
  tournament_id: UUID
  club_id: UUID
  name: string
  coach_name: string | null
  logo_url: string | null
}

/** Jugador: pertenece a un club y se conserva entre torneos. */
export interface Player {
  id: UUID
  club_id: UUID
  full_name: string
  jersey_number: number | null
  is_active: boolean
}

export interface Round {
  id: UUID
  tournament_id: UUID
  number: number
  name: string | null
  start_date: string | null
  end_date: string | null
  bye_team_id: UUID | null
}

export interface Match {
  id: UUID
  tournament_id: UUID
  round_id: UUID | null
  home_team_id: UUID
  away_team_id: UUID
  scheduled_at: string | null
  venue: string | null
  status: MatchStatus
  home_score: number | null
  away_score: number | null
  winner_team_id: UUID | null
  notes: string | null
}

export interface StandingRow {
  position: number
  team: Pick<Team, 'id' | 'name' | 'logo_url'>
  played: number
  won: number
  lost: number
  points_for: number
  points_against: number
  point_difference: number
  points: number
  adjustment_points: number
  adjustment_reasons: string[]
}

export interface PlayerStat {
  player_id: UUID
  attended: boolean
  touchdowns: number
  td_passes: number
  interceptions: number
  sacks: number
  tackles: number
}

export interface PlayerStatTotals extends Omit<PlayerStat, 'attended'> {
  games_attended: number
}

export interface PlayerStatLeader extends PlayerStatTotals {
  player: Pick<Player, 'id' | 'full_name' | 'jersey_number'>
  team: Pick<Team, 'id' | 'name' | 'logo_url'>
}

/** Totales de un jugador en un torneo concreto (carrera, RF-19). */
export interface PlayerStatByTournament extends PlayerStatTotals {
  tournament: Pick<Tournament, 'id' | 'name' | 'season'>
  team_id: UUID
}

/** Un renglón del historial de un club (RF-17b). */
export interface ClubHistoryRow {
  tournament: Pick<Tournament, 'id' | 'name' | 'season'>
  team_id: UUID
  standing: Pick<StandingRow, 'position' | 'won' | 'lost' | 'points'>
  teams_count: number
}

export interface FinanceSummaryRow {
  team: Pick<Team, 'id' | 'name' | 'logo_url'>
  registration_fees: string
  fines: string
  other_charges: string
  total_charges: string
  payments: string
  balance: string
}

export interface FinanceSummary {
  rows: FinanceSummaryRow[]
  total_charges: string
  total_payments: string
  total_balance: string
}

export interface FinanceMovement {
  id: UUID
  team_id: UUID
  type: FinanceMovementType
  amount: string
  description: string | null
  occurred_on: string
  match_id: UUID | null
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user_id: UUID
}
