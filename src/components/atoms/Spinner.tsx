export function Spinner({ label = 'Cargando…' }: { label?: string }) {
  return <span className="spinner" role="status" aria-label={label} />
}
