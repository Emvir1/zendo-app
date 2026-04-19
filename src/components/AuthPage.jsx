import { useState } from 'react'
import { login, register } from '../api'
import LoginLoader from './LoginLoader'

export default function AuthPage({ onLogin }) {
  const [mode,         setMode]         = useState('login')
  const [loggingIn,    setLoggingIn]    = useState(false)

  function handleLogin(userData) {
    setLoggingIn(true)
    // small delay so the loader renders before App re-mounts
    setTimeout(() => onLogin(userData), 100)
  }

  if (loggingIn) return <LoginLoader />

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="logo-icon">Z</div>
          <span className="logo-text">ZenDo</span>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab${mode === 'login' ? ' active' : ''}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={`auth-tab${mode === 'register' ? ' active' : ''}`}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        {mode === 'login'
          ? <LoginForm onLogin={handleLogin} onSwitch={() => setMode('register')} />
          : <RegisterForm onSwitch={() => setMode('login')} />
        }
      </div>
    </div>
  )
}

// ── Login ─────────────────────────────────────────────────────────────────────

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await login(username, password)
      onLogin(data.user)
    } catch {
      setError('Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <p className="auth-error">{error}</p>}

      <label className="auth-label">Username</label>
      <input
        className="auth-input"
        type="text"
        placeholder="your_username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
        autoFocus
      />

      <label className="auth-label">Password</label>
      <input
        className="auth-input"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />

      <button className="auth-btn" type="submit" disabled={loading}>
        {loading ? 'Logging in…' : 'Login'}
      </button>
    </form>
  )
}

// ── Register ──────────────────────────────────────────────────────────────────

function RegisterForm({ onSwitch }) {
  const [form, setForm] = useState({
    username: '', password: '', first_name: '', last_name: '',
    middle_name: '', gender: '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [success, setSuccess] = useState(false)

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const payload = { ...form }
      if (!payload.middle_name) delete payload.middle_name
      if (!payload.gender)      delete payload.gender
      await register(payload)
      setSuccess(true)
    } catch (err) {
      setError('Registration failed. Username may already be taken.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-success">
        <p>Account created! You can now log in.</p>
        <button className="auth-btn" onClick={onSwitch}>Go to Login</button>
      </div>
    )
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <p className="auth-error">{error}</p>}

      <div className="auth-row">
        <div className="auth-field">
          <label className="auth-label">First Name *</label>
          <input className="auth-input" type="text" placeholder="Jenna"
            value={form.first_name} onChange={set('first_name')} required />
        </div>
        <div className="auth-field">
          <label className="auth-label">Last Name *</label>
          <input className="auth-input" type="text" placeholder="Doe"
            value={form.last_name} onChange={set('last_name')} required />
        </div>
      </div>

      <label className="auth-label">Middle Name</label>
      <input className="auth-input" type="text" placeholder="(optional)"
        value={form.middle_name} onChange={set('middle_name')} />

      <label className="auth-label">Username *</label>
      <input className="auth-input" type="text" placeholder="your_username"
        value={form.username} onChange={set('username')} required autoFocus />

      <label className="auth-label">Password * (min 8 characters)</label>
      <input className="auth-input" type="password" placeholder="••••••••"
        value={form.password} onChange={set('password')} required />

      <label className="auth-label">Gender</label>
      <select className="auth-input auth-select" value={form.gender} onChange={set('gender')}>
        <option value="">— optional —</option>
        <option value="female">Female</option>
        <option value="male">Male</option>
        <option value="other">Other</option>
      </select>

      <button className="auth-btn" type="submit" disabled={loading}>
        {loading ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  )
}
