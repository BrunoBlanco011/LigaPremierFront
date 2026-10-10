import { useState } from 'react'
import { Plus, CircleDollarSign } from 'lucide-react'
import type { FinanceMovementType } from '@/types/api'
import { useFinanceSummary } from '@/features/finance/queries'
import {
  useChargeRegistration,
  useCreateMovement,
} from '@/features/finance/mutations'
import { useTournamentTeams } from '@/features/teams/queries'
import { MoneyText } from '@/components/molecules/MoneyText'
import { TeamBadge } from '@/components/molecules/TeamBadge'
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

const MOVEMENT_TYPES: { value: FinanceMovementType; label: string }[] = [
  { value: 'payment', label: 'Abono' },
  { value: 'fine', label: 'Multa' },
  { value: 'other_charge', label: 'Otro cargo' },
  { value: 'registration_fee', label: 'Inscripción' },
]

/** Estado de cuenta + movimientos del torneo (RF-29/30/31). */
export function FinancePanel({ tournamentId }: { tournamentId: string }) {
  const summary = useFinanceSummary(tournamentId)
  const teams = useTournamentTeams(tournamentId)
  const charge = useChargeRegistration(tournamentId)
  const create = useCreateMovement(tournamentId)

  const [regOpen, setRegOpen] = useState(false)
  const [regAmount, setRegAmount] = useState('')
  const [movOpen, setMovOpen] = useState(false)
  const [mov, setMov] = useState({ team_id: '', type: 'payment' as FinanceMovementType, amount: '', description: '' })
  const [error, setError] = useState<string | null>(null)

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
    if (!mov.team_id || !mov.amount) return setError('Completa equipo y monto.')
    create.mutate(
      {
        team_id: mov.team_id,
        type: mov.type,
        amount: mov.amount,
        description: mov.description.trim() || null,
      },
      {
        onSuccess: () => { setMovOpen(false); setMov({ team_id: '', type: 'payment', amount: '', description: '' }) },
        onError: (e) => setError(friendlyMessage(e)),
      },
    )
  }

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
          <Button variant="flag" onClick={() => setMovOpen(true)}>
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
                <th className="num">Cargos</th>
                <th className="num">Abonos</th>
                <th className="num">Adeudo</th>
              </tr>
            </thead>
            <tbody>
              {summary.data.teams.map((r) => (
                <tr key={r.team.id}>
                  <td><TeamBadge name={r.team.name} logoUrl={r.team.logo_url} /></td>
                  <td className="num"><MoneyText amount={r.registration_fees} /></td>
                  <td className="num"><MoneyText amount={r.fines} /></td>
                  <td className="num"><MoneyText amount={r.other_charges} /></td>
                  <td className="num"><MoneyText amount={r.total_charges} /></td>
                  <td className="num"><MoneyText amount={r.payments} /></td>
                  <td className="num"><MoneyText amount={r.balance} balance /></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: 700 }}>
                <td>Totales</td>
                <td colSpan={3} />
                <td className="num"><MoneyText amount={summary.data.total_charges} /></td>
                <td className="num"><MoneyText amount={summary.data.total_payments} /></td>
                <td className="num"><MoneyText amount={summary.data.total_balance} balance /></td>
              </tr>
            </tfoot>
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
            <Button variant="flag" onClick={submitRegistration} disabled={charge.isPending}>
              {charge.isPending ? 'Cargando…' : 'Cargar'}
            </Button>
          </div>
        </Modal>
      )}

      {/* Registrar movimiento (RF-31) */}
      {movOpen && (
        <Modal title="Registrar movimiento" onClose={() => setMovOpen(false)}>
          {error && <div className="login-card__error">{error}</div>}
          <div className="field">
            <Label htmlFor="mov-team" required>Equipo</Label>
            <Select id="mov-team" value={mov.team_id} onChange={(e) => setMov({ ...mov, team_id: e.target.value })}>
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
            label="Descripción"
            placeholder="Ej. Cambio de fecha, pierde por forfeit"
            value={mov.description}
            onChange={(e) => setMov({ ...mov, description: e.target.value })}
          />
          <div className="modal__foot">
            <Button variant="ghost" onClick={() => setMovOpen(false)}>Cancelar</Button>
            <Button variant="flag" onClick={submitMovement} disabled={create.isPending}>
              {create.isPending ? 'Guardando…' : 'Registrar'}
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}
