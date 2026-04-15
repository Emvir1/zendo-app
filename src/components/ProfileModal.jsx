import { useState } from 'react'

export default function ProfileModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    username:   user.username   ?? '',
    first_name: user.first_name ?? '',
    last_name:  user.last_name  ?? '',
    middle_name:user.middle_name?? '',
    birth_date: user.birth_date ? user.birth_date.slice(0, 10) : '',
    gender:     user.gender     ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState(null)

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    // Only send fields that have a value
    const payload = {}
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '') payload[k] = v
    })

    try {
      await onSave(payload)
    } catch (err) {
      setError(err.message ?? 'Failed to update profile.')
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card profile-card" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <span className="modal-label">My Profile</span>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Avatar */}
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">{initials}</div>
          <div>
            <p className="profile-name">{user.first_name} {user.last_name}</p>
            <p className="profile-username">@{user.username}</p>
          </div>
        </div>

        {error && <p className="modal-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="auth-row">
            <div className="auth-field">
              <label className="modal-field-label">First Name</label>
              <input className="modal-input" type="text" value={form.first_name} onChange={set('first_name')} required />
            </div>
            <div className="auth-field">
              <label className="modal-field-label">Last Name</label>
              <input className="modal-input" type="text" value={form.last_name} onChange={set('last_name')} required />
            </div>
          </div>

          <label className="modal-field-label">Middle Name</label>
          <input className="modal-input" type="text" placeholder="optional" value={form.middle_name} onChange={set('middle_name')} />

          <label className="modal-field-label">Username</label>
          <input className="modal-input" type="text" value={form.username} onChange={set('username')} required />

          <div className="auth-row">
            <div className="auth-field">
              <label className="modal-field-label">Birth Date</label>
              <input className="modal-input" type="date" value={form.birth_date} onChange={set('birth_date')} />
            </div>
            <div className="auth-field">
              <label className="modal-field-label">Gender</label>
              <select className="modal-input modal-select" value={form.gender} onChange={set('gender')}>
                <option value="">— optional —</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="modal-actions" style={{ justifyContent: 'flex-end' }}>
            <div className="modal-actions-right">
              <button type="button" className="modal-btn modal-btn-cancel" onClick={onClose} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="modal-btn modal-btn-save" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  )
}
