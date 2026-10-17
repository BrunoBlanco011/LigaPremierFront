import { Fragment, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Plus, CircleDollarSign, Pencil, Trash2 } from 'lucide-react'
import type { FinanceMovement, FinanceMovementType } from '@/types/api'
import { useFinanceMovements, useFinanceSummary } from '@/features/finance/queries'
import {
  useChargeRegistration,
  useCreateMovement,
  useDeleteMovement,
  useUpdateMovement,
} from '@/features/finance/mutations'
import { useTournamentTeams } from '@/features/teams/queries'
import { MoneyText } from '@/components/molecules/MoneyText'
import { TeamBadge } from '@/components/molecules/TeamBadge'
import { Modal } from '@/components/molecules/Modal'
import { FormField } from '@/components/molecules/FormField'
import { Label } from '@/components/atoms/Label'
import { Select } from '@/components/atoms/Select'
import { Button } from '@/components/atoms/Button'
import { useConfirmMutate } from '@/components/molecules/ConfirmDialog'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/molecules/StateView'
import { friendlyMessage } from '@/lib/errors'
import { formatDateShort, formatMoney } from '@/lib/format'

const MOVEMENT_TYPES: { value: FinanceMovementType; label: string }[] = [
  { value: 'payment', label: 'Abono' },
  { value: 'fine', label: 'Multa' },
  { value: 'other_charge', label: 'Otro cargo' },
  { value: 'registration_fee', label: 'Inscripción' },
]
const TYPE_LABEL = Object.fromEntries(MOVEMENT_TYPES.map((t) => [t.value, t.label])) as Record<FinanceMovementType, string>

const EMPTY_MOVEMENT = { team_id: '', type: 'payment' as FinanceMovementType, amount: '', description: '', occurred_on: '' }

// Fecha local (no UTC) para que no se adelante un día por la noche
const todayIso = () => new Date().toLocaleDateString('en-CA')

/** Estado de cuenta + movimientos del torneo (RF-29/30/31). */
export function FinancePanel({ tournamentId }: { tournamentId: string }) {
  const summary = useFinanceSummary(tournamentId)
  const teams = useTournamentTeams(tournamentId)
  const charge = useChargeRegistration(tournamentId)
  const create = useCreateMovement(tournamentId)
  const movements = useFinanceMovements(tournamentId)
  const update = useUpdateMovement(tournamentId)
  const remove = useDeleteMovement(tournamentId)
  const confirmMutate = useConfirmMutate()

  const [regOpen, setRegOpen] = useState(false)
  const [regAmount, setRegAmount] = useState('')
  const [movOpen, setMovOpen] = useState(false)
  const [mov, setMov] = useState(EMPTY_MOVEMENT)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  // Movimientos de cada equipo, del más reciente al más antiguo
  const movementsByTeam = useMemo(() => {
    const map = new Map<string, FinanceMovement[]>()
    for (const m of movements.data ?? []) map.set(m.team_id, [...(map.get(m.team_id) ?? []), m])
    for (const list of map.values()) list.sort((a, b) => b.occurred_on.localeCompare(a.occurred_on))
    return map
  }, [movements.data])

  const toggle = (teamId: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(teamId)) next.delete(teamId)
      else next.add(teamId)
      return next
    })

  const openMovement = (teamId = '') => {
    setError(null)
    setEditingId(null)
    setMov({ ...EMPTY_MOVEMENT, team_id: teamId, occurred_on: todayIso() })
    setMovOpen(true)
  }

  const openEdit = (m: FinanceMovement) => {
    setError(null)
    setEditingId(m.id)
    setMov({
      team_id: m.team_id,
      type: m.type,
      amount: m.amount,
      description: m.description ?? '',
      occurred_on: m.occurred_on,
    })
    setMovOpen(true)
  }

  const submitRegistration = () => {
    setError(null)
    if (!regAmount) return setError('Indica el monto de inscripción.')
    charge.mutate(
      { amount: regAmount },
      { onSuccess: () => { setRegOpen(false); setRegAmount('') }, onError: (e) => setError(friendlyMessage(e)) },
    )
  }

  const submitMovement = () => {
    setError(null)
    if (!mov.team_id || !mov.amount || !mov.occurred_on) return setError('Completa equipo, monto y fecha.')
    const fields = {
      type: mov.type,
      amount: mov.amount,
      description: mov.description.trim() || null,
      occurred_on: mov.occurred_on,
    }
    const callbacks = {
      onSuccess: () => { setMovOpen(false); setMov(EMPTY_MOVEMENT); setEditingId(null) },
      onError: (e: unknown) => setError(friendlyMessage(e)),
    }
    if (editingId) update.mutate({ id: editingId, ...fields }, callbacks)
    else create.mutate({ team_id: mov.team_id, ...fields }, callbacks)
  }
  const saving = create.isPending || update.isPending

  return (
    <>
      <div className="dash__topbar" style={{ marginBottom: 16 }}>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
          Inscripción + multas + otros cargos − abonos = adeudo.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="outline" onClick={() => setRegOpen(true)}>
            <CircleDollarSign size={16} /> Cargar inscripción
          </Button>
          <Button variant="primary" onClick={() => openMovement()}>
            <Plus size={16} /> Movimiento
          </Button>
        </div>
      </div>

      {summary.isLoading ? (
        <LoadingState />
      ) : summary.isError ? (
        <ErrorState error={summary.error} onRetry={() => summary.refetch()} />
      ) : !summary.data || summary.data.teams.length === 0 ? (
        <EmptyState title="Sin datos financieros" message="Carga la inscripción para empezar." />
      ) : (
        <div className="table-wrap">
          <table className="table tnum">
            <thead>
              <tr>
                <th>Equipo</th>
                <th className="num">Inscripción</th>
                <th className="num">Multas</th>
                <th className="num">Otros</th>
                <th className="num">Total de cargos</th>
                <th className="num">Abonos</th>
                <th className="num">Adeudo</th>
              </tr>
            </thead>
            <tbody>
              {[...summary.data.teams]
                .sort((a, b) => Number(b.balance) - Number(a.balance))
                .map((r) => {
                  const open = expanded.has(r.team.id)
                  const list = movementsByTeam.get(r.team.id) ?? []
                  return (
                    <Fragment key={r.team.id}>
                      <tr>
                        <td>
                          <button
                            type="button"
                            className="fin-toggle"
                            aria-expanded={open}
                            aria-controls={`fin-mov-${r.team.id}`}
                            onClick={() => toggle(r.team.id)}
                          >
                            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            <TeamBadge name={r.team.name} logoUrl={r.team.logo_url} />
                          </button>
                        </td>
                        <td className="num"><MoneyText amount={r.registration_fees} /></td>
                        <td className="num"><MoneyText amount={r.fines} /></td>
                        <td className="num"><MoneyText amount={r.other_charges} /></td>
                        <td className="num"><MoneyText amount={r.total_charges} /></td>
                        <td className="num"><MoneyText amount={r.payments} /></td>
                        <td className="num"><MoneyText amount={r.balance} balance /></td>
                      </tr>
                      {open && (
                        <tr id={`fin-mov-${r.team.id}`} className="fin-detail">
                          <td colSpan={7}>
                            <div className="fin-detail__head">
                              <strong>Movimientos de {r.team.name}</strong>
                              <Button variant="outline" onClick={() => openMovement(r.team.id)}>
                                <Plus size={16} /> Movimiento
                              </Button>
                            </div>
                            {movements.isLoading ? (
                              <LoadingState />
                            ) : list.length === 0 ? (
                              <p className="fin-detail__empty">Sin movimientos registrados.</p>
                            ) : (
                              <table className="table tnum fin-detail__table">
                                <thead>
                                  <tr>
                                    <th>Fecha</th>
                                    <th>Tipo</th>
                                    <th>Descripción</th>
                                    <th className="num">Monto</th>
                                    <th aria-label="Acciones" />
                                  </tr>
                                </thead>
                                <tbody>
                                  {list.map((m) => (
                                    <tr key={m.id}>
                                      <td>{formatDateShort(m.occurred_on)}</td>
                                      <td>{TYPE_LABEL[m.type]}</td>
                                      <td>{m.description ?? '—'}</td>
                                      <td className="num">
                                        {m.type === 'payment' ? '− ' : ''}
                                        <MoneyText amount={m.amount} />
                                      </td>
                                      <td className="num fin-detail__actions">
                                        <Button
                                          variant="ghost"
                                          aria-label={`Editar ${TYPE_LABEL[m.type].toLowerCase()} de ${formatMoney(m.amount)}`}
                                          onClick={() => openEdit(m)}
                                        >
                                          <Pencil size={16} />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          aria-label={`Eliminar ${TYPE_LABEL[m.type].toLowerCase()} de ${formatMoney(m.amount)}`}
                                          onClick={() =>
                                            confirmMutate(
                                              `¿Eliminar este movimiento?\n\n${TYPE_LABEL[m.type]} de ${formatMoney(m.amount)} a ${r.team.name}.`,
                                              remove,
                                              m.id,
                                            )
                                          }
                                        >
                                          <Trash2 size={16} />
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* Cargar inscripción (RF-30) */}
      {regOpen && (
        <Modal title="Cargar inscripción a todos" onClose={() => setRegOpen(false)}>
          {error && <div className="login-card__error">{error}</div>}
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginBottom: 16 }}>
            Se cobra solo a los equipos que aún no la tienen (no duplica).
          </p>
          <FormField
            label="Monto (MXN)"
            type="number"
            min={0}
            step="0.01"
            value={regAmount}
            onChange={(e) => setRegAmount(e.target.value)}
          />
          <div className="modal__foot">
            <Button variant="ghost" onClick={() => setRegOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={submitRegistration} disabled={charge.isPending}>
              {charge.isPending ? 'Cargando…' : 'Cargar'}
            </Button>
          </div>
        </Modal>
      )}

      {/* Registrar movimiento (RF-31) */}
      {movOpen && (
        <Modal title={editingId ? 'Editar movimiento' : 'Registrar movimiento'} onClose={() => setMovOpen(false)}>
          {error && <div className="login-card__error">{error}</div>}
          <div className="field">
            <Label htmlFor="mov-team" required>Equipo</Label>
            <Select
              id="mov-team"
              value={mov.team_id}
              disabled={Boolean(editingId)}
              onChange={(e) => setMov({ ...mov, team_id: e.target.value })}
            >
              <option value="">Selecciona…</option>
              {teams.data?.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
          </div>
          <div className="field">
            <Label htmlFor="mov-type">Tipo</Label>
            <Select
              id="mov-type"
              value={mov.type}
              onChange={(e) => setMov({ ...mov, type: e.target.value as FinanceMovementType })}
            >
              {MOVEMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </div>
          <FormField
            label="Monto (MXN)"
            type="number"
            min={0}
            step="0.01"
            value={mov.amount}
            onChange={(e) => setMov({ ...mov, amount: e.target.value })}
          />
          <FormField
            label="Fecha"
            type="date"
            value={mov.occurred_on}
            onChange={(e) => setMov({ ...mov, occurred_on: e.target.value })}
          />
          <FormField
            label="Descripción"
            placeholder="Ej. Cambio de fecha, pierde por forfeit"
            value={mov.description}
            onChange={(e) => setMov({ ...mov, description: e.target.value })}
          />
          <div className="modal__foot">
            <Button variant="ghost" onClick={() => setMovOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={submitMovement} disabled={saving}>
              {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Registrar'}
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}
