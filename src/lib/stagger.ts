// Respaldo del escalonado de animaciones (styles/motion.css) para navegadores
// sin sibling-index(): numera los hijos de los contenedores con --sibling-index.
// En navegadores con soporte no se ejecuta nada.

const CONTAINERS = '.page, .dash__main > *, .hero__inner, .grid, .table tbody'

function number(container: Element) {
  Array.from(container.children).forEach((child, i) => {
    ;(child as HTMLElement).style.setProperty('--sibling-index', String(i + 1))
  })
}

export function installStaggerFallback() {
  if (typeof CSS === 'undefined' || CSS.supports('animation-delay: calc(sibling-index() * 1s)')) {
    return
  }
  document.querySelectorAll(CONTAINERS).forEach(number)

  // El callback corre antes del siguiente pintado: no hay parpadeo
  new MutationObserver((mutations) => {
    const touched = new Set<Element>()
    for (const m of mutations) {
      if (m.target instanceof Element && m.target.matches(CONTAINERS)) touched.add(m.target)
      m.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return
        if (node.matches(CONTAINERS)) touched.add(node)
        node.querySelectorAll(CONTAINERS).forEach((c) => touched.add(c))
      })
    }
    touched.forEach(number)
  }).observe(document.body, { childList: true, subtree: true })
}
