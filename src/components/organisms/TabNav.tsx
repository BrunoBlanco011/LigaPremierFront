import { useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

export interface TabItem {
  to: string
  label: string
  end?: boolean
}

/** Navegación por pestañas basada en rutas (RF-11). El indicador inferior se
 *  desliza a la pestaña activa (A1); instantáneo con movimiento reducido. */
export function TabNav({ tabs }: { tabs: TabItem[] }) {
  const navRef = useRef<HTMLElement>(null)
  const location = useLocation()
  const [ind, setInd] = useState<{ x: number; w: number } | null>(null)

  useLayoutEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const active = nav.querySelector<HTMLElement>('.tab.is-active')
    if (active) setInd({ x: active.offsetLeft, w: active.offsetWidth })
  }, [location.pathname, tabs])

  return (
    <nav className="tabs" ref={navRef}>
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) => `tab${isActive ? ' is-active' : ''}`}
        >
          {t.label}
        </NavLink>
      ))}
      {ind && (
        <span
          className="tab__ind"
          aria-hidden="true"
          style={{ transform: `translateX(${ind.x}px)`, width: ind.w }}
        />
      )}
    </nav>
  )
}
