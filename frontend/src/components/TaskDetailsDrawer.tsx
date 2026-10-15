import { useEffect, useState } from 'react'
import { getTask } from '../api/tasks'
import { errorMessage } from '../api/client'
import { formatDateTime, formatDueDate, isOverdue } from '../lib/format'
import type { Task } from '../types/task'
import { PriorityBadge, StatusBadge } from './Badges'
import { Modal } from './Modal'

interface Props {
  /** The list's copy, shown immediately while the fresh copy loads. */
  initial: Task
  onClose: () => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function TaskDetailsDrawer({ initial, onClose, onEdit, onDelete }: Props) {
  const [task, setTask] = useState<Task>(initial)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    getTask(initial.id, controller.signal)
      .then(setTask)
      .catch((err) => !controller.signal.aborted && setError(errorMessage(err)))
    return () => controller.abort()
  }, [initial.id])

  const overdue = isOverdue(task.dueDate, task.status)

  return (
    <Modal title="Task details" variant="drawer" onClose={onClose}>
      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <h3 className="text-xl font-semibold leading-snug">{task.title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
      </div>

      <h4 className="mt-6 text-xs font-medium uppercase tracking-wide text-muted">Description</h4>
      <p className="mt-1 whitespace-pre-wrap break-words text-sm">{task.description}</p>

      <dl className="mt-6 space-y-3 text-sm">
        <Row label="Due date">
          <span className={overdue ? 'font-medium text-danger' : ''}>
            {formatDueDate(task.dueDate)}
            {overdue && ' · overdue'}
          </span>
        </Row>
        <Row label="Created">{formatDateTime(task.createdAt)}</Row>
        <Row label="Last updated">{formatDateTime(task.updatedAt)}</Row>
        <Row label="ID"><span className="break-all font-mono text-xs">{task.id}</span></Row>
      </dl>

      <div className="mt-8 flex gap-2">
        <button className="btn btn-primary flex-1" onClick={() => onEdit(task)}>Edit</button>
        <button className="btn btn-secondary flex-1 text-danger" onClick={() => onDelete(task)}>Delete</button>
      </div>
    </Modal>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line pb-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  )
}
