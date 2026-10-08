import { Link } from 'react-router-dom'
import type { Match } from '@/types/api'
import { TeamBadge } from '@/components/molecules/TeamBadge'
import { formatTime } from '@/lib/format'

/** Aside de "próxima jornada" en Inicio: cabecera + partidos programados. */
export function NextRoundCard({
  title,
  matches,
  href,
}: {
  title: string
  matches: Match[]
  href: string
}) {
  return (
    <aside className="nextr" aria-label="Próxima jornada">
      <div className="nextr__head">
        <span className="nextr__eyebrow">PRÓXIMA JORNADA</span>
        <span className="ital nextr__title">{title}</span>
      </div>
      {matches.map((m) => (
        <div className="nextr__row" key={m.id}>
          <span className="marc nextr__time">
            {m.scheduled_at ? formatTime(m.scheduled_at) : '—'}
          </span>
          <div className="nextr__teams">
            <span>
              <TeamBadge name={m.home_team?.name ?? 'Local'} logoUrl={m.home_team?.logo_url} size={22} />
            </span>
            <span>
              <TeamBadge name={m.away_team?.name ?? 'Visita'} logoUrl={m.away_team?.logo_url} size={22} />
            </span>
          </div>
        </div>
      ))}
      <Link to={href} className="nextr__link">
        Ver la jornada completa →
      </Link>
    </aside>
  )
}
