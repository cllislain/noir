import { useTags } from "@/features/tags/useTags"
import { DateRangePicker } from "./DateRangePicker"
import type { EntryFilters } from "@/api/endpoints"

const MOODS = ["happy", "neutral", "sad", "anxious", "grateful"] as const

interface FilterPanelProps {
  filters: EntryFilters
  onMoodChange: (mood: string) => void
  onTagChange: (tagId: string) => void
  onDateRangeChange: (start: string | undefined, end: string | undefined) => void
  onReset: () => void
}

export function FilterPanel({
  filters,
  onMoodChange,
  onTagChange,
  onDateRangeChange,
  onReset,
}: FilterPanelProps) {
  const { data: tags = [] } = useTags()
  const activeTags = filters.tags ? filters.tags.split(",") : []

  const toggleTag = (id: string) => {
    const updated = activeTags.includes(id)
      ? activeTags.filter((t) => t !== id)
      : [...activeTags, id]
    onTagChange(updated.join(","))
  }

  const hasFilters =
    filters.mood ||
    filters.tags ||
    filters.is_favorite ||
    filters.created_after ||
    filters.created_before

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm" style={{ color: "var(--j-text-secondary)" }}>
          Filters
        </h3>
        {hasFilters && (
          <button
            onClick={onReset}
            className="text-xs hover:underline"
            style={{ color: "var(--j-accent)" }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Mood */}
      <div>
        <p
          className="text-xs font-medium uppercase tracking-wider mb-2"
          style={{ color: "var(--j-text-muted)" }}
        >
          Mood
        </p>
        <div className="flex flex-wrap gap-1">
          {MOODS.map((mood) => (
            <button
              key={mood}
              onClick={() => onMoodChange(filters.mood === mood ? "" : mood)}
              className="px-2 py-0.5 rounded-full text-xs border transition-colors"
              style={
                filters.mood === mood
                  ? {
                      backgroundColor: "var(--j-accent)",
                      color: "var(--j-accent-text)",
                      borderColor: "var(--j-accent)",
                    }
                  : {
                      backgroundColor: "var(--j-bg-surface)",
                      color: "var(--j-text-secondary)",
                      borderColor: "var(--j-border)",
                    }
              }
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <p
            className="text-xs font-medium uppercase tracking-wider mb-2"
            style={{ color: "var(--j-text-muted)" }}
          >
            Tags
          </p>
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => {
              const active = activeTags.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className="px-2 py-0.5 rounded-full text-xs font-medium transition-opacity"
                  style={{
                    backgroundColor: tag.color,
                    color: "#fff",
                    opacity: active ? 1 : 0.45,
                    outline: active ? `2px solid ${tag.color}` : "none",
                    outlineOffset: "2px",
                  }}
                >
                  {tag.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Date range */}
      <div>
        <p
          className="text-xs font-medium uppercase tracking-wider mb-2"
          style={{ color: "var(--j-text-muted)" }}
        >
          Date range
        </p>
        <DateRangePicker
          startDate={filters.created_after}
          endDate={filters.created_before}
          onChange={onDateRangeChange}
        />
      </div>
    </div>
  )
}
