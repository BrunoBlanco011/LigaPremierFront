import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Team } from '@/types/api'

/** RF-40: equipos donde el coach está asignado. */
export function useMyTeams() {
  return useQuery({
    queryKey: ['me', 'teams'],
    queryFn: () => api.get<Team[]>('/me/teams'),
  })
}
