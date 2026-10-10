import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Save } from 'lucide-react'
import type { Player, PlayerStat } from '@/types/api'
import { useMatch, useMatchStats } from '@/features/matches/queries'
import { useTeam, useTeamPlayers } from '@/features/teams/queries'
import { usePutMatchStats } from '@/features/stats/mutations'
import { Button } from '@/components/atoms/Button'
import { ErrorState, LoadingState } from '@/components/molecules/StateView'
import { StatTablesLayout } from '@/components/molecules/StatTablesLayout'
import { useConfirm } from '@/components/molecules/ConfirmDialog'
import { alertOnError } from '@/lib/mutationHelpers'
import { usePageTitle } from '@/lib/usePageTitle'

type StatKey = keyof Omit<PlayerStat, 'player_id' | 'attended'>
const COLS: { key: StatKey; label: string }[] = [
  { key: 'touchdowns', label: 'Anotaciones' },
  { key: 'td_passes', label: 'Pases de anotación' },
  { key: 'interceptions', label: 'Intercepciones' },
  { key: 'sacks', label: 'Capturas' },
  { key: 'tackles', label: 'Tackles' },
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
  const navigate = useNavigate()
  const confirm = useConfirm()

  // Solo guardamos las ediciones del usuario; la base se deriva de los datos.
  const [edits, setEdits] = useState<Map<string, PlayerStat>>(new Map())
  const [saved, setSaved] = useState(false)

  const dirty = edits.size > 0 && !saved

  // Avisa si se recarga o cierra la pestaña con cambios sin guardar.
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const backToMatches = () => navigate(`/admin/torneos/${id}/partidos`)

  // Salir con cambios sin guardar pide confirmación (RF-UX 26).
  const leave = () => {
    if (!dirty) return backToMatches()
    void confirm({
      title: '¿Salir sin guardar?',
      body: 'Hay estadísticas capturadas que aún no se guardan. Se perderán si sales.',
      confirmLabel: 'Salir sin guardar',
      cancelLabel: 'Seguir capturando',
      danger: true,
    }).then((ok) => {
      if (ok) backToMatches()
    })
  }

  const discard = () => {
    setEdits(new Map())
    setSaved(false)
  }

  usePageTitle(
    home.data && away.data ? `Captura · ${home.data.name} vs ${away.data.name}` : 'Captura',
  )

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
      const current = prev.get(playerId) ?? base.get(playerId) ?? blank(playerId)
      next.set(playerId, { ...current, ...patch })
      return next
    })
  }

  const onSave = () => {
    // Si no asistió, sus valores se ignoran (se guardan en cero).
    const rows = allPlayers.map((p) => {
      const v = valueOf(p.id)
      if (v.attended) return v
      return { ...v, touchdowns: 0, td_passes: 0, interceptions: 0, sacks: 0, tackles: 0 }
    })
    save.mutate(rows, {
      onSuccess: () => setSaved(true),
      onError: alertOnError,
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
        <div className="stat-scroll">
         <div className="table-wrap stat-scroll__x">
          <table className="table tnum">
            <thead>
              <tr>
                <th>Jugador</th>
                <th className="num">Asistió</th>
                {COLS.map((c) => <th key={c.key} className="num">{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {players.map((p) => {
                const s = valueOf(p.id)
                return (
                  <tr
                    key={p.id}
                    style={{ background: s.attended ? undefined : 'var(--color-superficie-2)' }}
                  >
                    <td style={{ fontWeight: 600, color: s.attended ? undefined : 'var(--color-texto-2)' }}>
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
                          value={s.attended ? s[c.key] : 0}
                          disabled={!s.attended}
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
        </div>
      )}
    </div>
  )

  return (
    <>
      <button type="button" onClick={leave} className="link-more" style={{ marginBottom: 12 }}>
        <ChevronLeft size={16} /> Partidos
      </button>
      <div className="dash__topbar">
        <div>
          <p className="eyebrow">Captura de estadísticas</p>
          <h1 className="page__title" style={{ fontSize: 26 }}>
            {home.data?.name ?? 'Local'} vs {away.data?.name ?? 'Visitante'}
          </h1>
        </div>
      </div>

      {existing.isLoading || homePlayers.isLoading || awayPlayers.isLoading ? (
        <LoadingState />
      ) : (
        <div style={{ marginTop: 16, paddingBottom: 76 }}>
          <StatTablesLayout
            homeLabel={home.data?.name ?? 'Local'}
            awayLabel={away.data?.name ?? 'Visitante'}
            home={renderTeam(home.data?.name ?? 'Local', homePlayers.data ?? [])}
            away={renderTeam(away.data?.name ?? 'Visitante', awayPlayers.data ?? [])}
          />
        </div>
      )}

      {/* Barra inferior sticky: la captura termina aquí (RF-UX 26). */}
      <div className="savebar" role="region" aria-label="Guardar estadísticas">
        <span className={`savebar__status${dirty ? ' is-dirty' : ''}`}>
          {dirty ? 'Cambios sin guardar' : saved ? 'Estadísticas guardadas' : 'Sin cambios'}
        </span>
        <div className="savebar__actions">
          <Button variant="secondary" onClick={discard} disabled={!dirty || save.isPending}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onSave} loading={save.isPending} disabled={!dirty}>
            <Save size={16} /> {save.isPending ? 'Guardando…' : 'Guardar estadísticas'}
          </Button>
        </div>
      </div>
    </>
  )
}
