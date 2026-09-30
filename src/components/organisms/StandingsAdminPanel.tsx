import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useStandings } from '@/features/standings/queries'
import {
  useAdjustments,
  useCreateAdjustment,
  useDeleteAdjustment,
} from '@/features/standings/mutations'
import { useTournamentTeams } from '@/features/teams/queries'
import { StandingsTable } from '@/components/organisms/StandingsTable'
import { Modal } from '@/components/molecules/Modal'
import { FormField } from '@/components/molecules/FormField'
import { Label } from '@/components/atoms/Label'
import { Select } from '@/components/atoms/Select'
import { Button } from '@/components/atoms/Button'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/molecules/StateView'
import { friendlyMessage } from '@/lib/errors'

/** Tabla del admin con ajustes manuales de puntos (RF-27). */
export function StandingsAdminPanel({ tournamentId }: { tournamentId: string }) {
  const standings = useStandings(tournamentId)
  const adjustments = useAdjustments(tournamentId)
  const teams = useTournamentTeams(tournamentId)
  const create = useCreateAdjustment(tournamentId)
  const del = useDeleteAdjustment(tournamentId)

  const [open, setOpen] = useState(false)
  const [teamId, setTeamId] = useState('')
  const [points, setPoints] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const teamName = (id: string) =>
    teams.data?.find((t) => t.id === id)?.name ?? '—'

  const submit = () => {
    setError(null)
    if (!teamId || points === '' || !reason.trim()) {
      setError('Completa equipo, puntos y motivo.')
      return
    }
    create.mutate(
      { team_id: teamId, points: Number(points), reason: reason.trim() },
      {
        onSuccess: () => {
          setOpen(false)
          setTeamId('')
          setPoints('')
          setReason('')
        },
        onError: (e) => setError(friendlyMessage(e)),
      },
    )
  }

  return (
    <>
      {standings.isLoading ? (
        <LoadingState />
      ) : standings.isError ? (
        <ErrorState error={standings.error} onRetry={() => standings.refetch()} />
      ) : standings.data && standings.data.length > 0 ? (
        <StandingsTable rows={standings.data} tournamentId={tournamentId} />
      ) : (
        <EmptyState title="Aún no hay tabla" />
      )}

      <div className="dash__topbar" style={{ margin: '32px 0 12px' }}>
        <h2 style={{ fontSize: 20 }}>Ajustes manuales</h2>
        <Button variant="flag" size="sm" onClick={() => setOpen(true)}>
          <Plus size={14} /> Nuevo ajuste
        </Button>
      </div>

      {adjustments.isLoading ? (
        <LoadingState />
      ) : !adjustments.data || adjustments.data.length === 0 ? (
        <p className="round__bye">Sin ajustes. Se usan para sanciones o bonificaciones.</p>
      ) : (
        <div className="table-wrap">
          <table className="table tnum">
            <thead>
              <tr>
                <th>Equipo</th>
                <th className="num">Puntos</th>
                <th>Motivo</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {adjustments.data.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{teamName(a.team_id)}</td>
                  <td className="num" style={{ color: a.points < 0 ? 'var(--loss)' : 'var(--field)' }}>
                    {a.points > 0 ? `+${a.points}` : a.points}
                  </td>
                  <td style={{ fontWeight: 400 }}>{a.reason}</td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => del.mutate(a.id, { onError: (e) => window.alert(friendlyMessage(e)) })}
                        disabled={del.isPending}
                        aria-label="Eliminar ajuste"
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

      {open && (
        <Modal title="Nuevo ajuste de puntos" onClose={() => setOpen(false)}>
          {error && <div className="login-card__error">{error}</div>}
          <div className="field">
            <Label htmlFor="adj-team" required>Equipo</Label>
            <Select id="adj-team" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
              <option value="">Selecciona…</option>
              {teams.data?.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
          </div>
          <FormField
            label="Puntos (negativo resta, positivo suma)"
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
          />
          <FormField
            label="Motivo"
            required
            placeholder="Ej. Adeudo de arbitraje"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="modal__foot">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="flag" onClick={submit} disabled={create.isPending}>
              {create.isPending ? 'Guardando…' : 'Agregar ajuste'}
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}
