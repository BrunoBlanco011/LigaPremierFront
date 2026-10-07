# Seguridad – Liga Premier Frontend

Reglas de seguridad del frontend, alineadas con las del backend
(`LigaPremierBackend/docs/SEGURIDAD.md`). **El backend es quien protege los datos**: todo lo que se
valida aquí se vuelve a validar en el servidor. El frontend da retroalimentación inmediata, no expone
información de más y reduce el daño posible si algo sale mal (por ejemplo, un XSS).

---

## 1. Inicio de sesión

| Regla | Dónde |
|-------|-------|
| **El login pasa por la API** (`POST /api/v1/auth/login`) y no directo a Supabase. Así aplica el bloqueo por intentos fallidos del backend y queda en su bitácora de auditoría. Con los tokens recibidos se abre la sesión en supabase-js (`setSession`), que se encarga de renovarlos | `src/auth/AuthProvider.tsx` |
| Mensaje genérico ante credenciales incorrectas (“Correo o contraseña incorrectos”): no revela si el correo existe | `src/pages/auth/LoginPage.tsx` |
| Si el backend bloquea (429), se muestra cuánto falta para reintentar, leyendo la cabecera `Retry-After` | `src/lib/errors.ts` (`tooManyRequestsMessage`) |
| **Cierre de sesión por inactividad**: 30 minutos sin actividad (clic, tecla, scroll, toque) cierran la sesión | `src/auth/AuthProvider.tsx` (`IDLE_TIMEOUT_MS`) |
| Si la API responde 401 a una petición con token (token vencido o revocado), se cierra la sesión local y la app regresa al login | `src/lib/api.ts` |
| Al cerrar sesión se borra la caché de React Query: el siguiente usuario no ve datos del anterior | `src/auth/AuthProvider.tsx` |

## 2. Contraseñas

Misma política que el backend (`UserCreate`), en `src/lib/security.ts` (`validatePassword`):

- Mínimo **10** caracteres y máximo 72 bytes.
- Debe tener **letras y números**.
- No puede contener la parte del correo antes de la `@`.

El formulario de alta de usuarios (`UserForm.tsx`) la valida antes de enviar, muestra la regla como
ayuda bajo el campo y usa `autoComplete="new-password"` para que el navegador sugiera una contraseña
segura.

## 3. Rutas protegidas por rol

- `/admin/*` exige rol `admin` y `/coach/*` exige rol `coach` (`src/auth/ProtectedRoute.tsx`).
- Esto es solo para la experiencia de uso: **la API rechaza (401/403) cualquier acción sin permiso**,
  aunque alguien modifique el JavaScript del navegador.

## 4. Subida de logos

`src/components/organisms/LogoUploader.tsx` + `src/lib/security.ts`:

- Solo **PNG, JPG y WEBP**, máximo 2 MB. **SVG ya no se acepta** (puede llevar JavaScript).
- Se revisan los primeros bytes del archivo (*magic bytes*): un archivo renombrado, por ejemplo un HTML
  con extensión `.png`, se rechaza antes de subirlo. El servidor hace la misma verificación.

## 5. Comunicación con la API

`src/lib/api.ts`:

- El token viaja solo en la cabecera `Authorization`; las peticiones usan `credentials: 'omit'` (sin
  cookies) y `referrerPolicy: 'no-referrer'`.
- **En producción la API debe ser HTTPS**: si `VITE_API_URL` usa `http://` (y no es `localhost`), la app
  no arranca.
- Los errores 500 o las respuestas que no son JSON (por ejemplo, una página HTML de un proxy) **nunca se
  muestran tal cual** al usuario: se muestra un mensaje genérico.
- Mensajes claros para 413 (archivo demasiado grande) y 429 (demasiados intentos).

## 6. Cabeceras de seguridad y CSP

### Content-Security-Policy (en el `index.html` del build)

`vite.config.ts` agrega al `index.html` de producción una CSP generada con los dominios del `.env`:

```
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: <SUPABASE_URL>; font-src 'self' data:;
connect-src 'self' <VITE_API_URL> <SUPABASE_URL>;
object-src 'none'; base-uri 'self'; form-action 'self'
```

- Solo se ejecutan scripts propios: un XSS no puede cargar código de otro dominio.
- La app solo puede hablar con la API y con Supabase: si alguien inyectara código, no podría enviar el
  token de sesión a un servidor externo.
- No se aplica en `npm run dev` porque el recargado en caliente de Vite usa scripts inline.
- **Si cambias de dominio de API o de Supabase, vuelve a hacer el build** para que la CSP se actualice.

### Cabeceras del servidor

- `public/_headers` (Netlify / Cloudflare Pages): HSTS, `X-Frame-Options: DENY`,
  `frame-ancestors 'none'` (contra clickjacking), `nosniff`, `Referrer-Policy`, `Permissions-Policy`,
  `Cross-Origin-Opener-Policy`.
- `vite dev` y `vite preview` envían las mismas cabeceras básicas (`vite.config.ts`).
- En **Vercel** o **Nginx** hay que configurar esas mismas cabeceras (en `vercel.json` → `headers` o con
  `add_header`), porque no leen `_headers`.

### Build

- `sourcemap: false`: no se publica el código fuente original.

## 7. Secretos y variables de entorno

- `.env.local` está en `.gitignore`.
- En el frontend **solo** va la llave publicable (`VITE_SUPABASE_ANON_KEY`). Con RLS y los permisos
  revocados en la base de datos, esa llave no puede leer ni escribir ninguna tabla; solo sirve para
  manejar la sesión.
- **Nunca** pongas la `service_role` key ni ningún secreto en una variable `VITE_*`: todo lo que empieza
  con `VITE_` termina dentro del JavaScript público.

## 8. Buenas prácticas para el código nuevo

- No usar `dangerouslySetInnerHTML`, `eval` ni `new Function` (la CSP los bloquearía de todos modos).
- Enlaces externos con `target="_blank"` siempre con `rel="noopener noreferrer"`.
- No guardar datos sensibles (finanzas, correos) en `localStorage`; React Query los mantiene solo en
  memoria.
- No escribir tokens ni datos personales en `console.log`.
- Toda validación de permisos o de datos debe existir **también** en el backend.

## 9. Checklist para producción

- [ ] `VITE_API_URL` con `https://` y el dominio real de la API.
- [ ] El dominio del frontend en `CORS_ORIGINS` del backend.
- [ ] Hacer el build con el `.env` de producción (la CSP toma los dominios de ahí).
- [ ] Configurar las cabeceras de `public/_headers` en el hosting (si no es Netlify o Cloudflare Pages).
- [ ] Servir solo por HTTPS.

## 10. Limitaciones conocidas

- supabase-js guarda la sesión en `localStorage` (así puede renovar el token). Si hubiera un XSS, el
  token se podría leer; la CSP y el cierre por inactividad reducen ese riesgo. Moverlo a cookies
  `HttpOnly` requeriría que el backend maneje la sesión.
- `style-src 'unsafe-inline'` se mantiene porque los componentes usan estilos inline. Es de bajo riesgo:
  los estilos inline no ejecutan código.
