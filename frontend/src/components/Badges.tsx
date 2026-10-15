import { PRIORITY_LABEL, STATUS_LABEL } from '../types/task'
import type { TaskPriority, TaskStatus } from '../types/task'

const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap'

const STATUS_STYLE: Record<TaskStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-400/15 dark:text-blue-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-400/15 dark:text-green-300',
}

const PRIORITY_STYLE: Record<TaskPriority, string> = {
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-400/15 dark:text-slate-300',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-400/15 dark:text-orange-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-400/15 dark:text-red-300',
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <span className={`${base} ${STATUS_STYLE[status]}`}>{STATUS_LABEL[status]}</span>
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <span className={`${base} ${PRIORITY_STYLE[priority]}`}>{PRIORITY_LABEL[priority]} priority</span>
}
