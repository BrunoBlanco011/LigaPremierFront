import { NavLink } from 'react-router-dom'
import { Shield, LogOut } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { useAuth } from '@/auth/useAuth'

export interface SidebarItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export function Sidebar({ items }: { items: SidebarItem[] }) {
  const { user, signOut } = useAuth()
  return (
    <aside className="sidebar">
      <div className="sidebar__brand brand">
        <span className="brand__mark">
          <Shield size={18} strokeWidth={2.5} />
        </span>
        <span>
          Liga<em>Premier</em>
        </span>
      </div>

      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `sidebar__link${isActive ? ' is-active' : ''}`}
        >
          {({ isActive }) => (
            <>
              {isActive && <motion.span layoutId="sidebar-pill" className="sidebar__pill" />}
              <Icon size={18} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}

      <div className="sidebar__spacer" />
      <div className="sidebar__user" title={user?.email ?? undefined}>
        {user?.full_name ?? user?.email}
      </div>
      <button className="sidebar__link" onClick={() => signOut()}>
        <LogOut size={18} />
        <span>Cerrar sesión</span>
      </button>
    </aside>
  )
}
