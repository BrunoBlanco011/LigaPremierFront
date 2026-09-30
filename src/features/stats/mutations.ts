import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PlayerStat } from '@/types/api'

/** RF-28: guarda (crea o reemplaza) las estadísticas de los jugadores enviados. */
export function usePutMatchStats(matchId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (rows: PlayerStat[]) =>
      api.put<PlayerStat[]>(`/matches/${matchId}/stats`, rows),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['matches', matchId, 'stats'] })
    },
  })
}
