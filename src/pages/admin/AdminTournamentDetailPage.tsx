import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useTournament } from '@/features/tournaments/queries'
import { InscriptionPanel } from '@/components/organisms/InscriptionPanel'
import { SchedulePanel } from '@/components/organisms/SchedulePanel'
import { MatchesPanel } from '@/components/organisms/MatchesPanel'
import { StandingsAdminPanel } from '@/components/organisms/StandingsAdminPanel'
import { FinancePanel } from '@/components/organisms/FinancePanel'
import { StatSheetPage } from '@/pages/admin/StatSheetPage'
import { TabNav } from '@/components/organisms/TabNav'
import type { TabItem } from '@/components/organisms/TabNav'
import { ErrorState, LoadingState } from '@/components/molecules/StateView'
import { usePageTitle } from '@/lib/usePageTitle'

/**
 * Detalle del torneo en admin. La pestaña "Equipos" ya inscribe clubes (RF-22b).
 * Rol, partidos, tabla y finanzas (RF-23..31) llegan en incrementos siguientes.
 */
export function AdminTournamentDetailPage() {
  const { id = '' } = useParams()
  const tournament = useTournament(id)

  const base = `/admin/torneos/${id}`
  const tabs: TabItem[] = [
    { to: `${base}/equipos`, label: 'Equipos' },
    { to: `${base}/rol-de-juegos`, label: 'Rol de juegos' },
    { to: `${base}/partidos`, label: 'Partidos' },
    { to: `${base}/tabla`, label: 'Tabla' },
    { to: `${base}/finanzas`, label: 'Finanzas' },
  ]

  usePageTitle(tournament.data ? `${tournament.data.name} · Admin` : null)

  if (tournament.isLoading) return <LoadingState />
  if (tournament.isError || !tournament.data)
    return <ErrorState error={tournament.error} onRetry={() => tournament.refetch()} />

  return (
    <>
      <p className="eyebrow">Torneo</p>
      <h1 className="page__title" style={{ fontSize: 28, marginBottom: 16 }}>
        {tournament.data.name}
      </h1>
      <TabNav tabs={tabs} />
      <div style={{ marginTop: 24 }}>
        <Routes>
          <Route index element={<Navigate to="equipos" replace />} />
          <Route path="equipos" element={<InscriptionPanel tournamentId={id} />} />
          <Route path="rol-de-juegos" element={<SchedulePanel tournamentId={id} />} />
          <Route path="partidos" element={<MatchesPanel tournamentId={id} />} />
          <Route path="partidos/:mid/estadisticas" element={<StatSheetPage />} />
          <Route path="tabla" element={<StandingsAdminPanel tournamentId={id} />} />
          <Route path="finanzas" element={<FinancePanel tournamentId={id} />} />
          <Route path="*" element={<Navigate to={base} replace />} />
        </Routes>
      </div>
    </>
  )
}
