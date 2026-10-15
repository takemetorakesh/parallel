import { useCallback, useEffect, useState } from 'react'
import * as api from '../api/tasks'
import { errorMessage } from '../api/client'
import type { TaskInput, TaskList, TaskQuery } from '../types/task'

export const DEFAULT_QUERY: TaskQuery = {
  q: '',
  status: '',
  priority: '',
  sortBy: 'createdAt',
  order: 'desc',
  page: 1,
  limit: 20,
}

export function useTasks() {
  const [query, setQuery] = useState<TaskQuery>(DEFAULT_QUERY)
  const [data, setData] = useState<TaskList | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    api
      .listTasks(query, controller.signal)
      .then((res) => {
        // e.g. the last task on the last page was deleted: step back to the new last page.
        if (res.meta.page > res.meta.pages) {
          setQuery((q) => ({ ...q, page: res.meta.pages }))
          return
        }
        setData(res)
        setLoading(false)
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        setError(errorMessage(err))
        setLoading(false)
      })
    return () => controller.abort()
  }, [query, reloadKey])

  /** Change filters/sort/search. Resets to page 1 unless a page is given. Ignores no-op patches. */
  const updateQuery = useCallback((patch: Partial<TaskQuery>) => {
    setQuery((q) => {
      const unchanged = (Object.keys(patch) as (keyof TaskQuery)[]).every((k) => q[k] === patch[k])
      return unchanged ? q : { ...q, ...patch, page: patch.page ?? 1 }
    })
  }, [])

  const reload = useCallback(() => setReloadKey((k) => k + 1), [])

  const create = useCallback(
    async (input: TaskInput) => {
      const task = await api.createTask(input)
      reload()
      return task
    },
    [reload],
  )

  const update = useCallback(
    async (id: string, input: Partial<TaskInput>) => {
      const task = await api.updateTask(id, input)
      reload()
      return task
    },
    [reload],
  )

  const remove = useCallback(
    async (id: string) => {
      await api.deleteTask(id)
      reload()
    },
    [reload],
  )

  return { query, updateQuery, data, loading, error, reload, create, update, remove }
}
