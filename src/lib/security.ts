// Reglas de seguridad compartidas con el backend (ver docs/SEGURIDAD.md del backend).
// El servidor vuelve a validar todo: esto solo da retroalimentación inmediata.

export const PASSWORD_MIN_LENGTH = 10
export const PASSWORD_MAX_BYTES = 72

/** Misma política que `UserCreate` en el backend. Devuelve el error o `true`. */
export function validatePassword(password: string, email = ''): string | true {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`
  }
  if (new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES) {
    return 'La contraseña es demasiado larga'
  }
  if (!/\p{L}/u.test(password) || !/\d/.test(password)) {
    return 'Debe tener letras y números'
  }
  const local = email.split('@')[0]?.trim().toLowerCase()
  if (local && password.toLowerCase().includes(local)) {
    return 'No debe contener tu correo'
  }
  return true
}

export const LOGO_MAX_BYTES = 2 * 1024 * 1024
/** SVG no se acepta: puede llevar JavaScript (XSS). */
export const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const

/** Tipo real de la imagen según sus primeros bytes (el navegador solo mira la extensión). */
export async function detectImageType(file: Blob): Promise<string | null> {
  const b = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  const ascii = (from: number, to: number) => String.fromCharCode(...b.slice(from, to))
  if (b[0] === 0x89 && ascii(1, 4) === 'PNG') return 'image/png'
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg'
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp'
  return null
}
