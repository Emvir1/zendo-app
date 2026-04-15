import { useState, useEffect } from 'react'

export default function TaskModal({ task, lists = [], onClose, onSave, onDelete }) {
  const [title,       setTitle]       = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [status,      setStatus]      = useState(task.status)
  const [listId,      setListId]      = useState(task.list_id ?? '')
  const [saving,      setSaving]      = useState(false)
  const [deleting,    setDeleting]    = useState(false)
  const [error,       setError]       = useState(null)

  // Keep form in sync if parent passes a new task
  useEffect(() => {
    setTitle(task.title)
    setDescription(task.description ?? '')
    setStatus(task.status)
    setListId(task.list_id ?? '')
    setError(null)
  }, [task.id])

  async function handleSave(e) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError(null)
    try {
      await onSave(task.id, {
        title:       title.trim(),
        description: description.trim() || null,
        status,
        list_id:     listId === '' ? null : Number(listId),
      })
    } catch {
      setError('Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      await onDelete(task.id)
    } catch {
      setError('Failed to delete task.')
      setDeleting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <span className="modal-label">Edit Task</span>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {error && <p className="modal-error">{error}</p>}

        <form onSubmit={handleSave}>
          {/* Title */}
          <label className="modal-field-label">Title</label>
          <input
            className="modal-input"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            autoFocus
          />

          {/* Description */}
          <label className="modal-field-label">Description</label>
          <textarea
            className="modal-input modal-textarea"
            placeholder="Add a description…"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
          />

          {/* Status */}
          <label className="modal-field-label">Status</label>
          <select
            className="modal-input modal-select"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          {/* List */}
          <label className="modal-field-label">List</label>
          <select
            className="modal-input modal-select"
            value={listId}
            onChange={e => setListId(e.target.value)}
          >
            <option value="">— No list —</option>
            {lists.map(l => (
              <option key={l.id} value={l.id}>
                {l.category}
              </option>
            ))}
          </select>

          {/* Meta */}
          <p className="modal-meta">
            Created: {new Date(task.created_at).toLocaleString()}
          </p>

          {/* Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="modal-btn modal-btn-delete"
              onClick={handleDelete}
              disabled={deleting || saving}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>

            <div className="modal-actions-right">
              <button
                type="button"
                className="modal-btn modal-btn-cancel"
                onClick={onClose}
                disabled={saving || deleting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="modal-btn modal-btn-save"
                disabled={saving || deleting}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  )
}
