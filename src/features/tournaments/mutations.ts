import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Tournament } from '@/types/api'
import { tournamentKeys } from './queries'

export interface TournamentInput {
  name: string
  season?: string | null
  category?: string | null
  description?: string | null
  start_date?: string | null
  end_date?: string | null
  status?: Tournament['status']
  points_win?: number
  points_loss?: number
}

export function useCreateTournament() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: TournamentInput) =>
      api.post<Tournament>('/tournaments', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: tournamentKeys.lists }),
  })
}

export function useUpdateTournament(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<TournamentInput>) =>
      api.patch<Tournament>(`/tournaments/${id}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tournamentKeys.lists })
      qc.invalidateQueries({ queryKey: tournamentKeys.detail(id) })
    },
  })
}

export function useDeleteTournament() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/tournaments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: tournamentKeys.lists }),
  })
}
