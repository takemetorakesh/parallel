import type { Task } from '../types/task'
import { TaskCard } from './TaskCard'

interface Props {
  tasks: Task[]
  /** Dim the list while a refetch is in flight. */
  busy: boolean
  onView: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function TaskList({ tasks, busy, ...handlers }: Props) {
  return (
    <div
      className={`grid gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${busy ? 'opacity-60' : ''}`}
      aria-busy={busy}
    >
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} {...handlers} />
      ))}
    </div>
  )
}
