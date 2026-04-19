import { useEffect, useState } from 'react'

const TIPS = [
  'Organizing your tasks keeps your mind clear.',
  'A small step forward is still progress.',
  'Focus on what matters most today.',
  'Breaking big goals into small tasks makes them achievable.',
  'Your productivity journey starts with one task.',
  'Done is better than perfect.',
  'Stay consistent — small wins add up.',
]

export default function LoginLoader() {
  const [tip, setTip]         = useState(0)
  const [visible, setVisible] = useState(true)

  // Rotate tips every 2.5 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setTip(t => (t + 1) % TIPS.length)
        setVisible(true)
      }, 300)
    }, 2500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="login-loader">
      {/* Background blobs */}
      <div className="loader-blob loader-blob-1" />
      <div className="loader-blob loader-blob-2" />

      <div className="loader-content">
        {/* Logo */}
        <div className="loader-logo">
          <div className="loader-logo-icon">Z</div>
          <span className="loader-logo-text">ZenDo</span>
        </div>

        {/* Spinner */}
        <div className="loader-spinner-wrap">
          <div className="loader-spinner" />
          <div className="loader-spinner loader-spinner-2" />
        </div>

        {/* Status */}
        <p className="loader-status">Setting up your workspace…</p>

        {/* Rotating tip */}
        <div className={`loader-tip${visible ? ' visible' : ''}`}>
          <span className="loader-tip-icon">💡</span>
          {TIPS[tip]}
        </div>
      </div>
    </div>
  )
}
