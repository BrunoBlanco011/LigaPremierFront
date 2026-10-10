import { useMemo, useState } from 'react'
import { CalendarPlus, Trash2 } from 'lucide-react'
import { useRounds, useMatches } from '@/features/schedule/queries'
import { useDeleteRound } from '@/features/schedule/mutations'
import { useTournamentTeams } from '@/features/teams/queries'
import { GenerateScheduleForm } from '@/components/organisms/GenerateScheduleForm'
import { Button } from '@/components/atoms/Button'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/molecules/StateView'
import { useConfirmMutate } from '@/components/molecules/ConfirmDialog'
import { indexById } from '@/lib/collections'
import { formatDateRange } from '@/lib/format'

/** Rol de juegos en admin: generar + listar/eliminar jornadas (RF-23/24). */
export function SchedulePanel({ tournamentId }: { tournamentId: string }) {
  const rounds = useRounds(tournamentId)
  const matches = useMatches(tournamentId)
  const teams = useTournamentTeams(tournamentId)
  const delRound = useDeleteRound(tournamentId)
  const confirmMutate = useConfirmMutate()
  const [genOpen, setGenOpen] = useState(false)

  const teamsById = useMemo(() => indexById(teams.data), [teams.data])
  const matchCountByRound = useMemo(() => {
    const m = new Map<string, number>()
    for (const match of matches.data ?? []) {
      if (match.round_id) m.set(match.round_id, (m.get(match.round_id) ?? 0) + 1)
    }
    return m
  }, [matches.data])

  const removeRound = (id: string, label: string) =>
    confirmMutate(
      `¿Eliminar "${label}"?\n\nSus partidos no se borran: quedan sin jornada asignada.`,
      delRound,
      id,
      { confirmLabel: 'Eliminar jornada' },
    )

  return (
    <>
      <div className="dash__topbar" style={{ marginBottom: 16 }}>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
          Genera el rol todos-contra-todos o administra las jornadas manualmente.
        </p>
        <Button variant="primary" onClick={() => setGenOpen(true)}>
          <CalendarPlus size={16} /> Generar rol
        </Button>
      </div>

      {rounds.isLoading ? (
        <LoadingState />
      ) : rounds.isError ? (
        <ErrorState error={rounds.error} onRetry={() => rounds.refetch()} />
      ) : !rounds.data || rounds.data.length === 0 ? (
        <EmptyState
          title="Sin jornadas"
          message="Inscribe los clubes y genera el rol de juegos."
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Jornada</th>
                <th>Fecha</th>
                <th>Descansa</th>
                <th className="num">Partidos</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {rounds.data.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.name ?? `Jornada ${r.number}`}</td>
                  <td>{formatDateRange(r.start_date, r.end_date)}</td>
                  <td>{r.bye_team_id ? teamsById.get(r.bye_team_id)?.name ?? '—' : '—'}</td>
                  <td className="num">{matchCountByRound.get(r.id) ?? 0}</td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeRound(r.id, r.name ?? `Jornada ${r.number}`)}
                        disabled={delRound.isPending}
                        aria-label={`Eliminar ${r.name ?? `Jornada ${r.number}`}`}
                        data-tooltip="Eliminar"
                      >
                        <Trash2 size={14} color="var(--color-error)" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {genOpen && (
        <GenerateScheduleForm
          tournamentId={tournamentId}
          onClose={() => setGenOpen(false)}
        />
      )}
    </>
  )
}
