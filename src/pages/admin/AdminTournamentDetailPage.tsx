import { Route, Routes, useParams } from 'react-router-dom'
import { useTournament } from '@/features/tournaments/queries'
import { InscriptionPanel } from '@/components/organisms/InscriptionPanel'
import { TabNav } from '@/components/organisms/TabNav'
import type { TabItem } from '@/components/organisms/TabNav'
import { Placeholder } from '@/components/molecules/Placeholder'
import { ErrorState, LoadingState } from '@/components/molecules/StateView'

/**
 * Detalle del torneo en admin. La pestaña "Equipos" ya inscribe clubes (RF-22b).
 * Rol, partidos, tabla y finanzas (RF-23..31) llegan en incrementos siguientes.
 */
export function AdminTournamentDetailPage() {
  const { id = '' } = useParams()
  const tournament = useTournament(id)

  const base = `/admin/torneos/${id}`
  const tabs: TabItem[] = [
    { to: base, label: 'Resumen', end: true },
    { to: `${base}/equipos`, label: 'Equipos' },
    { to: `${base}/rol-de-juegos`, label: 'Rol de juegos' },
    { to: `${base}/partidos`, label: 'Partidos' },
    { to: `${base}/tabla`, label: 'Tabla' },
    { to: `${base}/finanzas`, label: 'Finanzas' },
  ]

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
          <Route index element={<Placeholder title="Resumen del torneo" rf="RF-11" />} />
          <Route path="equipos" element={<InscriptionPanel tournamentId={id} />} />
          <Route path="rol-de-juegos" element={<Placeholder title="Rol de juegos" rf="RF-23 / RF-24" />} />
          <Route path="partidos" element={<Placeholder title="Partidos y resultados" rf="RF-25 / RF-26" />} />
          <Route path="tabla" element={<Placeholder title="Tabla y ajustes" rf="RF-27" />} />
          <Route path="finanzas" element={<Placeholder title="Finanzas" rf="RF-29 a RF-31" />} />
        </Routes>
      </div>
    </>
  )
}
