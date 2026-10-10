import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, ClipboardCheck, BarChart3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Match, MatchStatus } from '@/types/api'
import { useMatches, useRounds } from '@/features/schedule/queries'
import { useDeleteMatch } from '@/features/matches/mutations'
import { useTournamentTeams } from '@/features/teams/queries'
import { MatchForm } from '@/components/organisms/MatchForm'
import { ResultForm } from '@/components/organisms/ResultForm'
import { MatchStatusPill } from '@/components/molecules/StatusPill'
import { Button } from '@/components/atoms/Button'
import { Select } from '@/components/atoms/Select'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/molecules/StateView'
import { useConfirmMutate } from '@/components/molecules/ConfirmDialog'
import { indexById } from '@/lib/collections'
import { formatDateTime } from '@/lib/format'

const STATUS_FILTERS: { value: MatchStatus; label: string }[] = [
  { value: 'scheduled', label: 'Programado' },
  { value: 'finished', label: 'Finalizado' },
  { value: 'forfeit', label: 'Forfeit' },
  { value: 'postponed', label: 'Pospuesto' },
  { value: 'cancelled', label: 'Cancelado' },
]

/** Partidos en admin: CRUD + capturar resultado (RF-25/26). */
export function MatchesPanel({ tournamentId }: { tournamentId: string }) {
  const [fRound, setFRound] = useState('')
  const [fTeam, setFTeam] = useState('')
  const [fStatus, setFStatus] = useState('')
  const rounds = useRounds(tournamentId)
  const matches = useMatches(tournamentId, {
    roundId: fRound || undefined,
    teamId: fTeam || undefined,
    status: (fStatus as MatchStatus) || undefined,
  })
  const teams = useTournamentTeams(tournamentId)
  const del = useDeleteMatch(tournamentId)
  const confirmMutate = useConfirmMutate()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Match | undefined>(undefined)
  const [scoring, setScoring] = useState<Match | null>(null)

  const teamsById = useMemo(() => indexById(teams.data), [teams.data])
  const teamName = (id: string) => teamsById.get(id)?.name ?? '—'
  const roundLabel = useMemo(() => {
    const m = new Map<string, string>()
    for (const r of rounds.data ?? []) m.set(r.id, r.name ?? `Jornada ${r.number}`)
    return m
  }, [rounds.data])
  const roundNumber = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of rounds.data ?? []) m.set(r.id, r.number)
    return m
  }, [rounds.data])

  // Ordena por jornada y luego por fecha.
  const ordered = useMemo(() => {
    return [...(matches.data ?? [])].sort((a, b) => {
      const ra = a.round_id ? roundNumber.get(a.round_id) ?? 999 : 999
      const rb = b.round_id ? roundNumber.get(b.round_id) ?? 999 : 999
      if (ra !== rb) return ra - rb
      return (a.scheduled_at ?? '').localeCompare(b.scheduled_at ?? '')
    })
  }, [matches.data, roundNumber])

  const remove = (m: Match) =>
    confirmMutate(
      `¿Eliminar ${teamName(m.home_team_id)} vs ${teamName(m.away_team_id)}?\n\nSe borra el marcador y las estadísticas capturadas.`,
      del,
      m.id,
      { confirmLabel: 'Eliminar partido' },
    )

  const played = (m: Match) => m.status === 'finished' || m.status === 'forfeit'

  return (
    <>
      <div className="dash__topbar" style={{ marginBottom: 16 }}>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
          Ajusta fecha, sede y estado; captura o corrige el resultado.
        </p>
        <Button
          variant="primary"
          onClick={() => {
            setEditing(undefined)
            setFormOpen(true)
          }}
        >
          <Plus size={16} /> Nuevo partido
        </Button>
      </div>

      <div className="filters">
        <Select aria-label="Filtrar por jornada" value={fRound} onChange={(e) => setFRound(e.target.value)}>
          <option value="">Todas las jornadas</option>
          {(rounds.data ?? []).map((r) => (
            <option key={r.id} value={r.id}>{r.name ?? `Jornada ${r.number}`}</option>
          ))}
        </Select>
        <Select aria-label="Filtrar por equipo" value={fTeam} onChange={(e) => setFTeam(e.target.value)}>
          <option value="">Todos los equipos</option>
          {(teams.data ?? []).map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </Select>
        <Select aria-label="Filtrar por estado" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          {STATUS_FILTERS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Select>
      </div>

      {matches.isLoading ? (
        <LoadingState />
      ) : matches.isError ? (
        <ErrorState error={matches.error} onRetry={() => matches.refetch()} />
      ) : ordered.length === 0 ? (
        <EmptyState
          title="Sin partidos"
          message={fRound || fTeam || fStatus ? 'Ningún partido con esos filtros.' : 'Genera el rol o crea partidos manualmente.'}
        />
      ) : (
        <div className="table-wrap">
          <table className="table tnum">
            <thead>
              <tr>
                <th>Jornada</th>
                <th>Partido</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th className="num">Marcador</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {ordered.map((m) => {
                const label = `${teamName(m.home_team_id)} vs ${teamName(m.away_team_id)}`
                return (
                <tr key={m.id}>
                  <td style={{ color: 'var(--color-texto-2)', whiteSpace: 'nowrap' }}>
                    {m.round_id ? roundLabel.get(m.round_id) ?? '—' : '—'}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    <Link to={`/torneos/${tournamentId}/partidos/${m.id}`}>{label}</Link>
                  </td>
                  <td style={{ fontWeight: 400 }}>{formatDateTime(m.scheduled_at)}</td>
                  <td><MatchStatusPill status={m.status} /></td>
                  <td className="num">
                    {played(m) ? `${m.home_score} – ${m.away_score}` : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Button size="sm" variant="outline" onClick={() => setScoring(m)}>
                        <ClipboardCheck size={14} /> {played(m) ? 'Corregir resultado' : 'Resultado'}
                      </Button>
                      <Link
                        to={`/admin/torneos/${tournamentId}/partidos/${m.id}/estadisticas`}
                        className="btn btn--ghost btn--sm"
                        aria-label={`Capturar estadísticas · ${label}`}
                        data-tooltip="Capturar estadísticas"
                      >
                        <BarChart3 size={14} />
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditing(m)
                          setFormOpen(true)
                        }}
                        aria-label={`Editar ${label}`}
                        data-tooltip="Editar"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="actions-sep"
                        onClick={() => remove(m)}
                        disabled={del.isPending}
                        aria-label={`Eliminar ${label}`}
                        data-tooltip="Eliminar"
                      >
                        <Trash2 size={14} color="var(--color-error)" />
                      </Button>
                    </div>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <MatchForm
          tournamentId={tournamentId}
          match={editing}
          onClose={() => setFormOpen(false)}
        />
      )}
      {scoring && (
        <ResultForm
          tournamentId={tournamentId}
          match={scoring}
          home={teamsById.get(scoring.home_team_id)}
          away={teamsById.get(scoring.away_team_id)}
          onClose={() => setScoring(null)}
        />
      )}
    </>
  )
}
