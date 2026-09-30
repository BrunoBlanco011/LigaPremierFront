import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Save } from 'lucide-react'
import type { Player, PlayerStat } from '@/types/api'
import { useMatch, useMatchStats } from '@/features/matches/queries'
import { useTeam, useTeamPlayers } from '@/features/teams/queries'
import { usePutMatchStats } from '@/features/stats/mutations'
import { Button } from '@/components/atoms/Button'
import { ErrorState, LoadingState } from '@/components/molecules/StateView'
import { friendlyMessage } from '@/lib/errors'

const COLS: { key: keyof Omit<PlayerStat, 'player_id' | 'attended'>; label: string }[] = [
  { key: 'touchdowns', label: 'Anot.' },
  { key: 'td_passes', label: 'Pases TD' },
  { key: 'interceptions', label: 'Int' },
  { key: 'sacks', label: 'Cap' },
  { key: 'tackles', label: 'Tk' },
]

const blank = (playerId: string): PlayerStat => ({
  player_id: playerId,
  attended: true,
  touchdowns: 0,
  td_passes: 0,
  interceptions: 0,
  sacks: 0,
  tackles: 0,
})

/** Hoja de captura de estadísticas por partido (RF-28). */
export function StatSheetPage() {
  const { id = '', mid = '' } = useParams()
  const match = useMatch(mid)
  const existing = useMatchStats(mid)
  const home = useTeam(match.data?.home_team_id ?? '')
  const away = useTeam(match.data?.away_team_id ?? '')
  const homePlayers = useTeamPlayers(match.data?.home_team_id ?? '')
  const awayPlayers = useTeamPlayers(match.data?.away_team_id ?? '')
  const save = usePutMatchStats(mid)

  // Solo guardamos las ediciones del usuario; la base se deriva de los datos.
  const [edits, setEdits] = useState<Map<string, PlayerStat>>(new Map())
  const [saved, setSaved] = useState(false)

  const allPlayers = useMemo(
    () => [...(homePlayers.data ?? []), ...(awayPlayers.data ?? [])],
    [homePlayers.data, awayPlayers.data],
  )

  // Base: stats existentes o fila en blanco por jugador (derivada, sin effect).
  const base = useMemo(() => {
    const existingById = new Map((existing.data ?? []).map((s) => [s.player_id, s]))
    return new Map(allPlayers.map((p) => [p.id, existingById.get(p.id) ?? blank(p.id)]))
  }, [allPlayers, existing.data])

  const valueOf = (playerId: string): PlayerStat =>
    edits.get(playerId) ?? base.get(playerId) ?? blank(playerId)

  const update = (playerId: string, patch: Partial<PlayerStat>) => {
    setSaved(false)
    setEdits((prev) => {
      const next = new Map(prev)
      next.set(playerId, { ...valueOf(playerId), ...patch })
      return next
    })
  }

  const onSave = () => {
    const rows = allPlayers.map((p) => valueOf(p.id))
    save.mutate(rows, {
      onSuccess: () => setSaved(true),
      onError: (e) => window.alert(friendlyMessage(e)),
    })
  }

  if (match.isLoading) return <LoadingState />
  if (match.isError || !match.data)
    return <ErrorState error={match.error} onRetry={() => match.refetch()} />

  const renderTeam = (title: string, players: Player[]) => (
    <div>
      <h3 style={{ fontSize: 18, marginBottom: 12 }}>{title}</h3>
      {players.length === 0 ? (
        <p className="round__bye">Sin jugadores en la plantilla.</p>
      ) : (
        <div className="table-wrap">
          <table className="table tnum">
            <thead>
              <tr>
                <th>Jugador</th>
                <th className="num">Asist.</th>
                {COLS.map((c) => <th key={c.key} className="num">{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {players.map((p) => {
                const s = valueOf(p.id)
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>
                      {p.jersey_number != null && (
                        <span style={{ color: 'var(--ink-faint)', marginRight: 6 }}>#{p.jersey_number}</span>
                      )}
                      {p.full_name}
                    </td>
                    <td className="num">
                      <input
                        type="checkbox"
                        checked={s.attended}
                        onChange={(e) => update(p.id, { attended: e.target.checked })}
                      />
                    </td>
                    {COLS.map((c) => (
                      <td key={c.key} className="num">
                        <input
                          className="input"
                          style={{ width: 58, padding: '4px 6px', textAlign: 'center' }}
                          type="number"
                          min={0}
                          value={s[c.key]}
                          onChange={(e) => update(p.id, { [c.key]: Number(e.target.value) })}
                        />
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  return (
    <>
      <Link to={`/admin/torneos/${id}/partidos`} className="link-more" style={{ marginBottom: 12 }}>
        <ChevronLeft size={16} /> Partidos
      </Link>
      <div className="dash__topbar">
        <div>
          <p className="eyebrow">Captura de estadísticas</p>
          <h1 className="page__title" style={{ fontSize: 26 }}>
            {home.data?.name ?? 'Local'} vs {away.data?.name ?? 'Visitante'}
          </h1>
        </div>
        <Button variant="flag" onClick={onSave} disabled={save.isPending}>
          <Save size={16} /> {save.isPending ? 'Guardando…' : saved ? 'Guardado ✓' : 'Guardar todo'}
        </Button>
      </div>

      {existing.isLoading || homePlayers.isLoading || awayPlayers.isLoading ? (
        <LoadingState />
      ) : (
        <div className="grid grid--2" style={{ marginTop: 16 }}>
          {renderTeam(home.data?.name ?? 'Local', homePlayers.data ?? [])}
          {renderTeam(away.data?.name ?? 'Visitante', awayPlayers.data ?? [])}
        </div>
      )}
    </>
  )
}
