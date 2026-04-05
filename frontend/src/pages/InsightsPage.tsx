import { useState } from "react"
import { Layout } from "@/components/Layout"
import { AppSidebar } from "@/components/AppSidebar"
import { MoodTrendChart } from "@/features/insights/MoodTrendChart"
import { MonthlyRecap } from "@/features/insights/MonthlyRecap"
import { StreakCard } from "@/features/insights/StreakCard"

export function InsightsPage() {
  const [trendDays, setTrendDays] = useState(90)

  return (
    <Layout
      sidebar={<AppSidebar />}
    >
      <div className="space-y-6">
        <div>
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--j-text-primary)" }}
          >
            Insights
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--j-text-muted)" }}
          >
            Patterns and trends from your entries
          </p>
        </div>

        {/* Streak */}
        <StreakCard />

        {/* Two-column on large screens, stacked on smaller */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Mood trend — takes 2/3 width on lg */}
          <div className="lg:col-span-2">
            <MoodTrendChart days={trendDays} onDaysChange={setTrendDays} />
          </div>

          {/* Monthly recap — 1/3 width on lg */}
          <div className="lg:col-span-1">
            <MonthlyRecap />
          </div>
        </div>
      </div>
    </Layout>
  )
}
