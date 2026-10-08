import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/auth/useAuth'

const LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/clubes', label: 'Clubes', end: false },
]

export function Navbar() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const panel = user ? (user.role === 'admin' ? '/admin' : '/coach') : null

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `nav2__link${isActive ? ' is-active' : ''}`

  return (
    <header className="nav2 sobre-verde">
      <div className="nav2__inner">
        <Link to="/" className="nav2__brand">
          <img src="/logo.png" alt="Liga Premier Football Flag Chiapas" className="nav2__logo" />
          <span className="nav2__brand-text">
            <span className="ital nav2__brand-name">Liga Premier</span>
            <span className="nav2__brand-sub">Football Flag Chiapas</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="nav2__nav">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <Link to={panel ?? '/login'} className="nav2__login">
          {panel ? 'Mi panel' : 'Iniciar sesión'}
        </Link>

        <button
          type="button"
          className="nav2__burger"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <nav aria-label="Principal" className="nav2__menu">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          <Link to={panel ?? '/login'} className="nav2__login" onClick={() => setOpen(false)}>
            {panel ? 'Mi panel' : 'Iniciar sesión'}
          </Link>
        </nav>
      )}
    </header>
  )
}
