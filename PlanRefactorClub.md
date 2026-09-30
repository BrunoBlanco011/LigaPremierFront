# Plan de migración — Modelo **Club** (v0.2 → v0.3)

> Adapta el frontend ya construido al refactor de arquitectura de la v0.3 de
> `RequerimientosFuncionales.md`: separar **Club** (permanente) de **Team /
> inscripción** (por torneo).
>
> **Estado:** propuesta para revisión. No se ha tocado código de la migración.

---

## 1. El cambio en una frase

Hoy un "equipo" vive dentro de un torneo. En la v0.3 se parte en dos:

| Entidad | Qué es | Endpoints raíz | Persiste |
|---------|--------|----------------|----------|
| **Club** | Equipo permanente de la liga (nombre, logo, coach, **plantilla**) | `/clubs` | Entre torneos |
| **Team (inscripción)** | Un club inscrito a un torneo; a él se ligan partidos, tabla, stats y finanzas. Trae `club_id` | `/tournaments/{id}/teams`, `/teams/{id}` | Por torneo |

**Flujo:** crear clubes una vez → inscribir clubes a cada torneo → generar rol.
Habilita **historial por club** y **estadísticas de carrera por jugador**.

---

## 2. Endpoints nuevos o que cambian (v0.3)

| RF | Antes (v0.2) | Ahora (v0.3) |
|----|--------------|--------------|
| RF-21 | `POST /tournaments/{id}/teams` (crear equipo) | **`GET/POST /clubs`, `GET/PATCH/DELETE /clubs/{id}`** (CRUD de club) |
| RF-22 | `POST /teams/{id}/logo` | **`POST /clubs/{id}/logo`** |
| RF-22b | — | **`POST /tournaments/{id}/teams` `{ club_ids: [...] }`** (inscribir); `DELETE /teams/{id}` (dar de baja inscripción) |
| RF-16 | `GET /tournaments/{id}/teams` | Igual, pero cada inscripción trae `id`(team_id), `club_id`, `name`, `logo_url`, `coach_name` |
| RF-17b | — | **`GET /clubs`, `/clubs/{id}`, `/clubs/{id}/players`, `/clubs/{id}/history`** |
| RF-19 | `stats → { totals, matches }` | **`stats → { totals, by_tournament, matches }`** (carrera) |
| RF-40 | `GET /me/teams` | **`GET /me/clubs`** |
| RF-41 | `GET/POST /teams/{id}/players` | **`GET/POST /clubs/{id}/players`** (la plantilla es del club) |
| RF-41 | — | **Transferencia:** `PATCH /players/{id}` con `club_id` (solo admin) |

**Regla de tabla (desempate) también cambia:** puntos → **puntos a favor → diferencia** → menos en contra (en v0.2 era diferencia → PF).

---

## 3. Impacto sobre el código actual

### 3.1 Tipos (`src/types/api.ts`)
- **Nuevo** `Club { id, name, coach_name, coach_user_id, logo_url }`.
- `Team` (inscripción) gana `club_id`; su `name`/`logo_url` provienen del club.
- `Player` pasa a pertenecer al **club** (`club_id`) en lugar de `team_id`.
- `PlayerStatsResponse` gana `by_tournament: { tournament, ...totales }[]`.
- **Nuevo** `ClubHistoryRow { tournament, team_id, standing, teams_count }`.

### 3.2 Capa `features` (lo más grande, pero mecánico)
| Archivo | Acción |
|---------|--------|
| **`features/clubs/queries.ts`** | NUEVO: `useClubs`, `useClub`, `useClubPlayers`, `useClubHistory` |
| **`features/clubs/mutations.ts`** | NUEVO: crear/editar/eliminar club, subir logo, inscribir clubes, transferir jugador |
| `features/coach/queries.ts` | `useMyTeams` → **`useMyClubs`** (`/me/clubs`) |
| `features/players/mutations.ts` | `useCreatePlayer(clubId)` apunta a `/clubs/{id}/players`; update/delete se quedan por `player_id`; **+ `useTransferPlayer`** |
| `features/teams/queries.ts` | `useTournamentTeams` ahora devuelve inscripciones con `club_id`; el roster se lee del club, no del team |
| `features/players/queries.ts` | `usePlayerStats` incluye `by_tournament` |

### 3.3 Organismos (reutilizables — cambio menor)
| Componente | Acción |
|------------|--------|
| `RosterManager` | Parametrizar por **`clubId`** en vez de `teamId` (lo usan coach y admin) |
| `PlayerForm` | Alta contra `/clubs/{id}/players` |
| **`LogoUploader`** | NUEVO: subida con vista previa, validación PNG/JPG/WEBP/SVG ≤ 2 MB (RF-22) |
| `ClubForm` | NUEVO: alta/edición de club (name, coach_name, coach_user_id) |
| `StandingsTable` | Actualizar texto del desempate |
| `Navbar` / `Sidebar` | Agregar entrada **"Clubes"** |

### 3.4 Páginas
| Ruta | Acción |
|------|--------|
| `/clubes` | NUEVA — lista de clubes (`ClubsPage`) |
| `/clubes/:id` | NUEVA — perfil + historial del club (`ClubProfilePage`, RF-17b) |
| `/torneos/:id/equipos/:teamId` | NUEVA — equipo en el torneo (RF-17), enlaza a su club |
| `/jugadores/:id` | Ampliar con **carrera** (`by_tournament`) |
| `/admin/clubes` | NUEVA — CRUD de clubes + logo + asignar coach (RF-21/22) |
| `/admin/clubes/:id/jugadores` | NUEVA — plantilla del club + transferencias |
| Admin torneo → pestaña "Equipos" | Cambia a **"Inscribir clubes"** (RF-22b) |
| `/coach` | `CoachHomePage` → **mis clubes** |
| `/coach/clubes/:id` | `CoachRosterPage` → plantilla del club (reusa `RosterManager`) |

### 3.5 Textos
- Advertencia de borrado de torneo: aclarar que **clubes y jugadores se conservan** (solo se borra la inscripción y lo del torneo).

---

## 4. Orden de ejecución (incrementos verificables)

Cada incremento cierra con `tsc` + `eslint` + build en verde.

| # | Incremento | RF | Nota |
|---|------------|----|----|
| **1** | Tipos + `features/clubs` + ajustes en teams/players/coach/stats | — | Base; sin romper UI existente |
| **2** | Rutas + navegación (Navbar/Sidebar con "Clubes") | §8 | Estructura lista |
| **3** | Admin: CRUD de clubes + `LogoUploader` + asignar coach | RF-21, RF-22 | Reusa `TournamentForm` como patrón |
| **4** | Admin: inscribir / dar de baja clubes en el torneo | RF-22b | Reemplaza pestaña "Equipos" |
| **5** | Coach → clubes: `useMyClubs`, `RosterManager` por `clubId` | RF-40, RF-41 | Repunta lo ya hecho |
| **6** | Admin: plantilla de club + **transferencias** | RF-41 | Solo admin |
| **7** | Perfil de club + historial; carrera del jugador | RF-17b, RF-19 | Pantallas nuevas |
| **8** | Perfil de equipo en el torneo + enlaces club↔team | RF-16, RF-17 | |
| **9** | Ajustes finos: desempate de tabla, textos de cascada | RF-12 | |
| **10** | Verificación final (build + revisión) | — | |

**Estimación de reúso:** ~70% de la UI (atoms/molecules/organisms, StateView, tablas,
formularios) se conserva. El grueso del trabajo es capa `features` + rutas + 2–3
pantallas nuevas.

---

## 5. Qué NO cambia

- Todo el sistema de diseño atómico (tokens, tipografía, componentes base).
- Auth y guards por rol.
- Sitio público de tabla, rol de juegos, resultados y estadísticas (solo cambian
  las fuentes de datos de equipos/roster).
- Cliente API, manejo de errores, formateo MXN/fechas.

---

## 6. A confirmar antes de empezar

1. **v0.3 es la fuente de verdad** (renombrar/limpiar los `.md` para evitar confusión: hoy `RefactorArquitectura.md` es la v0.2 vieja).
2. **Roster público:** ¿el sitio público muestra la plantilla del club o solo los jugadores del equipo en ese torneo? (RF-17 sugiere plantilla del club).
3. **Transferencias:** confirmar que solo admin y que las stats previas se quedan con el equipo con el que se hicieron (así lo dice RF-41).
