import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Club, ClubHistoryRow, Player } from '@/types/api'

export const clubKeys = {
  all: ['clubs'] as const,
  detail: (id: string) => ['clubs', id] as const,
  players: (id: string) => ['clubs', id, 'players'] as const,
  history: (id: string) => ['clubs', id, 'history'] as const,
}

export function useClubs() {
  return useQuery({
    queryKey: clubKeys.all,
    queryFn: () => api.get<Club[]>('/clubs'),
  })
}

export function useClub(id: string) {
  return useQuery({
    queryKey: clubKeys.detail(id),
    queryFn: () => api.get<Club>(`/clubs/${id}`),
    enabled: Boolean(id),
  })
}

export function useClubPlayers(clubId: string) {
  return useQuery({
    queryKey: clubKeys.players(clubId),
    queryFn: () => api.get<Player[]>(`/clubs/${clubId}/players`),
    enabled: Boolean(clubId),
  })
}

export function useClubHistory(clubId: string) {
  return useQuery({
    queryKey: clubKeys.history(clubId),
    queryFn: () => api.get<ClubHistoryRow[]>(`/clubs/${clubId}/history`),
    enabled: Boolean(clubId),
  })
}
