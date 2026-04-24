import { useEffect, useState } from 'react'

const COUNTDOWN_SEC = 120 // 2 minutes

export default function IdleWarningModal({ onStay, onLogout }) {
  const [seconds, setSeconds] = useState(COUNTDOWN_SEC)

  useEffect(() => {
    if (seconds <= 0) {
      onLogout()
      return
    }
    const id = setInterval(() => setSeconds(s => s - 1), 1000)
    return () => clearInterval(id)
  }, [seconds, onLogout])

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const pct = (seconds / COUNTDOWN_SEC) * 100

  return (
    <div className="modal-overlay idle-overlay">
      <div className="modal-card idle-card">

        <div className="idle-icon">⏱</div>

        <h2 className="idle-title">Still there?</h2>
        <p className="idle-subtitle">
          You've been inactive for a while. For your security, you'll be
          logged out automatically.
        </p>

        {/* Countdown ring */}
        <div className="idle-countdown">
          <svg className="idle-ring" viewBox="0 0 56 56">
            <circle className="idle-ring-bg" cx="28" cy="28" r="24" />
            <circle
              className="idle-ring-fill"
              cx="28" cy="28" r="24"
              strokeDasharray={`${2 * Math.PI * 24}`}
              strokeDashoffset={`${2 * Math.PI * 24 * (1 - pct / 100)}`}
            />
          </svg>
          <span className="idle-time">{mm}:{ss}</span>
        </div>

        <div className="idle-actions">
          <button className="modal-btn modal-btn-cancel idle-btn-logout" onClick={onLogout}>
            Log out now
          </button>
          <button className="modal-btn modal-btn-save" onClick={onStay}>
            Stay logged in
          </button>
        </div>

      </div>
    </div>
  )
}
