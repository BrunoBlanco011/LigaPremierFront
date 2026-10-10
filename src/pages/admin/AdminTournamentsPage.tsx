import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { Tournament } from '@/types/api'
import { useTournaments } from '@/features/tournaments/queries'
import { useDeleteTournament } from '@/features/tournaments/mutations'
import { TournamentForm } from '@/components/organisms/TournamentForm'
import { TournamentStatusPill } from '@/components/molecules/StatusPill'
import { Button } from '@/components/atoms/Button'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/molecules/StateView'
import { useConfirmMutate } from '@/components/molecules/ConfirmDialog'
import { formatDate } from '@/lib/format'
import { usePageTitle } from '@/lib/usePageTitle'

export function AdminTournamentsPage() {
  usePageTitle('Torneos · Admin')
  const tournaments = useTournaments()
  const del = useDeleteTournament()
  const confirmMutate = useConfirmMutate()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Tournament | undefined>(undefined)

  const openCreate = () => {
    setEditing(undefined)
    setFormOpen(true)
  }
  const openEdit = (t: Tournament) => {
    setEditing(t)
    setFormOpen(true)
  }

  const onDelete = (t: Tournament) =>
    confirmMutate(
      `¿Eliminar "${t.name}"?\n\nEsto borra en cascada las inscripciones, jornadas, ` +
        `partidos, estadísticas y finanzas del torneo. Los clubes y sus jugadores se ` +
        `conservan. Considera cambiar el estado a "Cancelado" o "Finalizado" en su lugar.`,
      del,
      t.id,
      { confirmLabel: 'Eliminar torneo' },
    )

  return (
    <>
      <div className="dash__topbar">
        <div>
          <p className="eyebrow">Administración</p>
          <h1 className="page__title" style={{ fontSize: 30 }}>Torneos</h1>
        </div>
        <Button variant="flag" onClick={openCreate}>
          <Plus size={16} /> Nuevo torneo
        </Button>
      </div>

      {tournaments.isLoading ? (
        <LoadingState />
      ) : tournaments.isError ? (
        <ErrorState error={tournaments.error} onRetry={() => tournaments.refetch()} />
      ) : !tournaments.data || tournaments.data.length === 0 ? (
        <EmptyState
          title="Sin torneos"
          message="Crea el primer torneo para empezar."
          action={
            <Button variant="flag" onClick={openCreate}>
              <Plus size={16} /> Nuevo torneo
            </Button>
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Torneo</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
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
                  <td>{formatDate(t.start_date)}</td>
                  <td>{formatDate(t.end_date)}</td>
                  <td><TournamentStatusPill status={t.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="outline" onClick={() => openEdit(t)}>
                        <Pencil size={14} /> Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(t)}
                        disabled={del.isPending}
                        aria-label={`Eliminar ${t.name}`}
                      >
                        <Trash2 size={14} color="var(--loss)" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <TournamentForm
          tournament={editing}
          onClose={() => setFormOpen(false)}
        />
      )}
    </>
  )
}
