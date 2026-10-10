import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { Match } from '@/types/api'
import { useTournaments } from '@/features/tournaments/queries'
import { useMatches } from '@/features/schedule/queries'
import { useClubs } from '@/features/clubs/queries'
import { FieldBand } from '@/components/molecules/FieldBand'
import { SkewTag } from '@/components/atoms/SkewTag'
import { FeaturedTournament } from '@/components/organisms/FeaturedTournament'
import { NextRoundCard } from '@/components/organisms/NextRoundCard'
import { ResultsTicker } from '@/components/organisms/ResultsTicker'
import { TeamBadge } from '@/components/molecules/TeamBadge'
import { EmptyState, ErrorState } from '@/components/molecules/StateView'
import { CardsSkeleton, ChipsSkeleton } from '@/components/molecules/Skeletons'
import { usePageTitle } from '@/lib/usePageTitle'

const roundLabel = (m?: Match) =>
  m?.round?.name ?? (m?.round?.number != null ? `Jornada ${m.round.number}` : '')

export function HomePage() {
  usePageTitle()
  const active = useTournaments('active')
  const clubs = useClubs()
  const primary = active.data?.[0]
  const matches = useMatches(primary?.id ?? '')

  const { nextTitle, nextMatches, recent } = useMemo(() => {
    const all = matches.data ?? []
    const upcoming = all
      .filter((m) => m.status === 'scheduled' && m.scheduled_at)
      .sort((a, b) => a.scheduled_at!.localeCompare(b.scheduled_at!))
    const nextRoundId = upcoming[0]?.round_id
    const nextMatches = upcoming.filter((m) => m.round_id === nextRoundId).slice(0, 3)
    const recent = all
      .filter((m) => m.status === 'finished' || m.status === 'forfeit')
      .sort((a, b) => (b.scheduled_at ?? '').localeCompare(a.scheduled_at ?? ''))
      .slice(0, 6)
    return { nextTitle: roundLabel(upcoming[0]), nextMatches, recent }
  }, [matches.data])

  return (
    <>
      {/* Hero */}
      <FieldBand yardas>
        <div
          className="band__inner"
          style={{
            padding: '56px 24px 88px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 40,
            alignItems: 'center',
          }}
        >
          <div style={{ flex: '1 1 520px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SkewTag>Temporada 2026</SkewTag>
            <h1 style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
              <span className="ital" style={{ fontSize: 'clamp(56px, 11vw, 104px)', lineHeight: 0.88 }}>
                Liga Premier
              </span>
              <span
                className="ital"
                style={{ fontSize: 'clamp(26px, 5vw, 44px)', lineHeight: 1, color: 'var(--color-sobre-verde-2)' }}
              >
                Football Flag Chiapas
              </span>
            </h1>
            <p style={{ margin: 0, fontSize: 18, lineHeight: '26px', color: 'var(--color-sobre-verde-2)', maxWidth: 460 }}>
              Rol de juegos, resultados y tabla de posiciones de la liga, al día después de cada jornada.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {primary && (
                <Link
                  to={`/torneos/${primary.id}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    height: 48,
                    padding: '0 24px',
                    borderRadius: 8,
                    background: '#fff',
                    color: 'var(--color-noche)',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  Ver tabla de posiciones
                </Link>
              )}
              {primary && (
                <Link
                  to={`/torneos/${primary.id}/rol`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    height: 48,
                    padding: '0 24px',
                    borderRadius: 8,
                    border: '1px solid var(--color-sobre-verde-2)',
                    color: '#fff',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Rol de juegos
                </Link>
              )}
            </div>
          </div>
          {primary && nextMatches.length > 0 && (
            <NextRoundCard title={nextTitle} matches={nextMatches} href={`/torneos/${primary.id}/rol`} />
          )}
        </div>
      </FieldBand>

      {primary && recent.length > 0 && (
        <ResultsTicker
          label={roundLabel(recent[0]).toUpperCase() || 'ÚLTIMOS RESULTADOS'}
          matches={recent}
          hrefBase={`/torneos/${primary.id}/partidos`}
        />
      )}

      <main className="pub pub--home">
        {/* Torneos en curso */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2 className="ital ital-h2">Torneos en curso</h2>
          {active.isLoading ? (
            <CardsSkeleton count={1} className="" lines={4} />
          ) : active.isError ? (
            <ErrorState error={active.error} onRetry={() => active.refetch()} resource="los torneos" />
          ) : active.data && active.data.length > 0 ? (
            active.data.map((t) => <FeaturedTournament key={t.id} tournament={t} />)
          ) : (
            <EmptyState
              title="No hay torneos en curso"
              message="Cuando la liga abra un torneo, aparecerá aquí."
            />
          )}
        </section>

        {/* Clubes de la liga */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
            <h2 className="ital ital-h2">Clubes de la liga</h2>
            <Link to="/clubes" style={{ fontWeight: 600 }}>Ver todos los clubes</Link>
          </div>
          {clubs.isLoading ? (
            <ChipsSkeleton count={6} />
          ) : clubs.data && clubs.data.length > 0 ? (
            <div className="clubs-grid">
              {clubs.data.map((c) => (
                <Link key={c.id} to={`/clubes/${c.id}`} className="club-chip">
                  <TeamBadge name={c.name} logoUrl={c.logo_url} showName={false} size={56} />
                  <span className="club-chip__name">{c.name}</span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="Aún no hay clubes" message="Los clubes aparecerán cuando se registren." />
          )}
        </section>
      </main>
    </>
  )
}
