import type { ReactNode } from 'react'

/** Etiqueta inclinada (mismo ángulo que el swoosh del logo). Siempre en MAYÚSCULAS. */
export function SkewTag({
  children,
  dark = false,
  className = '',
}: {
  children: ReactNode
  dark?: boolean
  className?: string
}) {
  return (
    <span className={`tag${dark ? ' tag-oscura' : ''} ${className}`.trim()}>
      <span className="uppercase">{children}</span>
    </span>
  )
}
