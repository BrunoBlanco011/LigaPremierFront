import { useState } from 'react'
import { UserPlus, Pencil, UserMinus, UserCheck, Trash2 } from 'lucide-react'
import type { Player } from '@/types/api'
import { useClubPlayers } from '@/features/clubs/queries'
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
import { ActionMenu, type ActionItem } from '@/components/molecules/ActionMenu'
import { alertOnError } from '@/lib/mutationHelpers'
import { useConfirmMutate } from '@/components/molecules/ConfirmDialog'

/** Gestión de plantilla del club (RF-41): alta, edición, baja y eliminación.
 *  `extraMenuItems` inyecta acciones adicionales al menú (ej. transferir, solo admin). */
export function RosterManager({
  clubId,
  extraMenuItems,
}: {
  clubId: string
  extraMenuItems?: (player: Player) => ActionItem[]
}) {
  const players = useClubPlayers(clubId)
  const update = useUpdatePlayer(clubId)
  const del = useDeletePlayer(clubId)
  const confirmMutate = useConfirmMutate()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Player | undefined>(undefined)
  const [showInactive, setShowInactive] = useState(false)

  const roster = (players.data ?? []).filter((p) => showInactive || p.is_active)

  const deactivate = (p: Player) =>
    update.mutate(
      { id: p.id, input: { is_active: !p.is_active } },
      { onError: alertOnError },
    )

  const remove = (p: Player) =>
    confirmMutate(
      `¿Eliminar a ${p.full_name}?\n\nSe borran también todas sus estadísticas. ` +
        `Si solo quieres liberarlo, usa "Dar de baja".`,
      del,
      p.id,
      { confirmLabel: 'Eliminar jugador' },
    )

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
          variant="primary"
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
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
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
                      <ActionMenu
                        label={`Más acciones de ${p.full_name}`}
                        items={[
                          ...(extraMenuItems?.(p) ?? []),
                          {
                            label: p.is_active ? 'Dar de baja' : 'Reactivar',
                            icon: p.is_active ? <UserMinus size={14} /> : <UserCheck size={14} />,
                            onClick: () => deactivate(p),
                          },
                          {
                            label: 'Eliminar',
                            danger: true,
                            icon: <Trash2 size={14} />,
                            onClick: () => remove(p),
                          },
                        ]}
                      />
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
          clubId={clubId}
          player={editing}
          onClose={() => setFormOpen(false)}
        />
      )}
    </>
  )
}
