import { useStreak } from "./useInsights"

export function StreakCard() {
  const { data, isLoading } = useStreak()

  if (isLoading) {
    return (
      <div
        className="card p-5 animate-pulse flex gap-4"
        style={{ backgroundColor: "var(--j-bg-surface)" }}
      >
        {[0, 1].map((i) => (
          <div key={i} className="flex-1 h-16 rounded" style={{ backgroundColor: "var(--j-bg-elevated)" }} />
        ))}
      </div>
    )
  }

  if (!data) return null

  return (
    <div
      className="card p-5 flex flex-wrap gap-4 items-center"
      style={{ backgroundColor: "var(--j-bg-surface)" }}
    >
      {/* Current streak */}
      <div className="flex items-center gap-3 flex-1 min-w-32">
        <span className="text-3xl">🔥</span>
        <div>
          <p className="text-2xl font-bold leading-none" style={{ color: "var(--j-text-primary)" }}>
            {data.current_streak}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--j-text-muted)" }}>
            {data.current_streak === 1 ? "day" : "days"} current streak
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px self-stretch" style={{ backgroundColor: "var(--j-border)" }} />

      {/* Longest streak */}
      <div className="flex items-center gap-3 flex-1 min-w-32">
        <span className="text-3xl">🏆</span>
        <div>
          <p className="text-2xl font-bold leading-none" style={{ color: "var(--j-text-primary)" }}>
            {data.longest_streak}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--j-text-muted)" }}>
            {data.longest_streak === 1 ? "day" : "days"} longest streak
          </p>
        </div>
      </div>

      {/* Wrote today badge */}
      {data.today_count > 0 && (
        <span
          className="ml-auto px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            backgroundColor: "var(--j-accent)",
            color: "var(--j-accent-text)",
          }}
        >
          ✓ Wrote today
        </span>
      )}
    </div>
  )
}
