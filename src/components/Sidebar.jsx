import { useState } from 'react'
import { listColor } from '../App'

export default function Sidebar({
  activeNav, onNavChange, todayCount,
  lists, lightMode, onToggleLight, onLogout,
  open, onClose,
  onAddList, onRenameList, onDeleteList,
}) {
  function nav(id) { onNavChange(id); onClose() }

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">Z</div>
          <span className="logo-text">ZenDo</span>
          <button className="sidebar-close" onClick={onClose} aria-label="Close menu">✕</button>
        </div>

        <nav className="sidebar-nav">
          <NavItem icon="⊞" label="All Tasks"  active={activeNav === 'all'}       onClick={() => nav('all')} />
          <NavItem icon="📅" label="Today"      active={activeNav === 'today'}     badge={todayCount > 0 ? todayCount : null} onClick={() => nav('today')} />
          <NavItem icon="★"  label="Important"  active={activeNav === 'important'} onClick={() => nav('important')} />
        </nav>

        <div className="sidebar-lists">
          <p className="section-label">Lists</p>

          {lists.map(list => (
            <ListItem
              key={list.id}
              list={list}
              active={activeNav === list.id}
              onClick={() => nav(list.id)}
              onRename={onRenameList}
              onDelete={onDeleteList}
            />
          ))}

          <NewListInput onAdd={onAddList} />
        </div>

        <div className="sidebar-footer">
          <div className="footer-item">
            <span>☀</span>
            Light Mode
            <label className="toggle-switch">
              <input type="checkbox" checked={lightMode} onChange={onToggleLight} />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="footer-item">
            <span>⚙</span>
            Settings
          </div>

          <div className="footer-item" onClick={onLogout} style={{ color: '#ef4444' }}>
            <span>↩</span>
            Logout
          </div>
        </div>
      </aside>
    </>
  )
}

// ── Nav item ──────────────────────────────────────────────────────────────────

function NavItem({ icon, label, active, badge, onClick }) {
  return (
    <div className={`nav-item${active ? ' active' : ''}`} onClick={onClick}>
      <span>{icon}</span>
      {label}
      {badge != null && <span className="nav-badge">{badge}</span>}
    </div>
  )
}

// ── List item with rename / delete ────────────────────────────────────────────

function ListItem({ list, active, onClick, onRename, onDelete }) {
  const [editing,  setEditing]  = useState(false)
  const [value,    setValue]    = useState(list.category)

  function commitRename() {
    const trimmed = value.trim()
    if (trimmed && trimmed !== list.category) onRename(list.id, trimmed)
    else setValue(list.category)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="list-item">
        <ListDot color={listColor(list.id)} />
        <input
          className="list-rename-input"
          value={value}
          autoFocus
          onChange={e => setValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={e => {
            if (e.key === 'Enter') commitRename()
            if (e.key === 'Escape') { setValue(list.category); setEditing(false) }
          }}
        />
      </div>
    )
  }

  return (
    <div className={`list-item${active ? ' active' : ''}`} onClick={onClick}>
      <ListDot color={listColor(list.id)} />
      <span className="list-item-label">{list.category}</span>
      <div className="list-item-actions">
        <button
          className="list-action-btn"
          title="Rename"
          onClick={e => { e.stopPropagation(); setEditing(true) }}
        >✎</button>
        <button
          className="list-action-btn list-action-delete"
          title="Delete"
          onClick={e => { e.stopPropagation(); onDelete(list.id) }}
        >×</button>
      </div>
    </div>
  )
}

// ── New list inline input ─────────────────────────────────────────────────────

function NewListInput({ onAdd }) {
  const [open,  setOpen]  = useState(false)
  const [value, setValue] = useState('')

  async function handleAdd() {
    const trimmed = value.trim()
    if (!trimmed) return
    await onAdd(trimmed)
    setValue('')
    setOpen(false)
  }

  if (!open) {
    return (
      <div className="list-item new-list-item" onClick={() => setOpen(true)}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
        New List
      </div>
    )
  }

  return (
    <div className="list-item new-list-form">
      <span style={{ fontSize: 16, lineHeight: 1, color: 'var(--text-dim)' }}>+</span>
      <input
        className="list-rename-input"
        placeholder="List name…"
        value={value}
        autoFocus
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') handleAdd()
          if (e.key === 'Escape') { setValue(''); setOpen(false) }
        }}
      />
      <button className="list-add-btn" onClick={handleAdd}>Add</button>
    </div>
  )
}

function ListDot({ color }) {
  return (
    <span style={{
      width: 10, height: 10, borderRadius: '50%',
      backgroundColor: color, display: 'inline-block', flexShrink: 0,
    }} />
  )
}
