import { ApiError } from './errors'
import { supabase } from './supabase'

export const BASE = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/api/v1`

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

async function authHeader(explicit?: boolean): Promise<Record<string, string>> {
  if (explicit === false) return {}
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(
  method: string,
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    ...(await authHeader(opts.auth)),
  }

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
  })

  if (res.status === 204) return undefined as T

  // Un cuerpo vacío o no-JSON (200 sin body, 500 con HTML) no debe romper:
  // se parsea con tolerancia y se conserva el texto crudo como detalle.
  const raw = await res.text()
  let payload: unknown = null
  if (raw) {
    try {
      payload = JSON.parse(raw)
    } catch {
      payload = raw
    }
  }

  if (!res.ok) {
    const detail =
      payload && typeof payload === 'object' && 'detail' in payload
        ? (payload as { detail: unknown }).detail
        : (payload ?? `Error ${res.status}`)
    throw new ApiError(res.status, detail)
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
