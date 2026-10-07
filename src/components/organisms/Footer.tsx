export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span>
          © {new Date().getFullYear()} <strong>Liga<em>Premier</em></strong> · Flag football
        </span>
        <span>Resultados y estadísticas de la liga</span>
      </div>
    </footer>
  )
}
