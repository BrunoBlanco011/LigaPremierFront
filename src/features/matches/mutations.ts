import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, saveFile } from '@/lib/api'
import type { Match, MatchStatus } from '@/types/api'

export interface MatchInput {
  home_team_id: string
  away_team_id: string
  round_id?: string | null
  scheduled_at?: string | null
  venue?: string | null
  status?: MatchStatus
  notes?: string | null
}

function invalidate(qc: ReturnType<typeof useQueryClient>, tournamentId: string) {
  qc.invalidateQueries({ queryKey: ['tournaments', tournamentId, 'matches'] })
  qc.invalidateQueries({ queryKey: ['tournaments', tournamentId, 'standings'] })
}

export function useCreateMatch(tournamentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: MatchInput) =>
      api.post<Match>(`/tournaments/${tournamentId}/matches`, input),
    onSuccess: () => invalidate(qc, tournamentId),
    meta: { successMessage: 'Partido creado' },
  })
}

export function useUpdateMatch(tournamentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<MatchInput> }) =>
      api.patch<Match>(`/matches/${id}`, input),
    onSuccess: () => invalidate(qc, tournamentId),
    meta: { successMessage: 'Partido actualizado' },
  })
}

export function useDeleteMatch(tournamentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/matches/${id}`),
    onSuccess: () => invalidate(qc, tournamentId),
    meta: { successMessage: 'Partido eliminado' },
  })
}

/** RF-26: capturar resultado normal (sin empates). */
export function useSaveResult(tournamentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      home_score,
      away_score,
    }: {
      id: string
      home_score: number
      away_score: number
    }) => api.put<Match>(`/matches/${id}/result`, { home_score, away_score }),
    onSuccess: () => invalidate(qc, tournamentId),
    meta: { successMessage: 'Resultado guardado' },
  })
}

/** RF-26: forfeit (el sistema fija 21-0). */
export function useForfeit(tournamentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, loserTeamId }: { id: string; loserTeamId: string }) =>
      api.put<Match>(`/matches/${id}/result`, {
        status: 'forfeit',
        forfeit_loser_team_id: loserTeamId,
      }),
    onSuccess: () => invalidate(qc, tournamentId),
    meta: { successMessage: 'Forfeit registrado' },
  })
}

/** Descarga la cédula de referees (Excel) con la plantilla de jugadores de ambos equipos. */
export function useDownloadRefereeSheet() {
  return useMutation({
    mutationFn: async (matchId: string) =>
      saveFile(await api.download(`/matches/${matchId}/referee-sheet`), 'cedula.xlsx'),
  })
}
