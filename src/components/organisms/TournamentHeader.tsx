import type { Tournament, TournamentStatus } from '@/types/api'
import { FieldBand } from '@/components/molecules/FieldBand'
import { SkewTag } from '@/components/atoms/SkewTag'
import { formatDateRange } from '@/lib/format'

const STATUS_LABEL: Record<TournamentStatus, string> = {
  draft: 'Preliminar',
  active: 'En curso',
  finished: 'Finalizado',
  cancelled: 'Cancelado',
}

/** Encabezado de torneo sobre la franja de cancha (RF-10). */
export function TournamentHeader({
  tournament: t,
  teamsCount,
  roundsPlayed,
  roundsTotal,
}: {
  tournament: Tournament
  teamsCount?: number
  roundsPlayed?: number
  roundsTotal?: number
}) {
  const meta = [
    formatDateRange(t.start_date, t.end_date),
    teamsCount ? `${teamsCount} equipos` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <FieldBand yardas>
      <div className="band__inner th__inner">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SkewTag>
            {[t.category, STATUS_LABEL[t.status]].filter(Boolean).join(' · ')}
          </SkewTag>
          <h1 className="ital th__title">{t.name}</h1>
          {meta && <span className="th__meta">{meta}</span>}
        </div>
        {roundsTotal ? (
          <div className="th__counter" aria-label="Avance del torneo">
            <span className="marc th__counter-num">
              {roundsPlayed ?? 0}
              <small>/{roundsTotal}</small>
            </span>
            <span className="th__counter-label">JORNADAS</span>
          </div>
        ) : null}
      </div>
    </FieldBand>
  )
}
