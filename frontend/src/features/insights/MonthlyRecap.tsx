import { format, parseISO } from "date-fns"
import { useMonthlyRecap } from "./useInsights"
import type { MoodValue } from "@/types"

const MOOD_EMOJI: Record<MoodValue, string> = {
  happy: "😊",
  neutral: "😐",
  sad: "😢",
  anxious: "😰",
  grateful: "🙏",
}

const MOOD_LABEL: Record<MoodValue, string> = {
  happy: "Happy",
  neutral: "Neutral",
  sad: "Sad",
  anxious: "Anxious",
  grateful: "Grateful",
}

const MOODS: MoodValue[] = ["happy", "neutral", "sad", "anxious", "grateful"]

export function MonthlyRecap() {
  const { data, isLoading } = useMonthlyRecap()

  const monthLabel = data
    ? format(parseISO(`${data.month}-01`), "MMMM yyyy")
    : ""

  const totalWithMood = data
    ? MOODS.reduce((sum, m) => sum + data.mood_distribution[m], 0)
    : 0

  if (isLoading) {
    return (
      <div
        className="card p-5 animate-pulse space-y-3"
        style={{ backgroundColor: "var(--j-bg-surface)" }}
      >
        <div
          className="h-4 w-40 rounded"
          style={{ backgroundColor: "var(--j-bg-elevated)" }}
        />
        <div
          className="h-20 rounded"
          style={{ backgroundColor: "var(--j-bg-elevated)" }}
        />
      </div>
    )
  }

  if (!data) return null

  return (
    <div
      className="card p-5 space-y-5"
      style={{ backgroundColor: "var(--j-bg-surface)" }}
    >
      <h2
        className="text-base font-semibold"
        style={{ color: "var(--j-text-primary)" }}
      >
        {monthLabel} recap
      </h2>

      {/* Total entries */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">📝</span>
        <div>
          <p
            className="text-2xl font-bold leading-none"
            style={{ color: "var(--j-text-primary)" }}
          >
            {data.total_entries}
          </p>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--j-text-muted)" }}
          >
            {data.total_entries === 1 ? "entry" : "entries"} this month
          </p>
        </div>
      </div>

      {/* Mood distribution */}
      {totalWithMood > 0 && (
        <div>
          <p
            className="text-xs font-medium mb-2"
            style={{ color: "var(--j-text-secondary)" }}
          >
            Mood distribution
          </p>
          <div className="space-y-1.5">
            {MOODS.filter((m) => data.mood_distribution[m] > 0).map((mood) => {
              const count = data.mood_distribution[mood]
              const pct = Math.round((count / totalWithMood) * 100)
              return (
                <div key={mood} className="flex items-center gap-2">
                  <span className="text-sm w-5">{MOOD_EMOJI[mood]}</span>
                  <span
                    className="text-xs w-16"
                    style={{ color: "var(--j-text-secondary)" }}
                  >
                    {MOOD_LABEL[mood]}
                  </span>
                  <div
                    className="flex-1 h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: "var(--j-bg-elevated)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: "var(--j-accent)",
                      }}
                    />
                  </div>
                  <span
                    className="text-xs w-6 text-right"
                    style={{ color: "var(--j-text-muted)" }}
                  >
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Top tags */}
      {data.top_tags.length > 0 && (
        <div>
          <p
            className="text-xs font-medium mb-2"
            style={{ color: "var(--j-text-secondary)" }}
          >
            Most used tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.top_tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                style={{
                  backgroundColor: `${tag.color}22`,
                  color: tag.color,
                  border: `1px solid ${tag.color}44`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
                <span style={{ color: `${tag.color}99` }}>{tag.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {data.total_entries === 0 && (
        <p
          className="text-sm text-center py-4"
          style={{ color: "var(--j-text-muted)" }}
        >
          No entries written this month yet.
        </p>
      )}
    </div>
  )
}
