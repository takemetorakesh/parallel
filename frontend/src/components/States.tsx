import type { ReactNode } from 'react'

export function LoadingState() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading tasks">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-line bg-surface p-5">
          <div className="h-4 w-2/3 rounded bg-surface-2" />
          <div className="mt-3 h-3 w-full rounded bg-surface-2" />
          <div className="mt-2 h-3 w-4/5 rounded bg-surface-2" />
          <div className="mt-5 flex gap-2">
            <div className="h-5 w-20 rounded-full bg-surface-2" />
            <div className="h-5 w-24 rounded-full bg-surface-2" />
          </div>
        </div>
      ))}
    </div>
  )
}

function Panel({ icon, title, children }: { icon: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-line bg-surface px-6 py-16 text-center">
      <div className="text-4xl" aria-hidden="true">{icon}</div>
      <h2 className="mt-3 text-lg font-semibold">{title}</h2>
      {children}
    </div>
  )
}

export function EmptyState({ filtered, onCreate, onClear }: { filtered: boolean; onCreate: () => void; onClear: () => void }) {
  return filtered ? (
    <Panel icon="🔍" title="No tasks match your filters">
      <p className="mt-1 text-sm text-muted">Try a different search or clear the filters.</p>
      <button className="btn btn-secondary mt-5" onClick={onClear}>Clear filters</button>
    </Panel>
  ) : (
    <Panel icon="📝" title="No tasks yet">
      <p className="mt-1 text-sm text-muted">Create your first task to get started.</p>
      <button className="btn btn-primary mt-5" onClick={onCreate}>New task</button>
    </Panel>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert">
      <Panel icon="⚠️" title="Couldn't load tasks">
        <p className="mt-1 text-sm text-muted">{message}</p>
        <button className="btn btn-primary mt-5" onClick={onRetry}>Try again</button>
      </Panel>
    </div>
  )
}
