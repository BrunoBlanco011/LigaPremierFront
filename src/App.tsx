import { Navigate, Route, Routes } from 'react-router-dom'
import { PublicLayout } from '@/components/templates/PublicLayout'
import { AdminLayout } from '@/components/templates/AdminLayout'
import { CoachLayout } from '@/components/templates/CoachLayout'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import { useRealtimeUpdates } from '@/lib/realtime'

import { HomePage } from '@/pages/public/HomePage'
import { TournamentPage } from '@/pages/public/TournamentPage'
import { StandingsTab } from '@/pages/public/tabs/StandingsTab'
import { ScheduleTab } from '@/pages/public/tabs/ScheduleTab'
import { ResultsTab } from '@/pages/public/tabs/ResultsTab'
import { TeamsTab } from '@/pages/public/tabs/TeamsTab'
import { StatsTab } from '@/pages/public/tabs/StatsTab'
import { MatchDetailPage } from '@/pages/public/MatchDetailPage'
import { TournamentTeamPage } from '@/pages/public/TournamentTeamPage'
import { ClubsPage } from '@/pages/public/ClubsPage'
import { ClubProfilePage } from '@/pages/public/ClubProfilePage'
import { PlayerProfilePage } from '@/pages/public/PlayerProfilePage'
import { JoinTeamPage } from '@/pages/public/JoinTeamPage'
import { LoginPage } from '@/pages/auth/LoginPage'

import { AdminTournamentsPage } from '@/pages/admin/AdminTournamentsPage'
import { AdminTournamentDetailPage } from '@/pages/admin/AdminTournamentDetailPage'
import { AdminClubsPage } from '@/pages/admin/AdminClubsPage'
import { AdminClubPlayersPage } from '@/pages/admin/AdminClubPlayersPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { CoachHomePage } from '@/pages/coach/CoachHomePage'
import { CoachRosterPage } from '@/pages/coach/CoachRosterPage'

export default function App() {
  // Refresca lo que esté en pantalla cuando alguien cambia datos (WebSocket)
  useRealtimeUpdates()

  return (
    <Routes>
      {/* Sitio público */}
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="clubes" element={<ClubsPage />} />
        <Route path="clubes/:id" element={<ClubProfilePage />} />
        <Route path="torneos/:id/partidos/:mid" element={<MatchDetailPage />} />
        <Route path="torneos/:id/equipos/:teamId" element={<TournamentTeamPage />} />
        <Route path="torneos/:id" element={<TournamentPage />}>
          <Route index element={<StandingsTab />} />
          <Route path="rol" element={<ScheduleTab />} />
          <Route path="resultados" element={<ResultsTab />} />
          <Route path="equipos" element={<TeamsTab />} />
          <Route path="estadisticas" element={<StatsTab />} />
        </Route>
        <Route path="jugadores/:id" element={<PlayerProfilePage />} />
      </Route>

      {/* Autenticación y auto-registro por link */}
      <Route path="login" element={<LoginPage />} />
      <Route path="unirse/:token" element={<JoinTeamPage />} />

      {/* Panel admin */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="torneos" replace />} />
          <Route path="torneos" element={<AdminTournamentsPage />} />
          <Route path="torneos/:id/*" element={<AdminTournamentDetailPage />} />
          <Route path="clubes" element={<AdminClubsPage />} />
          <Route path="clubes/:id/jugadores" element={<AdminClubPlayersPage />} />
          <Route path="usuarios" element={<AdminUsersPage />} />
        </Route>
      </Route>

      {/* Panel coach */}
      <Route element={<ProtectedRoute role="coach" />}>
        <Route path="coach" element={<CoachLayout />}>
          <Route index element={<CoachHomePage />} />
          <Route path="clubes/:id" element={<CoachRosterPage />} />
        </Route>
      </Route>

      {/* 404 → inicio */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
