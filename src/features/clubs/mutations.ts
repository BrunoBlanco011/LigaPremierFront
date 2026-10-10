import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Club, Team } from '@/types/api'
import { clubKeys } from './queries'

export interface ClubInput {
  name: string
  coach_name?: string | null
  coach_user_id?: string | null
}

export function useCreateClub() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ClubInput) => api.post<Club>('/clubs', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: clubKeys.all }),
    meta: { successMessage: 'Club creado' },
  })
}

export function useUpdateClub(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<ClubInput>) =>
      api.patch<Club>(`/clubs/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: clubKeys.all }),
    meta: { successMessage: 'Club actualizado' },
  })
}

export function useDeleteClub() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/clubs/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: clubKeys.all }),
    meta: { successMessage: 'Club eliminado' },
  })
}

/** RF-22: sube el logo del club (multipart, campo `file`). */
export function useUploadClubLogo(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return api.upload<Club>(`/clubs/${id}/logo`, form)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clubKeys.all })
      qc.invalidateQueries({ queryKey: clubKeys.detail(id) })
    },
    meta: { successMessage: 'Logo actualizado' },
  })
}

/** RF-22b: inscribe clubes a un torneo. */
export function useEnrollClubs(tournamentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (clubIds: string[]) =>
      api.post<Team[]>(`/tournaments/${tournamentId}/teams`, {
        club_ids: clubIds,
      }),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ['tournaments', tournamentId, 'teams'],
      }),
    meta: { successMessage: 'Equipos inscritos' },
  })
}

/** RF-22b: da de baja una inscripción (borra en cascada lo de ese torneo). */
export function useRemoveEnrollment(tournamentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (teamId: string) => api.del<void>(`/teams/${teamId}`),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ['tournaments', tournamentId, 'teams'],
      }),
    meta: { successMessage: 'Inscripción cancelada' },
  })
}
