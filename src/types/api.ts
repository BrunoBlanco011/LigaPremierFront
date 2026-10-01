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
  forfeit_loser_team_id: UUID | null
  notes: string | null
  // El backend responde `MatchView`: incluye los equipos y la jornada embebidos.
  home_team?: Pick<Team, 'id' | 'name' | 'logo_url'> | null
  away_team?: Pick<Team, 'id' | 'name' | 'logo_url'> | null
  round?: { id: UUID; number: number; name: string | null } | null
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

/** Ajuste manual de puntos en la tabla (RF-27). */
export interface StandingAdjustment {
  id: UUID
  team_id: UUID
  points: number
  reason: string
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

/**
 * Acumulado de un jugador, forma **plana** del backend (`PlayerTotalsView`).
 * Se usa tanto para líderes (RF-18) como para los totales de carrera (RF-19).
 */
export interface PlayerTotals {
  player_id: UUID
  full_name: string
  jersey_number: number | null
  team_id: UUID | null
  team_name: string
  games_attended: number
  touchdowns: number
  td_passes: number
  interceptions: number
  sacks: number
  tackles: number
}

/** Totales de un jugador en un torneo concreto (carrera, RF-19 · `PlayerSeasonView`). */
export interface PlayerSeason {
  tournament_id: UUID
  tournament_name: string
  totals: PlayerTotals
}

/** Un renglón del historial de un club (RF-17b · `ClubSeason`). `standing` puede ser null. */
export interface ClubHistoryRow {
  tournament: Pick<Tournament, 'id' | 'name' | 'season'>
  team_id: UUID
  standing: Pick<StandingRow, 'position' | 'won' | 'lost' | 'points'> | null
  teams_count: number
}

/** Fila del estado de cuenta (`TeamBalanceView`). Montos como texto. */
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
  teams: FinanceSummaryRow[]
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

/** Invitación de club (link temporal de auto-registro). */
export interface ClubInvite {
  id: UUID
  club_id: UUID
  token: string
  expires_at: string
  created_by: UUID | null
}

/** Datos públicos de una invitación válida (página de auto-registro). */
export interface InviteInfo {
  club: Pick<Club, 'id' | 'name' | 'logo_url'>
  expires_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user_id: UUID
}
