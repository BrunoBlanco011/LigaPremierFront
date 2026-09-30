import { useParams } from 'react-router-dom'
import { useTournament } from '@/features/tournaments/queries'
import { TabNav } from '@/components/organisms/TabNav'
import type { TabItem } from '@/components/organisms/TabNav'
import { Placeholder } from '@/components/molecules/Placeholder'
import { ErrorState, LoadingState } from '@/components/molecules/StateView'

/**
 * Resumen del torneo en admin. Las subsecciones (equipos, rol, partidos,
 * tabla, finanzas — RF-21..31) se implementan en el siguiente incremento;
 * aquí queda la navegación y el marco listos.
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
        <Placeholder title="Gestión del torneo" rf="RF-21 a RF-31" />
      </div>
    </>
  )
}
