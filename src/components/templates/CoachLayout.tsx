import { Outlet } from 'react-router-dom'
import { Users } from 'lucide-react'
import { Sidebar } from '@/components/organisms/Sidebar'
import type { SidebarItem } from '@/components/organisms/Sidebar'

const items: SidebarItem[] = [
  { to: '/coach', label: 'Mis clubes', icon: Users, end: true },
]

export function CoachLayout() {
  return (
    <div className="dash">
      <Sidebar items={items} />
      <main className="dash__main">
        <Outlet />
      </main>
    </div>
  )
}
