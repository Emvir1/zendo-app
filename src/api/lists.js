// ── Lists ─────────────────────────────────────────────────────────────────────
import { request } from './client'

// GET    /api/lists/      → { lists: [{id, category}] }
export const getLists = () =>
  request('/api/lists/')

// GET    /api/lists/:id   → { list }
export const getListById = (id) =>
  request(`/api/lists/${id}`)

// POST   /api/lists/      → { message, list }
export const createList = (category) =>
  request('/api/lists/', { method: 'POST', body: JSON.stringify({ category }) })

// PATCH  /api/lists/:id   → { message, list }
export const updateList = (id, category) =>
  request(`/api/lists/${id}`, { method: 'PATCH', body: JSON.stringify({ category }) })

// DELETE /api/lists/:id   → { message }
export const deleteList = (id) =>
  request(`/api/lists/${id}`, { method: 'DELETE' })
