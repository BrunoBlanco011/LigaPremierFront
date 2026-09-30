import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Player } from '@/types/api'

export interface PlayerInput {
  full_name: string
  jersey_number?: number | null
}

export function useCreatePlayer(teamId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: PlayerInput) =>
      api.post<Player>(`/teams/${teamId}/players`, input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['teams', teamId, 'players'] }),
  })
}

export function useUpdatePlayer(teamId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<PlayerInput & { is_active: boolean }> }) =>
      api.patch<Player>(`/players/${id}`, input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['teams', teamId, 'players'] }),
  })
}

export function useDeletePlayer(teamId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/players/${id}`),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['teams', teamId, 'players'] }),
  })
}
