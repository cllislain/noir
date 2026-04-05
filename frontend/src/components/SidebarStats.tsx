import { useStreak } from "@/features/entries/useStreak"

function StatRow({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs flex items-center gap-1.5" style={{ color: "var(--j-text-muted)" }}>
        <span>{icon}</span>
        {label}
      </span>
      <span className="text-sm font-semibold" style={{ color: "var(--j-text-primary)" }}>
        {value}
      </span>
    </div>
  )
}

export function SidebarStats() {
  const { data, isLoading } = useStreak()

  if (isLoading) {
    return (
      <div className="space-y-2 px-1 animate-pulse">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-4 rounded"
            style={{ backgroundColor: "var(--j-bg-elevated)" }}
          />
        ))}
      </div>
    )
  }

  if (!data) return null

  const streakLabel =
    data.current_streak === 0
      ? "No streak"
      : `${data.current_streak} ${data.current_streak === 1 ? "day" : "days"}`

  const streakIcon = data.current_streak >= 7 ? "🔥" : data.current_streak >= 1 ? "✨" : "💤"

  return (
    <div className="space-y-1.5 px-1">
      <StatRow label="Today" value={`${data.today_count} ${data.today_count === 1 ? "entry" : "entries"}`} icon="📝" />
      <StatRow label="Streak" value={streakLabel} icon={streakIcon} />
      <StatRow label="Best" value={`${data.longest_streak} ${data.longest_streak === 1 ? "day" : "days"}`} icon="🏆" />
    </div>
  )
}
