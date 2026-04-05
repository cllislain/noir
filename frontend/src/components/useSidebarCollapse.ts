import { useState, useCallback } from "react"

const STORAGE_KEY = "noir-sidebar-collapsed"

function readStored(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true"
  } catch {
    return false
  }
}

export function useSidebarCollapse() {
  const [isCollapsed, setIsCollapsed] = useState(readStored)

  const toggle = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem(STORAGE_KEY, String(next)) } catch { /* ignore */ }
      return next
    })
  }, [])

  return { isCollapsed, toggle }
}
