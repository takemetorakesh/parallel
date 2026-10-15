import { useEffect, useState } from 'react'
import { errorMessage } from '../api/client'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Modal } from '../components/Modal'
import { Pagination } from '../components/Pagination'
import { EmptyState, ErrorState, LoadingState } from '../components/States'
import { TaskDetailsDrawer } from '../components/TaskDetailsDrawer'
import { TaskForm } from '../components/TaskForm'
import { TaskList } from '../components/TaskList'
import { ThemeToggle } from '../components/ThemeToggle'
import { useToast } from '../components/Toast'
import { Toolbar } from '../components/Toolbar'
import { useDebounce } from '../hooks/useDebounce'
import { DEFAULT_QUERY, useTasks } from '../hooks/useTasks'
import type { Task, TaskInput } from '../types/task'

type FormTarget = Task | 'new' | null

export default function Dashboard() {
  const { query, updateQuery, data, loading, error, reload, create, update, remove } = useTasks()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  useEffect(() => updateQuery({ q: debouncedSearch.trim() }), [debouncedSearch, updateQuery])

  const [formTarget, setFormTarget] = useState<FormTarget>(null)
  const [viewing, setViewing] = useState<Task | null>(null)
  const [deleting, setDeleting] = useState<Task | null>(null)

  const hasFilters = !!(query.q || query.status || query.priority)

  function clearFilters() {
    setSearch('')
    updateQuery({ q: '', status: '', priority: '', sortBy: DEFAULT_QUERY.sortBy, order: DEFAULT_QUERY.order })
  }

  async function handleSubmit(input: TaskInput) {
    if (formTarget === 'new') {
      await create(input)
      toast('success', 'Task created')
    } else if (formTarget) {
      await update(formTarget.id, input)
      toast('success', 'Task updated')
    }
    setFormTarget(null)
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await remove(deleting.id)
    } catch (err) {
      toast('error', errorMessage(err))
      throw err
    }
    toast('success', 'Task deleted')
    setDeleting(null)
    setViewing(null)
  }

  const tasks = data?.data ?? []
  const showSkeleton = loading && !data
  const showError = !!error && tasks.length === 0

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted" aria-live="polite">
            {data ? `${data.meta.total} ${data.meta.total === 1 ? 'task' : 'tasks'}${hasFilters ? ' found' : ''}` : ' '}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button className="btn btn-primary" onClick={() => setFormTarget('new')}>
            <span aria-hidden="true">+</span> New task
          </button>
        </div>
      </header>

      <div className="mt-6">
        <Toolbar search={search} onSearch={setSearch} query={query} onChange={updateQuery} />
      </div>

      <main className="mt-6">
        {showSkeleton ? (
          <LoadingState />
        ) : showError ? (
          <ErrorState message={error} onRetry={reload} />
        ) : tasks.length === 0 ? (
          <EmptyState filtered={hasFilters} onCreate={() => setFormTarget('new')} onClear={clearFilters} />
        ) : (
          <>
            {error && (
              <p role="alert" className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error} <button className="underline" onClick={reload}>Retry</button>
              </p>
            )}
            <TaskList tasks={tasks} busy={loading} onView={setViewing} onEdit={setFormTarget} onDelete={setDeleting} />
            {data && <Pagination meta={data.meta} onPage={(page) => updateQuery({ page })} />}
          </>
        )}
      </main>

      {formTarget && (
        <Modal title={formTarget === 'new' ? 'New task' : 'Edit task'} onClose={() => setFormTarget(null)}>
          <TaskForm
            task={formTarget === 'new' ? undefined : formTarget}
            onSubmit={handleSubmit}
            onCancel={() => setFormTarget(null)}
          />
        </Modal>
      )}

      {viewing && !formTarget && !deleting && (
        <TaskDetailsDrawer
          initial={viewing}
          onClose={() => setViewing(null)}
          onEdit={(t) => {
            setViewing(null)
            setFormTarget(t)
          }}
          onDelete={setDeleting}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete task"
          message={`Delete “${deleting.title}”? This can't be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  )
}
