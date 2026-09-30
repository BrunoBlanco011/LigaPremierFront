import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Match, PlayerStat } from '@/types/api'

export function useMatch(matchId: string) {
  return useQuery({
    queryKey: ['matches', matchId],
    queryFn: () => api.get<Match>(`/matches/${matchId}`),
    enabled: Boolean(matchId),
  })
}

export function useMatchStats(matchId: string) {
  return useQuery({
    queryKey: ['matches', matchId, 'stats'],
    queryFn: () => api.get<PlayerStat[]>(`/matches/${matchId}/stats`),
    enabled: Boolean(matchId),
  })
}
