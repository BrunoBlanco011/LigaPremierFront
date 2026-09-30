import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Player, PlayerStat, PlayerStatTotals } from '@/types/api'

interface PlayerStatsResponse {
  totals: PlayerStatTotals
  matches: (PlayerStat & { match_id: string })[]
}

export function usePlayer(playerId: string) {
  return useQuery({
    queryKey: ['players', playerId],
    queryFn: () => api.get<Player>(`/players/${playerId}`),
    enabled: Boolean(playerId),
  })
}

export function usePlayerStats(playerId: string) {
  return useQuery({
    queryKey: ['players', playerId, 'stats'],
    queryFn: () => api.get<PlayerStatsResponse>(`/players/${playerId}/stats`),
    enabled: Boolean(playerId),
  })
}
