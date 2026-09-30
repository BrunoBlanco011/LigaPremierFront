import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useTournaments } from '@/features/tournaments/queries'
import { TournamentStatusPill } from '@/components/molecules/StatusPill'
import { Button } from '@/components/atoms/Button'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/molecules/StateView'
import { formatDate } from '@/lib/format'

export function AdminTournamentsPage() {
  const tournaments = useTournaments()

  return (
    <>
      <div className="dash__topbar">
        <div>
          <p className="eyebrow">Administración</p>
          <h1 className="page__title" style={{ fontSize: 30 }}>Torneos</h1>
        </div>
        {/* RF-20: alta de torneo (formulario en el siguiente incremento) */}
        <Button variant="flag" disabled title="Próximo incremento">
          <Plus size={16} /> Nuevo torneo
        </Button>
      </div>

      {tournaments.isLoading ? (
        <LoadingState />
      ) : tournaments.isError ? (
        <ErrorState error={tournaments.error} onRetry={() => tournaments.refetch()} />
      ) : !tournaments.data || tournaments.data.length === 0 ? (
        <EmptyState title="Sin torneos" message="Crea el primer torneo para empezar." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Torneo</th>
                <th>Temporada</th>
                <th>Inicio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.data.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Link to={`/admin/torneos/${t.id}`} style={{ fontWeight: 600 }}>
                      {t.name}
                    </Link>
                  </td>
                  <td>{t.season ?? '—'}</td>
                  <td>{formatDate(t.start_date)}</td>
                  <td><TournamentStatusPill status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
