import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { StandingAdjustment } from '@/types/api'

const adjKey = (tid: string) => ['tournaments', tid, 'adjustments']

export function useAdjustments(tournamentId: string) {
  return useQuery({
    queryKey: adjKey(tournamentId),
    queryFn: () =>
      api.get<StandingAdjustment[]>(
        `/tournaments/${tournamentId}/standings/adjustments`,
      ),
    enabled: Boolean(tournamentId),
  })
}

export interface AdjustmentInput {
  team_id: string
  points: number
  reason: string
}

function invalidate(qc: ReturnType<typeof useQueryClient>, tid: string) {
  qc.invalidateQueries({ queryKey: adjKey(tid) })
  qc.invalidateQueries({ queryKey: ['tournaments', tid, 'standings'] })
}

export function useCreateAdjustment(tournamentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: AdjustmentInput) =>
      api.post<StandingAdjustment>(
        `/tournaments/${tournamentId}/standings/adjustments`,
        input,
      ),
    onSuccess: () => invalidate(qc, tournamentId),
  })
}

export function useDeleteAdjustment(tournamentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/standing-adjustments/${id}`),
    onSuccess: () => invalidate(qc, tournamentId),
  })
}
