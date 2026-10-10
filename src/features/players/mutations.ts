import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Player } from '@/types/api'
import { clubKeys } from '@/features/clubs/queries'

export interface PlayerInput {
  full_name: string
  jersey_number?: number | null
  birth_date?: string | null
}

/** RF-41: la plantilla es del club. */
export function useCreatePlayer(clubId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: PlayerInput) =>
      api.post<Player>(`/clubs/${clubId}/players`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: clubKeys.players(clubId) }),
    meta: { successMessage: 'Jugador agregado' },
  })
}

export function useUpdatePlayer(clubId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: Partial<PlayerInput & { is_active: boolean }>
    }) => api.patch<Player>(`/players/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: clubKeys.players(clubId) }),
    meta: { successMessage: 'Jugador actualizado' },
  })
}

export function useDeletePlayer(clubId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/players/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: clubKeys.players(clubId) }),
    meta: { successMessage: 'Jugador eliminado' },
  })
}

/** RF-41: transferir un jugador a otro club (solo admin). */
export function useTransferPlayer(fromClubId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, clubId }: { id: string; clubId: string }) =>
      api.patch<Player>(`/players/${id}`, { club_id: clubId }),
    onSuccess: (_data, { clubId }) => {
      qc.invalidateQueries({ queryKey: clubKeys.players(fromClubId) })
      qc.invalidateQueries({ queryKey: clubKeys.players(clubId) })
    },
    meta: { successMessage: 'Jugador transferido' },
  })
}
