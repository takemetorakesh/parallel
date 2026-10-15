import { PRIORITIES, PRIORITY_LABEL, STATUSES, STATUS_LABEL } from '../types/task'
import type { SortBy, SortOrder, TaskPriority, TaskQuery, TaskStatus } from '../types/task'

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'dueDate:asc', label: 'Due soonest' },
  { value: 'dueDate:desc', label: 'Due latest' },
  { value: 'priority:desc', label: 'Priority: high → low' },
  { value: 'priority:asc', label: 'Priority: low → high' },
]

interface Props {
  search: string
  onSearch: (value: string) => void
  query: TaskQuery
  onChange: (patch: Partial<TaskQuery>) => void
}

export function Toolbar({ search, onSearch, query, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
      <div className="col-span-2 lg:col-span-1">
        <label htmlFor="search" className="sr-only">Search tasks</label>
        <input
          id="search"
          type="search"
          className="input"
          placeholder="Search by title or description…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="filter-status" className="sr-only">Filter by status</label>
        <select
          id="filter-status"
          className="input"
          value={query.status}
          onChange={(e) => onChange({ status: e.target.value as TaskStatus | '' })}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="filter-priority" className="sr-only">Filter by priority</label>
        <select
          id="filter-priority"
          className="input"
          value={query.priority}
          onChange={(e) => onChange({ priority: e.target.value as TaskPriority | '' })}
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
        </select>
      </div>

      <div className="col-span-2 lg:col-span-1">
        <label htmlFor="sort" className="sr-only">Sort tasks</label>
        <select
          id="sort"
          className="input"
          value={`${query.sortBy}:${query.order}`}
          onChange={(e) => {
            const [sortBy, order] = e.target.value.split(':') as [SortBy, SortOrder]
            onChange({ sortBy, order })
          }}
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  )
}
