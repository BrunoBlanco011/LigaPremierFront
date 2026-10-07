import { NavLink, Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { motion } from 'motion/react'
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
        <Link to="/" className="brand" aria-label="LigaPremier, inicio">
          <span className="brand__mark">
            <Shield size={18} strokeWidth={2.5} />
          </span>
          <span className="brand__text">
            Liga<em>Premier</em>
          </span>
        </Link>
        <nav className="nav__links">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `nav__link${isActive ? ' is-active' : ''}`}
            >
              {({ isActive }) => (
                <>
                  {/* Una sola píldora compartida: motion la desliza al enlace activo */}
                  {isActive && <motion.span layoutId="nav-pill" className="nav__pill" />}
                  <span>{l.label}</span>
                </>
              )}
            </NavLink>
          ))}
          {user ? (
            <NavLink to={user.role === 'admin' ? '/admin' : '/coach'} className="nav__link nav__link--cta">
              <span>Mi panel</span>
            </NavLink>
          ) : (
            <NavLink to="/login" className="nav__link nav__link--cta">
              <span>Iniciar sesión</span>
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
