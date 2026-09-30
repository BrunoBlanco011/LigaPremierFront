import { initials } from '@/lib/format'

interface TeamBadgeProps {
  name: string
  logoUrl?: string | null
  showName?: boolean
  size?: number
}

/** Escudo del equipo: logo o iniciales sobre color de marca. */
export function TeamBadge({
  name,
  logoUrl,
  showName = true,
  size = 34,
}: TeamBadgeProps) {
  return (
    <span className="team-badge">
      {logoUrl ? (
        <img
          className="team-badge__crest"
          src={logoUrl}
          alt=""
          style={{ width: size, height: size }}
        />
      ) : (
        <span
          className="team-badge__crest"
          style={{ width: size, height: size }}
          aria-hidden="true"
        >
          {initials(name)}
        </span>
      )}
      {showName && <span className="team-badge__name">{name}</span>}
    </span>
  )
}
