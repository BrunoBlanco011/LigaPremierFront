import { Link } from 'react-router-dom'
import { CalendarDays, ArrowRight } from 'lucide-react'
import type { Tournament } from '@/types/api'
import { TournamentStatusPill } from '@/components/molecules/StatusPill'
import { formatDate } from '@/lib/format'

export function TournamentCard({ tournament: t }: { tournament: Tournament }) {
  return (
    <Link to={`/torneos/${t.id}`} className="card tcard">
      <div className="tcard__row">
        <TournamentStatusPill status={t.status} />
        {t.category && <span className="tcard__meta">{t.category}</span>}
      </div>
      <h3 className="tcard__title">{t.name}</h3>
      {t.season && <span className="tcard__meta">Temporada {t.season}</span>}
      <div className="tcard__row" style={{ marginTop: 'auto' }}>
        <span className="tcard__meta">
          <CalendarDays
            size={14}
            style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }}
          />
          {formatDate(t.start_date)}
        </span>
        <span className="tcard__arrow" aria-hidden="true">
          <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  )
}
