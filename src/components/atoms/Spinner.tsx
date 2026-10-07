/** Indicador de carga: <progress> sin valor = indeterminado (lo anuncian los lectores de pantalla). */
export function Spinner({ label = 'Cargando…' }: { label?: string }) {
  return <progress className="spinner" aria-label={label} />
}
