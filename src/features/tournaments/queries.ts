import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Tournament, TournamentStatus } from '@/types/api'

export const tournamentKeys = {
  all: ['tournaments'] as const,
  // 'list'/'detail' namespaces para no solaparse con los sub-recursos
  // anidados (['tournaments', <id>, 'standings'|'matches'|...]).
  lists: ['tournaments', 'list'] as const,
  list: (status?: TournamentStatus) => ['tournaments', 'list', { status }] as const,
  detail: (id: string) => ['tournaments', 'detail', id] as const,
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
