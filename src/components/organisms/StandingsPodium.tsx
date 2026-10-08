import type { CSSProperties } from 'react'
import type { StandingRow } from '@/types/api'
import { TeamBadge } from '@/components/molecules/TeamBadge'
import { SkewTag } from '@/components/atoms/SkewTag'

const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0')
const LABELS = ['LÍDER', '2º LUGAR', '3ER LUGAR']

/** Podio de la tabla: líder destacado en dorado + 2º y 3º (RF-12).
 *  Entrada escalonada en orden 2º·1º·3º al montar (A4). */
export function StandingsPodium({ rows }: { rows: StandingRow[] }) {
  const top = rows.slice(0, 3)
  if (top.length === 0) return null
  return (
    <section className="podium" aria-label="Podio">
      {top.map((r, i) => {
        // orden visual de entrada: 2º primero, luego 1º, luego 3º
        const delay = (i === 1 ? 0 : i === 0 ? 1 : 2) * 0.06
        return (
          <div
            key={r.team.id}
            className={`podium__card enter-up${i === 0 ? ' is-first' : ''}`}
            style={{ '--enter-delay': `${delay}s` } as CSSProperties}
          >
            <span
              className="ital podium__big enter-fade"
              aria-hidden="true"
              style={{ '--enter-delay': `${delay + 0.08}s` } as CSSProperties}
            >
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
        )
      })}
    </section>
  )
}
