import { type ReactNode, useState } from "react"
import { NavLink } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import { RealtimeClock } from "./RealtimeClock"
import { HeatmapCalendar } from "./HeatmapCalendar"
import { SidebarStats } from "./SidebarStats"
import { useSidebarLayout, type SectionId } from "./useSidebarLayout"

interface NavItem {
  to: string
  label: string
  icon: string
  adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: "/",         label: "Home",     icon: "📓" },
  { to: "/insights", label: "Insights", icon: "📊" },
  { to: "/trash",    label: "Trash",    icon: "🗑️" },
  { to: "/admin",    label: "Admin",    icon: "⚙️", adminOnly: true },
]

const SECTION_LABELS: Record<SectionId, string> = {
  clock:   "Overview",
  search:  "Search",
  nav:     "Navigate",
  heatmap: "Activity",
  stats:   "Stats",
}

interface AppSidebarProps {
  /** Page-specific content (search bar, filters, etc.) rendered in the "search" section */
  children?: ReactNode
  /** Called when a heatmap day is clicked. null = clear filter */
  onDateClick?: (date: string | null) => void
  activeDate?: string | null
}

export function AppSidebar({ children, onDateClick, activeDate }: AppSidebarProps) {
  const { user } = useAuth()
  const { layout, toggleCollapsed, reorder } = useSidebarLayout(user?.username)
  const [dragOverId, setDragOverId] = useState<SectionId | null>(null)
  const [draggingId, setDraggingId] = useState<SectionId | null>(null)

  const navLinkStyle = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? { backgroundColor: "var(--j-bg-elevated)", color: "var(--j-text-primary)", fontWeight: 600 as const }
      : { color: "var(--j-text-secondary)" }

  function renderContent(id: SectionId): ReactNode {
    switch (id) {
      case "clock":
        return (
          <div className="space-y-2 px-1">
            {user && (
              <p className="text-xs" style={{ color: "var(--j-text-muted)" }}>
                Welcome back,{" "}
                <span className="font-semibold" style={{ color: "var(--j-text-secondary)" }}>
                  {user.username}
                </span>
              </p>
            )}
            <RealtimeClock />
          </div>
        )

      case "search":
        if (!children) return null
        return <div className="space-y-3">{children}</div>

      case "nav":
        return (
          <nav>
            <ul className="space-y-0.5">
              {NAV_ITEMS.filter((item) => !item.adminOnly || user?.is_staff).map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
                    style={navLinkStyle}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )

      case "heatmap":
        return <HeatmapCalendar onDateClick={onDateClick} activeDate={activeDate} />

      case "stats":
        return <SidebarStats />
    }
  }

  return (
    <div className="flex flex-col gap-0.5">
      {layout.order.map((id) => {
        const content = renderContent(id)
        // Skip search section entirely when no children are provided
        if (id === "search" && !children) return null

        const isCollapsed = layout.collapsed[id] ?? false
        const isDragTarget = dragOverId === id && draggingId !== id

        return (
          <div
            key={id}
            onDragOver={(e) => { e.preventDefault(); setDragOverId(id) }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOverId(null)
              }
            }}
            onDrop={(e) => {
              e.preventDefault()
              const fromId = e.dataTransfer.getData("sectionId") as SectionId
              if (fromId) reorder(fromId, id)
              setDragOverId(null)
              setDraggingId(null)
            }}
            className="rounded-lg overflow-hidden transition-all"
            style={
              isDragTarget
                ? { outline: "2px solid var(--j-accent)", outlineOffset: "1px" }
                : undefined
            }
          >
            {/* ── Section header ─────────────────────────────────────────── */}
            <div
              className="flex items-center gap-1.5 px-1 py-1 rounded-lg"
              style={{ color: "var(--j-text-muted)" }}
            >
              {/* Drag handle */}
              <span
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("sectionId", id)
                  e.dataTransfer.effectAllowed = "move"
                  setDraggingId(id)
                }}
                onDragEnd={() => { setDraggingId(null); setDragOverId(null) }}
                className="text-sm px-0.5 select-none"
                style={{ cursor: "grab", lineHeight: 1 }}
                title="Drag to reorder"
              >
                ⠿
              </span>

              {/* Label */}
              <span
                className="flex-1 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--j-text-muted)" }}
              >
                {SECTION_LABELS[id]}
              </span>

              {/* Collapse toggle */}
              <button
                onClick={() => toggleCollapsed(id)}
                className="p-0.5 rounded transition-opacity hover:opacity-100 opacity-60"
                style={{ color: "var(--j-text-muted)" }}
                title={isCollapsed ? "Expand" : "Collapse"}
              >
                <svg
                  className="w-3 h-3 transition-transform duration-200"
                  style={{ transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* ── Section content ─────────────────────────────────────────── */}
            {!isCollapsed && content && (
              <div className="pb-3">{content}</div>
            )}

            {/* ── Divider ─────────────────────────────────────────────────── */}
            <div className="h-px mx-1" style={{ backgroundColor: "var(--j-border)" }} />
          </div>
        )
      })}
    </div>
  )
}
