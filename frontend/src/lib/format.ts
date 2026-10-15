/** Parse a YYYY-MM-DD string as a local date (new Date('2026-10-05') would be UTC and can shift a day). */
function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDueDate(value: string | null): string {
  if (!value) return 'No due date'
  return parseDateOnly(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === 'completed') return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return parseDateOnly(dueDate) < today
}

/** "Oct 17", with the year only when it isn't the current one. */
export function formatShortDate(value: string, dateOnly = false): string {
  const d = dateOnly ? parseDateOnly(value) : new Date(value)
  const opts: Intl.DateTimeFormatOptions =
    d.getFullYear() === new Date().getFullYear() ? { month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' }
  return d.toLocaleDateString(undefined, opts)
}

/** Short display id derived from the uuid, e.g. TSK-A1B2. */
export function shortId(id: string): string {
  return `TSK-${id.replace(/-/g, '').slice(0, 4).toUpperCase()}`
}
