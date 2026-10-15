import { useEffect } from 'react'
import type { ReactNode } from 'react'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
  /** "center" dialog, or a "drawer" that slides in from the right. */
  variant?: 'center' | 'drawer'
}

export function Modal({ title, onClose, children, variant = 'center' }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  const isDrawer = variant === 'drawer'

  return (
    <div
      className={`fixed inset-0 z-40 flex bg-black/50 ${isDrawer ? 'justify-end' : 'items-center justify-center p-4'}`}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex flex-col bg-surface shadow-xl ${
          isDrawer
            ? 'h-full w-full max-w-md border-l border-line'
            : 'max-h-[90vh] w-full max-w-lg rounded-2xl border border-line'
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="btn btn-ghost -mr-2 px-2 py-1" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}
