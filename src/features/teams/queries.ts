import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Player, Team } from '@/types/api'

export function useTournamentTeams(tournamentId: string) {
  return useQuery({
    queryKey: ['tournaments', tournamentId, 'teams'],
    queryFn: () => api.get<Team[]>(`/tournaments/${tournamentId}/teams`),
    enabled: Boolean(tournamentId),
  })
}

export function useTeam(teamId: string) {
  return useQuery({
    queryKey: ['teams', teamId],
    queryFn: () => api.get<Team>(`/teams/${teamId}`),
    enabled: Boolean(teamId),
  })
}

export function useTeamPlayers(teamId: string) {
  return useQuery({
    queryKey: ['teams', teamId, 'players'],
    queryFn: () => api.get<Player[]>(`/teams/${teamId}/players`),
    enabled: Boolean(teamId),
  })
}
