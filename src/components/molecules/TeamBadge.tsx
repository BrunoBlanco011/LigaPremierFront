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
  // Debajo de 28 px solo cabe una inicial legible (RF-UX 27).
  const label = size < 28 ? initials(name).slice(0, 1) : initials(name)
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
          {label}
        </span>
      )}
      {showName && <span className="team-badge__name">{name}</span>}
    </span>
  )
}
