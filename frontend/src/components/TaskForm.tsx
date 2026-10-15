import { useState } from 'react'
import type { FormEvent } from 'react'
import { ApiError, errorMessage } from '../api/client'
import { PRIORITIES, PRIORITY_LABEL, STATUSES, STATUS_LABEL } from '../types/task'
import type { Task, TaskInput, TaskPriority, TaskStatus } from '../types/task'

const TITLE_MAX = 120
const DESCRIPTION_MAX = 2000

type Field = 'title' | 'description' | 'dueDate'
type Errors = Partial<Record<Field, string>>

interface Values {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string
}

interface Props {
  /** Present when editing; omitted when creating. */
  task?: Task
  onSubmit: (input: TaskInput) => Promise<void>
  onCancel: () => void
}

function validate(v: Values): Errors {
  const errors: Errors = {}
  if (!v.title.trim()) errors.title = 'Title is required'
  else if (v.title.trim().length > TITLE_MAX) errors.title = `Title must be at most ${TITLE_MAX} characters`
  if (!v.description.trim()) errors.description = 'Description is required'
  else if (v.description.trim().length > DESCRIPTION_MAX) errors.description = `Description must be at most ${DESCRIPTION_MAX} characters`
  if (v.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(v.dueDate)) errors.dueDate = 'Enter a valid date'
  return errors
}

export function TaskForm({ task, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<Values>({
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: task?.status ?? 'pending',
    priority: task?.priority ?? 'medium',
    dueDate: task?.dueDate ?? '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((v) => ({ ...v, [key]: value }))
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    setFormError(null)
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim(),
        status: values.status,
        priority: values.priority,
        dueDate: values.dueDate || null,
      })
    } catch (err) {
      // Map server-side validation errors back onto the fields they belong to.
      if (err instanceof ApiError && err.details.length > 0) {
        const mapped: Errors = {}
        for (const d of err.details) {
          if (d.field === 'title' || d.field === 'description' || d.field === 'dueDate') mapped[d.field] = d.message
        }
        setErrors(mapped)
        if (Object.keys(mapped).length === 0) setFormError(err.message)
      } else {
        setFormError(errorMessage(err))
      }
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError && (
        <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {formError}
        </p>
      )}

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">
          Title <span className="text-danger" aria-hidden="true">*</span>
        </label>
        <input
          id="title"
          className={`input ${errors.title ? 'input-error' : ''}`}
          value={values.title}
          onChange={(e) => set('title', e.target.value)}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
          autoFocus
        />
        {errors.title && <p id="title-error" className="mt-1 text-xs text-danger">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          Description <span className="text-danger" aria-hidden="true">*</span>
        </label>
        <textarea
          id="description"
          rows={4}
          className={`input resize-y ${errors.description ? 'input-error' : ''}`}
          value={values.description}
          onChange={(e) => set('description', e.target.value)}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && <p id="description-error" className="mt-1 text-xs text-danger">{errors.description}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium">Status</label>
          <select id="status" className="input" value={values.status} onChange={(e) => set('status', e.target.value as TaskStatus)}>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="priority" className="mb-1 block text-sm font-medium">Priority</label>
          <select id="priority" className="input" value={values.priority} onChange={(e) => set('priority', e.target.value as TaskPriority)}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="dueDate" className="mb-1 block text-sm font-medium">Due date</label>
        <input
          id="dueDate"
          type="date"
          className={`input ${errors.dueDate ? 'input-error' : ''}`}
          value={values.dueDate}
          onChange={(e) => set('dueDate', e.target.value)}
          aria-invalid={!!errors.dueDate}
        />
        {errors.dueDate && <p className="mt-1 text-xs text-danger">{errors.dueDate}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : task ? 'Save changes' : 'Create task'}
        </button>
      </div>
    </form>
  )
}
