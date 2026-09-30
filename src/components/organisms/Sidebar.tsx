import { NavLink } from 'react-router-dom'
import { Shield, LogOut } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
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
          <Shield size={18} />
        </span>
        LigaPremier
      </div>

      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `sidebar__link${isActive ? ' is-active' : ''}`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}

      <div className="sidebar__spacer" />
      <div className="sidebar__link" style={{ opacity: 0.7, fontSize: 13 }}>
        {user?.full_name ?? user?.email}
      </div>
      <button className="sidebar__link" onClick={() => signOut()}>
        <LogOut size={18} />
        Cerrar sesión
      </button>
    </aside>
  )
}
