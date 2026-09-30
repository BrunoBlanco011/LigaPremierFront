import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Round } from '@/types/api'

export interface GenerateScheduleInput {
  start_date?: string | null
  days_between_rounds?: number
  double_round?: boolean
  replace_existing?: boolean
}

export interface GenerateScheduleResult {
  rounds_created: number
  matches_created: number
}

/** RF-23: generar rol de juegos (todos contra todos). */
export function useGenerateSchedule(tournamentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: GenerateScheduleInput) =>
      api.post<GenerateScheduleResult>(
        `/tournaments/${tournamentId}/schedule/generate`,
        input,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tournaments', tournamentId, 'rounds'] })
      qc.invalidateQueries({ queryKey: ['tournaments', tournamentId, 'matches'] })
    },
  })
}

export interface RoundInput {
  number: number
  name?: string | null
  start_date?: string | null
  end_date?: string | null
  bye_team_id?: string | null
}

export function useCreateRound(tournamentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: RoundInput) =>
      api.post<Round>(`/tournaments/${tournamentId}/rounds`, input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['tournaments', tournamentId, 'rounds'] }),
  })
}

export function useDeleteRound(tournamentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (roundId: string) => api.del<void>(`/rounds/${roundId}`),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['tournaments', tournamentId, 'rounds'] }),
  })
}
