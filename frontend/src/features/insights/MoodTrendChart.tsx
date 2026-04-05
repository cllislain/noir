import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { format, parseISO } from "date-fns"
import { useMoodTrend } from "./useInsights"
import type { MoodTrendPoint } from "@/types"

// Neutral colors that work across all themes
const MOOD_COLORS: Record<keyof Omit<MoodTrendPoint, "date">, string> = {
  happy: "#4ade80",
  neutral: "#94a3b8",
  sad: "#60a5fa",
  anxious: "#fb923c",
  grateful: "#c084fc",
}

const MOOD_LABELS: Record<keyof Omit<MoodTrendPoint, "date">, string> = {
  happy: "😊 Happy",
  neutral: "😐 Neutral",
  sad: "😢 Sad",
  anxious: "😰 Anxious",
  grateful: "🙏 Grateful",
}

type DayOption = { label: string; value: number }

const DAY_OPTIONS: DayOption[] = [
  { label: "30 days", value: 30 },
  { label: "60 days", value: 60 },
  { label: "90 days", value: 90 },
]

interface Props {
  days: number
  onDaysChange: (days: number) => void
}

export function MoodTrendChart({ days, onDaysChange }: Props) {
  const { data, isLoading } = useMoodTrend(days)

  const chartData =
    data?.map((point) => ({
      ...point,
      label: format(parseISO(point.date), "MMM d"),
    })) ?? []

  const hasData = chartData.length > 0

  return (
    <div
      className="card p-5 space-y-4"
      style={{ backgroundColor: "var(--j-bg-surface)" }}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2
          className="text-base font-semibold"
          style={{ color: "var(--j-text-primary)" }}
        >
          Mood over time
        </h2>

        <div className="flex gap-1.5">
          {DAY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onDaysChange(opt.value)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={
                days === opt.value
                  ? {
                      backgroundColor: "var(--j-accent)",
                      color: "var(--j-accent-text)",
                    }
                  : {
                      backgroundColor: "var(--j-bg-elevated)",
                      color: "var(--j-text-secondary)",
                      border: "1px solid var(--j-border)",
                    }
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div
          className="h-56 rounded-lg animate-pulse"
          style={{ backgroundColor: "var(--j-bg-elevated)" }}
        />
      )}

      {!isLoading && !hasData && (
        <p
          className="text-sm text-center py-16"
          style={{ color: "var(--j-text-muted)" }}
        >
          No mood data in the last {days} days.
        </p>
      )}

      {!isLoading && hasData && (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--j-border)"
              opacity={0.5}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--j-text-muted)" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "var(--j-text-muted)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--j-bg-elevated)",
                border: "1px solid var(--j-border)",
                borderRadius: "8px",
                color: "var(--j-text-primary)",
                fontSize: "12px",
              }}
              labelStyle={{ color: "var(--j-text-secondary)", marginBottom: 4 }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
              formatter={(value) =>
                MOOD_LABELS[value as keyof typeof MOOD_LABELS] ?? value
              }
            />
            {(Object.keys(MOOD_COLORS) as (keyof typeof MOOD_COLORS)[]).map(
              (mood) => (
                <Line
                  key={mood}
                  type="monotone"
                  dataKey={mood}
                  stroke={MOOD_COLORS[mood]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              )
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
