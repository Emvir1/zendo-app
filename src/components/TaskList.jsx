export default function TaskList({ tasks, loading, onToggle, onDelete, onOpen }) {
  if (loading) {
    return (
      <div>
        {[1, 2, 3].map(n => (
          <div key={n} className="skeleton" />
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        No active tasks. Enjoy your day!
      </div>
    )
  }

  return (
    <div>
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onOpen={onOpen}
        />
      ))}
    </div>
  )
}

function TaskItem({ task, onToggle, onDelete, onOpen }) {
  return (
    <div className="task-item">
      <div
        className={`task-checkbox${task.done ? ' checked' : ''}`}
        onClick={() => onToggle(task.id)}
        role="checkbox"
        aria-checked={task.done}
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onToggle(task.id)}
      >
        {task.done && '✓'}
      </div>

      <div className="task-body" onClick={() => onOpen(task.id)} style={{ cursor: 'pointer' }} title="Click to view / edit">
        <span className={`task-text${task.done ? ' done' : ''}`}>
          {task.text}
        </span>
        {task.description && (
          <span className="task-description">{task.description}</span>
        )}
        {task.done && task.completedAt && (
          <span className="task-completed-at">
            Completed {new Date(task.completedAt).toLocaleString()}
          </span>
        )}
      </div>

      <button
        className="task-delete"
        onClick={() => onDelete(task.id)}
        title="Delete task"
        aria-label="Delete task"
      >
        ×
      </button>
    </div>
  )
}
