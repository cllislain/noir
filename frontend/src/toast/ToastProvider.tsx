import { useState, useCallback, useRef, type ReactNode } from "react"
import { ToastContext, type Toast, type ToastType } from "./ToastContext"

const DEFAULT_DURATION = 3500

const TYPE_STYLES: Record<ToastType, { icon: string; border: string; iconColor: string }> = {
  success: { icon: "✓", border: "#22c55e", iconColor: "#22c55e" },
  error:   { icon: "✕", border: "#ef4444", iconColor: "#ef4444" },
  info:    { icon: "ℹ", border: "var(--j-accent)", iconColor: "var(--j-accent)" },
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const style = TYPE_STYLES[toast.type]

  return (
    <div
      className="flex items-start gap-3 w-80 rounded-xl border shadow-lg px-4 py-3 text-sm pointer-events-auto"
      style={{
        backgroundColor: "var(--j-bg-surface)",
        borderColor: style.border,
        color: "var(--j-text-primary)",
        animation: "toast-in 0.2s ease",
      }}
      role="alert"
    >
      <span
        className="flex-shrink-0 font-bold text-base leading-none mt-0.5"
        style={{ color: style.iconColor }}
      >
        {style.icon}
      </span>

      <span className="flex-1 leading-snug">{toast.message}</span>

      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 text-base leading-none hover:opacity-60 transition-opacity"
        style={{ color: "var(--j-text-muted)" }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, type: ToastType = "info", duration: number = DEFAULT_DURATION) => {
      const id = `${Date.now()}-${Math.random()}`
      const entry: Toast = { id, message, type, duration }
      setToasts((prev) => [...prev, entry])
      const timer = setTimeout(() => dismiss(id), duration)
      timers.current.set(id, timer)
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}

      {/* Toast container — fixed top-right, stacks downward */}
      <div
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>

      {/* Keyframe animation injected once */}
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(1rem); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}
