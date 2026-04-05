import { createContext, useContext } from "react"

export type ToastType = "success" | "error" | "info"

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration: number
}

export interface ToastContextValue {
  toasts: Toast[]
  toast: (message: string, type?: ToastType, duration?: number) => void
  dismiss: (id: string) => void
}

export const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  toast: () => undefined,
  dismiss: () => undefined,
})

export function useToast(): ToastContextValue {
  return useContext(ToastContext)
}
