import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PlayerStatLeader } from '@/types/api'

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

export function useLeaders(
  tournamentId: string,
  sortBy: LeaderSort,
  limit = 10,
) {
  return useQuery({
    queryKey: ['tournaments', tournamentId, 'leaders', sortBy, limit],
    queryFn: () =>
      api.get<PlayerStatLeader[]>(
        `/tournaments/${tournamentId}/player-stats`,
        { query: { sort_by: sortBy, limit } },
      ),
    enabled: Boolean(tournamentId),
  })
}
