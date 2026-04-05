import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

export const INACTIVITY_KEY = "inactivity-timeout"

/** Returns timeout minutes from localStorage. 0 = never. */
export function getInactivityTimeout(): number {
  try {
    const v = localStorage.getItem(INACTIVITY_KEY)
    if (v === null) return 15  // default
    const n = parseInt(v, 10)
    return isNaN(n) ? 15 : n
  } catch {
    return 15
  }
}

export function setInactivityTimeout(minutes: number) {
  try {
    localStorage.setItem(INACTIVITY_KEY, String(minutes))
  } catch { /* ignore */ }
}

interface Options {
  onLock: () => Promise<void>
  enabled?: boolean
}

/**
 * Tracks user activity and calls onLock() after the configured idle period.
 */
export function useInactivityLock({ onLock, enabled = true }: Options) {
  const navigate = useNavigate()
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!enabled) return
    const minutes = getInactivityTimeout()
    if (minutes === 0) return  // disabled

    const ms = minutes * 60 * 1000

    const reset = () => {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(async () => {
        await onLock()
        navigate("/login?locked=1", { replace: true })
      }, ms)
    }

    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"]
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    reset()  // start the initial timer

    return () => {
      clearTimeout(timerRef.current)
      events.forEach((e) => window.removeEventListener(e, reset))
    }
  }, [onLock, navigate])
}
