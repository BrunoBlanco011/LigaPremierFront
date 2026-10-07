import { NavLink } from 'react-router-dom'
import { motion } from 'motion/react'

export interface TabItem {
  to: string
  label: string
  end?: boolean
}

/** Navegación por pestañas basada en rutas (RF-11). El subrayado se desliza entre pestañas. */
export function TabNav({ tabs }: { tabs: TabItem[] }) {
  return (
    <nav className="tabs">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) => `tab${isActive ? ' is-active' : ''}`}
        >
          {({ isActive }) => (
            <>
              {t.label}
              {isActive && <motion.span layoutId="tab-indicator" className="tab__indicator" />}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
