import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Tournament, TournamentStatus } from '@/types/api'

export const tournamentKeys = {
  all: ['tournaments'] as const,
  list: (status?: TournamentStatus) => ['tournaments', { status }] as const,
  detail: (id: string) => ['tournaments', id] as const,
}

export function useTournaments(status?: TournamentStatus) {
  return useQuery({
    queryKey: tournamentKeys.list(status),
    queryFn: () =>
      api.get<Tournament[]>('/tournaments', {
        query: { status },
      }),
  })
}

export function useTournament(id: string) {
  return useQuery({
    queryKey: tournamentKeys.detail(id),
    queryFn: () => api.get<Tournament>(`/tournaments/${id}`),
    enabled: Boolean(id),
  })
}
