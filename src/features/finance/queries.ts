import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { FinanceMovement, FinanceMovementType, FinanceSummary } from '@/types/api'

export function useFinanceSummary(tournamentId: string) {
  return useQuery({
    queryKey: ['tournaments', tournamentId, 'finance', 'summary'],
    queryFn: () =>
      api.get<FinanceSummary>(`/tournaments/${tournamentId}/finance/summary`),
    enabled: Boolean(tournamentId),
  })
}

export function useFinanceMovements(
  tournamentId: string,
  filters: { teamId?: string; type?: FinanceMovementType } = {},
) {
  return useQuery({
    queryKey: ['tournaments', tournamentId, 'finance', 'movements', filters],
    queryFn: () =>
      api.get<FinanceMovement[]>(`/tournaments/${tournamentId}/finance/movements`, {
        query: { team_id: filters.teamId, type: filters.type },
      }),
    enabled: Boolean(tournamentId),
  })
}
