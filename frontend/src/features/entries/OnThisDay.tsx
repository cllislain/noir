import { Link } from "react-router-dom"
import { format, parseISO } from "date-fns"
import { useOnThisDay } from "@/features/insights/useInsights"

const MOOD_EMOJI: Record<string, string> = {
  happy: "😊",
  neutral: "😐",
  sad: "😢",
  anxious: "😰",
  grateful: "🙏",
}

export function OnThisDay() {
  const { data, isLoading } = useOnThisDay()

  if (isLoading || !data || data.length === 0) return null

  const today = format(new Date(), "MMMM d")

  return (
    <div
      className="rounded-xl border px-4 py-3 space-y-2"
      style={{
        backgroundColor: "var(--j-bg-surface)",
        borderColor: "var(--j-border)",
      }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: "var(--j-accent)" }}
      >
        On this day — {today}
      </p>

      <ul className="space-y-1.5">
        {data.map((entry) => (
          <li key={entry.id} className="flex items-start gap-2">
            <span className="mt-0.5 text-sm">
              {entry.mood ? MOOD_EMOJI[entry.mood] ?? "📓" : "📓"}
            </span>
            <div className="flex-1 min-w-0">
              <Link
                to={`/entries/${entry.id}`}
                className="text-sm font-medium hover:underline truncate block"
                style={{ color: "var(--j-text-primary)" }}
              >
                {entry.title}
              </Link>
              <p
                className="text-xs"
                style={{ color: "var(--j-text-muted)" }}
              >
                {entry.years_ago === 1
                  ? "1 year ago"
                  : `${entry.years_ago} years ago`}{" "}
                · {format(parseISO(entry.created_at), "MMM d, yyyy")}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
