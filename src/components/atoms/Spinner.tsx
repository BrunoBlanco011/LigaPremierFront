import { FootballSpinner } from './FootballSpinner'

/** Alias retrocompatible: todos los spinners son el balón de americano. */
export function Spinner({ label = 'Cargando…' }: { label?: string }) {
  return <FootballSpinner size="md" tone="marca" label={label} />
}
