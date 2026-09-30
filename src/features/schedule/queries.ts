import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Match, MatchStatus, Round } from '@/types/api'

export function useRounds(tournamentId: string) {
  return useQuery({
    queryKey: ['tournaments', tournamentId, 'rounds'],
    queryFn: () => api.get<Round[]>(`/tournaments/${tournamentId}/rounds`),
    enabled: Boolean(tournamentId),
  })
}

interface MatchFilters {
  roundId?: string
  teamId?: string
  status?: MatchStatus
}

export function useMatches(tournamentId: string, filters: MatchFilters = {}) {
  return useQuery({
    queryKey: ['tournaments', tournamentId, 'matches', filters],
    queryFn: () =>
      api.get<Match[]>(`/tournaments/${tournamentId}/matches`, {
        query: {
          round_id: filters.roundId,
          team_id: filters.teamId,
          status: filters.status,
        },
      }),
    enabled: Boolean(tournamentId),
  })
}
