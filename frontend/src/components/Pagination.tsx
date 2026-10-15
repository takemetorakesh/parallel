import type { PageMeta } from '../types/task'

export function Pagination({ meta, onPage }: { meta: PageMeta; onPage: (page: number) => void }) {
  if (meta.pages <= 1) return null
  return (
    <nav className="mt-6 flex items-center justify-between gap-3" aria-label="Pagination">
      <button className="btn btn-secondary" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>
        ← Previous
      </button>
      <span className="text-sm text-muted">
        Page {meta.page} of {meta.pages}
      </span>
      <button className="btn btn-secondary" disabled={meta.page >= meta.pages} onClick={() => onPage(meta.page + 1)}>
        Next →
      </button>
    </nav>
  )
}
