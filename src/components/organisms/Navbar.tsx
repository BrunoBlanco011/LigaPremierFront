import { NavLink, Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { useAuth } from '@/auth/useAuth'

const links = [
  { to: '/', label: 'Torneos', end: true },
  { to: '/clubes', label: 'Clubes', end: false },
]

export function Navbar() {
  const { user } = useAuth()
  return (
    <header className="nav">
      <div className="container nav__inner">
        <Link to="/" className="brand">
          <span className="brand__mark">
            <Shield size={18} />
          </span>
          Liga<em style={{ color: 'var(--flag)', fontStyle: 'normal' }}>Premier</em>
        </Link>
        <nav className="nav__links">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `nav__link${isActive ? ' is-active' : ''}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <NavLink
              to={user.role === 'admin' ? '/admin' : '/coach'}
              className="nav__link"
            >
              Mi panel
            </NavLink>
          ) : (
            <NavLink to="/login" className="nav__link">
              Iniciar sesión
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
