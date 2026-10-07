import { ApiError } from './errors'
import { supabase } from './supabase'

const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const BASE = `${API_URL}/api/v1`

// En producción el token viaja en cada petición: solo por HTTPS.
const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(API_URL)
if (import.meta.env.PROD && !API_URL.startsWith('https://') && !isLocal) {
  throw new Error('[LigaPremier] VITE_API_URL debe usar https:// en producción')
}

type Query = Record<string, string | number | boolean | undefined | null>

interface RequestOptions {
  query?: Query
  body?: unknown
  /** FormData para subir archivos (no se serializa a JSON). */
  form?: FormData
  signal?: AbortSignal
  /** Forzar envío (o no) del token. Por defecto se envía si hay sesión. */
  auth?: boolean
}

function buildUrl(path: string, query?: Query): string {
  const url = new URL(BASE + path)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url.toString()
}

async function accessToken(explicit?: boolean): Promise<string | null> {
  if (explicit === false) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

async function request<T>(
  method: string,
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const token = await accessToken(opts.auth)
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

  let body: BodyInit | undefined
  if (opts.form) {
    body = opts.form // el navegador pone el boundary de multipart
  } else if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(opts.body)
  }

  const res = await fetch(buildUrl(path, opts.query), {
    method,
    headers,
    body,
    signal: opts.signal,
    // La API usa el token en la cabecera, nunca cookies: no se envían credenciales
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
  })

  if (res.status === 204) return undefined as T

  // Un cuerpo vacío o no-JSON (200 sin body, 500 con HTML de un proxy) no debe romper.
  // El texto crudo no-JSON nunca se muestra al usuario: puede traer detalles internos.
  const raw = await res.text()
  let payload: unknown = null
  if (raw) {
    try {
      payload = JSON.parse(raw)
    } catch {
      payload = null
    }
  }

  if (!res.ok) {
    // Token expirado o revocado: se cierra la sesión local y AuthProvider manda al login
    if (res.status === 401 && token) {
      void supabase.auth.signOut({ scope: 'local' })
    }
    const detail =
      payload && typeof payload === 'object' && 'detail' in payload
        ? (payload as { detail: unknown }).detail
        : null
    const retryAfter = Number(res.headers.get('Retry-After')) || null
    throw new ApiError(res.status, detail, retryAfter)
  }

  return (payload ?? undefined) as T
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>('GET', path, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('POST', path, { ...opts, body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PUT', path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PATCH', path, { ...opts, body }),
  del: <T>(path: string, opts?: RequestOptions) =>
    request<T>('DELETE', path, opts),
  upload: <T>(path: string, form: FormData, opts?: RequestOptions) =>
    request<T>('POST', path, { ...opts, form }),
}
