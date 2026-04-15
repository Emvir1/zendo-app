// ── Shared request helper ─────────────────────────────────────────────────────
// JWT is stored in localStorage and attached as an Authorization header.
// CORS stays open (*) — no credentials: 'include' needed.

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

export function getToken() {
  return localStorage.getItem('zendo_token')
}

export async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    let message = `API error ${res.status}`
    try {
      const body = await res.json()
      if (body.message) message = body.message
    } catch {}
    throw new Error(message)
  }
  return res.json()
}
