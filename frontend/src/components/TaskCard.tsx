import { formatDate, formatDueDate, isOverdue } from '../lib/format'
import type { Task } from '../types/task'
import { PriorityBadge, StatusBadge } from './Badges'

interface Props {
  task: Task
  onView: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function TaskCard({ task, onView, onEdit, onDelete }: Props) {
  const overdue = isOverdue(task.dueDate, task.status)

  return (
    <article className="flex flex-col rounded-xl border border-line bg-surface p-5 shadow-sm">
      <h3 className="text-base font-semibold leading-snug">
        <button className="cursor-pointer text-left hover:text-primary focus-visible:outline-2 focus-visible:outline-primary" onClick={() => onView(task)}>
          {task.title}
        </button>
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted">{task.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-muted">Due</dt>
          <dd className={overdue ? 'font-medium text-danger' : ''}>
            {formatDueDate(task.dueDate)}
            {overdue && ' · overdue'}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Created</dt>
          <dd>{formatDate(task.createdAt)}</dd>
        </div>
      </dl>

      <div className="mt-5 flex gap-2 border-t border-line pt-4">
        <button className="btn btn-secondary flex-1 px-2" onClick={() => onView(task)} aria-label={`View ${task.title}`}>
          View
        </button>
        <button className="btn btn-secondary flex-1 px-2" onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`}>
          Edit
        </button>
        <button className="btn btn-ghost flex-1 px-2 text-danger hover:text-danger" onClick={() => onDelete(task)} aria-label={`Delete ${task.title}`}>
          Delete
        </button>
      </div>
    </article>
  )
}
