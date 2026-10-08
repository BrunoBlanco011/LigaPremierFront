import { Link, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import type { Player, PlayerStat, Team } from '@/types/api'
import { useMatch, useMatchStats } from '@/features/matches/queries'
import { useTeamPlayers } from '@/features/teams/queries'
import { TeamBadge } from '@/components/molecules/TeamBadge'
import { MatchStatusPill } from '@/components/molecules/StatusPill'
import { EmptyState, ErrorState, NotFoundState } from '@/components/molecules/StateView'
import { CardsSkeleton } from '@/components/molecules/Skeletons'
import { Skeleton } from '@/components/atoms/Skeleton'
import { ApiError } from '@/lib/errors'
import { formatDateTime } from '@/lib/format'

type TeamLite = Pick<Team, 'id' | 'name' | 'logo_url'>

const GRID = 'minmax(160px, 2fr) 72px repeat(5, minmax(72px, 1fr))'
const COLS: { key: keyof PlayerStat; label: string }[] = [
  { key: 'attended', label: 'Asistió' },
  { key: 'touchdowns', label: 'Anotaciones' },
  { key: 'td_passes', label: 'Pases de anotación' },
  { key: 'interceptions', label: 'Intercepciones' },
  { key: 'sacks', label: 'Capturas' },
  { key: 'tackles', label: 'Tackles' },
]

function Cell({ value, col }: { value: PlayerStat[keyof PlayerStat]; col: keyof PlayerStat }) {
  if (col === 'attended') return <span>{value ? 'Sí' : 'No'}</span>
  return <span>{value as number}</span>
}

function TeamStatTable({
  team,
  players,
  statsByPlayer,
}: {
  team?: TeamLite
  players: Player[]
  statsByPlayer: Map<string, PlayerStat>
}) {
  const rows = players.filter((p) => statsByPlayer.has(p.id))
  return (
    <section style={{ flex: '1 1 520px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <TeamBadge name={team?.name ?? 'Equipo'} logoUrl={team?.logo_url} showName={false} size={40} />
        <h3 style={{ fontSize: 18, lineHeight: '24px', fontWeight: 600, margin: 0 }}>
          {team?.name ?? 'Equipo'}
        </h3>
      </div>
      {rows.length === 0 ? (
        <p style={{ color: 'var(--color-texto-2)' }}>Sin estadísticas capturadas.</p>
      ) : (
        <div
          style={{
            overflowX: 'auto',
            background: 'var(--color-superficie)',
            border: '1px solid var(--color-borde)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ minWidth: 720 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: GRID,
                columnGap: 8,
                alignItems: 'center',
                background: 'var(--color-premier)',
                padding: '10px 16px',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <span>Jugador</span>
              {COLS.map((c) => (
                <span key={c.key} style={{ textAlign: 'right' }}>{c.label}</span>
              ))}
            </div>
            {rows.map((p) => {
              const s = statsByPlayer.get(p.id)!
              return (
                <div
                  key={p.id}
                  className="tnum"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: GRID,
                    columnGap: 8,
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderTop: '1px solid var(--color-borde)',
                    fontSize: 14,
                    textAlign: 'right',
                  }}
                >
                  <span
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {p.jersey_number != null && (
                      <span style={{ color: 'var(--color-texto-2)', display: 'inline-block', minWidth: 36 }}>
                        #{p.jersey_number}
                      </span>
                    )}
                    {p.full_name}
                  </span>
                  {COLS.map((c) => (
                    <Cell key={c.key} value={s[c.key]} col={c.key} />
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}

export function MatchDetailPage() {
  const { id = '', mid = '' } = useParams()
  const match = useMatch(mid)
  const stats = useMatchStats(mid)
  const homePlayers = useTeamPlayers(match.data?.home_team_id ?? '')
  const awayPlayers = useTeamPlayers(match.data?.away_team_id ?? '')

  const statsByPlayer = useMemo(
    () => new Map((stats.data ?? []).map((s) => [s.player_id, s])),
    [stats.data],
  )

  if (match.isLoading)
    return (
      <div className="pub" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <Skeleton height={150} style={{ borderRadius: 'var(--radius-lg)' }} />
        <CardsSkeleton count={2} className="grid grid--2" lines={5} />
      </div>
    )
  if (match.isError || !match.data) {
    const notFound = match.error instanceof ApiError && match.error.status === 404
    return (
      <div className="pub">
        {notFound ? (
          <NotFoundState title="No encontramos este partido" />
        ) : (
          <ErrorState error={match.error} onRetry={() => match.refetch()} resource="el partido" />
        )}
      </div>
    )
  }

  const m = match.data
  const home = m.home_team ?? undefined
  const away = m.away_team ?? undefined
  const played = m.status === 'finished' || m.status === 'forfeit'
  const homeWon = m.winner_team_id === m.home_team_id
  const awayWon = m.winner_team_id === m.away_team_id
  const backHref = `/torneos/${id || m.tournament_id}/rol`

  return (
    <div className="pub" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <Link to={backHref} style={{ fontWeight: 600, fontSize: 14 }}>
        ← Rol de juegos
      </Link>

      {/* Marcador */}
      <div className="cancha" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              color: 'var(--color-sobre-verde-2)',
              fontSize: 13,
            }}
          >
            <span>
              {m.round?.name ?? (m.round?.number != null ? `Jornada ${m.round.number}` : '')}
              {m.scheduled_at && ` · ${formatDateTime(m.scheduled_at)}`}
            </span>
            <MatchStatusPill status={m.status} />
          </div>
          <div className="sb__grid">
            <div className="sb__team">
              <TeamBadge name={home?.name ?? 'Local'} logoUrl={home?.logo_url} showName={false} size={48} />
              <span className="ital sb__name">{home?.name ?? 'Local'}</span>
            </div>
            <div className="marc sb__score">
              {played ? (
                <>
                  <span className="enter-up" style={{ display: 'inline-block' }}>
                    <span style={{ opacity: homeWon ? 1 : 0.6 }}>{m.home_score ?? 0}</span>
                  </span>
                  <span style={{ opacity: 0.6 }}> – </span>
                  <span
                    className="enter-up"
                    style={{ display: 'inline-block', animationDelay: '0.06s' }}
                  >
                    <span style={{ opacity: awayWon ? 1 : 0.6 }}>{m.away_score ?? 0}</span>
                  </span>
                </>
              ) : (
                'VS'
              )}
            </div>
            <div className="sb__team sb__team--away">
              <TeamBadge name={away?.name ?? 'Visita'} logoUrl={away?.logo_url} showName={false} size={48} />
              <span className="ital sb__name">{away?.name ?? 'Visita'}</span>
            </div>
          </div>
          {m.notes && (
            <p style={{ margin: 0, color: 'var(--color-sobre-verde-2)', fontSize: 14 }}>{m.notes}</p>
          )}
        </div>
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: '30px', fontWeight: 600, margin: 0 }}>
        Estadísticas del partido
      </h2>

      {stats.isLoading ? (
        <CardsSkeleton count={2} className="grid grid--2" lines={5} />
      ) : statsByPlayer.size === 0 ? (
        <EmptyState
          title="Sin estadísticas de este partido"
          message="Las estadísticas de los jugadores aparecerán cuando se capturen."
        />
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          <TeamStatTable team={home} players={homePlayers.data ?? []} statsByPlayer={statsByPlayer} />
          <TeamStatTable team={away} players={awayPlayers.data ?? []} statsByPlayer={statsByPlayer} />
        </div>
      )}
    </div>
  )
}
