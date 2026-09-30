# Plan de desarrollo — Frontend LigaPremier

> Plan de implementación del frontend para la app de gestión de liga de **flag football / tocho bandera**.
> Basado en `RequerimientosFuncionales.md` v0.2 (30 sep 2026). Backend: **FastAPI + Supabase**.
>
> **Estado:** propuesta para revisión. No se ha escrito código de producto todavía.

---

## 1. Objetivo y alcance

Construir un frontend web con **tres áreas** sobre un backend REST ya definido:

1. **Sitio público** (con login): consulta de torneos, tabla, rol de juegos, resultados, equipos, rosters y líderes de estadísticas.
2. **Panel admin** (`role: admin`): CRUD completo de torneos, equipos, jornadas, partidos, resultados, estadísticas, finanzas y usuarios.
3. **Panel coach** (`role: coach`): administración del roster de sus equipos.

El contrato exacto de la API vive en `http://localhost:8000/docs` (Swagger) y `openapi.json`. Este plan **no reinventa** el contrato; define **cómo lo consume el frontend**.

---

## 2. Stack técnico propuesto

El proyecto ya arranca con **Vite + React 19 + TypeScript + Tailwind CSS v4**. Se propone añadir:

| Necesidad | Propuesta | Por qué |
|-----------|-----------|---------|
| Ruteo | **react-router-dom v7** | Rutas anidadas y por rol; ya visto en §8 del RF |
| Estado del servidor (API) | **TanStack Query (React Query)** | App muy read-heavy: caché, revalidación, estados loading/error, invalidación tras mutaciones |
| Autenticación | **supabase-js** (`signInWithPassword`) | El RF lo permite (RF-01) y renueva el token solo (RF-04); su `access_token` es el mismo Bearer del backend |
| Cliente HTTP | Wrapper `fetch` propio | Inyecta `Authorization: Bearer`, base `{API_URL}/api/v1` y normaliza errores |
| Formularios + validación | **React Hook Form + Zod** | Muchos formularios; mapea errores `422` (`loc`) al campo correcto |
| Animaciones | **motion** (Framer Motion) | Transiciones de página, reveals, micro-interacciones (dirigido por `frontend-design`) |
| Tipografía | **@fontsource-variable** (self-hosted) | Rendimiento y privacidad, sin CDN |
| Iconos | **lucide-react** | Set moderno y ligero |
| Formato dinero/fechas | `Intl.NumberFormat` / `Intl.DateTimeFormat` | MXN y fechas locales de la liga (§2 del RF) |

> **Decisión pendiente de confirmar contigo:** usar `supabase-js` para auth (recomendado) **o** el flujo manual `POST /auth/login` + guardar token. Ver §10.

---

## 3. Variables de entorno

Archivo `.env.local` (no se commitea):

```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://<proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

---

## 4. Arquitectura — Atomic Design (escalable)

La app se organiza con **Atomic Design** para que la UI escale: piezas pequeñas y reutilizables (átomos) se componen en piezas más grandes (moléculas → organismos → plantillas → páginas). Esto separa **UI reutilizable** (capa atómica) de la **lógica de dominio/datos** (capa `features`), de modo que agregar nuevas pantallas reusa componentes existentes en lugar de duplicarlos.

### 4.1 Las cinco capas de Atomic Design

| Capa | Qué contiene | Regla | Ejemplos en LigaPremier |
|------|--------------|-------|-------------------------|
| **Atoms** | Piezas UI mínimas, sin estado de negocio | No conocen la API ni el dominio | `Button`, `Input`, `Label`, `Badge`, `Icon`, `Spinner`, `Avatar`, `Text`, `Divider` |
| **Molecules** | Combinación de átomos con un propósito | Reutilizables, sin llamar a la API | `FormField` (Label+Input+Error), `SearchBar`, `Tabs`, `StatCard`, `TeamBadge`, `StatusPill`, `MoneyText`, `FormPill (W/D/L)`, `Toast` |
| **Organisms** | Secciones completas y significativas | Pueden recibir datos por props (los pide la página) | `Navbar`, `Sidebar`, `StandingsTable`, `MatchCard`, `RosterTable`, `StatSheet` (hoja de captura), `FinanceTable`, `TournamentCard`, `PlayerStatsTable`, formularios en `Modal` |
| **Templates** | Esqueleto/layout de una pantalla, sin datos reales | Definen la estructura y los huecos | `PublicLayout`, `AdminLayout`, `CoachLayout`, `TournamentTabsTemplate`, `DetailPageTemplate` |
| **Pages** | Instancia concreta: template + organismos + datos | Conectan con `features` (hooks) | `TournamentsPage`, `StandingsPage`, `MatchDetailPage`, `AdminFinancePage`, `CoachRosterPage`… |

> **Regla de dependencia:** una capa solo importa de capas inferiores (page → template → organism → molecule → atom). Nunca al revés. Esto evita ciclos y mantiene los átomos 100% reutilizables.

### 4.2 Estructura de carpetas

```
src/
├── main.tsx                 # Providers: Router, QueryClient, Auth
├── App.tsx                  # Layout raíz + <Outlet/>
├── routes.tsx               # Definición central de rutas
│
├── styles/
│   └── tokens.css           # Design tokens (color, tipografía, radios, sombras)
│
├── lib/                     # Utilidades transversales (no UI)
│   ├── api.ts               # fetch wrapper (Bearer, base URL, manejo de error)
│   ├── supabase.ts          # cliente supabase-js
│   ├── queryClient.ts       # config de TanStack Query
│   ├── format.ts            # dinero (MXN), fechas, horas
│   └── errors.ts            # tipos y parser de errores 401/403/404/409/422
│
├── types/
│   └── api.ts               # tipos de dominio (Tournament, Team, Match, ...)
│
├── auth/                    # Login (REQUERIDO, ver §6)
│   ├── AuthProvider.tsx     # sesión, usuario (GET /me), rol
│   ├── useAuth.ts
│   └── ProtectedRoute.tsx   # guard por rol (admin/coach)
│
├── components/              # ── CAPA ATÓMICA (UI reutilizable, sin API) ──
│   ├── atoms/               # Button, Input, Label, Badge, Icon, Spinner, Avatar, Text
│   ├── molecules/           # FormField, Tabs, StatCard, TeamBadge, StatusPill, MoneyText, Toast
│   ├── organisms/           # Navbar, Sidebar, StandingsTable, MatchCard, RosterTable, StatSheet, FinanceTable
│   └── templates/           # PublicLayout, AdminLayout, CoachLayout, plantillas de pantalla
│
├── features/               # ── CAPA DE DOMINIO (lógica + hooks de datos) ──
│   ├── auth/               # RF-01..04
│   ├── tournaments/        # RF-10, RF-11, RF-20
│   ├── standings/          # RF-12, RF-27
│   ├── schedule/           # RF-13, RF-23, RF-24
│   ├── matches/            # RF-14, RF-15, RF-25, RF-26
│   ├── stats/              # RF-18, RF-19, RF-28
│   ├── teams/              # RF-16, RF-17, RF-21, RF-22
│   ├── players/            # RF-19, RF-41
│   ├── finance/            # RF-29, RF-30, RF-31
│   └── users/              # RF-32
│
└── pages/                  # ── CAPA PAGES (template + organisms + features) ──
    ├── public/
    ├── admin/
    └── coach/
```

**Cómo encajan las dos capas:** cada `feature` expone hooks de datos (`useTournaments`, `useStandings`, `useCreateMatch`, …) sobre TanStack Query. Una **page** llama esos hooks y pasa los datos a **organismos** puros; los organismos se arman con **moléculas** y **átomos**. Así la UI no sabe de dónde vienen los datos y se reutiliza entre público/admin/coach (p. ej. `StandingsTable` sirve tanto en la vista pública como en la de admin).

---

## 5. Capa de datos y manejo de errores

### 5.1 Cliente API (`lib/api.ts`)
- Prefijo `{VITE_API_URL}/api/v1`.
- Inyecta `Authorization: Bearer <token>` desde la sesión de Supabase cuando existe.
- Los GET públicos funcionan sin token.
- Convierte respuestas no-2xx en un `ApiError` tipado con `status` y `detail`.

### 5.2 Mapa de errores (RF §2.1)

| Código | Comportamiento global |
|--------|-----------------------|
| `401` | Limpiar sesión → redirigir a `/login` |
| `403` | Toast/pantalla "No tienes permiso" |
| `404` | Pantalla "No encontrado" |
| `409` | Mostrar `detail` junto al formulario (duplicados) |
| `422` | Si `detail` es texto → mostrarlo; si es lista → marcar campo por `loc` |

### 5.3 Convenciones de datos
- **IDs:** UUID (string).
- **Dinero:** llega como **texto** (`"700.00"`); se conserva como string y se formatea con `Intl.NumberFormat('es-MX', { style:'currency', currency:'MXN' })`.
- **Fechas/horas:** ISO 8601 con zona; mostrar en hora local de la liga.
- **PATCH parcial**, **DELETE → 204** sin cuerpo.

---

## 6. Autenticación y control de acceso

- **RF-01** Login (correo/contraseña) → sesión Supabase.
- **RF-02** `GET /me` → `{ id, email, full_name, role }` decide destino: `admin` → `/admin`, `coach` → `/coach`.
- **RF-03** Logout → `signOut()` + limpiar caché de Query.
- **RF-04** Cualquier `401` → limpiar sesión → `/login` (Supabase renueva token solo).
- `ProtectedRoute` bloquea rutas `/admin/*` (solo admin) y `/coach/*` (solo coach); el sitio público es abierto.

---

## 7. Sistema de diseño

Dirección visual guiada por la skill **`frontend-design`** en una fase dedicada (§9, Fase 1). Puntos base:

- **Tokens** en `index.css`: paleta, tipografía, radios, sombras, espaciado.
- **Tipografía:** display + cuerpo con `@fontsource-variable`; **cifras tabulares** para marcadores, tabla y estadísticas.
- **Identidad de flag football** (no fútbol soccer): marcador tipo scoreboard, estados de partido claros (En juego / Forfeit / Cancelado).
- **Componentes UI** consistentes (Button, Card, Table, Modal, Tabs, Badge, Toast, Inputs).
- **Piso de calidad:** responsive a móvil, foco visible por teclado, `prefers-reduced-motion` respetado, estados de carga/vacío/error en cada vista.

> La propuesta concreta de paleta y tipografía se define al inicio de la Fase 1 y se valida contigo antes de construir pantallas.

---

## 8. Mapa de pantallas → RF → endpoints

### 8.1 Sitio público
| Ruta | Pantalla | RF | Endpoints clave |
|------|----------|----|-----------------|
| `/` | Torneos activos | RF-10 | `GET /tournaments?status=active` |
| `/torneos/:id` | Portada con pestañas | RF-11 | `GET /tournaments/{id}` |
| ↳ Tabla | Posiciones + ajustes/tooltip | RF-12 | `GET /tournaments/{id}/standings` |
| ↳ Rol de juegos | Partidos por jornada + BYE | RF-13 | `GET .../rounds`, `GET .../matches?round_id=` |
| ↳ Resultados | Marcadores + ganador/forfeit | RF-14 | `GET .../matches?status=finished` |
| ↳ Equipos | Tarjetas con logo y coach | RF-16 | `GET /tournaments/{id}/teams` |
| ↳ Estadísticas | Líderes por categoría | RF-18 | `GET .../player-stats?sort_by=&limit=` |
| `/torneos/:id/partidos/:mid` | Detalle de partido + stats | RF-15 | `GET /matches/{id}`, `GET /matches/{id}/stats` |
| `/equipos/:id` | Perfil de equipo + roster | RF-17 | `GET /teams/{id}`, `/players`, matches, stats |
| `/jugadores/:id` | Perfil de jugador | RF-19 | `GET /players/{id}`, `/players/{id}/stats` |
| `/login` | Inicio de sesión | RF-01 | `POST /auth/login` / supabase |

### 8.2 Panel admin (`/admin`)
| Ruta | Pantalla | RF | Endpoints clave |
|------|----------|----|-----------------|
| `/admin/torneos` | Lista + crear/editar/eliminar | RF-20 | `GET/POST/PATCH/DELETE /tournaments` |
| `/admin/torneos/:id` | Resumen del torneo | RF-11 | `GET /tournaments/{id}` |
| ↳ `equipos` | CRUD + logo + asignar coach | RF-21, RF-22 | `.../teams`, `POST /teams/{id}/logo`, `GET /users?role=coach` |
| ↳ `equipos/:teamId/jugadores` | CRUD de roster | RF-41 | `GET/POST /teams/{id}/players`, `PATCH/DELETE /players/{id}` |
| ↳ `rol-de-juegos` | Generar rol + CRUD jornadas | RF-23, RF-24 | `POST .../schedule/generate`, `.../rounds` |
| ↳ `partidos` | CRUD + capturar resultado | RF-25, RF-26 | `.../matches`, `PUT /matches/{id}/result` |
| ↳ `partidos/:mid/estadisticas` | Hoja de captura (local/visita) | RF-28 | `GET/PUT /matches/{id}/stats` |
| ↳ `tabla` | Tabla + ajustes manuales | RF-12, RF-27 | `.../standings`, `.../standings/adjustments` |
| ↳ `finanzas` | Estado de cuenta + movimientos | RF-29..31 | `.../finance/summary`, `/registration-fees`, `/movements` |
| `/admin/usuarios` | Coaches y admins | RF-32 | `GET/POST/PATCH/DELETE /users` |

### 8.3 Panel coach (`/coach`)
| Ruta | Pantalla | RF | Endpoints clave |
|------|----------|----|-----------------|
| `/coach` | Mis equipos | RF-40 | `GET /me/teams` |
| `/coach/equipos/:id` | Roster (CRUD jugadores) | RF-41 | `.../players`, `PATCH/DELETE /players/{id}` |

---

## 9. Fases de entrega (iterativas)

Cada fase es entregable y verificable. Orden pensado para **entregar valor pronto** (el sitio público) y dejar lo transaccional después.

| Fase | Contenido | RF |
|------|-----------|----|
| **0 · Cimientos** | Deps, `.env`, cliente API, TanStack Query, tipos base, layouts vacíos, manejo global de errores | §2–§5 |
| **1 · Diseño** | Tokens, tipografía, biblioteca de componentes UI, motion base; validación de dirección visual | §7 |
| **2 · Sitio público** | Torneos, portada con pestañas, tabla, rol de juegos, resultados, equipos, perfiles, líderes | RF-10..19 |
| **3 · Auth + guards** | Login, `GET /me`, rutas por rol, sesión expirada | RF-01..04 |
| **4 · Admin: torneos y equipos** | CRUD torneos, equipos, logos, asignar coach | RF-20..22 |
| **5 · Admin: rol y partidos** | Generar rol, CRUD jornadas/partidos, capturar/corregir resultado (sin empates, forfeit) | RF-23..26 |
| **6 · Admin: tabla y estadísticas** | Ajustes manuales, hoja de captura de estadísticas | RF-27..28 |
| **7 · Admin: finanzas** | Estado de cuenta, inscripción masiva, cargos/abonos | RF-29..31 |
| **8 · Admin: usuarios** | CRUD de usuarios y roles | RF-32 |
| **9 · Panel coach** | Mis equipos + roster (baja vs. eliminar) | RF-40..41 |
| **10 · Pulido** | Accesibilidad, responsive, estados vacíos/carga/error, animaciones finales, revisión | todo |

---

## 10. Reglas de negocio que impactan la UI

1. **Sin empates:** el formulario de resultado rechaza marcadores iguales (validación cliente + `422`).
2. **Forfeit = 21-0:** botón "Forfeit" + selector del equipo que pierde; el marcador lo fija el backend.
3. **Puntos:** victoria = `points_win`, derrota = `points_loss`, más ajustes manuales; solo cuentan `finished` y `forfeit`.
4. **Jersey único** entre jugadores **activos** de un equipo (`409`).
5. **Dar de baja ≠ eliminar** jugador (baja conserva stats; eliminar borra todo, con confirmación).
6. **Borrado en cascada** de torneo: confirmación fuerte; sugerir cambiar estado a `cancelled`/`finished`.
7. **Coach acotado** a sus equipos (`403` fuera de alcance).
8. **Finanzas solo admin**; `balance > 0` en rojo (adeudo), negativo = saldo a favor.

---

## 11. Decisiones que necesito confirmar contigo

1. **Auth:** ¿`supabase-js` (recomendado, renueva token solo) o flujo manual `POST /auth/login`?
2. **Nombre/identidad visual:** el proyecto se llama "LigaPremier" pero el deporte es **flag football**. ¿La marca es genérica de la liga o quieres un nombre/branding específico?
3. **Librerías nuevas** a instalar (react-router, TanStack Query, react-hook-form, zod, supabase-js, lucide, fontsource): ¿las apruebas antes de la Fase 0?
4. **Decisiones pendientes del RF §9** que afectan pantallas:
   - Desempate por enfrentamiento directo (solo cambia orden/pie de tabla).
   - **"Club" permanente vs. inscripción por torneo** → si se aprueba, agrega pantallas de clubes e historial; conviene decidirlo **antes** de construir las pantallas de equipos (Fase 4).
   - Multas automáticas (hoy manuales, RF-31).
5. **Idioma/formato:** ¿todo en español (es-MX) y moneda MXN fijos, o configurable?

---

## 12. Riesgos y notas

- El contrato exacto (campos opcionales, nombres) debe verificarse contra `openapi.json` al empezar cada feature; este plan asume los endpoints listados en el RF.
- La **hoja de captura de estadísticas** (RF-28) y **finanzas** (RF-29..31) son las pantallas más complejas: conviene prototiparlas primero dentro de su fase.
- Generar tipos TypeScript desde `openapi.json` (p. ej. `openapi-typescript`) reduciría errores; a evaluar en Fase 0.
