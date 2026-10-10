import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { User, UserRole } from '@/types/api'

export interface UserInput {
  email: string
  password: string
  full_name: string
  role: UserRole
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UserInput) => api.post<User>('/users', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
    meta: { successMessage: 'Usuario creado' },
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
    meta: { successMessage: 'Usuario eliminado' },
  })
}
