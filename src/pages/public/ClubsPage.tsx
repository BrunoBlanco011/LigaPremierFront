import { Link } from 'react-router-dom'
import { useClubs } from '@/features/clubs/queries'
import { TeamBadge } from '@/components/molecules/TeamBadge'
import { FieldBand } from '@/components/molecules/FieldBand'
import { SkewTag } from '@/components/atoms/SkewTag'
import { EmptyState, ErrorState } from '@/components/molecules/StateView'
import { ChipsSkeleton } from '@/components/molecules/Skeletons'
import { usePageTitle } from '@/lib/usePageTitle'

/** Clubes de la liga (RF-17b). */
export function ClubsPage() {
  usePageTitle('Clubes')
  const clubs = useClubs()

  return (
    <>
      <FieldBand yardas>
        <div className="band__inner" style={{ padding: '40px 24px 48px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SkewTag>La liga</SkewTag>
          <h1 className="ital" style={{ margin: 0, fontSize: 'clamp(40px, 8vw, 56px)', lineHeight: 0.95 }}>
            Clubes
          </h1>
          <span style={{ fontSize: 16, color: 'var(--color-sobre-verde-2)' }}>
            Los equipos permanentes de la liga y su historial.
          </span>
        </div>
      </FieldBand>

      <main className="pub">
        {clubs.isLoading ? (
          <ChipsSkeleton count={12} />
        ) : clubs.isError ? (
          <ErrorState error={clubs.error} onRetry={() => clubs.refetch()} resource="los clubes" />
        ) : !clubs.data || clubs.data.length === 0 ? (
          <EmptyState title="Aún no hay clubes" message="Los clubes aparecerán cuando se registren." />
        ) : (
          <div className="clubs-grid">
            {clubs.data.map((c) => (
              <Link key={c.id} to={`/clubes/${c.id}`} className="club-chip">
                <TeamBadge name={c.name} logoUrl={c.logo_url} showName={false} size={56} />
                <span className="club-chip__name">{c.name}</span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
