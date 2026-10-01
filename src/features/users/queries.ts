import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { User, UserRole } from '@/types/api'

export function useUsers(role?: UserRole, enabled = true) {
  return useQuery({
    queryKey: ['users', { role }],
    queryFn: () => api.get<User[]>('/users', { query: { role } }),
    enabled,
  })
}

/** Selector de coaches para asignar a un club (RF-21, solo admin). */
export function useCoaches(enabled = true) {
  return useUsers('coach', enabled)
}
