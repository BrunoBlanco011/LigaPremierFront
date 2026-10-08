import type { CSSProperties } from 'react'

/** Bloque de carga con pulso. Decorativo: siempre aria-hidden. */
export function Skeleton({
  width,
  height = 14,
  circle = false,
  className = '',
  style,
}: {
  width?: number | string
  height?: number | string
  circle?: boolean
  className?: string
  style?: CSSProperties
}) {
  return (
    <span
      className={`sk${circle ? ' sk--circle' : ''} ${className}`.trim()}
      aria-hidden="true"
      style={{ display: 'block', width, height, ...style }}
    />
  )
}
