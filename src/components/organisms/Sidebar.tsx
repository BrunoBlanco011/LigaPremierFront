import { NavLink, Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'
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
  const subtitle = user?.role === 'admin' ? 'Panel de admin' : 'Panel de coach'

  return (
    <aside className="sidebar sobre-verde">
      <Link to="/" className="sidebar__brand">
        <img src="/logo.png" alt="" className="sidebar__logo" />
        <span className="sidebar__brand-text">
          <span className="ital sidebar__brand-name">Liga Premier</span>
          <span className="sidebar__brand-sub">{subtitle}</span>
        </span>
      </Link>

      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `sidebar__link${isActive ? ' is-active' : ''}`}
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}

      <div className="sidebar__spacer" />
      <div className="sidebar__user">{user?.full_name ?? user?.email}</div>
      <button className="sidebar__link" onClick={() => signOut()}>
        <LogOut size={18} />
        Cerrar sesión
      </button>
    </aside>
  )
}
