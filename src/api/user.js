// ── User / Profile ────────────────────────────────────────────────────────────
import { request } from './client'

// GET  /api/users/self  → { user }
export const getProfile = () =>
  request('/api/users/self')

// PATCH /api/users/self  → { message, user }
export const updateProfile = (data) =>
  request('/api/users/self', { method: 'PATCH', body: JSON.stringify(data) })
