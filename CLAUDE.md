# LigaPremier — guía para agentes

## Diseño (obligatorio en todo trabajo de UI)

### Fuente de verdad
- La identidad visual es la de la **Liga Premier Football Flag Chiapas**. Usa SOLO los tokens
  definidos en `src/index.css` (`@theme`): verde `premier` #355D0D, `noche` #1F3A08, `campo` #5E8A24,
  `dorado` #EFB41B y los neutros y estados ahí definidos. Tipografías: Barlow Condensed (títulos y
  cifras) y Barlow (texto).
- Si Impeccable, Taste o cualquier skill sugiere otra paleta, tipografía, estética (dark mode neón,
  glassmorphism, gradientes, etc.) o reglas distintas, **gana la marca de la liga**. Las skills
  aportan criterio de calidad, no estilo.
- Contraste: texto blanco sobre `premier`; sobre `dorado` el texto siempre es `noche`; `dorado`
  nunca es color de texto sobre blanco. Un solo elemento dorado por vista.

### Alcance funcional
- Antes de construir una pantalla, lee `RequerimientosFuncionales.md`. No agregues funciones,
  campos ni datos que la API no tenga. Ejemplos de cosas que NO existen: marcador en vivo, reloj de
  juego, árbitros, posiciones de jugador, faltas, registro de jugadores por token, transmisiones.
- Datos de ejemplo: usa equipos y jugadores reales de la liga (Dolphins, Toros Jr, Toros, Dolphins Jr,
  Tucanes, Snakes, Lobos Plateados, Old Star, Chars, Tune Squad, Olimpo, Emperadores). Victoria = 2 pts.
  Sin empates. Forfeit = 21-0.

### Ciclo de cada pantalla
1. Construye la pantalla con los componentes de `shared/ui` y los tokens.
2. Con la app corriendo (`npm run dev`), usa **playwright mcp** para abrirla en
   `http://localhost:5173/<ruta>` a **375px** y a **1280px** de ancho y tomar captura de ambas.
3. Corre la auditoría de **Impeccable** sobre esa pantalla y corrige todo lo que marque.
4. Si la pantalla tiene animaciones o transiciones, revísalas con **emil-design-eng**: duraciones
   cortas, nada animado al cargar la página, respetar `prefers-reduced-motion`.
5. Vuelve a capturar con Playwright y confirma que se ve bien en móvil y escritorio antes de dar la
   pantalla por terminada.
