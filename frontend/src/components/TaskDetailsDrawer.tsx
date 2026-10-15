import { useEffect, useState } from 'react'
import { getTask } from '../api/tasks'
import { errorMessage } from '../api/client'
import { formatDateTime, isOverdue, shortId } from '../lib/format'
import type { Task, TaskInput } from '../types/task'
import { CalendarIcon, PencilIcon, TrashIcon, XIcon } from './icons'
import { Modal } from './Modal'
import { PrioritySelect, StatusSelect } from './TaskProps'

interface Props {
  /** The list's copy, shown immediately while the fresh copy loads. */
  initial: Task
  onClose: () => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onPatch: (task: Task, patch: Partial<TaskInput>) => Promise<Task>
}

export function TaskDetailsDrawer({ initial, onClose, onEdit, onDelete, onPatch }: Props) {
  const [task, setTask] = useState<Task>(initial)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    getTask(initial.id, controller.signal)
      .then(setTask)
      .catch((err) => !controller.signal.aborted && setError(errorMessage(err)))
    return () => controller.abort()
  }, [initial.id])

  /** Optimistic property change; rolls back if the API rejects it. */
  async function patch(p: Partial<TaskInput>) {
    const before = task
    setTask({ ...task, ...p })
    try {
      setTask(await onPatch(task, p))
    } catch {
      setTask(before)
    }
  }

  const overdue = isOverdue(task.dueDate, task.status)

  return (
    <Modal title={shortId(task.id)} variant="drawer" onClose={onClose}>
      <div className="px-5 pb-6">
        {error && (
          <p role="alert" className="mb-4 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-danger">
            {error}
          </p>
        )}

        <h3 className="text-xl font-semibold leading-snug">{task.title}</h3>
        <p className="mt-3 whitespace-pre-wrap break-words text-muted">{task.description}</p>

        <h4 className="mb-2 mt-8 text-xs font-medium text-subtle">Properties</h4>
        <dl className="space-y-1">
          <Row label="Status">
            <StatusSelect variant="full" value={task.status} onChange={(status) => patch({ status })} />
          </Row>
          <Row label="Priority">
            <PrioritySelect variant="full" value={task.priority} onChange={(priority) => patch({ priority })} />
          </Row>
          <Row label="Due date">
            <label className={`prop-btn ${overdue ? 'text-danger' : ''}`}>
              <CalendarIcon size={14} />
              <input
                type="date"
                aria-label="Due date"
                className="bg-transparent outline-none"
                value={task.dueDate ?? ''}
                onChange={(e) => patch({ dueDate: e.target.value || null })}
              />
            </label>
            {task.dueDate && (
              <button className="icon-btn" aria-label="Clear due date" onClick={() => patch({ dueDate: null })}>
                <XIcon size={12} />
              </button>
            )}
            {overdue && <span className="text-xs text-danger">Overdue</span>}
          </Row>
        </dl>

        <h4 className="mb-2 mt-8 text-xs font-medium text-subtle">Activity</h4>
        <dl className="space-y-1.5 text-muted">
          <div className="flex gap-3"><dt className="w-24 shrink-0">Created</dt><dd>{formatDateTime(task.createdAt)}</dd></div>
          <div className="flex gap-3"><dt className="w-24 shrink-0">Updated</dt><dd>{formatDateTime(task.updatedAt)}</dd></div>
          <div className="flex gap-3"><dt className="w-24 shrink-0">ID</dt><dd className="break-all font-mono text-xs">{task.id}</dd></div>
        </dl>

        <div className="mt-8 flex gap-2">
          <button className="btn btn-secondary" onClick={() => onEdit(task)}><PencilIcon size={14} /> Edit</button>
          <button className="btn btn-ghost hover:text-danger" onClick={() => onDelete(task)}><TrashIcon size={14} /> Delete</button>
        </div>
      </div>
    </Modal>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <dt className="w-24 shrink-0 text-muted">{label}</dt>
      <dd className="flex items-center gap-1">{children}</dd>
    </div>
  )
}
