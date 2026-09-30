import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, ClipboardCheck, BarChart3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Match } from '@/types/api'
import { useMatches } from '@/features/schedule/queries'
import { useDeleteMatch } from '@/features/matches/mutations'
import { useTournamentTeams } from '@/features/teams/queries'
import { MatchForm } from '@/components/organisms/MatchForm'
import { ResultForm } from '@/components/organisms/ResultForm'
import { MatchStatusPill } from '@/components/molecules/StatusPill'
import { Button } from '@/components/atoms/Button'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/molecules/StateView'
import { friendlyMessage } from '@/lib/errors'
import { formatDateTime } from '@/lib/format'

/** Partidos en admin: CRUD + capturar resultado (RF-25/26). */
export function MatchesPanel({ tournamentId }: { tournamentId: string }) {
  const matches = useMatches(tournamentId)
  const teams = useTournamentTeams(tournamentId)
  const del = useDeleteMatch(tournamentId)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Match | undefined>(undefined)
  const [scoring, setScoring] = useState<Match | null>(null)

  const teamsById = useMemo(
    () => new Map((teams.data ?? []).map((t) => [t.id, t])),
    [teams.data],
  )
  const teamName = (id: string) => teamsById.get(id)?.name ?? '—'

  const remove = (m: Match) => {
    const ok = window.confirm('¿Eliminar este partido?')
    if (ok) del.mutate(m.id, { onError: (e) => window.alert(friendlyMessage(e)) })
  }

  const played = (m: Match) => m.status === 'finished' || m.status === 'forfeit'

  return (
    <>
      <div className="dash__topbar" style={{ marginBottom: 16 }}>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
          Ajusta fecha, sede y estado; captura o corrige el resultado.
        </p>
        <Button
          variant="flag"
          onClick={() => {
            setEditing(undefined)
            setFormOpen(true)
          }}
        >
          <Plus size={16} /> Nuevo partido
        </Button>
      </div>

      {matches.isLoading ? (
        <LoadingState />
      ) : matches.isError ? (
        <ErrorState error={matches.error} onRetry={() => matches.refetch()} />
      ) : !matches.data || matches.data.length === 0 ? (
        <EmptyState title="Sin partidos" message="Genera el rol o crea partidos manualmente." />
      ) : (
        <div className="table-wrap">
          <table className="table tnum">
            <thead>
              <tr>
                <th>Partido</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th className="num">Marcador</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {matches.data.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 600 }}>
                    <Link to={`/torneos/${tournamentId}/partidos/${m.id}`}>
                      {teamName(m.home_team_id)} vs {teamName(m.away_team_id)}
                    </Link>
                  </td>
                  <td style={{ fontWeight: 400 }}>{formatDateTime(m.scheduled_at)}</td>
                  <td><MatchStatusPill status={m.status} /></td>
                  <td className="num">
                    {played(m) ? `${m.home_score} – ${m.away_score}` : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="outline" onClick={() => setScoring(m)}>
                        <ClipboardCheck size={14} /> Resultado
                      </Button>
                      <Link
                        to={`/admin/torneos/${tournamentId}/partidos/${m.id}/estadisticas`}
                        className="btn btn--ghost btn--sm"
                        aria-label="Capturar estadísticas"
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
                        aria-label="Editar partido"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => remove(m)}
                        disabled={del.isPending}
                        aria-label="Eliminar partido"
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
