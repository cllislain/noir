import { useState } from "react"
import { format, startOfMonth, getDay, getDaysInMonth, addMonths, subMonths, parseISO } from "date-fns"
import { useHeatmap } from "@/features/insights/useHeatmap"

interface Props {
  /** Called when a day is clicked. Passes ISO date string, or null to clear. */
  onDateClick?: (date: string | null) => void
  activeDate?: string | null
}

function opacityForCount(count: number): number {
  if (count === 0) return 0
  if (count === 1) return 0.35
  if (count === 2) return 0.6
  return 1
}

export function HeatmapCalendar({ onDateClick, activeDate }: Props) {
  const [cursor, setCursor] = useState(() => new Date())
  const { data } = useHeatmap(cursor.getFullYear(), cursor.getMonth() + 1)

  const daysInMonth = getDaysInMonth(cursor)
  const firstDow = getDay(startOfMonth(cursor)) // 0=Sun … 6=Sat

  const goBack = () => setCursor((d) => subMonths(d, 1))
  const goForward = () => setCursor((d) => addMonths(d, 1))

  const monthLabel = format(cursor, "MMM yyyy")
  const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"]

  const handleClick = (dateStr: string) => {
    if (!onDateClick) return
    if (activeDate === dateStr) {
      onDateClick(null) // toggle off
    } else {
      onDateClick(dateStr)
    }
  }

  return (
    <div className="px-1 space-y-2">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <button
          onClick={goBack}
          className="w-6 h-6 flex items-center justify-center rounded text-xs transition-colors"
          style={{ color: "var(--j-text-muted)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--j-text-primary)" }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--j-text-muted)" }}
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="text-xs font-semibold" style={{ color: "var(--j-text-secondary)" }}>
          {monthLabel}
        </span>
        <button
          onClick={goForward}
          className="w-6 h-6 flex items-center justify-center rounded text-xs transition-colors"
          style={{ color: "var(--j-text-muted)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--j-text-primary)" }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--j-text-muted)" }}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 gap-0.5">
        {DAY_LABELS.map((d, i) => (
          <div
            key={i}
            className="text-center text-xs"
            style={{ color: "var(--j-text-muted)", fontSize: "9px" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const day = idx + 1
          const dateStr = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          const count = data?.days[dateStr] ?? 0
          const opacity = opacityForCount(count)
          const isActive = activeDate === dateStr
          const tooltipText = count > 0
            ? `${count} ${count === 1 ? "entry" : "entries"} on ${format(parseISO(dateStr), "MMM d")}`
            : format(parseISO(dateStr), "MMM d")

          return (
            <button
              key={day}
              title={tooltipText}
              onClick={() => handleClick(dateStr)}
              className="aspect-square rounded-sm text-center transition-all"
              style={{
                fontSize: "9px",
                backgroundColor: opacity > 0
                  ? `color-mix(in srgb, var(--j-accent) ${Math.round(opacity * 100)}%, transparent)`
                  : "var(--j-bg-elevated)",
                color: opacity > 0.5 ? "var(--j-accent-text)" : "var(--j-text-muted)",
                outline: isActive ? "2px solid var(--j-accent)" : undefined,
                cursor: onDateClick ? "pointer" : "default",
              }}
            >
              {day}
            </button>
          )
        })}
      </div>

      {activeDate && (
        <button
          onClick={() => onDateClick?.(null)}
          className="text-xs hover:underline w-full text-center"
          style={{ color: "var(--j-accent)" }}
        >
          Clear date filter
        </button>
      )}
    </div>
  )
}
