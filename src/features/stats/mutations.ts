import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PlayerStat } from '@/types/api'

/** RF-28: guarda (crea o reemplaza) las estadísticas de los jugadores enviados. */
export function usePutMatchStats(matchId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (rows: PlayerStat[]) => {
      // El GET de stats trae campos extra (p. ej. `id`) que el PUT rechaza
      // ("Extra inputs are not permitted"): enviamos solo la forma declarada.
      const payload = rows.map(
        ({
          player_id,
          attended,
          touchdowns,
          td_passes,
          interceptions,
          sacks,
          tackles,
        }): PlayerStat => ({
          player_id,
          attended,
          touchdowns,
          td_passes,
          interceptions,
          sacks,
          tackles,
        }),
      )
      return api.put<PlayerStat[]>(`/matches/${matchId}/stats`, payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['matches', matchId, 'stats'] })
    },
    meta: { successMessage: 'Estadísticas guardadas' },
  })
}
