import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ClubInvite, Player } from '@/types/api'

/** El coach (o admin) genera un link de invitación de 24 h. */
export function useCreateInvite(clubId: string) {
  return useMutation({
    mutationFn: () => api.post<ClubInvite>(`/clubs/${clubId}/invites`),
    meta: { successMessage: 'Invitación generada' },
  })
}

export interface SelfRegisterInput {
  full_name: string
  jersey_number?: number | null
}

/** Un jugador se da de alta con el token (público). */
export function useRedeemInvite(token: string) {
  return useMutation({
    mutationFn: (input: SelfRegisterInput) =>
      api.post<Player>(`/invites/${token}/players`, input, { auth: false }),
    meta: { successMessage: 'Registro completado' },
  })
}
