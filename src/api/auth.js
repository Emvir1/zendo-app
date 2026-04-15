// ── Auth ──────────────────────────────────────────────────────────────────────
import { request } from './client'

// POST /auth/register  → { message }
export const register = (data) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify(data) })

// POST /auth/login  → { message, user, access_token_cookie }
export async function login(username, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  localStorage.setItem('zendo_token', data.access_token_cookie)
  return data
}

// Clears the stored token (call on logout)
export function logout() {
  localStorage.removeItem('zendo_token')
}
