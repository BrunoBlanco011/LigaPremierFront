import { useEffect } from 'react'

const BRAND = 'Liga Premier'
const DEFAULT = `${BRAND} · Football Flag Chiapas`

/** Fija el título de la pestaña del navegador por ruta.
 *  `usePageTitle('Tabla · Apertura 2026')` → "Tabla · Apertura 2026 · Liga Premier". */
export function usePageTitle(title?: string | null) {
  useEffect(() => {
    document.title = title ? `${title} · ${BRAND}` : DEFAULT
  }, [title])
}
