import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import tailwindcss from '@tailwindcss/vite'

/** Cabeceras de seguridad para `vite` y `vite preview` (en producción las pone el hosting: public/_headers). */
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
}

function origin(url: string | undefined): string | null {
  try {
    return url ? new URL(url).origin : null
  } catch {
    return null
  }
}

/**
 * Content-Security-Policy en el index.html del build: solo se pueden cargar scripts
 * propios y solo se puede hablar con la API y con Supabase. Limita el daño de un XSS
 * (p. ej. robar el token de sesión y mandarlo a otro dominio).
 * No se aplica en `vite dev` porque el recargado en caliente usa scripts inline.
 */
function contentSecurityPolicy(env: Record<string, string>): Plugin {
  const api = origin(env.VITE_API_URL)
  const supabase = origin(env.VITE_SUPABASE_URL)
  const connect = ["'self'", api, supabase].filter(Boolean).join(' ')
  const images = ["'self'", 'data:', 'blob:', supabase].filter(Boolean).join(' ')
  const policy = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    `img-src ${images}`,
    "font-src 'self' data:",
    `connect-src ${connect}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  return {
    name: 'liga-premier-csp',
    apply: 'build',
    transformIndexHtml: () => [
      {
        tag: 'meta',
        attrs: { 'http-equiv': 'Content-Security-Policy', content: policy },
        injectTo: 'head-prepend',
      },
    ],
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [react(), tailwindcss(), contentSecurityPolicy(env)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: { headers: securityHeaders },
    preview: { headers: securityHeaders },
    build: {
      // Sin source maps públicos: no se publica el código fuente original
      sourcemap: false,
    },
  }
})
