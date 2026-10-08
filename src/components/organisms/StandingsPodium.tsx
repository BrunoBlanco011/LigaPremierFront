import type { StandingRow } from '@/types/api'
import { TeamBadge } from '@/components/molecules/TeamBadge'
import { SkewTag } from '@/components/atoms/SkewTag'

const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0')
const LABELS = ['LÍDER', '2º LUGAR', '3ER LUGAR']

/** Podio de la tabla: líder destacado en dorado + 2º y 3º (RF-12). */
export function StandingsPodium({ rows }: { rows: StandingRow[] }) {
  const top = rows.slice(0, 3)
  if (top.length === 0) return null
  return (
    <section className="podium" aria-label="Podio">
      {top.map((r, i) => (
        <div key={r.team.id} className={`podium__card${i === 0 ? ' is-first' : ''}`}>
          <span className="ital podium__big" aria-hidden="true">
            {r.position}
          </span>
          <SkewTag dark={i !== 0}>{LABELS[i]}</SkewTag>
          <div className="podium__team">
            <TeamBadge name={r.team.name} logoUrl={r.team.logo_url} showName={false} size={48} />
            <span className="ital podium__name">{r.team.name}</span>
          </div>
          <div className="podium__stats">
            <span>
              <b className="marc" style={{ fontSize: 28, color: 'var(--color-texto)' }}>
                {r.points}
              </b>{' '}
              pts
            </span>
            <span>
              <b className="marc" style={{ fontSize: 20 }}>
                {r.won}–{r.lost}
              </b>{' '}
              G–P
            </span>
            <span>
              <b className="marc" style={{ fontSize: 20 }}>
                {signed(r.point_difference)}
              </b>{' '}
              dif.
            </span>
          </div>
        </div>
      ))}
    </section>
  )
}
