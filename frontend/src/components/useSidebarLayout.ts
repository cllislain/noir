import { useState, useCallback, useEffect } from "react"

export type SectionId = "clock" | "search" | "nav" | "heatmap" | "stats"

export interface SidebarLayout {
  order: SectionId[]
  collapsed: Partial<Record<SectionId, boolean>>
}

export const DEFAULT_ORDER: SectionId[] = ["clock", "search", "nav", "heatmap", "stats"]

function storageKey(username: string) {
  return `noir-sidebar-${username}`
}

function loadLayout(username: string): SidebarLayout {
  try {
    const raw = localStorage.getItem(storageKey(username))
    if (!raw) return { order: DEFAULT_ORDER, collapsed: {} }
    const parsed = JSON.parse(raw) as Partial<SidebarLayout>
    // Ensure all known sections are present in order (handles new sections added in updates)
    const saved = parsed.order ?? DEFAULT_ORDER
    const merged = [
      ...saved.filter((id): id is SectionId => DEFAULT_ORDER.includes(id as SectionId)),
      ...DEFAULT_ORDER.filter((id) => !saved.includes(id)),
    ]
    return { order: merged, collapsed: parsed.collapsed ?? {} }
  } catch {
    return { order: DEFAULT_ORDER, collapsed: {} }
  }
}

function saveLayout(username: string, layout: SidebarLayout) {
  try {
    localStorage.setItem(storageKey(username), JSON.stringify(layout))
  } catch { /* storage full */ }
}

export function useSidebarLayout(username: string | undefined) {
  const [layout, setLayout] = useState<SidebarLayout>(() =>
    username ? loadLayout(username) : { order: DEFAULT_ORDER, collapsed: {} }
  )

  // Reload when the logged-in user changes
  useEffect(() => {
    if (username) setLayout(loadLayout(username))
  }, [username])

  // Persist whenever layout changes
  useEffect(() => {
    if (username) saveLayout(username, layout)
  }, [username, layout])

  const toggleCollapsed = useCallback((id: SectionId) => {
    setLayout((prev) => ({
      ...prev,
      collapsed: { ...prev.collapsed, [id]: !prev.collapsed[id] },
    }))
  }, [])

  const reorder = useCallback((fromId: SectionId, toId: SectionId) => {
    if (fromId === toId) return
    setLayout((prev) => {
      const order = [...prev.order]
      const fromIdx = order.indexOf(fromId)
      const toIdx = order.indexOf(toId)
      if (fromIdx === -1 || toIdx === -1) return prev
      order.splice(fromIdx, 1)
      order.splice(toIdx, 0, fromId)
      return { ...prev, order }
    })
  }, [])

  return { layout, toggleCollapsed, reorder }
}
