import { useState } from 'react'
import { UserPlus, Pencil, UserMinus, UserCheck, Trash2 } from 'lucide-react'
import type { Player } from '@/types/api'
import { useTeamPlayers } from '@/features/teams/queries'
import {
  useDeletePlayer,
  useUpdatePlayer,
} from '@/features/players/mutations'
import { PlayerForm } from '@/components/organisms/PlayerForm'
import { Button } from '@/components/atoms/Button'
import { Badge } from '@/components/atoms/Badge'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/molecules/StateView'
import { friendlyMessage } from '@/lib/errors'

/** Gestión de roster (RF-41): alta, edición, baja y eliminación. */
export function RosterManager({ teamId }: { teamId: string }) {
  const players = useTeamPlayers(teamId)
  const update = useUpdatePlayer(teamId)
  const del = useDeletePlayer(teamId)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Player | undefined>(undefined)
  const [showInactive, setShowInactive] = useState(false)

  const roster = (players.data ?? []).filter((p) => showInactive || p.is_active)

  const deactivate = (p: Player) =>
    update.mutate(
      { id: p.id, input: { is_active: !p.is_active } },
      { onError: (e) => window.alert(friendlyMessage(e)) },
    )

  const remove = (p: Player) => {
    const ok = window.confirm(
      `¿Eliminar a ${p.full_name}?\n\nSe borran también todas sus estadísticas. ` +
        `Si solo quieres liberarlo, usa "Dar de baja".`,
    )
    if (ok) del.mutate(p.id, { onError: (e) => window.alert(friendlyMessage(e)) })
  }

  return (
    <>
      <div className="dash__topbar" style={{ marginBottom: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          Mostrar dados de baja
        </label>
        <Button
          variant="flag"
          onClick={() => {
            setEditing(undefined)
            setFormOpen(true)
          }}
        >
          <UserPlus size={16} /> Agregar jugador
        </Button>
      </div>

      {players.isLoading ? (
        <LoadingState />
      ) : players.isError ? (
        <ErrorState error={players.error} onRetry={() => players.refetch()} />
      ) : roster.length === 0 ? (
        <EmptyState title="Sin jugadores" message="Agrega el primer jugador a tu roster." />
      ) : (
        <div className="table-wrap">
          <table className="table tnum">
            <thead>
              <tr>
                <th className="num">#</th>
                <th>Jugador</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {roster.map((p) => (
                <tr key={p.id} style={{ opacity: p.is_active ? 1 : 0.55 }}>
                  <td className="num">{p.jersey_number ?? '—'}</td>
                  <td style={{ fontWeight: 600 }}>{p.full_name}</td>
                  <td>
                    {p.is_active ? (
                      <Badge tone="win">Activo</Badge>
                    ) : (
                      <Badge tone="muted">Baja</Badge>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditing(p)
                          setFormOpen(true)
                        }}
                      >
                        <Pencil size={14} /> Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deactivate(p)}
                        disabled={update.isPending}
                        title={p.is_active ? 'Dar de baja' : 'Reactivar'}
                      >
                        {p.is_active ? <UserMinus size={14} /> : <UserCheck size={14} />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => remove(p)}
                        disabled={del.isPending}
                        aria-label={`Eliminar ${p.full_name}`}
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
        <PlayerForm
          teamId={teamId}
          player={editing}
          onClose={() => setFormOpen(false)}
        />
      )}
    </>
  )
}
