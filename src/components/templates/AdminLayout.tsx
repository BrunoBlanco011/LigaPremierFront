import { Outlet } from 'react-router-dom'
import { Trophy, Users, Shield } from 'lucide-react'
import { Sidebar } from '@/components/organisms/Sidebar'
import type { SidebarItem } from '@/components/organisms/Sidebar'

const items: SidebarItem[] = [
  { to: '/admin/torneos', label: 'Torneos', icon: Trophy },
  { to: '/admin/clubes', label: 'Clubes', icon: Shield },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
]

export function AdminLayout() {
  return (
    <div className="dash">
      <Sidebar items={items} />
      <main className="dash__main">
        <Outlet />
      </main>
    </div>
  )
}
