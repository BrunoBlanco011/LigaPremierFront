import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { FinanceMovement, FinanceMovementType } from '@/types/api'

function invalidate(qc: ReturnType<typeof useQueryClient>, tid: string) {
  qc.invalidateQueries({ queryKey: ['tournaments', tid, 'finance'] })
}

export interface RegistrationFeeInput {
  amount: number | string
  description?: string | null
  occurred_on?: string | null
}

/** RF-30: cargar inscripción a todos los equipos (sin duplicar). */
export function useChargeRegistration(tournamentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: RegistrationFeeInput) =>
      api.post(`/tournaments/${tournamentId}/finance/registration-fees`, input),
    onSuccess: () => invalidate(qc, tournamentId),
  })
}

export interface MovementInput {
  team_id: string
  type: FinanceMovementType
  amount: number | string
  description?: string | null
  occurred_on?: string | null
  match_id?: string | null
}

/** RF-31: registrar cargo o abono. */
export function useCreateMovement(tournamentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: MovementInput) =>
      api.post<FinanceMovement>(
        `/tournaments/${tournamentId}/finance/movements`,
        input,
      ),
    onSuccess: () => invalidate(qc, tournamentId),
  })
}

export function useDeleteMovement(tournamentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/finance/movements/${id}`),
    onSuccess: () => invalidate(qc, tournamentId),
  })
}
