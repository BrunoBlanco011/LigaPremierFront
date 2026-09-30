import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Club } from '@/types/api'

/** RF-40: clubes donde el coach está asignado. */
export function useMyClubs() {
  return useQuery({
    queryKey: ['me', 'clubs'],
    queryFn: () => api.get<Club[]>('/me/clubs'),
  })
}
