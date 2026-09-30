import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { StandingRow } from '@/types/api'

export function useStandings(tournamentId: string) {
  return useQuery({
    queryKey: ['tournaments', tournamentId, 'standings'],
    queryFn: () =>
      api.get<StandingRow[]>(`/tournaments/${tournamentId}/standings`),
    enabled: Boolean(tournamentId),
  })
}
