import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PlayerTotals } from '@/types/api'

export type LeaderSort =
  | 'touchdowns'
  | 'td_passes'
  | 'interceptions'
  | 'sacks'
  | 'tackles'
  | 'games_attended'

export const LEADER_LABELS: Record<LeaderSort, string> = {
  touchdowns: 'Anotaciones',
  td_passes: 'Pases de anotación',
  interceptions: 'Intercepciones',
  sacks: 'Capturas',
  tackles: 'Tackles',
  games_attended: 'Asistencia',
}

/** Acumulado de todos los jugadores del torneo (para armar los líderes de cada categoría). */
export function useTournamentPlayerStats(tournamentId: string) {
  return useQuery({
    queryKey: ['tournaments', tournamentId, 'player-stats'],
    queryFn: () =>
      api.get<PlayerTotals[]>(`/tournaments/${tournamentId}/player-stats`),
    enabled: Boolean(tournamentId),
  })
}

/** Acumulado del torneo de cada jugador de un equipo (inscripción). */
export function useTeamPlayerStats(tournamentId: string, teamId: string) {
  return useQuery({
    queryKey: ['tournaments', tournamentId, 'player-stats', teamId],
    queryFn: () =>
      api.get<PlayerTotals[]>(
        `/tournaments/${tournamentId}/player-stats`,
        { query: { team_id: teamId } },
      ),
    enabled: Boolean(tournamentId && teamId),
  })
}
