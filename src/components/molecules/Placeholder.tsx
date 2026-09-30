import { Construction } from 'lucide-react'

/** Sección navegable pendiente de implementar (siguiente incremento del plan). */
export function Placeholder({ title, rf }: { title: string; rf: string }) {
  return (
    <div className="state">
      <Construction className="state__icon" size={32} />
      <p className="state__title">{title}</p>
      <p>Pantalla en construcción · {rf}</p>
    </div>
  )
}
