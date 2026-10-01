import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { InviteInfo } from '@/types/api'

/** Datos del club de una invitación (página pública de auto-registro). */
export function useInvite(token: string) {
  return useQuery({
    queryKey: ['invites', token],
    queryFn: () => api.get<InviteInfo>(`/invites/${token}`, { auth: false }),
    enabled: Boolean(token),
    retry: false,
  })
}
