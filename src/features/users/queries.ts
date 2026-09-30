import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { User, UserRole } from '@/types/api'

export function useUsers(role?: UserRole) {
  return useQuery({
    queryKey: ['users', { role }],
    queryFn: () => api.get<User[]>('/users', { query: { role } }),
  })
}

/** Selector de coaches para asignar a un club (RF-21). */
export function useCoaches() {
  return useUsers('coach')
}
