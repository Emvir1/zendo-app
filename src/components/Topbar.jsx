import { useState, useEffect, useRef } from 'react'

export default function Topbar({
  title, searchQuery, onSearch, onMenuOpen,
  user, onProfileOpen, notifications = [],
}) {
  const [notifOpen, setNotifOpen] = useState(false)
  const panelRef = useRef(null)

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : '?'

  const unread = notifications.length

  // Close panel when clicking outside
  useEffect(() => {
    if (!notifOpen) return
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [notifOpen])

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn hamburger" onClick={onMenuOpen} aria-label="Open menu">
          ☰
        </button>
        <span className="topbar-title">{title}</span>
      </div>

      <div className="topbar-right">
        <div className="search-bar">
          <span style={{ color: '#6b7280', fontSize: 14 }}>🔍</span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={e => onSearch(e.target.value)}
          />
        </div>

        {/* Notification bell */}
        <div className="notif-wrap" ref={panelRef}>
          <button
            className="icon-btn notif-btn"
            title="Notifications"
            onClick={() => setNotifOpen(v => !v)}
            aria-label="Notifications"
          >
            🔔
            {unread > 0 && (
              <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>
            )}
          </button>

          {notifOpen && (
            <div className="notif-panel">
              <div className="notif-header">
                <span className="notif-title">Notifications</span>
                {unread > 0 && (
                  <span className="notif-count">{unread} pending today</span>
                )}
              </div>

              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <span>✓</span>
                    <p>All caught up! No pending tasks for today.</p>
                  </div>
                ) : (
                  notifications.map(task => (
                    <div key={task.id} className="notif-item">
                      <span className="notif-dot" />
                      <span className="notif-text">{task.text}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div
          className="avatar"
          title="My Profile"
          onClick={onProfileOpen}
          style={{ cursor: 'pointer' }}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
