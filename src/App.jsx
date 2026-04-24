import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import TaskList from './components/TaskList'
import TaskModal from './components/TaskModal'
import ProfileModal from './components/ProfileModal'
import AuthPage from './components/AuthPage'
import IdleWarningModal from './components/IdleWarningModal'
import { useIdleTimer } from './hooks/useIdleTimer'
import { getTasks, getTaskById, createTask, updateTask, deleteTask, updateProfile, logout, getLists, createList, updateList, deleteList } from './api'
import './App.css'

// ── Greeting helper ──────────────────────────────────────────────────────────
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

// Colour palette — assigned by list index since backend has no colour field
const PALETTE = ['#60a5fa','#f59e0b','#34d399','#a78bfa','#f87171','#fb923c','#4ade80','#e879f9']
export const listColor = (id) => PALETTE[(id - 1) % PALETTE.length]

// Normalize backend task → frontend shape
function normalize(task) {
  return {
    id:          task.id,
    text:        task.title,
    description: task.description ?? null,
    done:        task.status === 'completed',
    list_id:     task.list_id ?? null,
    createdAt:   task.created_at ?? new Date().toISOString(),
    completedAt: task.status === 'completed' ? (task.updated_at ?? null) : null,
  }
}

export default function App() {
  // ── Auth state (persisted in localStorage) ──────────────────────────────────
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('zendo_user')) } catch { return null }
  })

  const [activeNav,    setActiveNav]    = useState('all')
  const [tasks,        setTasks]        = useState([])
  const [lists,        setLists]        = useState([])
  const [newTask,      setNewTask]      = useState('')
  const [newDesc,      setNewDesc]      = useState('')
  const [addExpanded,  setAddExpanded]  = useState(false)
  const [lightMode,    setLightMode]    = useState(false)
  const [searchQuery,  setSearchQuery]  = useState('')
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [modalTask,    setModalTask]    = useState(null)
  const [profileOpen,  setProfileOpen]  = useState(false)
  const [idleWarn,     setIdleWarn]     = useState(false)

  // ── Auth handlers ────────────────────────────────────────────────────────────
  function handleLogin(userData) {
    localStorage.setItem('zendo_user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = useCallback(() => {
    logout()
    localStorage.removeItem('zendo_user')
    setUser(null)
    setTasks([])
    setIdleWarn(false)
  }, [])

  const { reset: resetIdle } = useIdleTimer({
    onWarn:        () => setIdleWarn(true),
    onLogout:      handleLogout,
    warnAfterMs:   8 * 60 * 1000,  // warn after 8 min
    logoutAfterMs: 2 * 60 * 1000,  // logout 2 min after warning
  })

  // ── Load tasks from Flask (only when logged in) ──────────────────────────────
  const fetchTasks = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      const [taskData, listData] = await Promise.all([getTasks(), getLists()])
      setTasks((taskData.tasks ?? []).map(normalize))
      setLists(listData.lists ?? [])
    } catch (err) {
      if (err.message.includes('401')) {
        handleLogout()
      } else {
        setError('Could not reach the server.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) fetchTasks()
    else       setLoading(false)
  }, [user, fetchTasks])

  // ── Derived values ──────────────────────────────────────────────────────────
  const today = new Date().toDateString()

  const todayTasks = tasks.filter(t => {
    const created = new Date(t.createdAt).toDateString()
    return created === today
  })

  const remainingToday = todayTasks.filter(t => !t.done).length

  const visibleTasks = (() => {
    let list = tasks
    if (activeNav === 'today')        list = todayTasks
    if (activeNav === 'important')    list = tasks.filter(t => t.important)
    if (typeof activeNav === 'number') list = tasks.filter(t => t.list_id === activeNav)
    if (searchQuery.trim())
      list = list.filter(t =>
        t.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    return list
  })()

  // ── Handlers ────────────────────────────────────────────────────────────────
  async function addTask(e) {
    e.preventDefault()
    const text = newTask.trim()
    if (!text) return

    const payload = { title: text }
    if (newDesc.trim()) payload.description = newDesc.trim()
    if (typeof activeNav === 'number') payload.list_id = activeNav

    // Optimistic: add locally first
    const tempId = `temp-${Date.now()}`
    const optimistic = {
      id: tempId, text, done: false,
      description: payload.description ?? null,
      list_id: payload.list_id ?? null, createdAt: new Date().toISOString(),
    }
    setTasks(prev => [optimistic, ...prev])
    setNewTask('')
    setNewDesc('')
    setAddExpanded(false)

    try {
      const res = await createTask(payload)
      const created = res.task ?? res
      setTasks(prev =>
        prev.map(t => t.id === tempId ? normalize(created) : t)
      )
    } catch (err) {
      setTasks(prev => prev.filter(t => t.id !== tempId))
      setError(err.message ?? 'Failed to save task.')
    }
  }


  async function toggleTask(id) {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const nextDone = !task.done

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: nextDone } : t))

    try {
      const res = await updateTask(id, { status: nextDone ? 'completed' : 'pending' })
      setTasks(prev => prev.map(t => t.id === id ? normalize(res.task) : t))
    } catch (err) {
      // Rollback
      setTasks(prev => prev.map(t => t.id === id ? { ...t, done: task.done } : t))
      setError(err.message ?? 'Failed to update task.')
    }
  }

  async function handleDeleteTask(id) {
    const snapshot = tasks.find(t => t.id === id)

    // Optimistic remove
    setTasks(prev => prev.filter(t => t.id !== id))

    try {
      await deleteTask(id)
    } catch (err) {
      // Rollback
      if (snapshot) setTasks(prev => [snapshot, ...prev])
      setError(err.message ?? 'Failed to delete task.')
    }
  }

  // ── List handlers ────────────────────────────────────────────────────────────
  async function handleAddList(category) {
    const res = await createList(category)
    setLists(prev => [...prev, res.list])
  }

  async function handleRenameList(id, category) {
    const res = await updateList(id, category)
    setLists(prev => prev.map(l => l.id === id ? res.list : l))
  }

  async function handleDeleteList(id) {
    await deleteList(id)
    setLists(prev => prev.filter(l => l.id !== id))
    if (activeNav === id) setActiveNav('all')
    setTasks(prev => prev.map(t => t.list_id === id ? { ...t, list_id: null } : t))
  }

  // ── Modal handlers ───────────────────────────────────────────────────────────
  async function openTask(id) {
    try {
      const res = await getTaskById(id)
      setModalTask(res.task)
    } catch {
      setError('Could not load task.')
    }
  }

  async function handleModalSave(id, data) {
    const res = await updateTask(id, data)
    setTasks(prev => prev.map(t => t.id === id ? normalize(res.task) : t))
    setModalTask(null)
  }

  async function handleModalDelete(id) {
    await deleteTask(id)
    setTasks(prev => prev.filter(t => t.id !== id))
    setModalTask(null)
  }

  // ── Profile handler ──────────────────────────────────────────────────────────
  async function handleProfileSave(data) {
    const res = await updateProfile(data)
    const updatedUser = res.user
    localStorage.setItem('zendo_user', JSON.stringify(updatedUser))
    setUser(updatedUser)
    setProfileOpen(false)
  }

  // ── Section / page titles ────────────────────────────────────────────────────
  const activeList = typeof activeNav === 'number'
    ? lists.find(l => l.id === activeNav)
    : null

  const sectionTitle = activeList
    ? activeList.category.toUpperCase()
    : { all: "ALL TASKS", today: "TODAY'S TASKS", important: 'IMPORTANT' }[activeNav] ?? 'ALL TASKS'

  const pageTitle = activeList
    ? activeList.category
    : { all: 'My Tasks', today: 'Today', important: 'Important' }[activeNav] ?? 'My Tasks'

  // ── Show auth page if not logged in ─────────────────────────────────────────
  if (!user) {
    return <AuthPage onLogin={handleLogin} />
  }

  const firstName = user.first_name ?? user.username

  return (
    <div className={`app${lightMode ? ' light' : ''}`}>
      <Sidebar
        activeNav={activeNav}
        onNavChange={setActiveNav}
        todayCount={todayTasks.length}
        lists={lists}
        lightMode={lightMode}
        onToggleLight={() => setLightMode(v => !v)}
        onLogout={handleLogout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onAddList={handleAddList}
        onRenameList={handleRenameList}
        onDeleteList={handleDeleteList}
      />

      <div className="main">
        <Topbar
          title={pageTitle}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          onMenuOpen={() => setSidebarOpen(true)}
          user={user}
          onProfileOpen={() => setProfileOpen(true)}
          notifications={todayTasks.filter(t => !t.done)}
        />

        <div className="content">
          <div className="content-inner">
          {error && (
            <div className="error-banner">
              ⚠ {error}
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          <div className="greeting-section">
            <h1 className="greeting-title">
              {getGreeting()}, {firstName}
            </h1>
            <p className="greeting-subtitle">
              You have {remainingToday} task{remainingToday !== 1 ? 's' : ''} remaining for today.
            </p>
          </div>

          {/* Add task */}
          {!addExpanded ? (
            <div className="add-task-trigger" onClick={() => setAddExpanded(true)}>
              <span className="add-task-trigger-icon">+</span>
              <span className="add-task-trigger-label">Add a task</span>
            </div>
          ) : (
            <form className="add-task-card" onSubmit={addTask}>
              <input
                className="add-task-title-input"
                type="text"
                placeholder="Task name"
                value={newTask}
                autoFocus
                onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => e.key === 'Escape' && (setNewTask(''), setNewDesc(''), setAddExpanded(false))}
              />
              <textarea
                className="add-task-desc-input"
                placeholder="Description (optional)"
                value={newDesc}
                rows={2}
                onChange={e => setNewDesc(e.target.value)}
              />
              <div className="add-task-actions">
                <button
                  type="button"
                  className="add-task-cancel"
                  onClick={() => { setNewTask(''); setNewDesc(''); setAddExpanded(false) }}
                >
                  Cancel
                </button>
                <button type="submit" className="add-task-confirm" disabled={!newTask.trim()}>
                  Add Task
                </button>
              </div>
            </form>
          )}

          {/* Task list */}
          <p className="tasks-section-label">{sectionTitle}</p>
          <TaskList
            tasks={visibleTasks}
            loading={loading}
            onToggle={toggleTask}
            onDelete={handleDeleteTask}
            onOpen={openTask}
          />
          </div>
        </div>
      </div>

      {/* Task detail / edit modal */}
      {modalTask && (
        <TaskModal
          task={modalTask}
          lists={lists}
          onClose={() => setModalTask(null)}
          onSave={handleModalSave}
          onDelete={handleModalDelete}
        />
      )}

      {/* Profile modal */}
      {profileOpen && (
        <ProfileModal
          user={user}
          onClose={() => setProfileOpen(false)}
          onSave={handleProfileSave}
        />
      )}

      {/* Idle warning */}
      {idleWarn && (
        <IdleWarningModal
          onStay={() => { setIdleWarn(false); resetIdle() }}
          onLogout={handleLogout}
        />
      )}
    </div>
  )
}
