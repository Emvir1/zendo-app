// ── Tasks ─────────────────────────────────────────────────────────────────────
import { request } from './client'

// GET    /api/tasks/     → { tasks: [...] }
export const getTasks = () =>
  request('/api/tasks/')

// GET    /api/tasks/:id  → { task }
export const getTaskById = (id) =>
  request(`/api/tasks/${id}`)

// POST   /api/tasks/     → { message, task }
export const createTask = (data) =>
  request('/api/tasks/', { method: 'POST', body: JSON.stringify(data) })

// PATCH  /api/tasks/:id  → { message, task }
export const updateTask = (id, data) =>
  request(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) })

// DELETE /api/tasks/:id  → { message }
export const deleteTask = (id) =>
  request(`/api/tasks/${id}`, { method: 'DELETE' })
